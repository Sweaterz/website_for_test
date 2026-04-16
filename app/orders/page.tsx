export default function OrdersPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">我的订单</h1>
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <p className="text-zinc-700">你还没有订单记录。</p>
        <p className="mt-2 text-sm text-zinc-500">
          后续可在此页面查询当前用户在 Supabase 中的订单数据。
        </p>
      </div>
    </section>
  );
}
