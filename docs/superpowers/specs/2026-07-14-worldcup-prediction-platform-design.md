# 世界杯赛事信息与互动预测平台 — 设计文档

> 日期：2026-07-14
> 选题：世界杯 / 苏超赛事信息与互动预测平台（方向一·赛事信息服务）
> 数据范围：2026 美加墨世界杯

## 1. 目标

面向足球赛事的信息服务场景，设计并实现一个兼顾赛事数据展示与用户互动的平台，形成从赛事浏览、比分预测到赛后讨论的完整使用体验。

## 2. 用户故事

作为一名足球爱好者，我希望浏览世界杯赛程、查看积分榜和淘汰赛图、对比分进行预测、收藏关注的比赛、并参与赛后讨论，从而获得完整的赛事互动体验。

## 3. 技术栈

| 层 | 技术 |
|----|------|
| 前端 | Next.js 16 (App Router) + React 19 + Tailwind CSS 4 + TypeScript |
| 后端 | Midway.js 4 + TypeORM + TypeScript |
| 数据库 | SQLite（通过 TypeORM 访问，含迁移） |
| 认证 | JWT（用户名+密码注册登录，区分 user/admin 角色） |
| Agent | MCP Server（封装赛事查询能力，供 WorkBuddy 调用） |
| 部署 | Docker Compose（node:24-alpine，x64） |
| 契约 | OpenAPI 3.1（contracts/openapi.yaml 为唯一事实来源） |
| 测试 | Node.js 内置测试运行器（组件测试 + Service 测试 + API/Contract 测试 + 并发测试） |

## 4. 功能清单

| 功能 | 描述 | 渲染模式 |
|------|------|----------|
| 赛程浏览 | 按阶段（小组赛/R16/QF/SF/决赛）筛选比赛列表 | SSR |
| 比赛详情 | 比赛信息 + 预测 + 评论 | SSR + Client |
| 球队信息 | 48 支球队列表与详情 | SSR |
| 积分榜 | 小组赛积分排名 | SSR |
| 淘汰赛图 | 对阵树状图 | SSR |
| 比分预测 | 用户提交比分预测（并发控制） | Client |
| 比赛结果录入 | 管理员录入比赛结果，自动计算预测得分 | Client (admin) |
| 用户收藏 | 收藏/取消收藏比赛 | Client |
| 评论互动 | 比赛下方发表评论 | Client |
| 用户认证 | 注册/登录/获取当前用户 | Client |

## 5. 架构

```
浏览器 → Next.js(:3000) → rewrite /api/* → Midway.js(:7001) → TypeORM → SQLite
                                                          ↑
MCP Server (复用后端 Service 层) → AI 助手 (WorkBuddy)
```

### 5.1 后端分层

```
backend/src/
├── controller/
│   ├── auth.controller.ts        # 注册/登录/当前用户
│   ├── match.controller.ts       # 赛程/球队/积分榜/淘汰赛
│   ├── prediction.controller.ts  # 预测 CRUD（并发控制）
│   ├── comment.controller.ts     # 评论 CRUD
│   └── favorite.controller.ts    # 收藏 CRUD
├── service/
│   ├── auth.service.ts           # 注册/登录/JWT 签发
│   ├── match.service.ts          # 赛事查询/积分榜计算
│   ├── prediction.service.ts     # 预测业务（含并发控制）
│   ├── comment.service.ts        # 评论业务
│   └── favorite.service.ts       # 收藏业务
├── entity/                       # TypeORM 实体
│   ├── user.entity.ts
│   ├── team.entity.ts
│   ├── match.entity.ts
│   ├── prediction.entity.ts
│   ├── favorite.entity.ts
│   └── comment.entity.ts
├── middleware/
│   ├── auth.middleware.ts        # JWT 验证，注入 ctx.user
│   └── admin.middleware.ts       # 检查 role === 'admin'
├── migration/                    # TypeORM 迁移文件
├── dto/                          # 请求/响应 DTO + 校验
├── mcp/                          # MCP Server 工具
│   └── tools.ts                  # 复用 Service 层
├── config/
│   └── config.default.ts
├── interface.ts
└── configuration.ts
```

### 5.2 前端结构

