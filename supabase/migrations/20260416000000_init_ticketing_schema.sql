-- Ticketing app initial schema
-- Tables:
-- - users
-- - events
-- - event_sessions
-- - ticket_types
-- - orders
-- - order_items

begin;

-- Extensions
create extension if not exists pgcrypto;

-- Common trigger function for updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- users
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_users_updated_at
before update on public.users
for each row
execute function public.set_updated_at();

-- events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_events_status on public.events(status);

create trigger trg_events_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

-- event_sessions
create table if not exists public.event_sessions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  session_name text,
  venue_name text not null,
  venue_address text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity integer not null check (capacity > 0),
  status text not null default 'scheduled' check (status in ('scheduled', 'sold_out', 'cancelled', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_session_time check (ends_at is null or ends_at > starts_at)
);

create index if not exists idx_event_sessions_event_id on public.event_sessions(event_id);
create index if not exists idx_event_sessions_starts_at on public.event_sessions(starts_at);

create trigger trg_event_sessions_updated_at
before update on public.event_sessions
for each row
execute function public.set_updated_at();

-- ticket_types
create table if not exists public.ticket_types (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.event_sessions(id) on delete cascade,
  name text not null,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  currency text not null default 'CNY',
  quota integer not null check (quota >= 0),
  sold_count integer not null default 0 check (sold_count >= 0),
  sale_starts_at timestamptz,
  sale_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_sale_window check (sale_ends_at is null or sale_starts_at is null or sale_ends_at > sale_starts_at),
  constraint chk_ticket_stock check (sold_count <= quota)
);

create index if not exists idx_ticket_types_session_id on public.ticket_types(session_id);

create trigger trg_ticket_types_updated_at
before update on public.ticket_types
for each row
execute function public.set_updated_at();

-- orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  user_id uuid not null references public.users(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled', 'refunded', 'expired')),
  total_amount numeric(12, 2) not null default 0 check (total_amount >= 0),
  currency text not null default 'CNY',
  paid_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user_id on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);

create trigger trg_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

-- order_items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  ticket_type_id uuid not null references public.ticket_types(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  subtotal numeric(12, 2) generated always as (quantity * unit_price) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_order_items_ticket_type_id on public.order_items(ticket_type_id);

create trigger trg_order_items_updated_at
before update on public.order_items
for each row
execute function public.set_updated_at();

commit;
