# Tech Docs Turbo Monorepo

A modern full-stack monorepo built with Turborepo, featuring a Next.js frontend and NestJS backend.

## 📁 Project Structure

```
tech-docs-turbo/
├── apps/
│   ├── web/          # Next.js 15 frontend with shadcn/ui
│   └── backend/      # NestJS API with TypeORM + oRPC
├── packages/
│   ├── orpc/                  # Shared oRPC contracts (type-safe API)
│   ├── ui/                    # Shared React components (shadcn/ui)
│   ├── eslint-config/         # Shared ESLint configurations
│   ├── typescript-config/     # Shared TypeScript configurations
│   └── prettier-config/       # Shared Prettier configuration
└── turbo.json        # Turborepo pipeline configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 20
- pnpm 10.4.1+

### Installation

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm dev

# Build all apps
pnpm build
```

## 📦 Apps & Packages

### Apps

- **web**: Next.js 15 application with App Router, React 19, shadcn/ui components, and type-safe oRPC client
- **backend**: NestJS API with TypeORM, PostgreSQL, and oRPC integration using @orpc/nest

### Packages

- **@workspace/orpc**: Shared oRPC contracts for type-safe API communication between frontend and backend
- **@workspace/ui**: Shared React component library built with shadcn/ui, Radix UI, and Tailwind CSS
- **@workspace/eslint-config**: ESLint configurations for Next.js, NestJS, and React
- **@workspace/typescript-config**: TypeScript configurations for different project types
- **@workspace/prettier-config**: Shared Prettier formatting rules

## 🛠️ Available Scripts

```bash
# Development
pnpm dev              # Start all apps in development mode
pnpm dev --filter=web # Start only web app

# Building
pnpm build            # Build all apps and packages
pnpm build --filter=backend # Build only backend

# Code Quality
pnpm lint             # Lint all packages
pnpm typecheck        # Type-check all packages
pnpm format           # Format code with Prettier

# Utilities
pnpm clean            # Clean all build artifacts and node_modules
```

## 🎨 Adding UI Components

Add shadcn/ui components to your web app:

```bash
pnpm dlx shadcn@canary add [COMPONENT]
```

This places components in `packages/ui/src/components/` for sharing across apps.

### Using Components

```tsx
import { Button } from "@workspace/ui/components/button"

export default function Page() {
  return <Button>Click me</Button>
}
```

## 🗄️ Backend Setup

The backend uses NestJS with TypeORM and PostgreSQL.

### Environment Variables

Create `apps/backend/.env.local`:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=techdocs

# Application
PORT=3001
NODE_ENV=development
```

### Database Setup

```bash
# Start PostgreSQL (using Docker)
docker run --name techdocs-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=techdocs \
  -p 5432:5432 \
  -d postgres:16

# Run migrations (when implemented)
cd apps/backend
pnpm migration:run
```

## 🔗 oRPC Type-Safe API

This monorepo uses [oRPC](https://orpc.dev) for end-to-end type-safe API communication between frontend and backend.

### Features

- ✅ **Contract-First Development**: Define API contracts once, use everywhere
- ✅ **Full Type Safety**: Automatic TypeScript inference from Zod schemas
- ✅ **Zero Manual Sync**: Shared contracts eliminate type duplication
- ✅ **OpenAPI Compatible**: Standard HTTP methods (GET, POST, PUT, DELETE)
- ✅ **Runtime Validation**: Zod schemas validate input/output

### Quick Example

**Define Contract** (`packages/orpc/src/contracts/todo.contract.ts`):
```typescript
export const todoContract = {
  list: oc.route({ method: 'GET', path: '/todos' })
    .output(z.array(TodoSchema)),
  
  create: oc.route({ method: 'POST', path: '/todos' })
    .input(CreateTodoSchema)
    .output(TodoSchema),
};
```

**Backend Implementation** (`apps/backend/src/todos/todos.controller.ts`):
```typescript
@Controller()
export class TodosController {
  @Implement(contract.todo.list)
  listTodos() {
    return implement(contract.todo.list).handler(async () => {
      return this.todosService.findAll();
    });
  }
}
```

**Frontend Usage** (`apps/web/app/todos/page.tsx`):
```typescript
import { orpc } from '@/lib/orpc-client';

// Type-safe API calls with auto-completion
const todos = await orpc.todo.list();
const newTodo = await orpc.todo.create({ title: 'Test', completed: false });
```

### Try the Todo Example

Visit `/todos` in the web app to see the full CRUD implementation with type-safe API calls.

For more details, see `packages/orpc/README.md`.

## 🔧 Configuration

### ESLint

The monorepo uses ESLint 9+ flat config format:

- **Next.js apps**: `@workspace/eslint-config/next-js`
- **NestJS apps**: `@workspace/eslint-config/nestjs`
- **React libraries**: `@workspace/eslint-config/react-internal`
- **Base config**: `@workspace/eslint-config/base`

### TypeScript

Shared TypeScript configurations:

- **Next.js**: `@workspace/typescript-config/nextjs.json`
- **NestJS**: `@workspace/typescript-config/nestjs.json`
- **React Library**: `@workspace/typescript-config/react-library.json`
- **Base**: `@workspace/typescript-config/base.json`

### Prettier

All packages use `@workspace/prettier-config` for consistent formatting.

## 📝 Development Workflow

1. **Make changes** in any app or package
2. **Turborepo** automatically rebuilds dependent packages
3. **Hot reload** works across the monorepo
4. **Type-check** with `pnpm typecheck`
5. **Lint** with `pnpm lint`
6. **Format** with `pnpm format`

## 🏗️ Build System

This monorepo uses:

- **Turborepo**: Task orchestration and caching
- **pnpm**: Fast, disk-efficient package manager
- **Workspaces**: Shared dependencies and internal packages

## 📚 Tech Stack

### Frontend (web)
- Next.js 16 (App Router)
- React 19.2
- TypeScript
- Tailwind CSS 4
- shadcn/ui components
- Radix UI primitives
- oRPC client with OpenAPILink

### Backend (backend)
- NestJS 11
- TypeORM
- PostgreSQL
- TypeScript
- oRPC with @orpc/nest
- Jest for testing

### Shared (packages/orpc)
- oRPC contracts
- Zod schemas
- OpenAPI routes
- Full type inference

### Tooling
- Turborepo for monorepo management
- ESLint 9 for linting
- Prettier for formatting
- pnpm for package management

## 📄 License

UNLICENSED - Private project
