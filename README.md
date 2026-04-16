# 演出购票平台（项目骨架）

这是一个基础项目骨架，已包含：

- Next.js（App Router）
- TypeScript
- Tailwind CSS
- Supabase client（`@supabase/supabase-js`）
- 基础页面路由：
  - `/` 首页
  - `/shows` 演出列表
  - `/shows/[id]` 演出详情
  - `/login` 登录页
  - `/orders` 我的订单页

## 1. 本地运行

### 安装依赖

```bash
npm install
```

### 配置环境变量

在项目根目录创建 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> 如果后续页面中调用 `getSupabaseClient()`，缺少上述变量会抛出错误提示。

### 启动开发服务器

```bash
npm run dev
```

浏览器访问：<http://localhost:3000>

## 2. 可用脚本

```bash
npm run dev    # 开发环境
npm run build  # 生产构建
npm run start  # 运行生产构建
npm run lint   # ESLint 检查
npm run test   # 运行基础单元测试
```

## 3. 下一步建议

- 接入 Supabase Auth（邮箱登录 / OAuth）
- 演出、票档、订单改为真实数据库查询
- 为“我的订单”增加登录态保护
- 增加下单流程（锁座/库存校验/支付）

## 4. 数据库 Migration

已提供初始化 schema migration：

- `supabase/migrations/20260416000000_init_ticketing_schema.sql`

包含以下表：

- `events`
- `event_sessions`
- `ticket_types`
- `orders`
- `order_items`
- `users`

如已安装 Supabase CLI，可在本地执行：

```bash
supabase db reset
```

或将该 SQL 文件在 Supabase SQL Editor 中执行。

## 5. 下单前锁库存（第一版）

本项目已提供服务端事务方案：`create_pending_order_with_lock`（PostgreSQL function）。

核心流程：

1. 用户提交订单时，先创建 `pending` 订单。
2. 对每个 `ticket_type` 执行 `SELECT ... FOR UPDATE` 行锁。
3. 校验 `available = quota - sold_count` 是否足够，若不足则抛出 `INSUFFICIENT_STOCK`。
4. 扣减 `sold_count` 并写入 `order_items`。
5. 更新订单总金额并返回订单信息。

以上步骤运行在同一数据库事务内，任一步失败会整体回滚，避免超卖和脏数据。

### 本地测试

```bash
npm run test
```

当前包含最基础单测：
- 下单入参校验
- RPC 调用参数校验
- 库存不足错误映射（`InsufficientStockError`）
