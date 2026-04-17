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

### 激活本地 Node 环境

本仓库已提供一个项目内隔离的 Node 环境，避免依赖系统全局 `node` / `npm`。

在项目根目录执行：

```bash
source /Users/haoyi/Documents/website_test/website_for_test/.node-env/activate.sh
```

激活后可用以下命令确认：

```bash
node -v
npm -v
```

### 安装依赖

激活本地 Node 环境后，执行：

```bash
npm install
```

### 配置环境变量

在项目根目录创建 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

> 如果后续页面中调用 `getSupabaseClient()`，缺少上述变量会抛出错误提示。
>
> `SUPABASE_SERVICE_ROLE_KEY` 用于服务端高权限调用，例如库存锁定下单 RPC；不要暴露到前端。

### 配置 Supabase Auth

当前项目已接入以下认证能力：

- 邮箱登录
- 邮箱注册
- Google OAuth 登录
- 微信登录入口预留（暂未开放）

在 Supabase Dashboard 中需要完成这些配置：

1. 打开 `Authentication -> URL Configuration`
2. 将 `Site URL` 设置为你的站点地址
3. 在 `Redirect URLs` 中加入本地回调地址：

```bash
http://localhost:3000/auth/callback
```

如需使用 Google OAuth，还需要：

1. 打开 `Authentication -> Providers -> Google`
2. 填写 Google OAuth 的 `Client ID` 和 `Client Secret`
3. 在 Google Cloud Console 中，将 Supabase 回调地址加入 `Authorized redirect URIs`：

```bash
https://<your-project-ref>.supabase.co/auth/v1/callback
```

微信登录当前仅保留前端入口占位，尚未在 Supabase 中启用自定义 OAuth Provider，也未接入微信开放平台参数。

### 启动开发服务器

激活本地 Node 环境并安装依赖后，执行：

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

常见本地操作示例：

```bash
source /Users/haoyi/Documents/website_test/website_for_test/.node-env/activate.sh
npm install
npm run dev
```

构建生产版本：

```bash
source /Users/haoyi/Documents/website_test/website_for_test/.node-env/activate.sh
npm run build
```

## 3. 当前已完成

- 接入 Supabase Auth（邮箱登录 / OAuth）
- 为 `/orders` 增加登录态保护
- 订单查询按当前登录用户做隔离
- 提供服务端事务下单 RPC 调用封装

## 4. 下一步建议

- 演出、票档、订单列表改为真实数据库查询
- 增加下单流程剩余环节（支付创建、支付回调、订单状态流转）
- 补充更多 RLS 策略与集成测试
- 增加订单超时取消与库存回补

## 5. 数据库 Migration

已提供初始化 schema migration：

- `supabase/migrations/20260416000000_init_ticketing_schema.sql`
- `supabase/migrations/20260416010000_add_pending_order_locking.sql`
- `supabase/migrations/20260418000000_enable_auth_rls.sql`

包含以下表：

- `events`
- `event_sessions`
- `ticket_types`
- `orders`
- `order_items`
- `users`

其中 `20260418000000_enable_auth_rls.sql` 还包含：

- `auth.users -> public.users` 自动同步 trigger
- `users / orders / order_items` 的 RLS 策略
- 仅允许用户读取自己的订单及订单明细

如已安装 Supabase CLI，可在本地执行：

```bash
supabase db reset
```

或将该 SQL 文件在 Supabase SQL Editor 中执行。

如果你已经在 Supabase 中初始化过旧 schema，记得继续执行新增 migration，否则登录后的 `/orders` 权限和用户同步不会生效。

## 6. 订单与登录态

- `/login`：支持邮箱登录、邮箱注册、Google OAuth；微信入口预留但暂未开放
- `/auth/callback`：处理 OAuth / 邮件确认后的 session 交换
- `/orders`：服务端校验当前登录用户，未登录会跳转到 `/login?redirectTo=/orders`
- 导航栏：登录后显示当前用户邮箱，并支持退出登录

## 7. 下单前锁库存（第一版）

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
