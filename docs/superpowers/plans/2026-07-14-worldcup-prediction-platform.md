# 世界杯预测平台 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a World Cup match info and interactive prediction platform with match browsing, score prediction (with concurrency control), standings, knockout bracket, comments, favorites, and MCP Server integration.

**Architecture:** Next.js 16 (App Router, SSR) frontend + Midway.js 4 backend with TypeORM + SQLite, JWT auth, role-based access control, Docker Compose deployment.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, Midway.js 4, TypeORM, SQLite, JWT, Docker Compose, MCP SDK

## Global Constraints

- Node.js >= 24.14.1, npm >= 11
- TypeScript for all application code, 2-space indent
- OpenAPI (`contracts/openapi.yaml`) is the single source of truth for HTTP
- No hardcoded secrets; use env vars (JWT_SECRET, DATABASE_PATH, etc.)
- No direct DB access from frontend; only via `/api/*`
- Four UI states required: loading, empty, error, success
- Parameterized SQL / TypeORM parameterized queries for all external input
- Spec-driven: update spec + contract before implementation
- Run `npm run check` before commits

## Design Reference

See `docs/superpowers/specs/2026-07-14-worldcup-prediction-platform-design.md` for full design.

## File Structure

### Backend

```
backend/src/
├── entity/           # TypeORM entities (user, team, match, prediction, favorite, comment)
├── migration/        # TypeORM migrations
├── dto/              # Request/response DTOs with validation
├── controller/       # HTTP controllers (auth, match, prediction, comment, favorite, admin)
├── service/          # Business logic services
├── middleware/       # Auth + Admin middleware
├── mcp/              # MCP Server tools
├── util/             # JWT, password hash, error helpers
├── seed/             # Seed data (2026 World Cup teams + matches)
├── config/           # Midway + TypeORM config
└── configuration.ts  # Midway app entry
```

### Frontend

```
frontend/src/
├── app/              # Next.js App Router pages (SSR + Client)
├── components/       # Reusable components (match-card, prediction-form, etc.)
├── lib/              # API client + shared types
└── context/          # Auth context provider
```

### Infra

```
infra/
├── compose.yaml      # Docker Compose config
├── frontend.Dockerfile
├── backend.Dockerfile
└── .dockerignore
```

---

## Task 1: Backend TypeORM Setup + Entities + Migration + Seed

**Files:**
- Create: `backend/src/entity/user.entity.ts`
- Create: `backend/src/entity/team.entity.ts`
- Create: `backend/src/entity/match.entity.ts`
- Create: `backend/src/entity/prediction.entity.ts`
- Create: `backend/src/entity/favorite.entity.ts`
- Create: `backend/src/entity/comment.entity.ts`
- Create: `backend/src/migration/0001_init.ts`
- Create: `backend/src/seed/teams.ts`
- Create: `backend/src/seed/matches.ts`
- Create: `backend/src/seed/seed.service.ts`
- Modify: `backend/src/configuration.ts` (add typeorm import)
- Modify: `backend/src/config/config.default.ts` (add typeorm config)
- Modify: `backend/package.json` (add typeorm deps)

**Interfaces:**
- Produces: `User`, `Team`, `Match`, `Prediction`, `Favorite`, `Comment` entity classes
- Produces: `SeedService` that runs migrations + seeds data on startup
- Produces: `SeedService.hashPassword()` and `SeedService.verifyPassword()` static methods

**Key entity details:**

User: id, username (unique), passwordHash, role ('user'|'admin'), createdAt
Team: id, name, code (3-letter), group (nullable 'A'-'L'), flagUrl, createdAt
Match: id, homeTeam (FK), awayTeam (FK), stage ('group'|'r32'|'r16'|'qf'|'sf'|'third'|'final'), group (nullable), kickoffTime, homeScore (nullable), awayScore (nullable), status ('scheduled'|'live'|'finished'), createdAt
Prediction: id, userId, matchId, homeScore, awayScore, points (nullable), createdAt — **UNIQUE(userId, matchId)**
Favorite: id, userId, matchId, createdAt — **UNIQUE(userId, matchId)**
Comment: id, userId, matchId, content (1-500), createdAt

