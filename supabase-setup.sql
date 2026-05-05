-- LifeLink Pakistan Supabase setup/repair script
-- Run this in Supabase Dashboard > SQL Editor.
-- Safe to run again if the table already exists.

create extension if not exists "pgcrypto";

create table if not exists public.blood_donors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null,
  city text not null,
  address text not null,
  blood_group text not null,
  created_at timestamptz not null default now(),
  constraint blood_donors_email_format check (
    email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  constraint blood_donors_blood_group_check check (
    blood_group in ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')
  )
);

alter table public.blood_donors
  add column if not exists id uuid,
  add column if not exists name text,
  add column if not exists email text,
  add column if not exists phone text,
  add column if not exists city text,
  add column if not exists address text,
  add column if not exists blood_group text,
  add column if not exists created_at timestamptz;

alter table public.blood_donors
  alter column id set default gen_random_uuid(),
  alter column created_at set default now();

update public.blood_donors
set
  id = coalesce(id, gen_random_uuid()),
  created_at = coalesce(created_at, now());

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.blood_donors'::regclass
      and contype = 'p'
  ) then
    alter table public.blood_donors
      add constraint blood_donors_pkey primary key (id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.blood_donors'::regclass
      and conname = 'blood_donors_email_format'
  ) then
    alter table public.blood_donors
      add constraint blood_donors_email_format check (
        email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
      ) not valid;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.blood_donors'::regclass
      and conname = 'blood_donors_blood_group_check'
  ) then
    alter table public.blood_donors
      add constraint blood_donors_blood_group_check check (
        blood_group in ('A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-')
      ) not valid;
  end if;
end $$;

create index if not exists blood_donors_city_blood_group_idx
  on public.blood_donors (city, blood_group);

create index if not exists blood_donors_created_at_idx
  on public.blood_donors (created_at desc);

alter table public.blood_donors enable row level security;

drop policy if exists "Allow public donor search" on public.blood_donors;
create policy "Allow public donor search"
  on public.blood_donors
  for select
  to anon
  using (true);

drop policy if exists "Allow public donor registration" on public.blood_donors;
create policy "Allow public donor registration"
  on public.blood_donors
  for insert
  to anon
  with check (true);

-- Optional test data. Keep this block only if you want demo donors.
insert into public.blood_donors
  (name, email, phone, city, address, blood_group)
select 'Test Donor A', 'donor.a@example.com', '03001234567', 'Lahore', 'Mayo Hospital Lahore', 'O+'
where not exists (
  select 1 from public.blood_donors where email = 'donor.a@example.com'
);

insert into public.blood_donors
  (name, email, phone, city, address, blood_group)
select 'Test Donor B', 'donor.b@example.com', '03111234567', 'Karachi', 'Aga Khan Hospital Karachi', 'A-'
where not exists (
  select 1 from public.blood_donors where email = 'donor.b@example.com'
);
