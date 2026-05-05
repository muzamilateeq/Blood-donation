-- LifeLink Pakistan Supabase setup
-- Run this in Supabase Dashboard > SQL Editor.

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

-- Optional test data. Remove or edit before production.
insert into public.blood_donors
  (name, email, phone, city, address, blood_group)
values
  ('Test Donor A', 'donor.a@example.com', '03001234567', 'Lahore', 'Mayo Hospital Lahore', 'O+'),
  ('Test Donor B', 'donor.b@example.com', '03111234567', 'Karachi', 'Aga Khan Hospital Karachi', 'A-')
on conflict do nothing;