**Seed data:** 2026 World Cup 48 teams in 12 groups (A-L), all group stage matches (72) + knockout matches (32) = 104 total. Admin user: admin/admin123.

- [ ] **Step 1: Install dependencies**

```bash
npm install typeorm @midwayjs/typeorm --workspace backend
```

- [ ] **Step 2: Create all 6 entity files** with TypeORM decorators. Prediction and Favorite entities must have `@Unique` on (userId, matchId). Match entity has `@ManyToOne` relations to Team with `eager: true`. Comment entity has `@Index` on matchId.

- [ ] **Step 3: Update configuration.ts** to import `@midwayjs/typeorm`:

```typescript
import * as typeorm from "@midwayjs/typeorm";
@Configuration({ imports: [koa, typeorm], ... })
```

- [ ] **Step 4: Update config.default.ts** with TypeORM dataSource config: type sqlite, database path from env, entities path, migrations path, synchronize: false.

- [ ] **Step 5: Create migration 0001_init.ts** that creates all 6 tables with proper constraints (UNIQUE, FK, INDEX).

- [ ] **Step 6: Create seed data files** — `teams.ts` with 48 teams (research actual 2026 World Cup qualified teams), `matches.ts` with 104 matches (real kickoff times).

- [ ] **Step 7: Create SeedService** that runs migrations on init, seeds admin user (scrypt password hash), seeds teams if empty, seeds matches if empty. Include static `verifyPassword()` method using `node:crypto` scrypt + timingSafeEqual.

- [ ] **Step 8: Verify backend compiles**

```bash
npm run build --workspace backend
```

- [ ] **Step 9: Commit**

```bash
git add backend/ && git commit -m "feat: add TypeORM entities, migration, and seed data"
```

---

## Task 2: Auth System (Service + Controller + Middleware + Tests)

**Files:**
- Create: `backend/src/util/jwt.ts` — JWT sign/verify using node:crypto HMAC-SHA256
- Create: `backend/src/util/password.ts` — scrypt hash/verify
- Create: `backend/src/util/error.ts` — ErrorCodes enum + factory functions
- Create: `backend/src/dto/auth.dto.ts` — RegisterInput, LoginInput + parsers
- Create: `backend/src/service/auth.service.ts` — register, login, verifyToken, findById
- Create: `backend/src/middleware/auth.middleware.ts` — JWT verification, inject ctx.user
- Create: `backend/src/middleware/admin.middleware.ts` — Check role === 'admin'
- Create: `backend/src/controller/auth.controller.ts` — POST /register, POST /login, GET /me
- Create: `backend/test/auth.service.test.mts`

**Interfaces:**
- Produces: `AuthService.register(input) -> { token, user }`
- Produces: `AuthService.login(input) -> { token, user }`
- Produces: `AuthService.verifyToken(token) -> JwtPayload | null`
- Produces: `AuthMiddleware` (IWebMiddleware) for protected routes
- Produces: `AdminMiddleware` (IWebMiddleware) for admin routes
- JWT format: `Bearer <jwt>`, payload: `{ userId, role }`

**Validation rules:** username 2-30 chars, password 6-100 chars. Error codes: USERNAME_TAKEN (409), INVALID_CREDENTIALS (401).

- [ ] **Step 1: Create util files** (jwt.ts, password.ts, error.ts) with the implementations described above.

- [ ] **Step 2: Create auth DTO** with parseRegisterInput and parseLoginInput validators.

- [ ] **Step 3: Create AuthService** with register (check duplicate, hash password, sign JWT), login (verify password, sign JWT), verifyToken, findById.

