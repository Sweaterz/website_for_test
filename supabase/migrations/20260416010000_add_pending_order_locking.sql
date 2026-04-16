begin;

create or replace function public.create_pending_order_with_lock(
  p_user_id uuid,
  p_items jsonb
)
returns table (
  order_id uuid,
  order_no text,
  total_amount numeric,
  status text,
  expires_at timestamptz
)
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_order_no text;
  v_total_amount numeric(12, 2) := 0;
  v_ticket_type_id uuid;
  v_quantity integer;
  v_price numeric(12, 2);
  v_currency text;
  v_order_currency text;
  v_available integer;
  v_expires_at timestamptz := now() + interval '15 minutes';
  v_item jsonb;
begin
  if p_user_id is null then
    raise exception 'INVALID_USER_ID';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_ITEMS';
  end if;

  -- 1) 先创建 pending 订单（如后续失败，事务会整体回滚）
  v_order_no := 'ORD-' || to_char(now(), 'YYYYMMDDHH24MISSMS') || '-' || substr(gen_random_uuid()::text, 1, 6);

  insert into public.orders (order_no, user_id, status, total_amount, currency, expires_at)
  values (v_order_no, p_user_id, 'pending', 0, 'CNY', v_expires_at)
  returning id into v_order_id;

  -- 2) 锁库存并扣减，使用 FOR UPDATE 防止并发超卖
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_ticket_type_id := (v_item->>'ticket_type_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;

    if v_ticket_type_id is null or v_quantity is null or v_quantity <= 0 then
      raise exception 'INVALID_ITEM';
    end if;

    select
      tt.price,
      tt.currency,
      (tt.quota - tt.sold_count) as available
    into v_price, v_currency, v_available
    from public.ticket_types tt
    where tt.id = v_ticket_type_id
    for update;

    if not found then
      raise exception 'TICKET_TYPE_NOT_FOUND: %', v_ticket_type_id;
    end if;

    if v_available < v_quantity then
      raise exception 'INSUFFICIENT_STOCK: ticket_type_id=% requested=% available=%',
        v_ticket_type_id, v_quantity, v_available;
    end if;

    if v_order_currency is null then
      v_order_currency := v_currency;
    elsif v_order_currency <> v_currency then
      raise exception 'MIXED_CURRENCY_NOT_ALLOWED';
    end if;

    update public.ticket_types
    set sold_count = sold_count + v_quantity
    where id = v_ticket_type_id;

    insert into public.order_items (order_id, ticket_type_id, quantity, unit_price)
    values (v_order_id, v_ticket_type_id, v_quantity, v_price);

    v_total_amount := v_total_amount + (v_price * v_quantity);
  end loop;

  update public.orders
  set total_amount = v_total_amount,
      currency = coalesce(v_order_currency, currency)
  where id = v_order_id;

  return query
  select o.id, o.order_no, o.total_amount, o.status, o.expires_at
  from public.orders o
  where o.id = v_order_id;
end;
$$;

comment on function public.create_pending_order_with_lock(uuid, jsonb)
is 'Create pending order first, then lock and deduct stock in one DB transaction to prevent overselling.';

commit;
