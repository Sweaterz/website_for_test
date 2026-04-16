import { describe, expect, it, vi } from "vitest";
import {
  InsufficientStockError,
  submitOrderWithInventoryLock,
  validateSubmitOrderInput,
} from "./place-order";

describe("validateSubmitOrderInput", () => {
  it("rejects empty items", () => {
    expect(() =>
      validateSubmitOrderInput({
        userId: "u1",
        items: [],
      }),
    ).toThrow("items must not be empty");
  });

  it("rejects invalid quantity", () => {
    expect(() =>
      validateSubmitOrderInput({
        userId: "u1",
        items: [{ ticketTypeId: "t1", quantity: 0 }],
      }),
    ).toThrow("quantity must be a positive integer");
  });
});

describe("submitOrderWithInventoryLock", () => {
  it("calls RPC and returns pending order", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: {
        order_id: "o1",
        order_no: "ORD_001",
        total_amount: 380,
        status: "pending",
        expires_at: "2026-04-16T00:00:00Z",
      },
      error: null,
    });

    const result = await submitOrderWithInventoryLock(
      {
        userId: "u1",
        items: [{ ticketTypeId: "tt1", quantity: 2 }],
      },
      { rpc },
    );

    expect(rpc).toHaveBeenCalledWith("create_pending_order_with_lock", {
      p_user_id: "u1",
      p_items: [{ ticket_type_id: "tt1", quantity: 2 }],
    });
    expect(result.order_id).toBe("o1");
    expect(result.status).toBe("pending");
  });

  it("maps insufficient stock database error", async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: null,
      error: { code: "P0001", message: "INSUFFICIENT_STOCK: ticket_type_id=tt1" },
    });

    await expect(
      submitOrderWithInventoryLock(
        {
          userId: "u1",
          items: [{ ticketTypeId: "tt1", quantity: 999 }],
        },
        { rpc },
      ),
    ).rejects.toBeInstanceOf(InsufficientStockError);
  });
});