- [ ] **Step 4: Create AuthMiddleware** that extracts Bearer token, verifies via AuthService, sets ctx.user = { id, role }. Returns 401 on missing/invalid token.

- [ ] **Step 5: Create AdminMiddleware** that checks ctx.user.role === 'admin', returns 403 if not.

- [ ] **Step 6: Create AuthController** with POST /api/auth/register, POST /api/auth/login, GET /api/auth/me (protected).

- [ ] **Step 7: Write auth service tests** — register creates user, register rejects duplicate, login with correct/wrong credentials, verifyToken valid/invalid.

- [ ] **Step 8: Run tests**

```bash
npm run test --workspace backend
```

- [ ] **Step 9: Commit**

```bash
git add backend/ && git commit -m "feat: add auth system with JWT, middleware, and tests"
```

---

## Task 3: Match System (Service + Controller + Tests)

**Files:**
- Create: `backend/src/service/match.service.ts`
- Create: `backend/src/controller/match.controller.ts`
- Create: `backend/test/match.service.test.mts`

**Interfaces:**
- Produces: `MatchService.listMatches(stage?, status?) -> Match[]`
- Produces: `MatchService.getMatch(id) -> Match | null`
- Produces: `MatchService.getStandings(group?) -> Standing[]`
- Produces: `MatchService.getKnockout() -> Record<string, KnockoutMatch[]>`
- Produces: `MatchService.listTeams() -> Team[]`
- Produces: `MatchService.getTeam(id) -> Team | null`
- Produces: `MatchService.updateMatchResult(id, homeScore, awayScore) -> Match | null`

**Standings calculation:** For finished group matches, compute played/won/drawn/lost/goalsFor/goalsAgainst/goalDifference/points. Sort by points > goalDifference > goalsFor > teamName.

**Knockout:** Group matches by stage (r32, r16, qf, sf, third, final), return as Record.

- [ ] **Step 1: Create MatchService** with all methods. Use TypeORM repositories with relations (homeTeam, awayTeam). Standings computed in-memory from finished matches.

- [ ] **Step 2: Create MatchController** with GET /api/matches (query: stage, status), GET /api/matches/:id, GET /api/standings (query: group), GET /api/knockout, GET /api/teams, GET /api/teams/:id.

- [ ] **Step 3: Write match service tests** — listMatches returns all/filtered, getMatch by id, getStandings calculates points correctly, getStandings empty for group with no finished matches.

- [ ] **Step 4: Run tests and commit**

---

## Task 4: Prediction System with Concurrency Control

**Files:**
- Create: `backend/src/dto/prediction.dto.ts`
- Create: `backend/src/service/prediction.service.ts`
- Create: `backend/src/controller/prediction.controller.ts`
- Create: `backend/test/prediction.service.test.mts`
- Create: `backend/test/prediction.concurrency.test.mts`

**Interfaces:**
- Produces: `PredictionService.submitPrediction(userId, input) -> Prediction`
- Produces: `PredictionService.listPredictions(userId) -> Prediction[]`
- Produces: `PredictionService.getPrediction(userId, matchId) -> Prediction | null`
- Produces: `PredictionService.calculatePoints(matchId) -> void`

**Concurrency control (3 layers):**
1. DB UNIQUE(userId, matchId) constraint
2. TypeORM transaction: check match.status='scheduled', then INSERT or UPDATE
3. Conditional UPDATE with subquery: `WHERE (SELECT status FROM matches WHERE id=?) = 'scheduled'`

On UNIQUE constraint violation during INSERT, catch QueryFailedError and fallback to UPDATE.

**Points calculation:** Exact score = 3 points, correct direction (win/draw/lose) = 1 point, wrong = 0 points.

- [ ] **Step 1: Create prediction DTO** with parsePredictionInput (matchId positive int, homeScore/awayScore 0-20).

- [ ] **Step 2: Create PredictionService** with submitPrediction (transaction + concurrency control), listPredictions, getPrediction, calculatePoints.

