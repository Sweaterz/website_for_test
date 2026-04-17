import { getSupabaseServerClient } from "@/lib/supabase/server";

export interface OrderListItem {
  id: string;
  orderNo: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
  expiresAt: string | null;
  items: {
    quantity: number;
    unitPrice: number;
    subtotal: number;
    ticketTypeName: string | null;
  }[];
}

function getTicketTypeName(ticketTypes: { name: string | null }[] | { name: string | null } | null) {
  if (Array.isArray(ticketTypes)) {
    return ticketTypes[0]?.name ?? null;
  }

  return ticketTypes?.name ?? null;
}

export async function getCurrentUserOrders(userId: string): Promise<OrderListItem[]> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        order_no,
        status,
        total_amount,
        currency,
        created_at,
        paid_at,
        expires_at,
        order_items (
          quantity,
          unit_price,
          subtotal,
          ticket_types (
            name
          )
        )
      `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`failed to load orders: ${error.message}`);
  }

  return (data ?? []).map((order) => ({
    id: order.id,
    orderNo: order.order_no,
    status: order.status,
    totalAmount: Number(order.total_amount),
    currency: order.currency,
    createdAt: order.created_at,
    paidAt: order.paid_at,
    expiresAt: order.expires_at,
    items: (order.order_items ?? []).map((item) => ({
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      subtotal: Number(item.subtotal),
      ticketTypeName: getTicketTypeName(item.ticket_types ?? null),
    })),
  }));
}