```
frontend/src/
├── app/
│   ├── layout.tsx                # 根布局 + 导航栏
│   ├── loading.tsx               # 全局加载状态
│   ├── error.tsx                 # 全局错误状态
│   ├── page.tsx                  # 首页：焦点比赛 + 积分榜概览 (SSR)
│   ├── matches/
│   │   ├── page.tsx              # 赛程列表 (SSR)
│   │   └── [id]/page.tsx         # 比赛详情 (SSR + Client 交互)
│   ├── standings/page.tsx        # 积分榜 (SSR)
│   ├── knockout/page.tsx         # 淘汰赛图 (SSR)
│   ├── teams/
│   │   ├── page.tsx              # 球队列表 (SSR)
│   │   └── [id]/page.tsx         # 球队详情 (SSR)
│   ├── login/page.tsx            # 登录 (Client)
│   ├── register/page.tsx         # 注册 (Client)
│   ├── predictions/page.tsx      # 我的预测 (Client)
│   └── admin/matches/page.tsx    # 结果录入 (Client, admin)
├── components/
│   ├── match-card.tsx            # 比赛卡片
│   ├── prediction-form.tsx      # 预测表单 (Client, 四态)
│   ├── comment-section.tsx      # 评论区 (Client, 四态)
│   ├── favorite-button.tsx      # 收藏按钮 (Client)
│   ├── standings-table.tsx      # 积分榜表格
│   ├── knockout-bracket.tsx     # 淘汰赛对阵图
│   ├── state-handler.tsx        # 统一四态处理
│   └── nav-bar.tsx              # 导航栏
└── lib/
    └── api.ts                    # API 调用封装
```

## 6. 数据模型

### 6.1 实体定义

**User**
| 字段 | 类型 | 约束 |
|------|------|------|
| id | INTEGER | PK, AUTOINCREMENT |
| username | TEXT | UNIQUE, NOT NULL, 2-30 字符 |
| passwordHash | TEXT | NOT NULL |
| role | TEXT | NOT NULL, DEFAULT 'user', enum: 'user' \| 'admin' |
| createdAt | TEXT | NOT NULL, ISO 8601 |

**Team**
| 字段 | 类型 | 约束 |
|------|------|------|
| id | INTEGER | PK, AUTOINCREMENT |
| name | TEXT | NOT NULL |
| code | TEXT | NOT NULL, 3 字母大写 |
| group | TEXT | nullable, 'A'-'H'（小组赛球队有值，淘汰赛可能为 null） |
| flagUrl | TEXT | nullable |
| createdAt | TEXT | NOT NULL, ISO 8601 |

**Match**
| 字段 | 类型 | 约束 |
|------|------|------|
| id | INTEGER | PK, AUTOINCREMENT |
| homeTeamId | INTEGER | FK → Team.id, NOT NULL |
| awayTeamId | INTEGER | FK → Team.id, NOT NULL |
| stage | TEXT | NOT NULL, enum: 'group' \| 'r32' \| 'r16' \| 'qf' \| 'sf' \| 'third' \| 'final' |
| group | TEXT | nullable, 'A'-'H'（仅小组赛有值） |
| kickoffTime | TEXT | NOT NULL, ISO 8601 |
| homeScore | INTEGER | nullable（未录入时为 null） |
| awayScore | INTEGER | nullable |
| status | TEXT | NOT NULL, DEFAULT 'scheduled', enum: 'scheduled' \| 'live' \| 'finished' |
| createdAt | TEXT | NOT NULL, ISO 8601 |

**Prediction**
| 字段 | 类型 | 约束 |
|------|------|------|
| id | INTEGER | PK, AUTOINCREMENT |
| userId | INTEGER | FK → User.id, NOT NULL |
| matchId | INTEGER | FK → Match.id, NOT NULL |
| homeScore | INTEGER | NOT NULL, 0-20 |
| awayScore | INTEGER | NOT NULL, 0-20 |
| points | INTEGER | nullable（比赛结束后计算） |
| createdAt | TEXT | NOT NULL, ISO 8601 |
| | | **UNIQUE(userId, matchId)** |

**Favorite**
| 字段 | 类型 | 约束 |
|------|------|------|
| id | INTEGER | PK, AUTOINCREMENT |
| userId | INTEGER | FK → User.id, NOT NULL |
| matchId | INTEGER | FK → Match.id, NOT NULL |
| createdAt | TEXT | NOT NULL, ISO 8601 |
| | | **UNIQUE(userId, matchId)** |

**Comment**
| 字段 | 类型 | 约束 |
|------|------|------|
| id | INTEGER | PK, AUTOINCREMENT |
| userId | INTEGER | FK → User.id, NOT NULL |
| matchId | INTEGER | FK → Match.id, NOT NULL |
| content | TEXT | NOT NULL, 1-500 字符 |
| createdAt | TEXT | NOT NULL, ISO 8601 |

### 6.2 种子数据

2026 美加墨世界杯真实数据：
- 48 支球队（12 组 × 4 队，或按实际赛制）
- 小组赛全部赛程
- 淘汰赛对阵（根据实际进度录入）
- 默认管理员账号：admin / admin123

## 7. API 设计

### 7.1 端点列表

**认证（公开）**
| Method | Path | 说明 |
|--------|------|------|
| POST | /api/auth/register | 注册，返回 JWT |
| POST | /api/auth/login | 登录，返回 JWT |
| GET | /api/auth/me | 当前用户信息（需认证） |