- [ ] **Step 3: Create PredictionController** with POST /api/predictions (auth), GET /api/predictions (auth), GET /api/predictions/:matchId (auth).

- [ ] **Step 4: Write prediction service tests** — create, update existing, reject when finished, list, get by matchId.

- [ ] **Step 5: Write concurrency tests** — CT-01: 10 concurrent submissions → only 1 record; CT-02: locked after match starts; CT-03: different users concurrent → all succeed.

- [ ] **Step 6: Run tests and commit**

---

## Task 5: Comment + Favorite Systems

**Files:**
- Create: `backend/src/dto/comment.dto.ts`
- Create: `backend/src/service/comment.service.ts`
- Create: `backend/src/controller/comment.controller.ts`
- Create: `backend/src/service/favorite.service.ts`
- Create: `backend/src/controller/favorite.controller.ts`
- Create: `backend/test/comment.service.test.mts`
- Create: `backend/test/favorite.service.test.mts`

**Interfaces:**
- Produces: `CommentService.listComments(matchId) -> Comment[]`
- Produces: `CommentService.createComment(userId, input) -> Comment`
- Produces: `FavoriteService.addFavorite(userId, matchId) -> Favorite` (idempotent via UNIQUE catch)
- Produces: `FavoriteService.listFavorites(userId) -> Favorite[]`
- Produces: `FavoriteService.removeFavorite(userId, matchId) -> void`

- [ ] **Step 1: Create comment DTO** (matchId positive int, content 1-500 chars trimmed).

- [ ] **Step 2: Create CommentService** and CommentController (GET /api/comments/:matchId public, POST /api/comments auth).

- [ ] **Step 3: Create FavoriteService** (addFavorite with UNIQUE catch for idempotency, listFavorites with match relations, removeFavorite).

- [ ] **Step 4: Create FavoriteController** (POST /api/favorites auth, GET /api/favorites auth, DELETE /api/favorites/:matchId auth).

- [ ] **Step 5: Write tests** — comment create/list/empty, favorite add/idempotent/list/remove.

- [ ] **Step 6: Run tests and commit**

---

## Task 6: Admin Controller + Match Result Entry

**Files:**
- Create: `backend/src/dto/match.dto.ts`
- Create: `backend/src/controller/admin.controller.ts`

**Interfaces:**
- Consumes: MatchService.updateMatchResult, PredictionService.calculatePoints
- Produces: `PATCH /api/admin/matches/:id/result` (admin only)

On result entry: update match scores + status='finished', then call calculatePoints to score all predictions.

- [ ] **Step 1: Create match result DTO** (homeScore/awayScore 0-20 ints).

- [ ] **Step 2: Create AdminController** with PATCH /api/admin/matches/:id/result. Uses AdminMiddleware. Calls MatchService.updateMatchResult then PredictionService.calculatePoints.

- [ ] **Step 3: Commit**

---

## Task 7: Update OpenAPI Contract

**Files:**
- Modify: `contracts/openapi.yaml`

- [ ] **Step 1: Rewrite openapi.yaml** with all endpoints (auth, matches, standings, knockout, teams, predictions, comments, favorites, admin), all schemas (User, Team, Match, Prediction, Favorite, Comment, Standing, KnockoutMatch, error format), security scheme (Bearer JWT), x-spec traces to AC IDs.

- [ ] **Step 2: Commit**

---

## Task 8: Frontend Foundation (API Client, Layout, State Handler, Nav)

**Files:**
- Create: `frontend/src/lib/types.ts` — All API types (User, Team, Match, Prediction, Comment, Favorite, Standing)
- Create: `frontend/src/lib/api.ts` — Fetch wrapper with JWT token, api.get/post/patch/delete
- Create: `frontend/src/context/auth-context.tsx` — AuthProvider with user/login/register/logout
- Create: `frontend/src/components/state-handler.tsx` — Four-state component (loading/empty/error/success)
- Create: `frontend/src/components/nav-bar.tsx` — Navigation with auth state
- Modify: `frontend/src/app/layout.tsx` — Wrap with AuthProvider + NavBar
- Create: `frontend/src/app/loading.tsx` — Global loading skeleton
- Create: `frontend/src/app/error.tsx` — Global error display

