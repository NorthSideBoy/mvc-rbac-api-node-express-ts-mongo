<div align="center">

# MVC RBAC API — Node.js + Express + GraphQL + TypeScript + MongoDB

RESTful API boilerplate implementing **MVC** + **RBAC (Role-Based Access Control)** with **JWT** authentication, **REST + GraphQL** transports, an in-process **EventBus**, **Socket.IO** realtime delivery, **OpenAPI/Swagger** documentation (via **tsoa**), and a ready-to-use **MongoDB Docker Compose** setup.

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Repository](https://img.shields.io/badge/repository-GitHub-181717?logo=github&logoColor=white)](https://github.com/NorthSideBoy/mvc-rbac-api-node-express-ts-mongo)
[![Node.js](https://img.shields.io/badge/node.js-LTS-339933?logo=nodedotjs&logoColor=white)](#tech-stack)
[![Express](https://img.shields.io/badge/express-4.x-82cc2d?logo=express&logoColor=white)](#tech-stack)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6?logo=typescript&logoColor=white)](#tech-stack)
[![GraphQL](https://img.shields.io/badge/graphql-16.x-E10098?logo=graphql&logoColor=white)](#tech-stack)
[![Socket.io](https://img.shields.io/badge/socket.io-4.x-010101?logo=socket.io&logoColor=white)](#tech-stack)
[![MongoDB](https://img.shields.io/badge/mongodb-8.x-47A248?logo=mongodb&logoColor=white)](#tech-stack)
[![Docker](https://img.shields.io/badge/docker-24.x-2496ED?logo=docker&logoColor=white)](#tech-stack)
[![Swagger](https://img.shields.io/badge/openapi-swagger-85EA2D?logo=swagger&logoColor=black)](#api-documentation)
[![JWT](https://img.shields.io/badge/jwt-auth-000000?logo=jsonwebtokens&logoColor=white)](#authentication)
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/NorthSideBoy/mvc-api-node-ts-rbac-express-graphql-mongo)

</div>

## Table of Contents

- [Why this project](#why-this-project)
- [Key features](#key-features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [API documentation](#api-documentation)
- [GraphQL API](#graphql-api)
- [Real-time events](#real-time-events)
- [Endpoint overview](#endpoint-overview)
- [RBAC model](#rbac-model)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## Why this project

Building APIs is easy; building **secure** APIs that scale in complexity is harder. This repository provides a clean starting point for a Node.js + Express + MongoDB REST API with:

- **Role-based route protection** (minimum required role per endpoint).
- **Fine-grained authorization** inside the service layer (permissions + scopes like *own*, *managed*, *all*).
- **A consistent architecture** (MVC-style layering) to keep code maintainable as features grow.

## Key features

- **RBAC with role hierarchy**: e.g. `ADMIN` includes `MANAGER` includes `USER` (higher roles inherit access).
- **Permission scopes**: `own`, `managed`, `all` for safe “self vs managed users vs everyone” rules.
- **JWT Bearer authentication**: `Authorization: Bearer <token>`.
- **Dedicated auth module**: login/register now live in transport + service layers scoped to `auth`.
- **Auto-generated OpenAPI + routes** with tsoa (`src/api/rest/docs/swagger.json`, `src/api/rest/routes/routes.ts`).
- **GraphQL API**: Apollo Server + type-graphql on `POST /graphql`.
- **Typed EventBus**: services can publish domain events without coupling business logic to side-effect handlers.
- **Socket.IO realtime layer**: gateways handle inbound websocket commands while bridges fan out domain events to rooms.
- **File uploads + storage**: multi-purpose upload/storage layer (currently used for user profile pictures) via REST multipart + GraphQL `Upload`, with public/private static serving.
- **MongoDB via Docker Compose** (replica set initialized automatically).
- **Request validation** with Zod (422 responses include validation details).
- **Rate limiting** Express + GraphQL (global + stricter limiter for 'auth').
- **Structured logging** with Pino.
- **Lint/format** with Biome.

## Tech Stack

<table>
  <tr>
    <td align="center" width="140">
      <img src="https://cdn.simpleicons.org/nodedotjs/339933" width="40" height="40" alt="Node.js" />
      <br /><b>Node.js</b>
    </td>
    <td align="center" width="140">
      <img src="https://cdn.simpleicons.org/express/82cc2d" width="40" height="40" alt="Express" />
      <br /><b>Express</b>
    </td>
    <td align="center" width="140">
      <img src="https://cdn.simpleicons.org/graphql" width="40" height="40" alt="GraphQL" />
      <br /><b>GraphQL</b>
    </td>
    <td align="center" width="140">
      <img src="https://cdn.simpleicons.org/socket.io" width="40" height="40" alt="Socket.IO" />
      <br /><b>Socket.IO</b>
    </td>
    <td align="center" width="140">
      <img src="https://cdn.simpleicons.org/typescript/3178C6" width="40" height="40" alt="TypeScript" />
      <br /><b>TypeScript</b>
    </td>
    <td align="center" width="140">
      <img src="https://cdn.simpleicons.org/mongodb/47A248" width="40" height="40" alt="MongoDB" />
      <br /><b>MongoDB</b>
    </td>
    <td align="center" width="140">
      <img src="https://cdn.simpleicons.org/docker/2496ED" width="40" height="40" alt="Docker" />
      <br /><b>Docker</b>
    </td>
    <td align="center" width="140">
      <img src="https://cdn.simpleicons.org/swagger/85EA2D" width="40" height="40" alt="Swagger / OpenAPI" />
      <br /><b>OpenAPI</b>
    </td>
    <td align="center" width="140">
      <img src="https://cdn.simpleicons.org/jsonwebtokens/000000" width="40" height="40" alt="JSON Web Tokens" />
      <br /><b>JWT</b>
    </td>
  </tr>
</table>

Also used: **tsoa**, **Mongoose/Typegoose**, **Zod**, **Pino**, **express-rate-limit**, **Biome**.
GraphQL stack: **Apollo Server**, **type-graphql**

## Architecture

This API follows an MVC-style layout (adapted for APIs), with **REST** (tsoa), **GraphQL** (Apollo + type-graphql), and **Socket.IO** sharing the same service layer and execution-context model:

- **Routes**: generated by tsoa (`RegisterRoutes`) and mounted in `src/server.ts`.
- **Controllers**: define HTTP endpoints and delegate to services (`src/api/rest/controllers`).
- **Resolvers + schemas**: type-graphql resolvers in `src/api/graphql/resolvers` and schema classes in `src/api/graphql/schemas`.
- **Socket.IO gateways**: inbound websocket lifecycle + event handlers under `src/api/socket.io/gateways`.
- **Socket.IO bridges**: outbound realtime fan-out from domain events to websocket rooms (`src/api/socket.io/bridges`).
- **EventBus + listeners**: typed in-process domain events under `src/events` and `src/listeners`.
- **Services**: contain business logic + authorization rules (`src/services`).
- **Models**: encapsulate MongoDB persistence (Typegoose/Mongoose) (`src/models`).

### Request flow

```text
Client
  |
  v
REST Routes (/...)        GraphQL Endpoint (/graphql)        Socket.IO Gateway (/socket.io)
  |                        |                                  |
  +--> auth middleware     +--> auth/context middleware       +--> socket auth/context middleware
  +--> request context     +--> execution context             +--> execution context
  |
  v
Controllers / Resolvers / Gateways
  |
  v
Services (RBAC permission checks)
  |
  +--> Models (Typegoose/Mongoose) -------------------------> MongoDB
  |
  +--> BaseService.emit(...) --> EventBus --> listeners/*
                                 |
                                 +--> bridges/* --> Socket.IO rooms --> realtime clients
```

### Where RBAC fits

RBAC is enforced in two complementary layers:

1. **Route-level (minimum role)**: endpoints declare the minimum required role using tsoa `@Security("Bearer", [Role.X])`. Higher roles inherit access via the role graph.
2. **Service-level (permissions + scopes)**: services validate *what* an actor can do and *to whom* (e.g., update your own profile vs manage lower roles).

RBAC implementation lives in:

- `src/rbac/constants/role-definitions.constant.ts` (role graph + included roles)
- `src/rbac/constants/permissions.constant.ts` (permission list)
- `src/rbac/core/role-policy.ts` (permission evaluation)

## Getting started

### Prerequisites

- Docker + Docker Compose
- Node.js (LTS recommended)
- npm

### Installation

1) Start MongoDB (and initialize the replica set) in detached mode:

```bash
docker compose up -d
```

> Note: Docker Compose reads `.env`. If you create/update `.env` after starting the containers, re-run `docker compose up -d` to apply the changes.

2) Install dependencies (this also generates OpenAPI + routes via `postinstall`):

```bash
npm install
```

3) Configure environment variables:

```bash
cp .env.example .env
```

Then edit `.env` with your values (see [Environment variables](#environment-variables)).

4) Database migrations / seeders

This project does not currently expose `seed` or `migrate` npm scripts.
You can create an initial user interactively (useful for creating your first `ADMIN`):

```bash
npm run script -- create-user
```

5) Start the development server:

```bash
npm run dev
```

Server logs include the API URLs:

- Swagger UI: `http://127.0.0.1:<PORT>/docs`
- GraphQL endpoint (Apollo landing page): `http://127.0.0.1:<PORT>/graphql`
- Socket.IO admin UI: `http://127.0.0.1:<PORT>/socket-ui` (Basic Auth)

The Socket.IO server shares the same host/port as Express and uses the default Socket.IO transport path (`/socket.io`).

## Environment variables

The application validates environment variables on boot (Zod). Copy `.env.example` to `.env` and set at least the required values.

| Variable | Description | Default |
| --- | --- | --- |
| `HOST` | HTTP bind host | `127.0.0.1` |
| `PORT` | HTTP port | `3000` (example uses `8000`) |
| `NODE_ENV` | `development` or `production` | `development` |
| `LOG_LEVEL` | `debug`, `info`, `warn`, `error` | `debug` |
| `DB_HOST` | Mongo host for the app process | `127.0.0.1` |
| `DB_PORT` | Mongo port | `27017` |
| `DB_NAME` | Database name | (required) |
| `DB_USER` | Mongo root username (used by Docker + app) | (required) |
| `DB_PASSWORD` | Mongo root password (used by Docker + app) | (required) |
| `DB_AUTH_SOURCE` | Mongo authSource | `admin` |
| `DATABASE_URL` | Mongo connection URI | (required\*) |
| `SOCKET_ADMIN_USERNAME` | Socket.IO admin UI Basic Auth username | (required) |
| `SOCKET_ADMIN_PASSWORD` | Socket.IO admin UI Basic Auth password | (required) |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | JWT expiry (e.g. `12h`, `30m`) | `1h` |
| `CORS_ORIGIN` | CORS allowed origins for HTTP + Socket.IO | `*` |
| `RATE_LIMIT_WINDOW` | Rate limit window (minutes) | `15` |
| `RATE_LIMIT_MAX` | Max requests per window | `500` |
| `MAX_FILE_SIZE` | Max request/upload size (MB) | `5` |

\* `DATABASE_URL` can be a full Mongo URI, or keep the `${...}` placeholders from `.env.example` — the app will construct the final URI from the `DB_*` variables.

`SOCKET_ADMIN_PASSWORD` is stored as plain text in `.env`, then hashed with bcrypt during environment parsing before being passed to `@socket.io/admin-ui`.

## Scripts

Main npm scripts (from `package.json`):

- `npm run dev`: starts the API with Nodemon + regenerates tsoa spec/routes on changes.
- `npm run build`: generates tsoa spec/routes then compiles TypeScript to `dist/`.
- `npm start`: runs the compiled server (`node ./dist/server.js`).
- `npm test`: currently a placeholder (no automated test suite configured yet).
- `npm run script -- --help`: lists available project scripts.
- `npm run script -- create-user`: interactive user creation script.
- `npm run format`: formats code with Biome.
- `npm run lint`: lints (and writes fixes) with Biome.
- `npm run check`: runs Biome checks.
- `npm run check:unsafe`: runs Biome checks (and writes fixes).
- `npm run clean`: removes build output and generated tsoa artifacts (`dist/`, `src/api/rest/routes/routes.ts`, `src/api/rest/docs/swagger.json`).

> `postinstall`, `predev`, and `prebuild` run `tsoa spec-and-routes` automatically.

## API documentation

This project ships Swagger UI using `swagger-ui-express`.

- Swagger UI: `GET /docs`

## GraphQL API

GraphQL is served by **Apollo Server** on:

- GraphQL endpoint: `POST /graphql`

### Authentication

Protected operations require the same JWT Bearer token as REST:

- Header: `Authorization: Bearer <YOUR_JWT>`

### Operation overview

Resolvers live in `src/api/graphql/resolvers` and use type-graphql schema classes from `src/api/graphql/schemas`.

- Auth mutations: `register`, `login`
- User queries: `findById`, `getUsers`
- User mutations: `create`, `update`, `updateStatus`, `updateRole`, `updatePassword`, `updateEmail`, `updateUsername`, `updatePicture`, `delete`

### File uploads

This project exposes file uploads in `REST` and `GraphQL` interfaces, backed by the same storage flow.

- REST endpoints with uploads: `POST /auth/register`, `POST /users`, `PUT /users/:id/picture`
- GraphQL operations with uploads: `register`, `create`, `updatePicture`
- In GraphQL, uploads use the `Upload` scalar (via `graphql-upload`)
- In REST, auth register, user create, and picture updates receive the multipart field `upload`.
- Files are stored in `storage/`. `storage/public/...` is served from `GET /public/...`, while `storage/private/...` is served from `GET /private/...` (requires AUTH).
- API responses include file metadata with a computed `url` (e.g., `user.picture.url`).

## Real-time events

This project includes an in-process domain `EventBus` plus a `Socket.IO` transport layer. Services publish typed domain events once, and the application decides whether to consume them locally (`listeners`) or push them to websocket clients (`bridges`).

### EventBus implementation

- `src/services/base.service.ts` exposes `emit(eventName, payload)`, so application services can publish events without depending on transport code.
- `src/events/core/event-bus.ts` wraps Node.js `EventEmitter` and keeps event publication/subscription typed through `EventMap` and `Event<K>`.
- `bootstrap()` initializes `listeners`, and `shutdown()` unsubscribes them during graceful shutdown.
- Default listeners are extension points: `AuthListener` subscribes to `account.logged_in`, and `UserListener` subscribes to `user.created`. In the current code they are ready for side effects but still contain placeholder logic.
- In the current implementation, services actively publish these events:
  - `AuthService.login()` -> `account.logged_in`
  - `UserService.create()` -> `user.created`
  - `UserService.findById()` -> `user.readed`
  - `UserService.updateProfile()` -> `user.profile.updated`

The typed event catalog already reserves additional user-domain names for status, role, password, email, username, picture, and delete operations, so more handlers can be added without changing the transport contracts.

### Socket.IO implementation

- `src/server.ts` upgrades Express to an HTTP server via `createServer(app)` and attaches `new Server(server, { cors: { origin: config.cors.origin } })`.
- The admin dashboard is instrumented with `@socket.io/admin-ui` and served from `GET /socket-ui`.
- Access to the admin UI is protected with Basic Auth using `SOCKET_ADMIN_USERNAME` and `SOCKET_ADMIN_PASSWORD` from the environment. The dashboard still runs on the `/admin` namespace internally.
- `gateways.initialize(io)` registers inbound websocket handlers, and `bridges.initialize(io)` subscribes realtime publishers to the `EventBus`.
- Socket authentication reuses the same Bearer JWT flow as REST/GraphQL. The token can be sent in `socket.handshake.auth.token` or in the handshake `Authorization` header.
- `contextMiddleware()` builds the same `ExecutionContext` used elsewhere in the app, so RBAC and per-request context work consistently for socket events too.

### Rooms and event fan-out

- On connect, `UserGateway` authenticates the socket and joins the caller to `user:self:<actorId>`.
- Clients can join or leave actor watch rooms with `user.subscribe` and `user.unsubscribe`, sending a payload shaped like `{ "id": "<USER_ID>" }`.
- `UserBridge` subscribes to all `EVENTS.USER` values and republishes them to Socket.IO using the same domain event names.
- Fan-out is actor-centric in the current implementation: events are emitted to `user:self:<ctx.actor.id>`, and watchable events are emitted to `user:watch:<ctx.actor.id>`.
- Watchable user events are: `user.readed`, `user.created`, `user:deleted`, `user.picture:deleted`, `user.picture:updated`, `user.profile.updated`, `user.status.updated`, and `user.username.updated`.
- Auth events are currently consumed only inside the in-process `EventBus`; the websocket bridge is implemented for `EVENTS.USER` only.

### Client example

```ts
import { io } from "socket.io-client";

const socket = io("http://127.0.0.1:8000", {
	auth: {
		token: "Bearer <YOUR_JWT>",
	},
});

socket.on("connect", () => {
	socket.emit("user.subscribe", { id: "<USER_ID>" });
});

socket.on("user.profile.updated", (payload) => {
	console.log("profile updated", payload);
});

socket.on("user.created", (payload) => {
	console.log("user created", payload);
});

socket.on("disconnect", (reason) => {
	console.log("disconnected", reason);
});
```

If a gateway middleware or handler fails and the client sent an acknowledgement callback, the server responds with an error payload shaped like `{ ok: false, error }`.

## Endpoint overview

The current public API is split into **Auth** and **Users** modules (generated docs provide full schemas and examples):

| Method | Path | Description | Auth | Minimum role |
| --- | --- | --- | --- | --- |
| POST | `/auth/register` | Register an account (multipart) | Public | - |
| POST | `/auth/login` | Login and receive a JWT | Public (rate-limited) | - |
| GET | `/users/:id` | Get user by id | Bearer JWT | `USER` |
| GET | `/users` | Get users | Bearer JWT | `USER` |
| POST | `/users` | Create user (multipart) | Bearer JWT | `MANAGER` |
| PUT | `/users/:id` | Update user profile | Bearer JWT | `USER` |
| PUT | `/users/:id/status` | Enable/disable user | Bearer JWT | `MANAGER` |
| PUT | `/users/:id/role` | Promote/demote user role | Bearer JWT | `ADMIN` |
| PUT | `/users/:id/password` | Update password | Bearer JWT | `USER` |
| PUT | `/users/:id/email` | Update email | Bearer JWT | `USER` |
| PUT | `/users/:id/username` | Update username | Bearer JWT | `USER` |
| PUT | `/users/:id/picture` | Update user picture (multipart) | Bearer JWT | `USER` |
| DELETE | `/users/:id/picture` | Delete user picture | Bearer JWT | `USER` |
| DELETE | `/users/:id` | Delete user | Bearer JWT | `ADMIN` |

### Example requests

Register:

```bash
curl -X POST http://127.0.0.1:8000/auth/register \
  -F firstname=john \
  -F lastname=doe \
  -F username=johndoe \
  -F email=john@example.com \
  -F password=Password123 \
  -F birthday=1990-01-01 \
  -F upload=@./avatar.jpeg
```

> `upload` is optional. If omitted, the default avatar (`storage/public/user/default.jpeg`) is used.
>
> User pictures are validated as images (`jpeg`/`png`) and limited to 2MB by default.

Login:

```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "john@example.com", "password": "Password123" }'
```

Update picture:

```bash
curl -X PUT http://127.0.0.1:8000/users/<USER_ID>/picture \
  -H "Authorization: Bearer <YOUR_JWT>" \
  -F upload=@./avatar.jpeg
```

> `PUT /users/:id/picture` also uses the multipart field `upload`, same as register/create.

Use the token:

```bash
curl http://127.0.0.1:8000/users \
  -H "Authorization: Bearer <YOUR_JWT>"
```

### Example GraphQL request

Login:

```bash
curl http://127.0.0.1:8000/graphql \
  -H "Content-Type: application/json" \
  -d '{ "query": "mutation Login($data: LoginUser!) { login(data: $data) { id email role token } }", "variables": { "data": { "email": "john@example.com", "password": "Password123" } } }'
```

Authenticated query:

```bash
curl http://127.0.0.1:8000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_JWT>" \
  -d '{ "query": "{ getUsers { id username email role } }" }'
```

### Example GraphQL upload request

Update picture:

```bash
curl http://127.0.0.1:8000/graphql \
  -H "Authorization: Bearer <YOUR_JWT>" \
  -F 'operations={"query":"mutation($id: String!, $upload: Upload!) { updatePicture(id: $id, upload: $upload) { success affected } }","variables":{"id":"<USER_ID>","upload":null}}' \
  -F 'map={"0":["variables.upload"]}' \
  -F 0=@./avatar.jpeg
```

## RBAC model

### Roles (hierarchy)

At the API level, roles are:

- `USER`
- `MANAGER` (includes `USER`)
- `ADMIN` (includes `MANAGER` and `USER`)

Conceptually:

```text
ADMIN
  └── MANAGER
        └── USER
```

Internally, the RBAC engine also defines:

- `ANONYMOUS` (for unauthenticated execution context)
- `JOKER` (wildcard / system-level role)

### Permission format + scopes

Permissions follow this pattern:

```text
resource:action[:scope]
```

Scopes:

- `own`: only the actor’s own resource (e.g., update *your* profile)
- `managed`: only resources belonging to *included lower roles* (not the same role)
- `all` or `` : included roles *including the same role*

Examples:

- `user:read`
- `user:update-email:own`
- `user:update-role:managed`
- `*:*` (wildcard)

### Enforcement strategy

- **Authentication + minimum role (REST)** is handled by tsoa `@Security` and `src/api/rest/middlewares/auth.middleware.ts`.
- **Authentication + minimum role (GraphQL)** is handled by type-graphql middlewares in `src/api/graphql/middlewares/auth.middleware.ts`.
- **Fine-grained authorization** is enforced inside services with `actor.can(...)` / `actor.canManage(...)` checks.

This keeps controllers thin and ensures authorization remains consistent even if services are used outside the HTTP layer (e.g., scripts).

## Project Structure

### Workspace directories

```text
docker/                         Docker resources for local infrastructure and environment bootstrapping.
scripts/                        CLI scripts for manual tasks, utilities, and smoke-style project workflows.
src/                            Main TypeScript source tree for the API, domain logic, RBAC, and validation.
storage/                        Local filesystem storage root used by managed files.
  private/                      Protected files served only through the private static route.
  public/                       Public files exposed directly by the application.
    user/                       Public user assets, including the default profile picture.
dist/                           Compiled JavaScript output; every subfolder mirrors the purpose of its `src/` counterpart.
```

### Source directories

```text
src/
  DTOs/                         Transfer contracts exchanged between layers and API boundaries.
    auth/                       Authentication payloads such as login, register, and authenticated-user responses.
    file/                       File creation, update, and persisted metadata contracts.
    operation/                  Generic operation/result response contracts.
    storage/                    Low-level storage command contracts.
    user/                       User profile, search, and user-management contracts.
  api/                          Transport-layer entry points shared by REST and GraphQL.
    common/                     Shared API helpers for auth, authorization, and request context glue.
    graphql/                    GraphQL transport layer built around type-graphql.
      middlewares/              GraphQL middleware chain for auth, context, errors, and rate limiting.
      resolvers/                GraphQL resolvers and base upload-handling logic.
      schemas/                  GraphQL schema classes exposed to clients.
        auth/                   Login/register schema types.
        common/                 Shared schema pieces such as pagination types.
        file/                   File-related schema types.
        operation/              Generic result and operation schema types.
        user/                   User query and mutation schema types.
    socket.io/                  Realtime transport layer built on Socket.IO.
      bridges/                  EventBus-to-socket publishers for outbound realtime notifications.
      common/                   Shared room naming helpers and Socket.IO-specific constants.
      decorators/               Metadata decorators for gateway events and middleware composition.
      gateways/                 Inbound websocket lifecycle and event handlers.
      middlewares/              Socket auth/context middleware aligned with the HTTP stack.
      types/                    Socket context, handler, middleware, and lifecycle types.
    rest/                       REST transport layer built on Express and tsoa.
      controllers/              REST controllers that expose HTTP endpoints.
      docs/                     Generated OpenAPI artifacts consumed by Swagger UI.
      middlewares/              REST middleware chain for auth, context, errors, and rate limiting.
      routes/                   Generated tsoa route-registration layer.
  builders/                     Small builders for standardized return objects.
  configs/                      Environment, database, and runtime configuration loaders.
  context/                      Request-scoped execution context and AsyncLocalStorage plumbing.
  contracts/                    Shared interfaces describing core application shapes.
  enums/                        Cross-cutting enums for roles, mime types, visibility, error codes, etc.
  errors/                       Central error hierarchy grouped by concern.
    application/                Domain/application-level business errors for auth, files, tokens, users, etc.
    core/                       Base abstractions for application and HTTP error types.
    http/                       HTTP status-oriented errors used by the REST layer.
  events/                       Typed domain event names, payload contracts, and the in-process EventBus.
  factories/                    Factory helpers for constructing runtime objects such as native files.
  guards/                       Type guards used to safely classify runtime values and errors.
  helpers/                      Small helper adapters reused by higher-level flows, including shared user/auth helpers.
  listeners/                    In-process EventBus subscribers initialized during application bootstrap.
  mappers/                      Transformation helpers between representations and transport shapes.
  models/                       Mongoose/Typegoose persistence models.
  plugins/                      Reusable model plugins such as pagination and timestamp helpers.
  rbac/                         Role-based access-control engine and policy graph.
    constants/                  RBAC operations, permissions, and role-definition constants.
    contracts/                  RBAC-specific interfaces for roles, edges, permissions, and actors.
    core/                       Role graph and policy-evaluation logic.
    enums/                      RBAC-specific enums.
    models/                     RBAC actor models and runtime authorization state.
    types/                      RBAC type helpers for actions, scopes, resources, and operations.
  security/                     Access-claims, grants, and actor helpers around authentication.
  services/                     Application services and business-logic orchestration, including dedicated auth/user services.
  types/                        Shared TypeScript utility types used across layers.
  utils/                        Low-level utilities for files, hashing, logging, mapping, schema parsing, tokens, URLs, and validation.
  validation/                   Runtime validation layer built on Zod.
    codecs/                     Input/output codecs grouped by bounded area.
      auth/                     Validation codecs for auth payloads.
      file/                     Validation codecs for file payloads.
      operation/                Validation codecs for generic operation payloads.
      storage/                  Validation codecs for storage commands.
      user/                     Validation codecs for user workflows.
    schemas/                    Reusable primitive and domain schemas shared by codecs.
```

## Contributing

Contributions are welcome.

- Open an issue to discuss changes or propose improvements.
- Prefer small PRs with focused scope.
- Keep code formatted/linted via `npm run check`.

## License

Licensed under the ISC license. See [LICENSE](LICENSE).
