/**
 * Genera src/lib/api/database.types.ts (formato Supabase) desde el esquema
 * real, usando el mismo Postgres de `npm run db:check`:
 *   npm run types:gen
 *
 * Cuando haya un stack local corriendo se puede usar como alternativa
 * `npx supabase gen types typescript --local` (docs/DATABASE.md §6).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const STUBS = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin;
  create schema auth;
  create table auth.users (
    id uuid primary key, instance_id uuid, aud text, role text, email text,
    encrypted_password text, email_confirmed_at timestamptz,
    raw_app_meta_data jsonb, raw_user_meta_data jsonb,
    created_at timestamptz, updated_at timestamptz
  );
  create function auth.uid()
  returns uuid language sql stable as $fn$
    select nullif(
      coalesce(
        current_setting('request.jwt.claim.sub', true),
        (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
      ), '')::uuid;
  $fn$;
`;

interface Column {
  table: string;
  name: string;
  udt: string;
  isArray: boolean;
  nullable: boolean;
  hasDefault: boolean;
}

interface Fk {
  table: string;
  constraint: string;
  columns: string[];
  refTable: string;
  refColumns: string[];
}

interface FnSig {
  name: string;
  args: { name: string; type: string; optional: boolean }[];
  result: string;
}

const pgToTs = (type: string): string => {
  const isArray = type.endsWith("[]");
  const raw = isArray ? type.slice(0, -2) : type;
  // alias de udt_name (columnas) → nombre de tipo SQL (firmas de funciones)
  const base =
    (
      {
        int2: "smallint",
        int4: "integer",
        int8: "bigint",
        bool: "boolean",
        bpchar: "text",
        varchar: "varchar",
        timestamp: "timestamp without time zone",
      } as Record<string, string>
    )[raw] ?? raw;
  let ts: string;
  switch (base) {
    case "uuid":
    case "text":
    case "varchar":
    case "character varying":
    case "name":
    case "date":
    case "time":
    case "time without time zone":
    case "timestamp":
    case "timestamp without time zone":
    case "timestamptz":
    case "timestamp with time zone":
      ts = "string";
      break;
    case "smallint":
    case "integer":
    case "bigint":
    case "numeric":
    case "decimal":
    case "real":
    case "double precision":
      ts = "number";
      break;
    case "boolean":
      ts = "boolean";
      break;
    case "json":
    case "jsonb":
      ts = "Json";
      break;
    case "void":
      ts = "undefined";
      break;
    case "record":
      ts = "Json";
      break;
    default:
      ts = "string";
  }
  return isArray ? `${ts}[]` : ts;
};

/** `p_a text, p_b integer DEFAULT NULL` → args tipados. */
function parseArgs(raw: string): FnSig["args"] {
  if (!raw.trim()) return [];
  const parts = raw.split(", ");
  return parts.map((part, i) => {
    const defIndex = part.indexOf(" DEFAULT ");
    const head = defIndex === -1 ? part : part.slice(0, defIndex);
    const optional = defIndex !== -1;
    const m = /^(\S+)\s+(.+)$/.exec(head);
    if (m) return { name: m[1], type: m[2], optional };
    // argumento sin nombre: el tipo ocupa todo el token
    return { name: `arg${i}`, type: head, optional };
  });
}

function emit(args: string[]): string {
  return `${args.join("\n")}\n`;
}