- [ ] **Step 1: Create types.ts** with all API response types.

- [ ] **Step 2: Create api.ts** with token management (localStorage) and fetch wrapper.

- [ ] **Step 3: Create auth-context.tsx** with AuthProvider, useAuth hook, login/register/logout.

- [ ] **Step 4: Create state-handler.tsx** — props: status, loading, empty, error, children.

- [ ] **Step 5: Create nav-bar.tsx** — links to matches/standings/knockout/teams, auth state (login/register or username/logout/admin).

- [ ] **Step 6: Update layout.tsx** to wrap children in AuthProvider + NavBar.

- [ ] **Step 7: Create loading.tsx and error.tsx.**

- [ ] **Step 8: Verify build and commit**

---

## Task 9: Frontend SSR Pages (Home, Matches, Standings, Knockout, Teams)

**Files:**
- Create: `frontend/src/components/match-card.tsx` — Match display card with teams, score, time
- Create: `frontend/src/components/standings-table.tsx` — Standings table component
- Create: `frontend/src/components/knockout-bracket.tsx` — Knockout bracket display
- Modify: `frontend/src/app/page.tsx` — Home: featured matches (SSR)
- Create: `frontend/src/app/matches/page.tsx` — Match list with stage filter (SSR)
- Create: `frontend/src/app/matches/[id]/page.tsx` — Match detail (SSR + Client components)
- Create: `frontend/src/app/standings/page.tsx` — Standings with group filter (SSR)
- Create: `frontend/src/app/knockout/page.tsx` — Knockout bracket (SSR)
- Create: `frontend/src/app/teams/page.tsx` — Team list (SSR)
- Create: `frontend/src/app/teams/[id]/page.tsx` — Team detail with matches (SSR)

**SSR pattern:** All SSR pages fetch from `process.env.BACKEND_INTERNAL_URL ?? "http://localhost:7001"` with `cache: "no-store"`. Use StateHandler for four states. Match detail page includes PredictionForm, CommentSection, FavoriteButton (Client components).

- [ ] **Step 1: Create match-card.tsx** — displays teams, flags, score/time, stage, status.

- [ ] **Step 2: Create home page** — fetch scheduled matches, display first 6.

- [ ] **Step 3: Create matches list page** — stage filter tabs, match grid.

- [ ] **Step 4: Create match detail page** — match header, PredictionForm (if scheduled), CommentSection, FavoriteButton.

- [ ] **Step 5: Create standings table component** — full table with all columns.

- [ ] **Step 6: Create standings page** — group filter tabs, StandingsTable.

- [ ] **Step 7: Create knockout bracket component** — grouped by stage.

- [ ] **Step 8: Create knockout page** — fetch bracket data, display.

- [ ] **Step 9: Create teams list page** — team cards with flag, name, code, group.

- [ ] **Step 10: Create team detail page** — team info + related matches.

- [ ] **Step 11: Verify build and commit**

---

## Task 10: Frontend Client Components (Prediction, Comment, Favorite, Login, Admin)

**Files:**
- Create: `frontend/src/components/prediction-form.tsx` — Score input form (four states)
- Create: `frontend/src/components/comment-section.tsx` — Comment list + form (four states)
- Create: `frontend/src/components/favorite-button.tsx` — Favorite toggle
- Create: `frontend/src/app/login/page.tsx` — Login form
- Create: `frontend/src/app/register/page.tsx` — Register form
- Create: `frontend/src/app/predictions/page.tsx` — My predictions list
- Create: `frontend/src/app/admin/matches/page.tsx` — Admin result entry

