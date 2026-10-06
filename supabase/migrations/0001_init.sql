-- ============================================================
-- GAMERT â€” 0001_init.sql
-- Esquema completo: tablas, integridad, RLS y RPC.
-- Contrato detallado en docs/DATABASE.md y docs/API.md.
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- 1. Tablas
-- ============================================================

create table public.organizations (
  id             text primary key,
  name           text not null,
  handle         text unique not null,
  tier           text not null default 'comunidad' check (tier in ('editorial', 'comunidad')),
  verified_prizes boolean not null default false,
  followers      integer not null default 0,
  game_ids       text[] not null default '{}'
);

create table public.games (
  id           text primary key,
  name         text not null,
  short        text not null,
  icon         text not null default 'gamepad',
  accent       text not null default 'hsl(0 0% 50%)',
  description  text not null default '',
  popular      boolean not null default false,
  publisher    text not null default '',
  publisher_id text references public.organizations (id)
);

create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  name            text not null,
  handle          text unique not null,
  main_game       text references public.games (id),
  avatar_url      text,
  joined          date not null default current_date,
  scouted         boolean not null default false,
  role            text not null default 'player' check (role in ('player', 'admin')),
  organizer_tier  text not null default 'comunidad'
                    check (organizer_tier in ('comunidad', 'verificado', 'editorial')),
  verified_prizes boolean not null default false,
  disputes_lost   integer not null default 0,
  followers       integer not null default 0,
  bio             text,
  is_publisher    boolean not null default false,
  settings        jsonb not null default '{
    "profile_private": false,
    "security_and_password": false,
    "sounds": false,
    "language": false,
    "push_notifications": true
  }'::jsonb,
  created_at      timestamptz not null default now()
);

create table public.tournaments (
  id             text primary key,
  name           text not null,
  game_id        text not null references public.games (id),
  organizer_id   uuid not null references public.profiles (id),
  publisher_tier text not null default 'comunidad'
                   check (publisher_tier in ('editorial', 'comunidad')),
  modality       text not null default 'Virtual' check (modality in ('Virtual', 'Presencial')),
  format         text not null default 'eliminacion'
                   check (format in ('eliminacion', 'grupos', 'suizo', 'doble_eliminacion')),
  date           date not null,
  time           text not null default '18:00',
  timezone       text not null default 'America/Argentina/Buenos_Aires',
  slots          integer not null check (slots between 2 and 128),
  enrolled       integer not null default 0,
  prize          jsonb not null default '{"amount":0,"currency":"PTS","kind":"ninguno","split":[0,0,0]}'::jsonb,
  rules          jsonb not null default '{
    "min_elo": 150,
    "max_participants": 16,
    "require_confirmation": true,
    "dispute_window_min": 24,
    "auto_forfeit_on_disconnect": true,
    "best_of": 3,
    "notes": ""
  }'::jsonb,
  status         text not null default 'upcoming'
                   check (status in ('upcoming', 'live', 'finished', 'cancelled')),
  phase          text,
  featured       boolean not null default false,
  created_at     timestamptz not null default now()
);

create index idx_tournaments_browse on public.tournaments (game_id, status, date);
create index idx_tournaments_organizer on public.tournaments (organizer_id);
create index idx_tournaments_live on public.tournaments (status) where status = 'live';

create table public.daily_series (
  id            text primary key,
  tournament_id text not null references public.tournaments (id) on delete cascade,
  days          integer[] not null,
  horizon_days  integer not null default 7
);

create table public.registrations (
  id            uuid primary key default gen_random_uuid(),
  tournament_id text not null references public.tournaments (id) on delete cascade,
  player_id     uuid not null references public.profiles (id) on delete cascade,
  status        text not null default 'confirmed' check (status in ('confirmed', 'cancelled')),
  created_at    timestamptz not null default now(),
  unique (tournament_id, player_id)
);

create index idx_reg_tournament on public.registrations (tournament_id);
create index idx_reg_player on public.registrations (player_id);

create table public.matches (
  id                text primary key,
  tournament_id     text not null references public.tournaments (id) on delete cascade,
  slot              integer not null,
  round             integer not null,
  round_label       text not null,
  a                 uuid references public.profiles (id),
  b                 uuid references public.profiles (id),
  elo_snapshot      jsonb,
  score_a           integer,
  score_b           integer,
  status            text not null default 'pending'
                      check (status in ('pending', 'ready', 'live', 'reported', 'confirmed', 'disputed')),
  winner_to         text,
  winner_slot       text check (winner_slot in ('a', 'b')),
  reported_by       uuid references public.profiles (id),
  reported_at       timestamptz,
  needs_confirmation boolean not null default false,
  disputed          boolean not null default false,
  report_reason     text,
  scheduled_at      timestamptz,
  starts_at         timestamptz not null,
  unique (tournament_id, slot)
);