async function main() {
  const db = new PGlite({ extensions: { pgcrypto } });
  await db.exec(STUBS);
  await db.exec(readFileSync(path.join(ROOT, "supabase/migrations/0001_init.sql"), "utf8"));

  const q = async <T>(sql: string): Promise<T[]> => (await db.query<T>(sql)).rows;

  const columns = await q<Column>(
    `select table_name as "table", column_name as name, udt_name as udt,
            (data_type = 'ARRAY') as "isArray",
            (is_nullable = 'YES') as "nullable",
            (column_default is not null or is_identity <> 'NO') as "hasDefault"
       from information_schema.columns
      where table_schema = 'public'
      order by table_name, ordinal_position`,
  );

  const tables = [...new Set(columns.map((c) => c.table))].sort();

  const fks = await q<Fk>(
    `select cl.relname as table,
            con.conname as constraint,
            (select array_agg(a.attname order by u.ord)
               from unnest(con.conkey) with ordinality u(attnum, ord)
               join pg_attribute a on a.attrelid = con.conrelid and a.attnum = u.attnum) as columns,
            cl2.relname as "refTable",
            (select array_agg(a.attname order by u.ord)
               from unnest(con.confkey) with ordinality u(attnum, ord)
               join pg_attribute a on a.attrelid = con.confrelid and a.attnum = u.attnum) as "refColumns"
       from pg_constraint con
       join pg_class cl on cl.oid = con.conrelid
       join pg_class cl2 on cl2.oid = con.confrelid
      where con.contype = 'f'
        and cl.relnamespace = 'public'::regnamespace
      order by cl.relname, con.conname`,
  );

  const functions = await q<{ name: string; args: string; result: string }>(
    `select p.proname as name,
            pg_get_function_arguments(p.oid) as args,
            pg_get_function_result(p.oid) as result
       from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.prokind = 'f'
        and p.prorettype not in ('trigger'::regtype, 'event_trigger'::regtype)
        and not exists (
          select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e'
        )
      order by p.proname`,
  ).then((rows) =>
    rows.map((r) => ({ name: r.name, args: parseArgs(r.args), result: r.result.trim() })),
  );

  const out: string[] = [];
  const push = (...l: string[]) => out.push(...l);

  push(
    "// Archivo generado por `npm run types:gen` — no editar a mano.",
    "// Fuente: supabase/migrations/0001_init.sql (contrato en docs/DATABASE.md §6).",
    "",
    "export type Json =",
    "  | string",
    "  | number",
    "  | boolean",
    "  | null",
    "  | { [key: string]: Json | undefined }",
    "  | Json[];",
    "",
    "export interface Database {",
    "  public: {",
    "    Tables: {",
  );

  for (const table of tables) {
    const cols = columns.filter((c) => c.table === table);
    const rels = fks.filter((f) => f.table === table);
    push(`      ${table}: {`);
    for (const mode of ["Row", "Insert", "Update"] as const) {
      push(`        ${mode}: {`);
      for (const c of cols) {
        const ts = pgToTs(c.isArray ? `${c.udt.slice(1)}[]` : c.udt);
        const withNull = c.nullable ? `${ts} | null` : ts;
        if (mode === "Row") {
          push(`          ${c.name}: ${withNull};`);
        } else if (mode === "Insert") {
          const optional = c.hasDefault || c.nullable;
          push(`          ${c.name}${optional ? "?" : ""}: ${withNull};`);
        } else {
          push(`          ${c.name}?: ${withNull};`);
        }
      }
      push("        };");
    }
    push("        Relationships: [");
    for (const fk of rels) {
      push(
        `          {`,
        `            foreignKeyName: "${fk.constraint}";`,
        `            columns: [${fk.columns.map((c) => `"${c}"`).join(", ")}];`,
        `            referencedRelation: "${fk.refTable}";`,
        `            referencedColumns: [${fk.refColumns.map((c) => `"${c}"`).join(", ")}];`,
        `          },`,
      );
    }
    push("        ];");
    push("      };");
  }

  push("    };", "    Views: { [_ in never]: never };", "    Functions: {");

  for (const fn of functions) {
    const argsType =
      fn.args.length === 0
        ? "Record<PropertyKey, never>"
        : `{ ${fn.args
            .map((a) => `${a.name}${a.optional ? "?" : ""}: ${pgToTs(a.type)}`)
            .join("; ")} }`;
    push(`      ${fn.name}: { Args: ${argsType}; Returns: ${pgToTs(fn.result)} };`);
  }

  push(
    "    };",
    "    Enums: { [_ in never]: never };",
    "    CompositeTypes: { [_ in never]: never };",
    "  };",
    "}",
    "",
    'export type Tables<T extends keyof Database["public"]["Tables"]> =',
    '  Database["public"]["Tables"][T]["Row"];',
    'export type Views<T extends keyof Database["public"]["Views"]> =',
    '  Database["public"]["Views"][T];',
    'export type Functions<T extends keyof Database["public"]["Functions"]> =',
    '  Database["public"]["Functions"][T];',
    'export type Enums<T extends keyof Database["public"]["Enums"]> =',
    '  Database["public"]["Enums"][T];',
    'export type CompositeTypes<T extends keyof Database["public"]["CompositeTypes"]> =',
    '  Database["public"]["CompositeTypes"][T];',
    "",
    'export type Schema = Database["public"];',
    "",
    "export interface StructuredError {",
    "  message: string;",
    "  details: string;",
    "  hint: string;",
    "  code: string;",
    "}",
    "",
  );

  const dest = path.join(ROOT, "src", "lib", "api", "database.types.ts");
  mkdirSync(path.dirname(dest), { recursive: true });
  writeFileSync(dest, emit(out), "utf8");

  console.log(`database.types.ts generado: ${tables.length} tablas, ${functions.length} funciones`);
  await db.close();
}

main().catch((err) => {
  console.error("ERROR:", err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
