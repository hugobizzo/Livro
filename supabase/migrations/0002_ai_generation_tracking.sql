create table public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  kind text not null,
  provider text not null default 'openai',
  model text not null,
  prompt_name text not null,
  prompt_version integer not null default 1,
  status text not null default 'completed',
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  image_count integer not null default 0,
  cost_brl numeric(10, 2) not null default 0,
  output jsonb not null default '{}'::jsonb,
  error_message text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.ai_generations enable row level security;

create policy "ai_generations_owner_or_admin_select"
on public.ai_generations for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.orders
    where orders.id = ai_generations.order_id
      and orders.owner_user_id = (select auth.uid())
  )
);

create policy "ai_generations_owner_or_admin_insert"
on public.ai_generations for insert
to authenticated
with check (
  public.is_admin()
  or order_id is null
  or exists (
    select 1 from public.orders
    where orders.id = ai_generations.order_id
      and orders.owner_user_id = (select auth.uid())
  )
);

alter table public.payments
add column if not exists preference_id text,
add column if not exists checkout_url text,
add column if not exists external_reference text;

create index if not exists payments_external_reference_idx
on public.payments (external_reference);

create index if not exists ai_generations_order_id_idx
on public.ai_generations (order_id);
