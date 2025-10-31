# Installation

NestJS Boilerplate supports [TypeORM](https://www.npmjs.com/package/typeorm) for working with databases. By default, TypeORM uses [PostgreSQL](https://www.postgresql.org/) as the main database, but you can use any relational database.

---

## Table of Contents <!-- omit in toc -->

- [Comfortable development (PostgreSQL + TypeORM)](#comfortable-development-postgresql--typeorm)
- [Quick run (PostgreSQL + TypeORM)](#quick-run-postgresql--typeorm)
- [Links](#links)

---

## Comfortable development (PostgreSQL + TypeORM)

1. Clone repository and install dependencies

   ```bash
   git clone --depth 1 https://github.com/SofienRogue/nestjs-nextjs-orpc-turbo-boilerplate.git my-app
   cd my-app/
   pnpm install
   ```

1. Go to folder `apps/backend`, and copy `env.example` as `.env`.

   ```bash
   cd my-app/
   cp env.example .env
   ```

2. Run additional container:
   Go to folder `deployment`,

   ```bash
   docker compose -p turbo-cont --env-file ../apps/backend/.env up -d
   ```

3. Build backend

   ```bash
   pnpm build --filter=backend
   ```

4. Create migration (SQL version to run inside adminer)

   ```bash
   pnpm run migration:sql
   ```
   New migration created in `apps/backend/src/migrations` with sql command <br>
   Copy sql command from new migration <br>
   Open adminer <http://localhost:8088>
   login with:
   - server: postgres:5432
   - user: root
   - password: secret
   - database: turbo_db
   Run sql command in adminer

5. Run app in dev mode

   ```bash
   cd apps/backend
   pnpm run start:dev
   ```

6. Open <http://localhost:5010>


## Links

- Open Scalar OpenApi docs <http://localhost:5010/api-docs>
- Adminer (client for DB): <http://localhost:8088>
- Maildev: <http://localhost:1080>

---

Previous: [Introduction](../README.md)

Next: [Database](database.md)