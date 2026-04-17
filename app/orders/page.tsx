import { redirect } from "next/navigation";
import { getCurrentUserOrders } from "@/lib/server/orders";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency,
  }).format(amount);
}

const statusLabelMap: Record<string, string> = {
  pending: "待支付",
  paid: "已支付",
  cancelled: "已取消",
  refunded: "已退款",
  expired: "已过期",
};

export default async function OrdersPage() {
  if (!hasSupabaseConfig()) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">我的订单</h1>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          缺少 Supabase 环境变量，暂时无法校验登录态和查询订单。
        </div>
      </section>
    );
  }

  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/orders");
  }

  const orders = await getCurrentUserOrders(user.id);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">我的订单</h1>
      {orders.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-zinc-700">你还没有订单记录。</p>
          <p className="mt-2 text-sm text-zinc-500">登录后只会看到当前账号自己的订单。</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{order.orderNo}</h2>
                  <p className="text-sm text-zinc-500">
                    创建时间：{new Date(order.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-zinc-900">
                    {statusLabelMap[order.status] ?? order.status}
                  </p>
                  <p className="text-lg font-semibold">
                    {formatAmount(order.totalAmount, order.currency)}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-2 border-t border-zinc-100 pt-4">
                {order.items.map((item, index) => (
                  <li key={`${order.id}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                    <div>
                      <p className="font-medium text-zinc-800">
                        {item.ticketTypeName ?? "未命名票档"}
                      </p>
                      <p className="text-zinc-500">数量：{item.quantity}</p>
                    </div>
                    <p className="text-zinc-700">
                      {formatAmount(item.subtotal, order.currency)}
                    </p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