**赛事（公开）**
| Method | Path | 说明 |
|--------|------|------|
| GET | /api/matches | 比赛列表，支持 ?stage=&status= 筛选 |
| GET | /api/matches/:id | 比赛详情 |
| GET | /api/standings | 积分榜，支持 ?group= 筛选 |
| GET | /api/knockout | 淘汰赛对阵图 |
| GET | /api/teams | 球队列表 |
| GET | /api/teams/:id | 球队详情 |

**预测（需认证）**
| Method | Path | 说明 |
|--------|------|------|
| POST | /api/predictions | 提交/更新预测（并发控制） |
| GET | /api/predictions | 我的预测列表 |
| GET | /api/predictions/:matchId | 查看某场预测 |

**收藏（需认证）**
| Method | Path | 说明 |
|--------|------|------|
| POST | /api/favorites | 收藏比赛 |
| GET | /api/favorites | 收藏列表 |
| DELETE | /api/favorites/:matchId | 取消收藏 |

**评论**
| Method | Path | 说明 |
|--------|------|------|
| GET | /api/comments/:matchId | 比赛评论列表（公开） |
| POST | /api/comments | 发表评论（需认证） |

**管理（需管理员）**
| Method | Path | 说明 |
|--------|------|------|
| PATCH | /api/admin/matches/:id/result | 录入比赛结果 |

### 7.2 统一错误格式

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "人类可读的错误描述",
    "details": {}
  },
  "requestId": "uuid-v4"
}
```

### 7.3 状态码

| 状态码 | 场景 |
|--------|------|
| 200 | 查询/更新成功 |
| 201 | 创建成功（注册、预测、收藏、评论） |
| 400 | 输入校验失败 |
| 401 | 未认证或 token 无效 |
| 403 | 无权限（普通用户访问 admin 接口） |
| 404 | 资源不存在 |
| 409 | 冲突（重复预测、用户名已存在） |
| 500 | 服务器内部错误 |

### 7.4 错误码

| code | 场景 |
|------|------|
| VALIDATION_ERROR | 输入校验失败 |
| UNAUTHORIZED | 未认证 |
| FORBIDDEN | 无权限 |
| NOT_FOUND | 资源不存在 |
| PREDICTION_LOCKED | 比赛已开始，无法修改预测 |
| DUPLICATE_PREDICTION | 重复预测（并发冲突） |
| USERNAME_TAKEN | 用户名已存在 |
| INVALID_CREDENTIALS | 用户名或密码错误 |

## 8. 并发控制设计

### 8.1 核心场景

同一用户对同一场比赛只能保留一条有效比分预测；并发提交不得产生重复记录；开赛后禁止修改。

### 8.2 三层防护

**第 1 层：数据库唯一约束**
- Predictions 表 `UNIQUE(userId, matchId)`
- 即使并发 INSERT 穿透应用层，DB 也会拒绝第二条

**第 2 层：TypeORM 事务 + 条件操作**
```
提交预测流程：
  BEGIN TRANSACTION
    1. 查询 match.status，确认 = 'scheduled'
    2. 查询是否已有预测
       - 无 → INSERT（事务内）
       - 有 → UPDATE（事务内）
    3. COMMIT
  异常处理：
    UNIQUE 约束冲突 → 捕获 → 改为 UPDATE 重试
```

**第 3 层：条件 UPDATE（防止开赛后修改）**
```sql
UPDATE predictions SET homeScore=?, awayScore=?
WHERE userId=? AND matchId=?
  AND (SELECT status FROM matches WHERE id=?) = 'scheduled'
```
- 返回 affectedRows=0 说明比赛已开始，返回 409 PREDICTION_LOCKED

### 8.3 并发测试

| 测试 | 场景 | 预期 |
|------|------|------|
| CT-01 | 同一用户并发 10 次预测同一场比赛 | 只有 1 条记录，其余返回 409 或转为 UPDATE |
| CT-02 | 开赛前提交预测，模拟开赛后修改 | 返回 409 PREDICTION_LOCKED |
| CT-03 | 多用户并发提交不同比赛的预测 | 全部成功，互不干扰 |

## 9. 前端四态设计

### 9.1 统一四态组件

```tsx
<StateHandler
  status="loading" | "empty" | "error" | "success"
  loading={<Skeleton />}
  empty={<EmptyMessage />}
  error={<ErrorMessage error={error} />}
  success={children}
