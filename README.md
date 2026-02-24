<div align="center">

# MVC RBAC API — Node.js + Express + GraphQL + TypeScript + MongoDB

RESTful API boilerplate implementing **MVC** + **RBAC (Role-Based Access Control)** with **JWT** authentication, **OpenAPI/Swagger** documentation (via **tsoa**), and a ready-to-use **MongoDB Docker Compose** setup.

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![Repository](https://img.shields.io/badge/repository-GitHub-181717?logo=github&logoColor=white)](https://github.com/NorthSideBoy/mvc-rbac-api-node-express-ts-mongo)
[![Node.js](https://img.shields.io/badge/node.js-LTS-339933?logo=nodedotjs&logoColor=white)](#tech-stack)
[![Express](https://img.shields.io/badge/express-4.x-82cc2d?logo=express&logoColor=white)](#tech-stack)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6?logo=typescript&logoColor=white)](#tech-stack)
[![GraphQL](https://img.shields.io/badge/graphql-16.x-E10098?logo=graphql&logoColor=white)](#tech-stack)
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
- [Endpoint overview](#endpoint-overview)
- [RBAC model](#rbac-model)
- [Project structure](#project-structure)
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
- **Auto-generated OpenAPI + routes** with tsoa (`src/docs/swagger.json`, `src/routes/routes.ts`).
- **GraphQL API**: Apollo Server + type-graphql on `POST /graphql`.
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

This API follows an MVC-style layout (adapted for APIs), with both **REST** (tsoa) and **GraphQL** (Apollo + type-graphql) sharing the same service layer:

- **Routes**: generated by tsoa (`RegisterRoutes`) and mounted in `src/server.ts`.
- **Controllers**: define HTTP endpoints and delegate to services (`src/controllers`).
- **Services**: contain business logic + authorization rules (`src/services`).
- **Models**: encapsulate MongoDB persistence (Typegoose/Mongoose) (`src/models`).
- **Resolvers + schemas**: type-graphql resolvers in `src/resolvers` and GraphQL schema classes in `src/schemas`.

### Request flow

```text
Client
  |
  v
REST Routes (tsoa RegisterRoutes)                 GraphQL Endpoint (/graphql)
  |
  +--> Security (JWT Bearer) -> AccessGrant (role check)    +--> type-graphql middlewares
  +--> Context middleware (AsyncLocalStorage execution context)  (auth + request context)
  |
  v
Controllers
  |
  v
Services (RBAC permission checks)
  |
  v
Models (Typegoose/Mongoose) ---> MongoDB
  |
  v
JSON Response
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

This project does not have any npm `seed` or `migrate` scripts in `package.json` but.
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
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRES_IN` | JWT expiry (e.g. `12h`, `30m`) | `1h` |
| `CORS_ORIGIN` | CORS allowed origins | `*` |
| `RATE_LIMIT_WINDOW` | Rate limit window (minutes) | `15` |
| `RATE_LIMIT_MAX` | Max requests per window | `500` |

\* `DATABASE_URL` can be a full Mongo URI, or keep the `${...}` placeholders from `.env.example` — the app will construct the final URI from the `DB_*` variables.

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

Resolvers live in `src/resolvers` and use type-graphql schema classes from `src/schemas`.

- Queries: `search`, `findById`, `getUsers`
- Mutations: `register`, `login`, `create`, `update`, `updateStatus`, `updateRole`, `updatePassword`, `updateEmail`, `updateUsername`, `delete`

## Endpoint overview

The current module is **Users** (generated docs provide full schemas and examples):

| Method | Path | Description | Auth | Minimum role |
| --- | --- | --- | --- | --- |
| POST | `/users/register` | Register a user | Public | - |
| POST | `/users/login` | Login and receive a JWT | Public (rate-limited) | - |
| GET | `/users/search` | Search users (paginated) | Bearer JWT | `USER` |
| GET | `/users/:id` | Get user by id | Bearer JWT | `USER` |
| GET | `/users` | Get users | Bearer JWT | `USER` |
| POST | `/users` | Create user | Bearer JWT | `MANAGER` |
| PUT | `/users/:id` | Update user profile | Bearer JWT | `USER` |
| PUT | `/users/:id/status` | Enable/disable user | Bearer JWT | `MANAGER` |
| PUT | `/users/:id/role` | Promote/demote user role | Bearer JWT | `ADMIN` |
| PUT | `/users/:id/password` | Update password | Bearer JWT | `USER` |
| PUT | `/users/:id/email` | Update email | Bearer JWT | `USER` |
| PUT | `/users/:id/username` | Update username | Bearer JWT | `USER` |
| DELETE | `/users/:id` | Delete user | Bearer JWT | `ADMIN` |

### Example requests

Register:

```bash
curl -X POST http://127.0.0.1:8000/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "john",
    "lastname": "doe",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "Password123",
    "birthday": "1990-01-01T00:00:00.000Z",
    "enable": true
  }'
```

Login:

```bash
curl -X POST http://127.0.0.1:8000/users/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "john@example.com", "password": "Password123" }'
```

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
- `all`: included roles *including the same role*

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

## Contributing

Contributions are welcome.

- Open an issue to discuss changes or propose improvements.
- Prefer small PRs with focused scope.
- Keep code formatted/linted via `npm run check`.

## License

Licensed under the ISC license. See [LICENSE](LICENSE).
