import { getSupabaseAdminClient } from "../supabase/admin";

export interface OrderItemInput {
  ticketTypeId: string;
  quantity: number;
}

export interface SubmitOrderInput {
  userId: string;
  items: OrderItemInput[];
}

export interface PendingOrderResult {
  order_id: string;
  order_no: string;
  total_amount: number;
  status: "pending";
  expires_at: string;
}

interface RpcClient {
  rpc: (
    fn: string,
    args: Record<string, unknown>,
  ) => PromiseLike<{ data: PendingOrderResult | null; error: { code?: string; message: string } | null }>;
}

export class InsufficientStockError extends Error {}

export function validateSubmitOrderInput(input: SubmitOrderInput) {
  if (!input.userId) {
    throw new Error("userId is required");
  }

  if (!input.items.length) {
    throw new Error("items must not be empty");
  }

  for (const item of input.items) {
    if (!item.ticketTypeId) {
      throw new Error("ticketTypeId is required");
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error("quantity must be a positive integer");
    }
  }
}

export async function submitOrderWithInventoryLock(
  input: SubmitOrderInput,
  client: RpcClient = getSupabaseAdminClient(),
): Promise<PendingOrderResult> {
  validateSubmitOrderInput(input);

  const payload = input.items.map((item) => ({
    ticket_type_id: item.ticketTypeId,
    quantity: item.quantity,
  }));

  const { data, error } = await client.rpc("create_pending_order_with_lock", {
    p_user_id: input.userId,
    p_items: payload,
  });

  if (error) {
    if (error.code === "P0001" && error.message.includes("INSUFFICIENT_STOCK")) {
      throw new InsufficientStockError("库存不足，无法完成锁库存下单");
    }

    throw new Error(`failed to submit order: ${error.message}`);
  }

  if (!data) {
    throw new Error("failed to submit order: empty response from RPC");
  }

  return data;
}
