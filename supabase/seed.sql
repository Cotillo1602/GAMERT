-- ============================================================
-- GAMERT â€” seed de desarrollo (generado con `npm run seed:gen`)
-- NO usar en producciÃ³n: las contraseÃ±as de abajo son pÃºblicas.
-- ============================================================
begin;
set local search_path = public, extensions, auth;

-- organizations
insert into public.organizations (id, name, handle, tier, verified_prizes, followers, game_ids) values ('o-riot', 'RIOT GAMES', '@riotgames', 'editorial', true, 245000, array['valorant','lol']);
insert into public.organizations (id, name, handle, tier, verified_prizes, followers, game_ids) values ('o-epic', 'EPIC GAMES', '@epicgames', 'editorial', true, 97400, array['fortnite']);
insert into public.organizations (id, name, handle, tier, verified_prizes, followers, game_ids) values ('o-ea', 'EA SPORTS', '@easports', 'editorial', true, 128000, array['fifa26','efootball']);
insert into public.organizations (id, name, handle, tier, verified_prizes, followers, game_ids) values ('o-bandai', 'BANDAI NAMCO', '@bandainamco', 'editorial', true, 54900, array['tekken8']);
insert into public.organizations (id, name, handle, tier, verified_prizes, followers, game_ids) values ('o-mojang', 'MOJANG', '@mojang', 'editorial', true, 71200, array['minecraft']);

-- games
insert into public.games (id, name, short, icon, accent, description, popular, publisher, publisher_id) values ('fifa26', 'FIFA26', 'FIFA', 'gamepad', 'hsl(150 70% 42%)', 'Fútbol 11 contra 11, la vía directa a EA Sports FC.', true, 'EA SPORTS', 'o-ea');
insert into public.games (id, name, short, icon, accent, description, popular, publisher, publisher_id) values ('efootball', 'E FOOTBALL', 'EFOOT', 'gamepad', 'hsl(160 65% 38%)', 'Fútbol rápido en móvil y consola.', false, 'EA SPORTS', 'o-ea');
insert into public.games (id, name, short, icon, accent, description, popular, publisher, publisher_id) values ('valorant', 'VALORANT', 'VAL', 'crosshair', 'hsl(354 72% 48%)', 'Táctico 5v5 de disparos.', true, 'RIOT GAMES', 'o-riot');
insert into public.games (id, name, short, icon, accent, description, popular, publisher, publisher_id) values ('lol', 'LOL', 'LOL', 'gamepad', 'hsl(210 80% 55%)', 'MOBA 5v5 de líneas.', true, 'RIOT GAMES', 'o-riot');
insert into public.games (id, name, short, icon, accent, description, popular, publisher, publisher_id) values ('minecraft', 'MINECRAFT', 'MC', 'layers', 'hsl(120 45% 42%)', 'Construcción y supervivencia por equipos.', false, 'MOJANG', 'o-mojang');
insert into public.games (id, name, short, icon, accent, description, popular, publisher, publisher_id) values ('fortnite', 'FORTNITE', 'FN', 'cloud', 'hsl(268 75% 58%)', 'Battle Royale multiplataforma.', false, 'EPIC GAMES', 'o-epic');
insert into public.games (id, name, short, icon, accent, description, popular, publisher, publisher_id) values ('tekken8', 'TEKKEN 8', 'TK8', 'users', 'hsl(20 78% 52%)', 'Lucha 1v1.', false, 'BANDAI NAMCO', 'o-bandai');

