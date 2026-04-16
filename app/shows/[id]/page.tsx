interface ShowDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ShowDetailPage({ params }: ShowDetailPageProps) {
  const { id } = await params;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">演出详情</h1>
      <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <p className="text-zinc-700">当前演出 ID：{id}</p>
        <p className="mt-2 text-sm text-zinc-500">
          这里可以接入 Supabase 查询演出详情、票档和库存信息。
        </p>
      </div>
    </section>
  );
}
