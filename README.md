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

### Google Cloud Console 超细操作清单

以下步骤用于拿到 Google OAuth 的 `Client ID` 和 `Client Secret`，再填回 Supabase。

1. 打开 Google Cloud Console

```bash
https://console.cloud.google.com/
```

2. 登录你的 Google 账号
3. 在顶部项目选择器中：
   - 如果已有项目，直接选中
   - 如果没有项目，点击 `New Project` 创建一个
4. 进入项目后，打开左侧菜单：
   - `Google Auth Platform`
   - 如果你当前控制台里还没有这个入口，也可能显示在 `APIs & Services`
5. 第一次使用时，先配置品牌信息或同意页
   - 按页面提示填写应用名称
   - 填写用户支持邮箱
   - 填写开发者联系邮箱
   - 保存
6. 如果页面要求配置受众：
   - 开发阶段通常先选择仅测试用户可用的模式
   - 将你自己的 Google 账号加入测试用户
7. 进入 `Clients`
8. 点击 `Create Client`
9. 在应用类型里选择 `Web application`
10. 输入一个好识别的名字，例如：

```bash
website_for_test-web
```

11. 在 `Authorized JavaScript origins` 中添加前端站点地址
    - 本地开发至少加入：

```bash
http://localhost:3000
```

    - 如果你未来部署到正式域名，也要把正式站点域名加进去，例如：

```bash
https://your-domain.com
```

12. 在 `Authorized redirect URIs` 中添加 Supabase 的回调地址：

```bash
https://<your-project-ref>.supabase.co/auth/v1/callback
```

13. 点击 `Create`
14. 创建成功后，复制页面里的：
    - `Client ID`
    - `Client Secret`
15. 回到 Supabase Dashboard：
    - 打开 `Authentication -> Providers -> Google`
    - 打开启用开关
    - 粘贴 `Client ID`
    - 粘贴 `Client Secret`
    - 保存
16. 再检查 `Authentication -> URL Configuration`
    - `Site URL` 是否已配置
    - `Redirect URLs` 是否已包含：

```bash
http://localhost:3000/auth/callback
```

17. 本地启动项目后，进入 `/login`
18. 点击 `使用 Google 登录`
19. 如果浏览器成功跳转到 Google 授权页，再跳回 `/auth/callback` 并最终回到站内页面，就说明配置生效

常见问题排查：

- 如果 Google 报 `redirect_uri_mismatch`，通常是 `Authorized redirect URIs` 没填 Supabase 回调地址，或者地址少了 `https`
- 如果 Supabase 跳转后没回到本地页面，通常是 `Redirect URLs` 没加入 `http://localhost:3000/auth/callback`
- 如果看不到授权按钮效果，先确认 Supabase 的 Google Provider 已保存并启用
- 如果测试账号无法登录，检查 Google 侧测试用户名单或受众配置

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

## 4. 下一步功能清单

为了把这个网站做成一个可正常使用的演出购票平台，建议按下面顺序推进。

### 第一阶段：先把核心购票链路跑通

- 演出列表改为真实数据库查询，展示 `events`
- 演出详情页改为真实数据库查询，展示场次与票档
- “我的订单”页面补充真实订单明细展示
- 接入下单接口，前端调用服务端下单逻辑
- 将 `create_pending_order_with_lock` 真正接入页面下单流程
- 处理库存不足、票档不存在、未登录等错误提示

### 第二阶段：补齐支付与订单状态流转

- 创建支付单
- 支付成功后更新订单状态为 `paid`
- 支付失败、取消、超时后更新订单状态
- 增加订单超时取消与库存回补
- 增加支付回调校验与幂等处理
- 在订单页展示支付状态、支付时间、过期时间

### 第三阶段：完善用户体验

- 首页增加推荐演出、热门演出、即将开售等模块
- 演出列表增加筛选、搜索、排序
- 演出详情页增加购票流程引导
- 登录页优化文案与错误提示
- 未登录用户点击下单时自动跳转登录并带回跳参数
- 订单页增加空状态、加载状态、错误状态

### 第四阶段：后台运营能力

- 增加演出管理后台
- 支持创建/编辑/发布演出
- 支持创建场次、票档、库存、价格
- 支持查看订单列表与订单状态
- 支持手动取消订单、处理退款状态

### 第五阶段：权限、安全与稳定性

- 补充更多 RLS 策略
- 区分普通用户、运营管理员权限
- 为关键接口增加服务端参数校验
- 为支付回调、下单接口增加日志记录
- 防止重复下单、重复支付、重复回调
- 敏感配置与服务端密钥整理到安全环境变量中

### 第六阶段：测试与发布准备

- 增加更多单元测试
- 增加下单与订单查询的集成测试
- 增加并发库存测试
- 增加支付流程测试
- 补充部署文档、环境变量文档、运维说明
- 上线前进行完整回归测试

### 推荐优先级

如果按“最短路径上线”的思路，建议优先完成这几项：

1. 演出与票档真实查询
2. 下单页面接入服务端下单逻辑
3. 支付创建与支付成功回调
4. 订单状态流转与库存回补
5. 后台发布演出与维护票档

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
