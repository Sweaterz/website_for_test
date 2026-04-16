import Link from "next/link";

const mockShows = [
  { id: "1", title: "城市夜现场", date: "2026-05-01", venue: "上海梅赛德斯奔驰文化中心" },
  { id: "2", title: "摇滚纪元巡演", date: "2026-06-18", venue: "北京工人体育馆" },
  { id: "3", title: "春日交响音乐会", date: "2026-04-28", venue: "广州大剧院" },
];

export default function ShowsPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">演出列表</h1>
      <ul className="space-y-3">
        {mockShows.map((show) => (
          <li key={show.id} className="rounded-lg border border-zinc-200 bg-white p-4">
            <h2 className="text-lg font-semibold">{show.title}</h2>
            <p className="text-sm text-zinc-600">
              时间：{show.date} · 场馆：{show.venue}
            </p>
            <Link
              href={`/shows/${show.id}`}
              className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              查看详情
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