-- usuarios de demo (email / contraseÃ±a: cualquier jugador @gamert.dev)
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  't1cotillo@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"T1 COTILLO","handle":"@t1cotillo"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fifa26', scouted = true, joined = '2025-08-12', organizer_tier = 'verificado', verified_prizes = true, disputes_lost = 1, followers = 4820, bio = 'Torneos diarios de FIFA y E Football. Cupas abiertas, sin scripts.' where id = '10000000-0000-4000-8000-000000000001';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'usuario1@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"USUARIO1","handle":"@usuario1"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fifa26', scouted = false, joined = '2025-09-30', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000002';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'usuario2@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"USUARIO 2","handle":"@usuario2"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'valorant', scouted = false, joined = '2025-10-14', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000003';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'usuario3@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"USUARIO3","handle":"@usuario3"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'lol', scouted = false, joined = '2025-11-02', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000004';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'usuario4@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"USUARIO 4","handle":"@usuario4"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fortnite', scouted = false, joined = '2025-11-20', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000005';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'novastrike@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"NOVA STRIKE","handle":"@novastrike"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'valorant', scouted = true, joined = '2025-12-05', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000006';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'ironmask@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"IRONMASK","handle":"@ironmask"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'tekken8', scouted = false, joined = '2026-01-08', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 310, bio = 'Luchas 1v1 semanales. Aprende y mejora.' where id = '10000000-0000-4000-8000-000000000007';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'pixelgrove@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"PIXELGROVE","handle":"@pixelgrove"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'minecraft', scouted = false, joined = '2026-01-22', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000008';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'rushmode@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"RUSHMODE","handle":"@rushmode"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fortnite', scouted = true, joined = '2025-10-28', organizer_tier = 'verificado', verified_prizes = true, disputes_lost = 0, followers = 2140, bio = 'Eventos de Fortnite y duelRanked. Organizo desde 2025.' where id = '10000000-0000-4000-8000-000000000009';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000010', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'catalinar@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"CATALINA R","handle":"@catalinar"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'efootball', scouted = false, joined = '2026-02-01', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000010';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'diablo9@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"DIABLO9","handle":"@diablo9"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'lol', scouted = false, joined = '2025-12-19', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000011';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000012', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'lumina@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"LUMINA","handle":"@lumina"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'minecraft', scouted = false, joined = '2026-02-10', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 88, bio = 'Torneos de construcción y supervivencia.' where id = '10000000-0000-4000-8000-000000000012';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000013', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'roxanna@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"ROXANNA","handle":"@roxanna"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fifa26', scouted = false, joined = '2025-05-06', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000013';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000014', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'kiko@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"KIKO","handle":"@kiko"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'efootball', scouted = false, joined = '2025-05-17', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000014';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000015', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'veloz@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"VELOZ","handle":"@veloz"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'valorant', scouted = false, joined = '2025-05-28', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000015';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000016', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'nova9@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"NOVA9","handle":"@nova9"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'lol', scouted = false, joined = '2025-06-08', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000016';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000017', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'drako@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"DRAKO","handle":"@drako"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'minecraft', scouted = false, joined = '2025-06-19', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000017';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000018', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'pixel@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"PIXEL","handle":"@pixel"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fortnite', scouted = false, joined = '2025-06-30', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000018';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000019', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'titan@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"TITAN","handle":"@titan"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'tekken8', scouted = false, joined = '2025-07-11', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000019';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000020', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'zefiro@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"ZEFIRO","handle":"@zefiro"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fifa26', scouted = false, joined = '2025-07-22', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000020';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'blaze@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"BLAZE","handle":"@blaze"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'efootball', scouted = false, joined = '2025-08-02', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000021';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000022', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'moko@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"MOKO","handle":"@moko"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'valorant', scouted = false, joined = '2025-08-13', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000022';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000023', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'rustico@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"RUSTICO","handle":"@rustico"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'lol', scouted = false, joined = '2025-08-24', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000023';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000024', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'onyx@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"ONYX","handle":"@onyx"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'minecraft', scouted = false, joined = '2025-09-04', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000024';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000025', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'kaori@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"KAORI","handle":"@kaori"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fortnite', scouted = false, joined = '2025-09-15', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000025';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000026', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'solaris@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"SOLARIS","handle":"@solaris"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'tekken8', scouted = false, joined = '2025-09-26', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000026';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000027', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'wizard@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"WIZARD","handle":"@wizard"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fifa26', scouted = false, joined = '2025-10-07', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000027';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000028', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'kano@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"KANO","handle":"@kano"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'efootball', scouted = false, joined = '2025-10-18', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000028';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000029', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'ferro@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"FERRO","handle":"@ferro"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'valorant', scouted = false, joined = '2025-10-29', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000029';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000030', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'lynx@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"LYNX","handle":"@lynx"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'lol', scouted = false, joined = '2025-11-09', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000030';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000031', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'mota@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"MOTA","handle":"@mota"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'minecraft', scouted = false, joined = '2025-11-20', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000031';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000032', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'arco@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"ARCO","handle":"@arco"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fortnite', scouted = false, joined = '2025-12-01', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000032';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000033', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'brio@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"BRIO","handle":"@brio"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'tekken8', scouted = false, joined = '2025-12-12', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000033';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000034', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'cenit@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"CENIT","handle":"@cenit"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fifa26', scouted = false, joined = '2025-12-23', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000034';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000035', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'duna@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"DUNA","handle":"@duna"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'efootball', scouted = false, joined = '2026-01-03', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000035';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000036', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'eco@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"ECO","handle":"@eco"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'valorant', scouted = false, joined = '2026-01-14', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000036';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000037', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'faro@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"FARO","handle":"@faro"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'lol', scouted = false, joined = '2026-01-25', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000037';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000038', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'gavi@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"GAVI","handle":"@gavi"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'minecraft', scouted = false, joined = '2026-02-05', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000038';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000039', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'halo@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"HALO","handle":"@halo"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fortnite', scouted = false, joined = '2026-02-16', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000039';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000040', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'indigo@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"INDIGO","handle":"@indigo"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'tekken8', scouted = false, joined = '2026-02-27', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000040';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000041', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'jaru@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"JARU","handle":"@jaru"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fifa26', scouted = false, joined = '2026-03-10', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000041';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000042', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'keo@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"KEO","handle":"@keo"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'efootball', scouted = false, joined = '2026-03-21', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000042';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000043', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'lumi@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"LUMI","handle":"@lumi"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'valorant', scouted = false, joined = '2026-04-01', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000043';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000044', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'miro@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"MIRO","handle":"@miro"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'lol', scouted = false, joined = '2026-04-12', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000044';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000045', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'nano@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"NANO","handle":"@nano"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'minecraft', scouted = false, joined = '2026-04-23', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000045';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000046', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'orion@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"ORION","handle":"@orion"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fortnite', scouted = false, joined = '2026-05-04', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000046';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000047', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'perla@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"PERLA","handle":"@perla"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'tekken8', scouted = false, joined = '2026-05-15', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000047';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000048', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'quill@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"QUILL","handle":"@quill"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fifa26', scouted = false, joined = '2026-05-26', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000048';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000049', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'rico@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"RICO","handle":"@rico"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'efootball', scouted = false, joined = '2026-06-06', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000049';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000050', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'soma@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"SOMA","handle":"@soma"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'valorant', scouted = false, joined = '2026-06-17', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000050';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000051', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'tano@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"TANO","handle":"@tano"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'lol', scouted = false, joined = '2026-06-28', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000051';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000052', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'umbral@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"UMBRAL","handle":"@umbral"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'minecraft', scouted = false, joined = '2026-07-09', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000052';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000053', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'veta@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"VETA","handle":"@veta"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fortnite', scouted = false, joined = '2026-07-20', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000053';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000054', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'wave@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"WAVE","handle":"@wave"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'tekken8', scouted = false, joined = '2026-07-31', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000054';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000055', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'xeno@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"XENO","handle":"@xeno"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fifa26', scouted = false, joined = '2026-08-11', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000055';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000056', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'yago@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"YAGO","handle":"@yago"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'efootball', scouted = false, joined = '2026-08-22', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000056';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000057', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'zuri@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"ZURI","handle":"@zuri"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'valorant', scouted = false, joined = '2026-09-02', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000057';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000058', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'aura@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"AURA","handle":"@aura"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'lol', scouted = false, joined = '2026-09-13', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000058';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000059', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'bita@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"BITA","handle":"@bita"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'minecraft', scouted = false, joined = '2026-09-24', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000059';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000060', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'cima@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"CIMA","handle":"@cima"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fortnite', scouted = false, joined = '2026-10-05', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000060';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000061', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'doro@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"DORO","handle":"@doro"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'tekken8', scouted = false, joined = '2026-10-16', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000061';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000062', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'eris@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"ERIS","handle":"@eris"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fifa26', scouted = false, joined = '2026-10-27', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000062';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000063', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'fibra@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"FIBRA","handle":"@fibra"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'efootball', scouted = false, joined = '2026-11-07', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000063';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000064', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'glaz@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"GLAZ","handle":"@glaz"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'valorant', scouted = false, joined = '2026-11-18', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000064';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000065', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'hueso@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"HUESO","handle":"@hueso"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'lol', scouted = false, joined = '2026-11-29', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000065';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000066', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'iris@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"IRIS","handle":"@iris"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'minecraft', scouted = false, joined = '2026-12-10', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000066';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000067', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'loto@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"LOTO","handle":"@loto"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fortnite', scouted = false, joined = '2026-12-21', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000067';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000068', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'marea@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"MAREA","handle":"@marea"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'tekken8', scouted = false, joined = '2027-01-01', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000068';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000069', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'nube@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"NUBE","handle":"@nube"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'fifa26', scouted = false, joined = '2027-01-12', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000069';
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '10000000-0000-4000-8000-000000000070', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'oso@gamert.dev', crypt('gamert1234', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"OSO","handle":"@oso"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set main_game = 'efootball', scouted = false, joined = '2027-01-23', organizer_tier = 'comunidad', verified_prizes = false, disputes_lost = 0, followers = 0, bio = null where id = '10000000-0000-4000-8000-000000000070';

-- cuentas editoriales (sin contraseÃ±a: no inician sesiÃ³n)
insert into auth.users (id, instance_id, aud, role, email, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'riotgames@gamert.dev', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"RIOT GAMES","handle":"@riotgames"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set is_publisher = true, organizer_tier = 'editorial', verified_prizes = true, followers = 245000, bio = null where id = '20000000-0000-4000-8000-000000000001';
insert into auth.users (id, instance_id, aud, role, email, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '20000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'epicgames@gamert.dev', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"EPIC GAMES","handle":"@epicgames"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set is_publisher = true, organizer_tier = 'editorial', verified_prizes = true, followers = 97400, bio = null where id = '20000000-0000-4000-8000-000000000002';
insert into auth.users (id, instance_id, aud, role, email, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '20000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'easports@gamert.dev', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"EA SPORTS","handle":"@easports"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set is_publisher = true, organizer_tier = 'editorial', verified_prizes = true, followers = 128000, bio = null where id = '20000000-0000-4000-8000-000000000003';
insert into auth.users (id, instance_id, aud, role, email, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '20000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'bandainamco@gamert.dev', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"BANDAI NAMCO","handle":"@bandainamco"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set is_publisher = true, organizer_tier = 'editorial', verified_prizes = true, followers = 54900, bio = null where id = '20000000-0000-4000-8000-000000000004';
insert into auth.users (id, instance_id, aud, role, email, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at) values (
  '20000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated',
  'mojang@gamert.dev', now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"MOJANG","handle":"@mojang"}'::jsonb, now(), now()
) on conflict (id) do nothing;
update public.profiles set is_publisher = true, organizer_tier = 'editorial', verified_prizes = true, followers = 71200, bio = null where id = '20000000-0000-4000-8000-000000000005';

-- ELO inicial por juego
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000001', 'fifa26', 2140, 62, 41, 15, 6, 2140, 4) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000001', 'efootball', 1980, 28, 19, 7, 2, 1980, 2) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000001', 'valorant', 1720, 14, 8, 5, 1, 1720, 0) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000002', 'fifa26', 2050, 48, 30, 14, 4, 2050, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000002', 'valorant', 1840, 22, 13, 8, 1, 1840, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000003', 'valorant', 2210, 71, 48, 17, 6, 2210, 6) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000003', 'lol', 1650, 19, 10, 8, 1, 1650, 0) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000004', 'lol', 1990, 39, 24, 12, 3, 1990, 2) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000004', 'minecraft', 1520, 11, 6, 4, 1, 1520, 0) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000005', 'fortnite', 1880, 34, 20, 11, 3, 1880, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000005', 'minecraft', 1610, 16, 9, 6, 1, 1610, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000006', 'valorant', 2330, 84, 58, 19, 7, 2330, 9) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000006', 'lol', 1780, 26, 15, 9, 2, 1780, 3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000007', 'tekken8', 2075, 44, 29, 12, 3, 2075, 2) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000007', 'fortnite', 1490, 9, 4, 4, 1, 1490, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000008', 'minecraft', 1760, 23, 14, 7, 2, 1760, 3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000008', 'efootball', 1340, 6, 2, 3, 1, 1340, 0) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000009', 'fortnite', 2120, 55, 35, 16, 4, 2120, 5) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000009', 'tekken8', 1450, 8, 4, 3, 1, 1450, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000010', 'efootball', 1910, 31, 19, 10, 2, 1910, 2) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000010', 'fifa26', 1700, 18, 10, 6, 2, 1700, 0) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000011', 'lol', 2150, 49, 33, 13, 3, 2150, 3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000011', 'valorant', 1520, 10, 5, 4, 1, 1520, 0) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000012', 'minecraft', 1830, 26, 16, 8, 2, 1830, 2) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000012', 'fortnite', 1290, 5, 2, 2, 1, 1290, 0) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000013', 'fifa26', 1112, 39, 20, 4, 15, 1112, -3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000013', 'lol', 1114, 31, 17, 14, 0, 1114, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000014', 'efootball', 1477, 104, 66, 38, 0, 1477, 4) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000014', 'lol', 885, 11, 3, 8, 0, 885, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000014', 'fifa26', 983, 11, 5, 6, 0, 983, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000015', 'valorant', 1157, 58, 23, 35, 0, 1157, -3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000015', 'efootball', 1067, 19, 9, 10, 0, 1067, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000015', 'fortnite', 1519, 7, 4, 3, 0, 1519, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000016', 'lol', 1858, 13, 7, 6, 0, 1858, 4) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000016', 'fifa26', 1249, 26, 8, 18, 0, 1249, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000017', 'minecraft', 1499, 78, 48, 14, 16, 1499, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000017', 'tekken8', 1241, 23, 13, 10, 0, 1241, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000018', 'fortnite', 1850, 32, 12, 16, 4, 1850, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000018', 'efootball', 1002, 7, 2, 5, 0, 1002, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000018', 'tekken8', 1579, 11, 7, 4, 0, 1579, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000019', 'tekken8', 1920, 97, 47, 50, 0, 1920, 4) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000019', 'valorant', 1015, 16, 8, 8, 0, 1015, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000020', 'fifa26', 1601, 52, 31, 21, 0, 1601, -3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000021', 'efootball', 1282, 6, 2, 4, 0, 1282, -3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000021', 'tekken8', 1379, 31, 17, 14, 0, 1379, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000022', 'valorant', 1217, 71, 33, 1, 37, 1217, -2) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000022', 'fifa26', 826, 10, 6, 4, 0, 826, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000022', 'lol', 1384, 35, 19, 16, 0, 1384, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000023', 'lol', 1569, 26, 15, 4, 7, 1569, -2) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000023', 'valorant', 1367, 28, 10, 18, 0, 1367, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000024', 'minecraft', 1344, 91, 30, 61, 0, 1344, -3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000024', 'efootball', 1145, 20, 8, 12, 0, 1145, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000024', 'fifa26', 880, 13, 7, 6, 0, 880, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000025', 'fortnite', 1025, 45, 20, 25, 0, 1025, 4) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000025', 'fifa26', 1327, 28, 16, 12, 0, 1327, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000026', 'tekken8', 1725, 110, 61, 49, 0, 1725, -3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000026', 'fortnite', 1510, 36, 14, 22, 0, 1510, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000026', 'lol', 1171, 7, 4, 3, 0, 1171, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000027', 'fifa26', 1406, 65, 43, 22, 0, 1406, -3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000027', 'minecraft', 912, 9, 5, 4, 0, 912, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000027', 'efootball', 927, 4, 1, 3, 0, 927, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000028', 'efootball', 1287, 19, 8, 10, 1, 1287, -3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000028', 'lol', 953, 15, 6, 9, 0, 953, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000029', 'valorant', 1638, 84, 45, 9, 30, 1638, -3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000029', 'minecraft', 1494, 33, 16, 17, 0, 1494, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000030', 'lol', 1468, 39, 25, 14, 0, 1468, -3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000030', 'tekken8', 1458, 33, 14, 19, 0, 1458, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000031', 'minecraft', 1149, 103, 41, 62, 0, 1149, 4) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000031', 'fortnite', 860, 6, 4, 2, 0, 860, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000032', 'fortnite', 1850, 58, 30, 28, 0, 1850, -3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000032', 'lol', 1042, 14, 6, 8, 0, 1042, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000033', 'tekken8', 1005, 13, 8, 3, 2, 1005, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000033', 'lol', 1318, 36, 17, 19, 0, 1318, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000034', 'fifa26', 1356, 77, 29, 38, 10, 1356, -2) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000034', 'fortnite', 1080, 20, 11, 9, 0, 1080, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000035', 'efootball', 1912, 32, 16, 16, 0, 1912, -3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000035', 'tekken8', 1588, 3, 1, 2, 0, 1588, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000036', 'valorant', 1593, 97, 59, 38, 0, 1593, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000036', 'minecraft', 990, 11, 5, 6, 0, 990, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000036', 'lol', 1067, 10, 6, 4, 0, 1067, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000037', 'lol', 1273, 51, 18, 33, 0, 1273, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000038', 'minecraft', 1743, 6, 3, 1, 2, 1743, 3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000039', 'fortnite', 1074, 71, 42, 10, 19, 1074, 3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000039', 'tekken8', 1445, 7, 4, 3, 0, 1445, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000040', 'tekken8', 1336, 25, 9, 16, 0, 1336, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000040', 'fortnite', 939, 8, 4, 4, 0, 939, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000040', 'valorant', 870, 31, 15, 16, 0, 870, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000041', 'fifa26', 1016, 90, 41, 49, 0, 1016, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000041', 'minecraft', 1121, 16, 5, 11, 0, 1121, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000041', 'tekken8', 1406, 28, 8, 20, 0, 1406, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000042', 'efootball', 1717, 45, 26, 19, 0, 1717, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000042', 'valorant', 1303, 23, 12, 11, 0, 1303, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000042', 'minecraft', 1161, 25, 11, 14, 0, 1161, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000043', 'valorant', 1398, 109, 35, 74, 0, 1398, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000043', 'efootball', 1485, 31, 11, 20, 0, 1485, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000044', 'lol', 1812, 64, 28, 33, 3, 1812, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000044', 'fifa26', 1031, 28, 9, 19, 0, 1031, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000045', 'minecraft', 1144, 19, 10, 2, 7, 1144, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000045', 'valorant', 1572, 11, 4, 7, 0, 1572, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000046', 'fortnite', 1460, 83, 55, 28, 0, 1460, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000046', 'lol', 1251, 20, 11, 9, 0, 1251, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000047', 'tekken8', 1141, 38, 16, 22, 0, 1141, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000047', 'valorant', 1433, 28, 11, 17, 0, 1433, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000048', 'fifa26', 1841, 103, 54, 49, 0, 1841, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000049', 'efootball', 1530, 57, 36, 10, 11, 1530, 3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000049', 'valorant', 1286, 11, 6, 5, 0, 1286, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000050', 'valorant', 1882, 12, 5, 6, 1, 1882, 3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000050', 'lol', 1157, 32, 15, 17, 0, 1157, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000050', 'tekken8', 1579, 31, 19, 12, 0, 1579, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000051', 'lol', 1904, 77, 39, 38, 0, 1904, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000051', 'minecraft', 918, 16, 9, 7, 0, 918, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000052', 'minecraft', 1584, 31, 19, 12, 0, 1584, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000052', 'efootball', 1563, 33, 20, 13, 0, 1563, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000053', 'fortnite', 1265, 96, 36, 60, 0, 1265, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000053', 'tekken8', 965, 6, 3, 3, 0, 965, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000053', 'valorant', 1594, 24, 8, 16, 0, 1594, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000054', 'tekken8', 1248, 51, 25, 1, 25, 1248, 4) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000054', 'valorant', 982, 36, 16, 20, 0, 982, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000054', 'lol', 1384, 21, 11, 10, 0, 1384, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000055', 'fifa26', 1600, 6, 4, 1, 1, 1600, 4) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000055', 'lol', 1523, 19, 10, 9, 0, 1523, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000056', 'efootball', 1327, 70, 25, 45, 0, 1327, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000056', 'valorant', 1512, 29, 8, 21, 0, 1512, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000057', 'valorant', 1008, 25, 12, 13, 0, 1008, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000057', 'fifa26', 914, 3, 1, 2, 0, 914, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000058', 'lol', 1709, 90, 52, 38, 0, 1709, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000058', 'tekken8', 1096, 11, 3, 8, 0, 1096, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000059', 'minecraft', 1389, 44, 15, 29, 0, 1389, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000060', 'fortnite', 1318, 109, 49, 55, 5, 1318, 2) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000060', 'minecraft', 1108, 6, 3, 3, 0, 1108, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000061', 'tekken8', 1669, 64, 36, 7, 21, 1669, 2) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000062', 'fifa26', 1452, 18, 12, 6, 0, 1452, 2) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000062', 'efootball', 1411, 8, 3, 5, 0, 1411, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000063', 'efootball', 1132, 83, 35, 48, 0, 1132, 2) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000063', 'fortnite', 1226, 16, 8, 8, 0, 1226, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000063', 'valorant', 1490, 27, 11, 16, 0, 1490, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000064', 'valorant', 1833, 38, 20, 18, 0, 1833, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000064', 'minecraft', 1408, 23, 8, 15, 0, 1408, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000064', 'fifa26', 1246, 24, 14, 10, 0, 1246, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000065', 'lol', 1036, 102, 66, 18, 18, 1036, 3) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000065', 'fortnite', 1474, 27, 17, 10, 0, 1474, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000066', 'minecraft', 1387, 57, 23, 27, 7, 1387, 4) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000066', 'fifa26', 1235, 11, 4, 7, 0, 1235, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000067', 'fortnite', 1895, 12, 6, 6, 0, 1895, -2) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000067', 'tekken8', 1174, 12, 7, 5, 0, 1174, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000067', 'efootball', 1293, 14, 4, 10, 0, 1293, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000068', 'tekken8', 1576, 76, 48, 28, 0, 1576, 2) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000068', 'fortnite', 1357, 20, 8, 12, 0, 1357, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000069', 'fifa26', 1257, 31, 12, 19, 0, 1257, 2) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000069', 'lol', 1539, 28, 16, 12, 0, 1539, -1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000070', 'efootball', 1774, 96, 48, 2, 46, 1774, 1) on conflict (player_id, game_id) do nothing;
insert into public.elo_ratings (player_id, game_id, rating, played, wins, losses, draws, peak, streak) values ('10000000-0000-4000-8000-000000000070', 'tekken8', 1059, 14, 5, 9, 0, 1059, 1) on conflict (player_id, game_id) do nothing;