create index idx_matches_round on public.matches (tournament_id, round, slot);
create index idx_matches_next on public.matches (winner_to);

create table public.match_events (
  id         bigserial primary key,
  match_id   text not null references public.matches (id) on delete cascade,
  actor_id   uuid references public.profiles (id),
  kind       text not null
               check (kind in ('report', 'confirm', 'dispute', 'resolve', 'forfeit', 'auto_confirm')),
  payload    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.elo_ratings (
  player_id  uuid not null references public.profiles (id) on delete cascade,
  game_id    text not null references public.games (id),
  rating     integer not null default 1500,
  played     integer not null default 0,
  wins       integer not null default 0,
  losses     integer not null default 0,
  draws      integer not null default 0,
  peak       integer not null default 1500,
  streak     integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (player_id, game_id)
);

create index idx_elo_ranking on public.elo_ratings (game_id, rating desc);

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  title      text not null,
  body       text not null,
  kind       text not null default 'sistema'
               check (kind in ('torneo', 'pago', 'elo', 'sistema')),
  game_id    text references public.games (id),
  read       boolean not null default false,
  date       timestamptz not null default now()
);

create index idx_notifications_user on public.notifications (user_id, read, date desc);

-- ============================================================
-- 2. Triggers de integridad
-- ============================================================