/>
```

### 9.2 各页面四态映射

| 页面/组件 | 加载中 | 空结果 | 错误 | 成功 |
|-----------|--------|--------|------|------|
| 赛程列表 | 骨架屏 | "暂无比赛" | 错误提示 | 比赛卡片列表 |
| 积分榜 | 表格骨架 | "暂无数据" | 错误提示 | 积分表格 |
| 淘汰赛图 | 骨架屏 | "淘汰赛尚未开始" | 错误提示 | 对阵图 |
| 预测表单 | 提交中 | 未预测 | 错误提示 | 已预测状态 |
| 评论区 | 评论骨架 | "暂无评论" | 错误提示 | 评论列表 |
| 收藏按钮 | 切换中 | 未收藏 | 错误提示 | 已收藏 |

## 10. MCP Server 设计

### 10.1 工具列表

| 工具名 | 参数 | 返回 |
|--------|------|------|
| get_matches | stage?, status? | 比赛列表 |
| get_match_by_id | id | 比赛详情 |
| get_standings | group? | 积分榜 |
| get_knockout_bracket | - | 淘汰赛对阵图 |
| get_predictions | userId | 用户预测列表 |
| get_match_comments | matchId | 比赛评论 |

### 10.2 实现

- 在 backend 中新增 `mcp/` 目录
- 复用 Service 层方法，不直接访问数据库
- 通过 stdio 传输协议与 AI 助手通信
- WorkBuddy 可调用这些工具查询赛事信息

## 11. 测试策略

### 11.1 测试分层

| 层 | 位置 | 覆盖内容 |
|----|------|----------|
| 组件测试 | frontend/test/ | 预测表单四态、评论区四态、四态处理组件 |
| Service 测试 | backend/test/ | 预测业务规则+并发、积分榜计算、注册/登录 |
| API/Contract 测试 | backend/test/ | 真实 HTTP 认证流程、预测 CRUD+并发、赛程查询、评论 CRUD |
| 并发测试 | backend/test/ | Promise.all 并发提交预测 |

### 11.2 AC 映射

每条验收标准至少一个可重复证据，通过 `npm run check` 门禁。

## 12. Docker 部署

### 12.1 镜像

- `node:24-alpine` 基础镜像
- 多阶段构建：build stage 编译 TS → runtime stage 仅运行
- linux/amd64 (x64) 目标平台

### 12.2 Compose

```yaml
services:
  frontend:
    build: { context: .., dockerfile: infra/frontend.Dockerfile }
    environment:
      BACKEND_INTERNAL_URL: http://backend:7001
    ports: ["3000:3000"]
    depends_on:
      backend: { condition: service_healthy }

  backend:
    build: { context: .., dockerfile: infra/backend.Dockerfile }
    environment:
      DATABASE_PATH: /app/backend/data/worldcup.sqlite
      JWT_SECRET: ${JWT_SECRET}
    volumes:
      - worldcup-data:/app/backend/data
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:7001/api/health')..."]

volumes:
  worldcup-data:
```

### 12.3 启动命令

```bash
docker compose up --build
```

## 13. 交付物

| 编号 | 交付物 | 说明 |
|------|--------|------|
| 1 | ~~演示录屏~~ | 跳过 |
| 2 | Docker 镜像包 | x64, docker-compose.yml, 启动脚本, 测试数据库+资源文件 |
| 3 | README.txt | 仓库地址、启动命令、挂载说明、公网地址、课程建议 |
| 4 | 问题处理报告 | 性能问题（发现→定位→解决→验证）+ 竞态资源（风险→机制→并发测试） |

## 14. 业务规则

### 14.1 预测规则

- **BR-01**：同一用户对同一场比赛只能有一条预测记录（UNIQUE 约束保证）。
- **BR-02**：比赛状态为 `scheduled` 时才允许提交/修改预测；`live` 或 `finished` 时返回 409 PREDICTION_LOCKED。
- **BR-03**：预测比分范围为 0-20，超出范围返回 400 VALIDATION_ERROR。
- **BR-04**：比赛结果录入后（status 变为 `finished`），自动计算预测得分：
  - 精确猜中比分 → 3 分
  - 猜对胜负方向（胜/平/负）→ 1 分
  - 猜错 → 0 分
- **BR-05**：得分计算在管理员录入结果时同步完成，写入 `prediction.points`。

### 14.2 用户角色规则

- **BR-06**：注册时默认角色为 `user`；`admin` 角色通过种子数据预置（admin/admin123）。
- **BR-07**：只有 `role = 'admin'` 的用户可以调用 `PATCH /api/admin/matches/:id/result`。
- **BR-08**：管理员录入比赛结果时，同时更新 `match.homeScore`、`match.awayScore`、`match.status = 'finished'`。

### 14.3 积分榜规则

- **BR-09**：积分榜按小组（A-H）分组，排序规则：积分 > 净胜球 > 进球数 > 队名。
- **BR-10**：积分计算：胜 3 分，平 1 分，负 0 分。仅统计 `status = 'finished'` 的比赛。

## 15. 非目标

- 实时赛事数据推送（WebSocket）
- 第三方足球 API 集成
- 社交分享功能
- 多语言支持
- 移动端原生应用