**Four states in prediction form:** loading (fetching existing prediction), empty (not logged in), error (fetch/submit failed), success (form displayed). Shows existing prediction if present.

**Four states in comment section:** loading, empty (no comments), error, success (comment list). Initial comments from SSR props.

- [ ] **Step 1: Create prediction-form.tsx** — fetch existing prediction, submit/update via POST /api/predictions, four states.

- [ ] **Step 2: Create comment-section.tsx** — display comments, submit via POST /api/comments, four states.

- [ ] **Step 3: Create favorite-button.tsx** — check favorite status, toggle via POST/DELETE /api/favorites.

- [ ] **Step 4: Create login and register pages** — forms calling auth context.

- [ ] **Step 5: Create predictions page** — list user's predictions with points.

- [ ] **Step 6: Create admin matches page** — list matches, inline result entry form.

- [ ] **Step 7: Verify build and commit**

---

## Task 11: MCP Server

**Files:**
- Create: `backend/src/mcp/tools.ts` — MCP tool definitions
- Create: `backend/src/mcp/server.ts` — MCP server entry
- Modify: `backend/package.json` (add @modelcontextprotocol/sdk)

**MCP tools (reuse Service layer):**
- get_matches(stage?, status?) → match list
- get_match_by_id(id) → match detail
- get_standings(group?) → standings
- get_knockout_bracket() → knockout tree
- get_predictions(userId) → user predictions
- get_match_comments(matchId) → comments

- [ ] **Step 1: Install MCP SDK**

```bash
npm install @modelcontextprotocol/sdk --workspace backend
```

- [ ] **Step 2: Create tools.ts** — define MCP tools that call MatchService, PredictionService, CommentService methods.

- [ ] **Step 3: Create server.ts** — stdio transport MCP server that registers tools.

- [ ] **Step 4: Commit**

---

## Task 12: Docker + README + Report

**Files:**
- Modify: `infra/compose.yaml` — update for new app
- Modify: `infra/frontend.Dockerfile` — update build
- Modify: `infra/backend.Dockerfile` — update build
- Create: `infra/.dockerignore`
- Create: `README.txt` — deliverable README
- Create: `docs/performance-and-concurrency-report.md` — problem handling report
- Modify: `.env.example` — add JWT_SECRET

- [ ] **Step 1: Update Dockerfiles** for multi-stage builds with TypeORM (need to copy entity/migration files).

- [ ] **Step 2: Update compose.yaml** with backend healthcheck, SQLite volume, JWT_SECRET env.

- [ ] **Step 3: Create .dockerignore** to exclude node_modules, .next, dist, data, .env.

- [ ] **Step 4: Update .env.example** with JWT_SECRET.

- [ ] **Step 5: Create README.txt** with: repo address, Docker startup command, volume mount instructions, web URL placeholder, optional course feedback.

- [ ] **Step 6: Create performance + concurrency report** — document performance issue found (N+1 queries in standings) and fix (single SQL aggregate), document race condition (concurrent predictions) and mechanism (UNIQUE + transaction + conditional UPDATE), include concurrency test results.

- [ ] **Step 7: Run full check**

```bash
npm run check
```

- [ ] **Step 8: Commit all**

```bash
git add -A && git commit -m "feat: add Docker config, README, and performance report"
```

---

## Self-Review Notes

**Spec coverage:** All features from design doc covered — auth (T2), matches/standings/knockout/teams (T3), prediction with concurrency (T4), comments/favorites (T5), admin result entry (T6), OpenAPI (T7), frontend SSR (T8-T9), frontend client (T10), MCP (T11), Docker+deliverables (T12).

**Type consistency:** Entity field names are consistent across tasks. Service method signatures match controller usage. Frontend types match API responses.

**Concurrency:** Three-layer protection documented in T4, with dedicated concurrency tests (CT-01 through CT-03).