-- Perfil automÃ¡tico al registrarse
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_handle text;
begin
  v_handle := coalesce(
    nullif(new.raw_user_meta_data->>'handle', ''),
    '@' || split_part(coalesce(new.email, new.id::text), '@', 1)
  );
  if exists (select 1 from public.profiles where handle = v_handle) then
    v_handle := v_handle || '_' || substr(new.id::text, 1, 4);
  end if;

  insert into public.profiles (id, name, handle, main_game)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(coalesce(new.email, new.id::text), '@', 1)),
    v_handle,
    nullif(new.raw_user_meta_data->>'main_game', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- enrolled siempre refleja las inscripciones vigentes
create or replace function public.refresh_enrolled()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tid text := coalesce(new.tournament_id, old.tournament_id);
begin
  update public.tournaments t
     set enrolled = (
       select count(*) from public.registrations r
       where r.tournament_id = v_tid and r.status = 'confirmed'
     )
   where t.id = v_tid;
  return null;
end;
$$;

create trigger registrations_refresh_enrolled
  after insert or update or delete on public.registrations
  for each row execute function public.refresh_enrolled();

-- ============================================================
-- 3. Helpers
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.notify(
  p_user uuid, p_title text, p_body text, p_kind text default 'sistema', p_game text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, title, body, kind, game_id)
  values (p_user, p_title, p_body, p_kind, p_game);
end;
$$;

create or replace function public.round_label(p_round integer, p_size integer)
returns text
language sql
immutable
as $$
  select case
    when p_round = round(log(p_size) / log(2)) - 1 then 'FINAL'
    when p_round = round(log(p_size) / log(2)) - 2 then 'SEMIFINAL'
    when p_round = round(log(p_size) / log(2)) - 3 then 'CUARTOS DE FINAL'
    else 'RONDA ' || (p_round + 1)
  end;
$$;

create or replace function public.bracket_size_for(p_n integer)
returns integer
language sql
immutable
as $$
  select case
    when target <= 2 then 2
    when target <= 4 then 4
    when target <= 8 then 8
    when target <= 16 then 16
    when target <= 32 then 32
    else 64
  end
  from (select greatest(2, p_n) as target) s;
$$;

create or replace function public.can_organize(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = p_user_id
      and (
        p.role = 'admin'
        or p.organizer_tier in ('verificado', 'editorial')
        or (
          exists (
            select 1 from public.elo_ratings e
            where e.player_id = p.id and e.rating >= 1500
          )
          and (
            select count(*) from public.matches m
            where (m.a = p.id or m.b = p.id) and m.status = 'confirmed'
          ) >= 10
        )
      )
  );
$$;

-- ============================================================
-- 4. ELO (port de src/lib/elo.ts â€” ADR-04)
-- ============================================================

create or replace function public.elo_k_factor(p_rating integer, p_played integer)
returns integer
language sql
immutable
as $$
  select case
    when p_played < 15 then 40
    when p_played >= 30 and p_rating >= 2000 then 24
    else 32
  end;
$$;

create or replace function public.elo_expected(p_rating integer, p_opponent integer)
returns numeric
language sql
immutable
as $$
  select 1.0 / (1.0 + power(10.0::numeric, (p_opponent - p_rating) / 400.0));
$$;

create or replace function public.elo_margin_mult(p_diff integer)
returns numeric
language sql
immutable
as $$
  select 1.0::numeric + least(0.6::numeric, ln((1 + greatest(p_diff, 0))::numeric) * 0.18);
$$;

/**
 * Aplica un resultado a la fila de ELO de un jugador y devuelve el delta.
 * p_score: 1 victoria, 0 derrota, 0.5 empate.
 */
create or replace function public.rate_player(
  p_player uuid,
  p_game text,
  p_score numeric,
  p_opponent_rating integer,
  p_diff integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rating integer;
  v_played integer;
  v_wins integer;
  v_losses integer;
  v_draws integer;
  v_peak integer;
  v_streak integer;
  v_exp numeric;
  v_raw numeric;
  v_scaled integer;
  v_delta integer;
  v_new integer;
begin
  select coalesce(e.rating, 1500), coalesce(e.played, 0), coalesce(e.wins, 0),
         coalesce(e.losses, 0), coalesce(e.draws, 0), coalesce(e.peak, 1500),
         coalesce(e.streak, 0)
    into v_rating, v_played, v_wins, v_losses, v_draws, v_peak, v_streak
    from public.elo_ratings e
   where e.player_id = p_player and e.game_id = p_game;

  if not found then
    v_rating := 1500; v_played := 0; v_wins := 0; v_losses := 0;
    v_draws := 0; v_peak := 1500; v_streak := 0;
  end if;

  v_exp := public.elo_expected(v_rating, p_opponent_rating);
  v_raw := public.elo_k_factor(v_rating, v_played) * (p_score - v_exp);
  v_scaled := round(v_raw * public.elo_margin_mult(p_diff))::integer;

  if p_score = 1 then
    v_delta := greatest(v_scaled, 1);
  elsif p_score = 0 then
    v_delta := least(v_scaled, -1);
  else
    v_delta := v_scaled;
  end if;

  v_new := greatest(100, v_rating + v_delta);
  v_delta := v_new - v_rating;

  if p_score = 1 then
    v_streak := v_streak + 1;
  elsif p_score = 0 then
    v_streak := least(0, v_streak) - 1;
  else
    v_streak := 0;
  end if;

  insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak, updated_at)
  values (
    p_player, p_game, v_new, v_played + 1,
    v_wins + case when p_score = 1 then 1 else 0 end,
    v_losses + case when p_score = 0 then 1 else 0 end,
    v_draws + case when p_score = 0.5 then 1 else 0 end,
    greatest(v_peak, v_new), v_streak, now()
  )
  on conflict (player_id, game_id) do update set
    rating = excluded.rating,
    played = excluded.played,
    wins = excluded.wins,
    losses = excluded.losses,
    draws = excluded.draws,
    peak = excluded.peak,
    streak = excluded.streak,
    updated_at = now();

  return v_delta;
end;
$$;

-- ============================================================
-- 5. Ciclo de vida del torneo
-- ============================================================

create or replace function public.join_tournament(p_tournament_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  t record;
  v_uid uuid := auth.uid();
  v_elo integer;
  v_min integer;
  v_max integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'UNAUTHENTICATED');
  end if;

  select * into t from public.tournaments where id = p_tournament_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;
  if t.status <> 'upcoming' then
    return jsonb_build_object('ok', false, 'error', 'NOT_OPEN');
  end if;
  if t.organizer_id = v_uid then
    return jsonb_build_object('ok', false, 'error', 'ORGANIZER_CANNOT_JOIN');
  end if;
  if exists (
    select 1 from public.registrations r
    where r.tournament_id = p_tournament_id and r.player_id = v_uid and r.status = 'confirmed'
  ) then
    return jsonb_build_object('ok', false, 'error', 'ALREADY_JOINED');
  end if;

  v_max := coalesce((t.rules->>'maxParticipants')::integer, t.slots);
  if t.enrolled >= least(v_max, t.slots) then
    return jsonb_build_object('ok', false, 'error', 'SLOT_FULL');
  end if;

  v_min := coalesce((t.rules->>'minElo')::integer, 0);
  select coalesce(e.rating, 1500) into v_elo
    from public.elo_ratings e
   where e.player_id = v_uid and e.game_id = t.game_id;
  if v_elo is null then
    v_elo := 1500;
  end if;
  if v_elo < v_min then
    return jsonb_build_object('ok', false, 'error', 'ELO_TOO_LOW');
  end if;

  insert into public.registrations (tournament_id, player_id)
  values (p_tournament_id, v_uid);

  perform public.notify(
    t.organizer_id,
    t.name || ': nueva inscripciÃ³n',
    'Un jugador se inscribiÃ³ en tu torneo (' || t.enrolled + 1 || '/' || t.slots || ').',
    'torneo',
    t.game_id
  );

  return jsonb_build_object('ok', true, 'enrolled', t.enrolled + 1);
end;
$$;

create or replace function public.leave_tournament(p_tournament_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  t record;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'UNAUTHENTICATED');
  end if;

  select * into t from public.tournaments where id = p_tournament_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;
  if t.status <> 'upcoming' then
    return jsonb_build_object('ok', false, 'error', 'BRACKET_STARTED');
  end if;
  if exists (select 1 from public.matches where tournament_id = p_tournament_id) then
    return jsonb_build_object('ok', false, 'error', 'BRACKET_STARTED');
  end if;

  delete from public.registrations
   where tournament_id = p_tournament_id and player_id = v_uid;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.create_tournament(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id text;
  v_slots integer;
  v_date date;
  v_name text;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'UNAUTHENTICATED');
  end if;
  if not public.can_organize(v_uid) then
    return jsonb_build_object('ok', false, 'error', 'NOT_ORGANIZER');
  end if;

  v_name := nullif(trim(p_payload->>'name'), '');
  if v_name is null then
    return jsonb_build_object('ok', false, 'error', 'NAME_REQUIRED');
  end if;

  v_slots := (p_payload->>'slots')::integer;
  if v_slots is null or v_slots < 2 or v_slots > 64
     or (v_slots & (v_slots - 1)) <> 0 then
    return jsonb_build_object('ok', false, 'error', 'BAD_SLOTS');
  end if;

  if coalesce(p_payload->>'format', 'eliminacion') <> 'eliminacion' then
    return jsonb_build_object('ok', false, 'error', 'FORMAT_NOT_SUPPORTED');
  end if;

  v_date := (p_payload->>'date')::date;
  if v_date is null then
    return jsonb_build_object('ok', false, 'error', 'BAD_DATE');
  end if;

  if not exists (select 1 from public.games g where g.id = p_payload->>'game_id') then
    return jsonb_build_object('ok', false, 'error', 'BAD_GAME');
  end if;

  v_id := coalesce(
    nullif(p_payload->>'id', ''),
    lower(regexp_replace(v_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substr(md5(random()::text), 1, 6)
  );
  if exists (select 1 from public.tournaments where id = v_id) then
    v_id := v_id || '-' || substr(md5(random()::text), 1, 4);
  end if;

  insert into public.tournaments (
    id, name, game_id, organizer_id, publisher_tier, modality, format,
    date, time, timezone, slots, prize, rules, featured
  )
  values (
    v_id,
    v_name,
    p_payload->>'game_id',
    v_uid,
    case when exists (
      select 1 from public.profiles p where p.id = v_uid and p.organizer_tier = 'editorial'
    ) then 'editorial' else 'comunidad' end,
    coalesce(p_payload->>'modality', 'Virtual'),
    'eliminacion',
    v_date,
    coalesce(p_payload->>'time', '18:00'),
    coalesce(p_payload->>'timezone', 'America/Argentina/Buenos_Aires'),
    v_slots,
    coalesce((p_payload->>'prize')::jsonb, '{"amount":0,"currency":"PTS","kind":"ninguno","split":[0,0,0]}'::jsonb),
    coalesce((p_payload->>'rules')::jsonb,
      '{"minElo":150,"maxParticipants":16,"requireConfirmation":true,"disputeWindowMin":24,"autoForfeitOnDisconnect":true,"bestOf":3,"notes":""}'::jsonb),
    coalesce((p_payload->>'featured')::boolean, false)
  );

  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;

create or replace function public.start_tournament(p_tournament_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  t record;
  v_result jsonb;
begin
  select * into t from public.tournaments where id = p_tournament_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;
  if not (t.organizer_id = auth.uid() or public.is_admin()) then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;
  if t.status <> 'upcoming' then
    return jsonb_build_object('ok', false, 'error', 'NOT_UPCOMING');
  end if;

  update public.tournaments set status = 'live' where id = p_tournament_id;

  v_result := public.generate_bracket(p_tournament_id);
  if not (v_result->>'ok')::boolean then
    update public.tournaments set status = 'upcoming' where id = p_tournament_id;
    return v_result;
  end if;

  update public.tournaments
     set phase = (select round_label from public.matches
                   where tournament_id = p_tournament_id order by slot limit 1)
   where id = p_tournament_id;

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.cancel_tournament(p_tournament_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  t record;
  r record;
begin
  select * into t from public.tournaments where id = p_tournament_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;
  if not (t.organizer_id = auth.uid() or public.is_admin()) then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;
  if t.status = 'finished' then
    return jsonb_build_object('ok', false, 'error', 'ALREADY_FINISHED');
  end if;

  update public.tournaments set status = 'cancelled' where id = p_tournament_id;

  for r in select player_id from public.registrations where tournament_id = p_tournament_id loop
    perform public.notify(
      r.player_id,
      t.name || ' fue cancelado',
      'El organizador cancelÃ³ el torneo. Te avisamos si se reprograma.',
      'torneo',
      t.game_id
    );
  end loop;

  return jsonb_build_object('ok', true);
end;
$$;

-- ============================================================
-- 6. Cuadro (bracket) â€” ADR-03
-- ============================================================

create or replace function public.generate_bracket(p_tournament_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  t record;
  v_seeds uuid[];
  v_size integer;
  v_order integer[] := array[1, 2];
  v_next integer[] := array[]::integer[];
  v_rounds integer;
  v_first integer;
  v_match_id text;
  v_a uuid;
  v_b uuid;
  v_slot integer := 0;
  v_start timestamptz;
  r integer;
  i integer;
  j integer;
  v_here integer;
  v_index integer;
  v_next_slot integer;
  m record;
begin
  select * into t from public.tournaments where id = p_tournament_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;
  if not (t.organizer_id = auth.uid() or public.is_admin()) then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;
  if exists (select 1 from public.matches where tournament_id = p_tournament_id) then
    return jsonb_build_object('ok', false, 'error', 'BRACKET_EXISTS');
  end if;

  select array_agg(p.id order by coalesce(e.rating, 1500) desc, p.handle)
    into v_seeds
    from public.registrations r2
    join public.profiles p on p.id = r2.player_id
    left join public.elo_ratings e on e.player_id = p.id and e.game_id = t.game_id
   where r2.tournament_id = p_tournament_id
     and r2.status = 'confirmed';

  if coalesce(array_length(v_seeds, 1), 0) < 2 then
    return jsonb_build_object('ok', false, 'error', 'NOT_ENOUGH_PLAYERS');
  end if;
  if array_length(v_seeds, 1) > 64 then
    -- el motor de cuadro estÃ¡ acotado en 64 (docs/ALCANCE.md Â§5)
    return jsonb_build_object('ok', false, 'error', 'TOO_MANY_PLAYERS');
  end if;

  v_size := public.bracket_size_for(array_length(v_seeds, 1));
  v_rounds := (round(log(v_size) / log(2)))::integer;
  v_start := ((t.date::text || ' ' || t.time)::timestamp) at time zone t.timezone;

  -- orden de siembra estÃ¡ndar: 1 vs N, 2 vs N-1â€¦
  while array_length(v_order, 1) < v_size loop
    v_next := array[]::integer[];
    for j in 1 .. array_length(v_order, 1) loop
      v_next := v_next || v_order[j] || (2 * array_length(v_order, 1) + 1 - v_order[j]);
    end loop;
    v_order := v_next;
  end loop;

  -- ronda inicial
  v_first := v_size / 2;
  for i in 0 .. v_first - 1 loop
    v_a := case when v_order[i * 2 + 1] <= coalesce(array_length(v_seeds, 1), 0)
                then v_seeds[v_order[i * 2 + 1]] end;
    v_b := case when v_order[i * 2 + 2] <= coalesce(array_length(v_seeds, 1), 0)
                then v_seeds[v_order[i * 2 + 2]] end;
    v_match_id := p_tournament_id || ':m' || v_slot;

    insert into public.matches (
      id, tournament_id, slot, round, round_label, a, b, status, starts_at, scheduled_at
    ) values (
      v_match_id, p_tournament_id, v_slot, 0, public.round_label(0, v_size), v_a, v_b,
      case when v_a is not null and v_b is not null then 'ready' else 'pending' end,
      v_start + make_interval(mins => i * 30), v_start + make_interval(mins => i * 30)
    );
    v_slot := v_slot + 1;
  end loop;

  -- rondas superiores
  for r in 1 .. v_rounds - 1 loop
    for i in 0 .. ((v_first / power(2, r))::integer) - 1 loop
      v_match_id := p_tournament_id || ':m' || v_slot;
      insert into public.matches (
        id, tournament_id, slot, round, round_label, a, b, status, starts_at, scheduled_at
      ) values (
        v_match_id, p_tournament_id, v_slot, r, public.round_label(r, v_size), null, null,
        'pending',
        v_start + make_interval(mins => r * 90 + i * 30),
        v_start + make_interval(mins => r * 90 + i * 30)
      );
      v_slot := v_slot + 1;
    end loop;
  end loop;

  -- enlaces de avance (mismo cÃ¡lculo que src/lib/bracket.ts)
  for m in select * from public.matches where tournament_id = p_tournament_id loop
    if m.round = v_rounds - 1 then
      continue;
    end if;
    v_here := v_size - (v_size / power(2, m.round))::integer;
    v_index := m.slot - v_here;
    v_next_slot := (v_size - (v_size / power(2, m.round + 1))::integer) + (v_index / 2);

    update public.matches
       set winner_to = p_tournament_id || ':m' || v_next_slot,
           winner_slot = case when v_index % 2 = 0 then 'a' else 'b' end
     where id = m.id;
  end loop;

  -- byes de la primera ronda: el Ãºnico presente avanza solo
  for m in
    select * from public.matches
     where tournament_id = p_tournament_id and round = 0
       and ((a is null) <> (b is null))
  loop
    update public.matches
       set status = 'confirmed', needs_confirmation = false
     where id = m.id;

    if m.winner_to is not null then
      update public.matches
         set a = case when m.winner_slot = 'a' then m.a else a end,
             b = case when m.winner_slot = 'b' then m.b else b end,
             status = case
               when (case when m.winner_slot = 'a' then m.a else a end) is not null
                and (case when m.winner_slot = 'b' then m.b else b end) is not null
               then 'ready' else 'pending' end
       where id = m.winner_to;
    end if;
  end loop;

  -- snapshot de ELO del emparejamiento (auditorÃ­a)
  update public.matches mm
     set elo_snapshot = (
       select coalesce(jsonb_object_agg(x.pid::text, x.rating), '{}'::jsonb)
       from (
         select p.id as pid, coalesce(e.rating, 1500) as rating
           from (values (mm.a), (mm.b)) as players(pid)
           join public.profiles p on p.id = players.pid
            left join public.elo_ratings e on e.player_id = p.id and e.game_id = tt.game_id
        ) x
      )
    from public.tournaments tt
   where mm.tournament_id = tt.id
     and mm.tournament_id = p_tournament_id
     and (mm.a is not null or mm.b is not null);

  update public.tournaments
     set phase = public.round_label(0, v_size)
   where id = p_tournament_id;

  return jsonb_build_object(
    'ok', true,
    'size', v_size,
    'players', coalesce(array_length(v_seeds, 1), 0),
    'matches', (select count(*) from public.matches where tournament_id = p_tournament_id)
  );
end;
$$;

-- ============================================================
-- 7. Resultados â€” ADR-04
-- ============================================================

/** Efectos de confirmar un resultado: avance, ELO, eventos y avisos. */
create or replace function public.finish_match(p_match_id text, p_event_kind text default 'confirm')
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
  t record;
  v_winner uuid;
  v_loser uuid;
  v_score_w integer;
  v_score_l integer;
  v_w_delta integer;
  v_l_delta integer;
  v_diff integer;
begin
  select * into m from public.matches where id = p_match_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;
  select * into t from public.tournaments where id = m.tournament_id;

  if m.a is null or m.b is null or m.score_a is null or m.score_b is null
     or m.score_a = m.score_b then
    return jsonb_build_object('ok', false, 'error', 'INVALID_SCORE');
  end if;

  update public.matches
     set status = 'confirmed', needs_confirmation = false, disputed = false
   where id = p_match_id
  returning * into m;

  if m.score_a > m.score_b then
    v_winner := m.a; v_loser := m.b; v_score_w := m.score_a; v_score_l := m.score_b;
  else
    v_winner := m.b; v_loser := m.a; v_score_w := m.score_b; v_score_l := m.score_a;
  end if;
  v_diff := abs(m.score_a - m.score_b);

  -- ELO por juego del torneo
  v_w_delta := public.rate_player(v_winner, t.game_id, 1,
    (select coalesce(e.rating, 1500) from public.elo_ratings e
      where e.player_id = v_loser and e.game_id = t.game_id), v_diff);
  v_l_delta := public.rate_player(v_loser, t.game_id, 0,
    (select coalesce(e.rating, 1500) from public.elo_ratings e
      where e.player_id = v_winner and e.game_id = t.game_id), v_diff);

  insert into public.match_events (match_id, actor_id, kind, payload)
  values (
    p_match_id, m.reported_by, p_event_kind,
    jsonb_build_object(
      'score_a', m.score_a, 'score_b', m.score_b,
      'winner', v_winner, 'elo_delta', v_w_delta
    )
  );

  -- avance al siguiente cruce
  if m.winner_to is not null then
    update public.matches
       set a = case when m.winner_slot = 'a' then v_winner else a end,
           b = case when m.winner_slot = 'b' then v_winner else b end,
           status = case
             when (case when m.winner_slot = 'a' then v_winner else a end) is not null
              and (case when m.winner_slot = 'b' then v_winner else b end) is not null
             then 'ready' else 'pending' end
     where id = m.winner_to;
  end if;

  perform public.notify(
    v_winner,
    'Ganaste en ' || t.name,
    'Resultado confirmado: ' || v_score_w || '-' || v_score_l || '. ELO ' ||
      case when v_w_delta >= 0 then '+' else '' end || v_w_delta || ' en ' ||
      (select name from public.games where id = t.game_id) || '.',
    'elo', t.game_id
  );
  perform public.notify(
    v_loser,
    'Perdiste en ' || t.name,
    'Resultado confirmado: ' || v_score_l || '-' || v_score_w || '. ELO ' || v_l_delta ||
      ' en ' || (select name from public.games where id = t.game_id) || '.',
    'elo', t.game_id
  );

  -- fin del torneo
  if m.winner_to is null then
    update public.tournaments set status = 'finished', phase = 'FINAL' where id = t.id;
    perform public.notify(
      v_winner,
      t.name || ' terminÃ³',
      'Â¡CampeÃ³n! El podio ya estÃ¡ disponible en la clasificaciÃ³n del torneo.',
      'torneo', t.game_id
    );
  end if;

  return jsonb_build_object(
    'ok', true, 'winner', v_winner,
    'elo_delta_winner', v_w_delta, 'elo_delta_loser', v_l_delta
  );
end;
$$;

create or replace function public.report_result(
  p_match_id text, p_score_a integer, p_score_b integer, p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
  t record;
  v_uid uuid := auth.uid();
  v_require boolean;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'UNAUTHENTICATED');
  end if;

  select * into m from public.matches where id = p_match_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;
  if m.status not in ('ready', 'live') then
    return jsonb_build_object('ok', false, 'error', 'MATCH_NOT_REPORTABLE');
  end if;
  if not (m.a = v_uid or m.b = v_uid) then
    return jsonb_build_object('ok', false, 'error', 'NOT_PARTICIPANT');
  end if;
  if p_score_a is null or p_score_b is null or p_score_a = p_score_b then
    return jsonb_build_object('ok', false, 'error', 'INVALID_SCORE');
  end if;

  select * into t from public.tournaments where id = m.tournament_id;
  v_require := coalesce((t.rules->>'requireConfirmation')::boolean, true);

  update public.matches
     set score_a = p_score_a, score_b = p_score_b,
         reported_by = v_uid, reported_at = now(),
         needs_confirmation = v_require,
         report_reason = p_reason,
         status = 'reported'
   where id = p_match_id;

  insert into public.match_events (match_id, actor_id, kind, payload)
  values (p_match_id, v_uid, 'report',
          jsonb_build_object('score_a', p_score_a, 'score_b', p_score_b));

  if v_require then
    perform public.notify(
      case when m.a = v_uid then m.b else m.a end,
      'Resultado por confirmar en ' || t.name,
      'Tu rival reportÃ³ ' || p_score_a || '-' || p_score_b || '. RevÃ­salo antes de confirmar.',
      'torneo', t.game_id
    );
    return jsonb_build_object('ok', true, 'needsConfirmation', true);
  end if;

  return public.finish_match(p_match_id, 'auto_confirm');
end;
$$;

create or replace function public.confirm_result(p_match_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
  t record;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'UNAUTHENTICATED');
  end if;

  select * into m from public.matches where id = p_match_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;
  if m.status <> 'reported' then
    return jsonb_build_object('ok', false, 'error', 'NOT_REPORTED');
  end if;
  if not (m.a = v_uid or m.b = v_uid) then
    return jsonb_build_object('ok', false, 'error', 'NOT_PARTICIPANT');
  end if;

  -- sÃ³lo el rival del que reportÃ³ puede confirmar
  if m.needs_confirmation and m.reported_by = v_uid then
    select * into t from public.tournaments where id = m.tournament_id;
    if coalesce((t.rules->>'disputeWindowMin')::integer, 0) > 0
       and m.reported_at is not null
       and now() < m.reported_at + make_interval(mins => (t.rules->>'disputeWindowMin')::integer) then
      return jsonb_build_object('ok', false, 'error', 'AWAITING_RIVAL');
    end if;
  end if;

  return public.finish_match(p_match_id, 'confirm');
end;
$$;

create or replace function public.dispute_result(p_match_id text, p_reason text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
  t record;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'UNAUTHENTICATED');
  end if;

  select * into m from public.matches where id = p_match_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;
  if m.status <> 'reported' then
    return jsonb_build_object('ok', false, 'error', 'NOT_REPORTED');
  end if;
  if not (m.a = v_uid or m.b = v_uid) then
    return jsonb_build_object('ok', false, 'error', 'NOT_PARTICIPANT');
  end if;
  if m.reported_by = v_uid then
    return jsonb_build_object('ok', false, 'error', 'CANNOT_DISPUTE_OWN');
  end if;

  select * into t from public.tournaments where id = m.tournament_id;

  update public.matches
     set status = 'disputed', disputed = true, report_reason = p_reason
   where id = p_match_id;

  insert into public.match_events (match_id, actor_id, kind, payload)
  values (p_match_id, v_uid, 'dispute', jsonb_build_object('reason', p_reason));

  perform public.notify(
    t.organizer_id,
    'Disputa en ' || t.name,
    'Un jugador impugnÃ³ el resultado de una partida. RevisÃ¡ el cuadro.',
    'torneo', t.game_id
  );

  return jsonb_build_object('ok', true);
end;
$$;

create or replace function public.resolve_dispute(
  p_match_id text, p_score_a integer, p_score_b integer, p_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
  t record;
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'UNAUTHENTICATED');
  end if;

  select * into m from public.matches where id = p_match_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;
  if m.status <> 'disputed' then
    return jsonb_build_object('ok', false, 'error', 'NOT_DISPUTED');
  end if;
  select * into t from public.tournaments where id = m.tournament_id;
  if not (t.organizer_id = v_uid or public.is_admin()) then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;
  if p_score_a is null or p_score_b is null or p_score_a = p_score_b then
    return jsonb_build_object('ok', false, 'error', 'INVALID_SCORE');
  end if;

  update public.matches
     set score_a = p_score_a, score_b = p_score_b, report_reason = p_reason
   where id = p_match_id;

  update public.profiles
     set disputes_lost = disputes_lost + 1
   where id = case when p_score_a > p_score_b then m.b else m.a end;

  return public.finish_match(p_match_id, 'resolve');
end;
$$;

create or replace function public.forfeit_match(p_match_id text, p_loser uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  m record;
  t record;
  v_uid uuid := auth.uid();
  v_score_a integer;
  v_score_b integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'UNAUTHENTICATED');
  end if;

  select * into m from public.matches where id = p_match_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  end if;
  select * into t from public.tournaments where id = m.tournament_id;
  if not (t.organizer_id = v_uid or public.is_admin()) then
    return jsonb_build_object('ok', false, 'error', 'FORBIDDEN');
  end if;
  if m.a is null or m.b is null or m.status in ('confirmed', 'pending') then
    return jsonb_build_object('ok', false, 'error', 'MATCH_NOT_PLAYABLE');
  end if;

  v_score_a := case when p_loser = m.a then 0 else 1 end;
  v_score_b := case when p_loser = m.b then 0 else 1 end;

  update public.matches
     set score_a = v_score_a, score_b = v_score_b,
         reported_by = v_uid, reported_at = now(),
         report_reason = 'forfeit',
         status = 'reported'
   where id = p_match_id;

  return public.finish_match(p_match_id, 'forfeit');
end;
$$;

create or replace function public.mark_notifications_read()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.notifications set read = true where user_id = auth.uid() and read = false;
  return jsonb_build_object('ok', true);
end;
$$;

-- ============================================================
-- 8. Row Level Security
-- ============================================================

alter table public.organizations enable row level security;
alter table public.games enable row level security;
alter table public.profiles enable row level security;
alter table public.tournaments enable row level security;
alter table public.daily_series enable row level security;
alter table public.registrations enable row level security;
alter table public.matches enable row level security;
alter table public.match_events enable row level security;
alter table public.elo_ratings enable row level security;
alter table public.notifications enable row level security;

-- organizations / games: catÃ¡logo, sÃ³lo lectura autenticada
create policy organizations_read on public.organizations
  for select to authenticated using (true);
create policy organizations_admin on public.organizations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy games_read on public.games
  for select to authenticated using (true);
create policy games_admin on public.games
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- profiles
create policy profiles_read on public.profiles
  for select to authenticated using (true);
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
create policy profiles_admin on public.profiles
  for delete to authenticated using (public.is_admin());

-- tournaments: lectura abierta, escritura sÃ³lo por RPC/admin
create policy tournaments_read on public.tournaments
  for select to authenticated using (true);
create policy tournaments_admin on public.tournaments
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy tournaments_admin_delete on public.tournaments
  for delete to authenticated using (public.is_admin());

-- registrations / matches / eventos: el cuadro y los rosters son pÃºblicos
-- dentro de la app (esports = transparencia). Escritura sÃ³lo por RPC.
create policy registrations_read on public.registrations
  for select to authenticated using (true);

create policy matches_read on public.matches
  for select to authenticated using (true);

create policy match_events_read on public.match_events
  for select to authenticated using (true);

-- ELO: lectura general, escritura sÃ³lo por RPC
create policy elo_read on public.elo_ratings
  for select to authenticated using (true);

-- notificaciones: sÃ³lo el dueÃ±o
create policy notifications_read on public.notifications
  for select to authenticated using (user_id = auth.uid());
create policy notifications_update_own on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_delete_own on public.notifications
  for delete to authenticated using (user_id = auth.uid());

-- ============================================================
-- 9. Exec: RPCs sÃ³lo para usuarios autenticados
-- ============================================================

do $$
declare
  fn record;
begin
  for fn in
    select p.oid::regprocedure as sig
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public'
       and p.prosecdef
       and p.proname not in ('handle_new_user', 'refresh_enrolled')
  loop
    execute 'revoke execute on function ' || fn.sig || ' from public, anon';
    execute 'grant execute on function ' || fn.sig || ' to authenticated, service_role';
  end loop;
end;
$$;

-- ============================================================
-- 10. Privilegios base de lectura
--      En Supabase estos grants vienen por defecto; acÃ¡ quedan
--      explÃ­citos para poder aplicar la migraciÃ³n en cualquier
--      Postgres (ver scripts/check-db.ts).
--      No se concede nada a `anon`: la app exige sesiÃ³n (docs/API.md).
-- ============================================================

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'grant usage on schema public to anon, authenticated, service_role';
    execute 'grant select on all tables in schema public to authenticated, service_role';
    execute 'grant execute on all functions in schema public to authenticated, service_role';
    if exists (select 1 from pg_namespace where nspname = 'auth') then
      execute 'grant usage on schema auth to anon, authenticated, service_role';
    end if;
  end if;
end;
$$;
