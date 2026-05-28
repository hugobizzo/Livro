-- Livro Magico - schema inicial
-- Rode em um projeto Supabase exclusivo deste app.

create extension if not exists pgcrypto;

create type public.user_role as enum ('customer', 'admin');
create type public.order_stage as enum (
  'briefing',
  'story_approval',
  'character_approval',
  'page_approval',
  'quality_review',
  'print_package',
  'printer_handoff'
);
create type public.financial_status as enum ('draft', 'awaiting_payment', 'paid', 'manual_review');
create type public.approval_status as enum ('approved', 'waiting', 'revision_requested', 'blocked');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'customer',
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  public_code text not null unique,
  serial_code text not null unique,
  customer_name text,
  child_name text not null,
  title text not null,
  city text,
  format text not null default 'A5 vertical',
  pages integer not null default 16 check (pages > 0 and pages % 4 = 0),
  price_brl numeric(10, 2) not null default 200,
  generation_cost_brl numeric(10, 2) not null default 0,
  print_cost_brl numeric(10, 2) not null default 0,
  freight_cost_brl numeric(10, 2) not null default 0,
  margin_brl numeric(10, 2) generated always as (
    price_brl - generation_cost_brl - print_cost_brl - freight_cost_brl
  ) stored,
  financial_status public.financial_status not null default 'draft',
  stage public.order_stage not null default 'briefing',
  status_label text not null default 'Rascunho',
  briefing jsonb not null default '{}'::jsonb,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_characters (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  name text not null,
  role text not null,
  relation text,
  personality text,
  appearance text,
  special_object text,
  catchphrase text,
  immutable_notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.story_pages (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  page_number integer not null check (page_number > 0),
  scene text not null,
  page_text text not null,
  emotion text,
  required_elements text[] not null default '{}',
  forbidden_elements text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, page_number)
);

create table public.approvals (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  label text not null,
  status public.approval_status not null default 'blocked',
  revisions_used integer not null default 0,
  revisions_limit integer not null default 2,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (order_id, label)
);

create table public.revision_requests (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  approval_id uuid references public.approvals(id) on delete set null,
  page_number integer,
  note text not null,
  status text not null default 'open',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.order_assets (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  character_id uuid references public.order_characters(id) on delete set null,
  kind text not null,
  bucket text not null,
  path text not null,
  original_filename text,
  retention_until date,
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'mercado_pago',
  provider_payment_id text,
  status text not null,
  amount_brl numeric(10, 2) not null,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.printers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  status text not null default 'testing',
  formats text,
  sla text,
  contact jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.print_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  printer_id uuid references public.printers(id) on delete set null,
  status text not null default 'draft',
  package_asset_id uuid references public.order_assets(id) on delete set null,
  tracking_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quality_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  stage text not null,
  severity text not null default 'medium',
  problem text not null,
  root_cause text,
  proposed_change text,
  status text not null default 'pending_approval',
  created_at timestamptz not null default now()
);

create table public.prompt_versions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  version integer not null,
  status text not null default 'draft',
  content text not null,
  change_reason text,
  created_at timestamptz not null default now(),
  unique (name, version)
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger orders_touch_updated_at
before update on public.orders
for each row execute function public.touch_updated_at();

create trigger story_pages_touch_updated_at
before update on public.story_pages
for each row execute function public.touch_updated_at();

create trigger print_jobs_touch_updated_at
before update on public.print_jobs
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.order_characters enable row level security;
alter table public.story_pages enable row level security;
alter table public.approvals enable row level security;
alter table public.revision_requests enable row level security;
alter table public.order_assets enable row level security;
alter table public.payments enable row level security;
alter table public.printers enable row level security;
alter table public.print_jobs enable row level security;
alter table public.quality_events enable row level security;
alter table public.prompt_versions enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles for select
to authenticated
using ((select auth.uid()) = id or public.is_admin());

create policy "profiles_update_own_or_admin"
on public.profiles for update
to authenticated
using ((select auth.uid()) = id or public.is_admin())
with check ((select auth.uid()) = id or public.is_admin());

create policy "orders_owner_or_admin_all"
on public.orders for all
to authenticated
using (owner_user_id = (select auth.uid()) or public.is_admin())
with check (owner_user_id = (select auth.uid()) or public.is_admin());

create policy "order_characters_owner_or_admin_all"
on public.order_characters for all
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_characters.order_id
      and (orders.owner_user_id = (select auth.uid()) or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.orders
    where orders.id = order_characters.order_id
      and (orders.owner_user_id = (select auth.uid()) or public.is_admin())
  )
);

create policy "story_pages_owner_or_admin_all"
on public.story_pages for all
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = story_pages.order_id
      and (orders.owner_user_id = (select auth.uid()) or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.orders
    where orders.id = story_pages.order_id
      and (orders.owner_user_id = (select auth.uid()) or public.is_admin())
  )
);

create policy "approvals_owner_or_admin_all"
on public.approvals for all
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = approvals.order_id
      and (orders.owner_user_id = (select auth.uid()) or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.orders
    where orders.id = approvals.order_id
      and (orders.owner_user_id = (select auth.uid()) or public.is_admin())
  )
);

create policy "revision_requests_owner_or_admin_all"
on public.revision_requests for all
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = revision_requests.order_id
      and (orders.owner_user_id = (select auth.uid()) or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.orders
    where orders.id = revision_requests.order_id
      and (orders.owner_user_id = (select auth.uid()) or public.is_admin())
  )
);

create policy "order_assets_owner_or_admin_all"
on public.order_assets for all
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = order_assets.order_id
      and (orders.owner_user_id = (select auth.uid()) or public.is_admin())
  )
)
with check (
  exists (
    select 1 from public.orders
    where orders.id = order_assets.order_id
      and (orders.owner_user_id = (select auth.uid()) or public.is_admin())
  )
);

create policy "payments_owner_or_admin_select"
on public.payments for select
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = payments.order_id
      and (orders.owner_user_id = (select auth.uid()) or public.is_admin())
  )
);

create policy "printers_admin_all"
on public.printers for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "printers_customer_read"
on public.printers for select
to authenticated
using (status = 'active' or public.is_admin());

create policy "print_jobs_owner_or_admin_select"
on public.print_jobs for select
to authenticated
using (
  exists (
    select 1 from public.orders
    where orders.id = print_jobs.order_id
      and (orders.owner_user_id = (select auth.uid()) or public.is_admin())
  )
);

create policy "quality_events_admin_all"
on public.quality_events for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "prompt_versions_admin_all"
on public.prompt_versions for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values
  ('original-uploads', 'original-uploads', false),
  ('generated-assets', 'generated-assets', false),
  ('print-packages', 'print-packages', false)
on conflict (id) do nothing;

create policy "storage_user_folder_read"
on storage.objects for select
to authenticated
using (
  bucket_id in ('original-uploads', 'generated-assets', 'print-packages')
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or public.is_admin()
  )
);

create policy "storage_user_folder_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('original-uploads', 'generated-assets', 'print-packages')
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or public.is_admin()
  )
);

create policy "storage_user_folder_update"
on storage.objects for update
to authenticated
using (
  bucket_id in ('original-uploads', 'generated-assets', 'print-packages')
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or public.is_admin()
  )
)
with check (
  bucket_id in ('original-uploads', 'generated-assets', 'print-packages')
  and (
    (storage.foldername(name))[1] = (select auth.uid())::text
    or public.is_admin()
  )
);
