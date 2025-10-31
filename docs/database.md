# Database

## Table of Contents <!-- omit in toc -->

- [About databases](#about-databases)
- [Working with database schema (TypeORM)](#working-with-database-schema-typeorm)
  - [Generate migration](#generate-migration)
  - [Run migration](#run-migration)
  - [Revert migration](#revert-migration)
  - [Drop all tables in database](#drop-all-tables-in-database)
- [Seeding (TypeORM)](#seeding-typeorm)
  - [Creating seeds (TypeORM)](#creating-seeds-typeorm)
  - [Run seed (TypeORM)](#run-seed-typeorm)
  - [Factory and Faker (TypeORM)](#factory-and-faker-typeorm)
- [Performance optimization (PostgreSQL + TypeORM)](#performance-optimization-postgresql--typeorm)
  - [Indexes and Foreign Keys](#indexes-and-foreign-keys)
  - [Max connections](#max-connections)
- [Switch PostgreSQL to MySQL](#switch-postgresql-to-mysql)

---

## About databases

Boilerplate supports two types of databases: PostgreSQL with TypeORM.

## Working with database schema (TypeORM)

### Generate migration

1. Create entity file with extension `.entity.ts`. For example `post.entity.ts`:

   ```ts
   // /src/posts/infrastructure/persistence/relational/entities/post.entity.ts

   import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
   import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

   @Entity()
   export class Post extends EntityRelationalHelper {
     @PrimaryGeneratedColumn()
     id: number;

     @Column()
     title: string;

     @Column()
     body: string;

     // Here any fields that you need
   }
   ```

2. Next, generate migration file in `SQL` format:

   ```bash
   pnpm run migration:sql
   ```

3. Apply this migration to database via copying the SQL to adminer (check [Project Setup](setup.md) ).

### Revert migration

```bash
npm run migration:revert
```

### Drop all tables in database

```bash
npm run schema:drop
```
---

## Seeding (TypeORM)

### Creating seeds (TypeORM) (FUTURE)

### Run seed (TypeORM) (FUTURE)

## Factory and Faker (TypeORM) (FUTURE)

## Performance optimization (PostgreSQL + TypeORM)

### Indexes and Foreign Keys

Don't forget to create `indexes` on the Foreign Keys (FK) columns (if needed), because by default PostgreSQL [does not automatically add indexes to FK](https://stackoverflow.com/a/970605/18140714).

### Max connections

Set the optimal number of [max connections](https://node-postgres.com/apis/pool) to database for your application in `/.env`:

```txt
DATABASE_MAX_CONNECTIONS=100
```

You can think of this parameter as how many concurrent database connections your application can handle.


---

Previous: [Project Setup](setup.md)

Next: [Auth](auth.md)