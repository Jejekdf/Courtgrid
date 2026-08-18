-- CourtGrid — Realtime availability signal (Anti-Palkor 2.0 live slot updates)
--
-- Adds a PII-free `slot_change` table fed by a trigger on `reservations`, and
-- exposes it through Supabase Realtime (`supabase_realtime` publication).
--
-- NOTE — deliberately NO RLS on this table: Supabase Realtime does NOT deliver
-- postgres_changes events for RLS-enabled tables, even with an open policy for
-- the subscriber role (verified empirically; RLS ON = events suppressed, RLS
-- OFF = events flow). The table carries only court_id + date_key (already
-- public via availability), is not exposed through PostgREST (no grants), and
-- is read exclusively by the Realtime service.
--
-- Single owner of the "something changed" signal = the DB trigger. Covers all
-- reservation writes (create, cancel, webhook, ghost-cancel, admin) with zero
-- app-code publish points, so it can never drift (cf. FIX-H4).
--
-- Apply via Supabase (SQL editor / migration). Idempotent — safe to re-run.

create table if not exists public.slot_change (
  id bigint generated always as identity primary key,
  court_id text not null,
  date_key text not null,
  created_at timestamptz not null default now()
);

create index if not exists slot_change_court_date_idx
  on public.slot_change (court_id, date_key);
create index if not exists slot_change_created_at_idx
  on public.slot_change (created_at);

create or replace function public.notify_slot_change()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_court text;
  v_date text;
begin
  if tg_op in ('INSERT', 'UPDATE') then
    v_court := new.court_id;
    v_date := to_char(new.date, 'YYYY-MM-DD');
  else
    v_court := old.court_id;
    v_date := to_char(old.date, 'YYYY-MM-DD');
  end if;

  if v_court is not null then
    insert into public.slot_change (court_id, date_key)
    values (v_court, v_date);
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_notify_slot_change on public.reservations;
create trigger trg_notify_slot_change
after insert or update or delete on public.reservations
for each row
execute function public.notify_slot_change();

-- Realtime needs the subscriber role to SELECT the table to build the change
-- record (verified empirically: no grant = events silently dropped). Grant
-- SELECT only — no RLS, no other privileges. The signal is non-sensitive
-- (court_id + date_key, already public via availability) and the table is not
-- exposed by the app through PostgREST.
grant select on public.slot_change to anon;
grant select on public.slot_change to authenticated;

-- Publish to the Realtime service (idempotent membership check).
do $$
begin
  if not exists (
    select 1
    from pg_publication p
    join pg_publication_rel pr on pr.prpubid = p.oid
    where p.pubname = 'supabase_realtime'
      and pr.prrelid = 'public.slot_change'::regclass
  ) then
    alter publication supabase_realtime add table public.slot_change;
  end if;
end
$$;

-- Retention: prune old signals nightly (rows older than 3 days are dead weight —
-- clients refetch full availability on every signal anyway).
create extension if not exists pg_cron;

select cron.unschedule('cleanup-slot-change')
where exists (
  select 1 from cron.job where jobname = 'cleanup-slot-change'
);

select cron.schedule('cleanup-slot-change', '0 3 * * *', $cron$
  delete from public.slot_change where created_at < now() - interval '3 days'
$cron$);