-- torneos
insert into public.tournaments (id, name, game_id, organizer_id, publisher_tier, modality, format, date, time, timezone, slots, prize, rules, status, phase, featured) values ('summer-cup-fifa26', 'TORNEO SUMMER CUP', 'fifa26', '20000000-0000-4000-8000-000000000001', 'editorial', 'Virtual', 'grupos', '2026-02-10', '18:00', 'GMT-4', 16, '{"amount":500,"currency":"USD","kind":"efectivo","split":[60,25,15]}'::jsonb, '{"minElo":150,"maxParticipants":16,"requireConfirmation":true,"disputeWindowMin":24,"autoForfeitOnDisconnect":true,"bestOf":3,"notes":"PARA PARTICIPAR TIENES QUE CONTAR CON UNA CANTIDAD DE 150 PTS DE ELO. SE PROHIBEN EL USO DE CHEATS Y SMURFS"}'::jsonb, 'live', 'FASE DE GRUPOS-GRUPO A', true);
insert into public.tournaments (id, name, game_id, organizer_id, publisher_tier, modality, format, date, time, timezone, slots, prize, rules, status, phase, featured) values ('super-cup-fifa', 'TORNEO SUPER CUP - FIFA', 'fifa26', '20000000-0000-4000-8000-000000000003', 'editorial', 'Virtual', 'eliminacion', '2026-02-10', '18:00', 'GMT-4', 16, '{"amount":500,"currency":"USD","kind":"efectivo","split":[70,30,0]}'::jsonb, '{"minElo":150,"maxParticipants":16,"requireConfirmation":true,"disputeWindowMin":24,"autoForfeitOnDisconnect":true,"bestOf":3,"notes":"PARA PARTICIPAR TIENES QUE CONTAR CON UNA CANTIDAD DE 150 PTS DE ELO. SE PROHIBEN EL USO DE CHEATS Y SMURFS"}'::jsonb, 'upcoming', null, false);
insert into public.tournaments (id, name, game_id, organizer_id, publisher_tier, modality, format, date, time, timezone, slots, prize, rules, status, phase, featured) values ('super-cup-valo', 'TORNEO SUPER CUP - VALO', 'valorant', '20000000-0000-4000-8000-000000000001', 'editorial', 'Presencial', 'eliminacion', '2026-03-14', '20:00', 'GMT-4', 80, '{"amount":1200,"currency":"USD","kind":"efectivo","split":[60,25,15]}'::jsonb, '{"minElo":150,"maxParticipants":80,"requireConfirmation":true,"disputeWindowMin":24,"autoForfeitOnDisconnect":true,"bestOf":5,"notes":"PARA PARTICIPAR TIENES QUE CONTAR CON UNA CANTIDAD DE 150 PTS DE ELO. SE PROHIBEN EL USO DE CHEATS Y SMURFS"}'::jsonb, 'upcoming', null, false);
insert into public.tournaments (id, name, game_id, organizer_id, publisher_tier, modality, format, date, time, timezone, slots, prize, rules, status, phase, featured) values ('valorant-regional', 'TORNEO VALORANT', 'valorant', '10000000-0000-4000-8000-000000000003', 'comunidad', 'Virtual', 'eliminacion', '2026-03-02', '17:00', 'GMT-4', 32, '{"amount":300,"currency":"USD","kind":"efectivo","split":[70,30,0]}'::jsonb, '{"minElo":1200,"maxParticipants":16,"requireConfirmation":true,"disputeWindowMin":24,"autoForfeitOnDisconnect":true,"bestOf":3,"notes":"PARA PARTICIPAR TIENES QUE CONTAR CON UNA CANTIDAD DE 150 PTS DE ELO. SE PROHIBEN EL USO DE CHEATS Y SMURFS"}'::jsonb, 'upcoming', null, false);
insert into public.tournaments (id, name, game_id, organizer_id, publisher_tier, modality, format, date, time, timezone, slots, prize, rules, status, phase, featured) values ('lol-open', 'TORNEO LOL', 'lol', '10000000-0000-4000-8000-000000000011', 'comunidad', 'Presencial', 'suizo', '2026-03-08', '19:00', 'GMT-4', 16, '{"amount":250,"currency":"USD","kind":"efectivo","split":[60,25,15]}'::jsonb, '{"minElo":1400,"maxParticipants":16,"requireConfirmation":true,"disputeWindowMin":24,"autoForfeitOnDisconnect":true,"bestOf":3,"notes":"PARA PARTICIPAR TIENES QUE CONTAR CON UNA CANTIDAD DE 150 PTS DE ELO. SE PROHIBEN EL USO DE CHEATS Y SMURFS"}'::jsonb, 'upcoming', null, false);
insert into public.tournaments (id, name, game_id, organizer_id, publisher_tier, modality, format, date, time, timezone, slots, prize, rules, status, phase, featured) values ('minecraft-craft', 'TORNEO MINECRAFT', 'minecraft', '10000000-0000-4000-8000-000000000012', 'comunidad', 'Virtual', 'doble_eliminacion', '2026-03-20', '16:00', 'GMT-4', 64, '{"amount":180,"currency":"USD","kind":"creditos","split":[50,30,20]}'::jsonb, '{"minElo":100,"maxParticipants":64,"requireConfirmation":true,"disputeWindowMin":24,"autoForfeitOnDisconnect":true,"bestOf":3,"notes":"PARA PARTICIPAR TIENES QUE CONTAR CON UNA CANTIDAD DE 150 PTS DE ELO. SE PROHIBEN EL USO DE CHEATS Y SMURFS"}'::jsonb, 'upcoming', null, false);
insert into public.tournaments (id, name, game_id, organizer_id, publisher_tier, modality, format, date, time, timezone, slots, prize, rules, status, phase, featured) values ('fortnite-cup', 'TORNEO FORTNITE', 'fortnite', '10000000-0000-4000-8000-000000000009', 'comunidad', 'Virtual', 'eliminacion', '2026-04-01', '21:00', 'GMT-4', 64, '{"amount":900,"currency":"USD","kind":"efectivo","split":[70,20,10]}'::jsonb, '{"minElo":1600,"maxParticipants":64,"requireConfirmation":true,"disputeWindowMin":24,"autoForfeitOnDisconnect":true,"bestOf":5,"notes":"PARA PARTICIPAR TIENES QUE CONTAR CON UNA CANTIDAD DE 150 PTS DE ELO. SE PROHIBEN EL USO DE CHEATS Y SMURFS"}'::jsonb, 'upcoming', null, false);
insert into public.tournaments (id, name, game_id, organizer_id, publisher_tier, modality, format, date, time, timezone, slots, prize, rules, status, phase, featured) values ('tekken-8', 'TORNEO TEKKEN 8', 'tekken8', '10000000-0000-4000-8000-000000000007', 'comunidad', 'Presencial', 'eliminacion', '2026-04-11', '18:00', 'GMT-4', 16, '{"amount":0,"currency":"USD","kind":"ninguno","split":[0,0,0]}'::jsonb, '{"minElo":1200,"maxParticipants":16,"requireConfirmation":true,"disputeWindowMin":24,"autoForfeitOnDisconnect":true,"bestOf":5,"notes":"PARA PARTICIPAR TIENES QUE CONTAR CON UNA CANTIDAD DE 150 PTS DE ELO. SE PROHIBEN EL USO DE CHEATS Y SMURFS"}'::jsonb, 'upcoming', null, false);
insert into public.tournaments (id, name, game_id, organizer_id, publisher_tier, modality, format, date, time, timezone, slots, prize, rules, status, phase, featured) values ('efootball-league', 'TORNEO E FOOTBALL', 'efootball', '20000000-0000-4000-8000-000000000003', 'editorial', 'Presencial', 'grupos', '2026-03-25', '15:00', 'GMT-4', 32, '{"amount":350,"currency":"USD","kind":"efectivo","split":[50,30,20]}'::jsonb, '{"minElo":800,"maxParticipants":32,"requireConfirmation":true,"disputeWindowMin":24,"autoForfeitOnDisconnect":true,"bestOf":3,"notes":"PARA PARTICIPAR TIENES QUE CONTAR CON UNA CANTIDAD DE 150 PTS DE ELO. SE PROHIBEN EL USO DE CHEATS Y SMURFS"}'::jsonb, 'upcoming', null, false);
insert into public.tournaments (id, name, game_id, organizer_id, publisher_tier, modality, format, date, time, timezone, slots, prize, rules, status, phase, featured) values ('daily-fifa-cup', 'FIFA DAILY CUP', 'fifa26', '10000000-0000-4000-8000-000000000001', 'comunidad', 'Virtual', 'eliminacion', '2026-01-01', '20:00', 'GMT-3', 32, '{"amount":50,"currency":"USD","kind":"creditos","split":[100,0,0]}'::jsonb, '{"minElo":1200,"maxParticipants":32,"requireConfirmation":true,"disputeWindowMin":24,"autoForfeitOnDisconnect":true,"bestOf":3,"notes":"PARA PARTICIPAR TIENES QUE CONTAR CON UNA CANTIDAD DE 150 PTS DE ELO. SE PROHIBEN EL USO DE CHEATS Y SMURFS"}'::jsonb, 'upcoming', null, false);
insert into public.tournaments (id, name, game_id, organizer_id, publisher_tier, modality, format, date, time, timezone, slots, prize, rules, status, phase, featured) values ('daily-valorant-open', 'VALORANT DAILY OPEN', 'valorant', '10000000-0000-4000-8000-000000000003', 'comunidad', 'Virtual', 'eliminacion', '2026-01-01', '21:00', 'GMT-3', 16, '{"amount":30,"currency":"USD","kind":"creditos","split":[100,0,0]}'::jsonb, '{"minElo":1400,"maxParticipants":16,"requireConfirmation":true,"disputeWindowMin":24,"autoForfeitOnDisconnect":true,"bestOf":3,"notes":"PARA PARTICIPAR TIENES QUE CONTAR CON UNA CANTIDAD DE 150 PTS DE ELO. SE PROHIBEN EL USO DE CHEATS Y SMURFS"}'::jsonb, 'upcoming', null, false);
insert into public.tournaments (id, name, game_id, organizer_id, publisher_tier, modality, format, date, time, timezone, slots, prize, rules, status, phase, featured) values ('daily-lol-amateur', 'LOL AMATEUR NIGHT', 'lol', '10000000-0000-4000-8000-000000000011', 'comunidad', 'Virtual', 'eliminacion', '2026-01-01', '22:00', 'GMT-3', 16, '{"amount":25,"currency":"USD","kind":"creditos","split":[100,0,0]}'::jsonb, '{"minElo":1100,"maxParticipants":16,"requireConfirmation":true,"disputeWindowMin":24,"autoForfeitOnDisconnect":true,"bestOf":3,"notes":"PARA PARTICIPAR TIENES QUE CONTAR CON UNA CANTIDAD DE 150 PTS DE ELO. SE PROHIBEN EL USO DE CHEATS Y SMURFS"}'::jsonb, 'upcoming', null, false);
insert into public.tournaments (id, name, game_id, organizer_id, publisher_tier, modality, format, date, time, timezone, slots, prize, rules, status, phase, featured) values ('daily-mc-build', 'MINECRAFT BUILD DUEL', 'minecraft', '10000000-0000-4000-8000-000000000012', 'comunidad', 'Virtual', 'eliminacion', '2026-01-01', '19:00', 'GMT-3', 8, '{"amount":0,"currency":"USD","kind":"ninguno","split":[0,0,0]}'::jsonb, '{"minElo":1000,"maxParticipants":8,"requireConfirmation":true,"disputeWindowMin":24,"autoForfeitOnDisconnect":true,"bestOf":3,"notes":"PARA PARTICIPAR TIENES QUE CONTAR CON UNA CANTIDAD DE 150 PTS DE ELO. SE PROHIBEN EL USO DE CHEATS Y SMURFS"}'::jsonb, 'upcoming', null, false);

-- series diarias
insert into public.daily_series (id, tournament_id, days, horizon_days) values ('s1', 'daily-fifa-cup', array[1,2,3,4,5,6,0], 7);
insert into public.daily_series (id, tournament_id, days, horizon_days) values ('s2', 'daily-valorant-open', array[2,4,6], 7);
insert into public.daily_series (id, tournament_id, days, horizon_days) values ('s3', 'daily-lol-amateur', array[1,3,5], 7);
insert into public.daily_series (id, tournament_id, days, horizon_days) values ('s4', 'daily-mc-build', array[6,0], 7);

commit;
