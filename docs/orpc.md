# ORPC Documentation

This guide covers OpenRPC (oRPC) implementation in the application, providing type-safe API communication between frontend and backend.

## Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [Schema Definition](#schema-definition)
- [Contract Definition](#contract-definition)
- [Server Implementation](#server-implementation)
- [Client Integration](#client-integration)
- [Code Generation](#code-generation)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Overview

OpenRPC (oRPC) is a type-safe RPC framework that provides end-to-end type safety for API communication. Unlike traditional REST APIs, oRPC uses contracts defined with Zod schemas to ensure type consistency between client and server.

**Key Features:**
- **Type Safety**: End-to-end TypeScript types from API contracts
- **Schema Validation**: Runtime validation using Zod schemas
- **OpenAPI Compatible**: Generates OpenAPI specifications automatically
- **Framework Agnostic**: Works with any backend framework
- **Client Generation**: Type-safe client libraries from contracts

**Architecture:**
- **Contracts**: Define API endpoints, methods, and data structures
- **Schemas**: Zod-based validation and type definitions
- **Server**: NestJS integration with `@orpc/nest`
- **Client**: Type-safe HTTP client with `@orpc/client`
- **OpenAPI**: Automatic specification generation

## Core Concepts

### Contracts vs Traditional APIs

**Traditional REST:**
```typescript
// Server
@Post('/todos')
createTodo(@Body() data: CreateTodoDto): Promise<Todo> {
  // Implementation
}

// Client
const todo = await fetch('/api/todos', {
  method: 'POST',
  body: JSON.stringify(data)
}).then(r => r.json());
```

**oRPC Approach:**
```typescript
// Contract Definition
export const todoContract = {
  create: oc.route({
    method: 'POST',
    path: '/v1/todos',
  }).input(CreateTodoSchema).output(TodoSchema)
};

// Server Implementation
@Implement(contract.todo.create)
createTodo(): any {
  return implement(contract.todo.create).handler(async ({ input }) => {
    return this.todosService.create(input);
  });
}

// Client Usage
const todo = await orpc.todo.create(data);
```

### Benefits

1. **Type Safety**: No more API mismatches between frontend and backend
2. **Validation**: Automatic input/output validation
3. **Documentation**: Self-documenting APIs with OpenAPI generation
4. **Developer Experience**: IntelliSense and autocompletion for API calls
5. **Runtime Safety**: Validation errors caught at API boundaries

## Schema Definition

Schemas define the data structures and validation rules using Zod. They're stored in `packages/orpc/src/schemas/`.

### Basic Schema Types

```typescript
// packages/orpc/src/schemas/todo.schema.ts
import { z } from 'zod';

/**
 * Base Todo schema with all fields
 */
export const TodoSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  completed: z.boolean().default(false),
  createdAt: z.date(),
});

/**
 * Schema for creating a new Todo (without auto-generated fields)
 */
export const CreateTodoSchema = TodoSchema.omit({
  id: true,
  createdAt: true,
});

/**
 * Schema for updating a Todo (all fields optional except id)
 */
export const UpdateTodoSchema = TodoSchema.partial().required({ id: true });

/**
 * Schema for Todo ID parameter
 */
export const TodoIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

/**
 * TypeScript types inferred from schemas
 */
export type Todo = z.infer<typeof TodoSchema>;
export type CreateTodo = z.infer<typeof CreateTodoSchema>;
export type UpdateTodo = z.infer<typeof UpdateTodoSchema>;
```

### Schema Composition

```typescript
// Complex schema with relationships
export const TodoWithFileSchema = TodoSchema.extend({
  file: z.object({
    originalName: z.string(),
    mimetype: z.string(),
    size: z.number(),
  }).nullable(),
});

// Union types for different response variants
export const TodoResponseSchema = z.union([
  TodoSchema,
  TodoWithFileSchema,
]);
```

### Validation Rules

```typescript
// String validation
const EmailSchema = z.string().email('Invalid email format');

// Number validation
const PrioritySchema = z.number().int().min(1).max(5);

// Custom validation
const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number');

// Array validation
const TagsSchema = z.array(z.string().min(1).max(50)).max(10);

// Object validation with transformations
const SlugSchema = z.string()
  .min(1)
  .max(100)
  .transform(val => val.toLowerCase().replace(/\s+/g, '-'));
```

## Contract Definition

Contracts define the API endpoints using the `oc` (OpenRPC Contract) builder. They're stored in `packages/orpc/src/contracts/`.

### Basic Contract Structure

```typescript
// packages/orpc/src/contracts/todo.contract.ts
import { oc } from '@orpc/contract';
import { z } from 'zod';
import { TodoSchema, CreateTodoSchema, TodoIdSchema } from '../schemas/todo.schema.js';

/**
 * Todo API contracts with OpenAPI routes
 */
export const todoContract = {
  /**
   * List all todos
   * GET /v1/todos
   */
  list: oc
    .route({
      method: 'GET',
      path: '/v1/todos',
      summary: 'List all todos',
      description: 'Retrieve all todo items',
      tags: ['Todos'],
    })
    .output(z.array(TodoSchema)),

  /**
   * Get a single todo by ID
   * GET /v1/todos/{id}
   */
  get: oc
    .route({
      method: 'GET',
      path: '/v1/todos/{id}',
      summary: 'Get todo by ID',
      description: 'Retrieve a single todo item by its ID',
      tags: ['Todos'],
    })
    .input(TodoIdSchema)
    .output(TodoSchema),

  /**
   * Create a new todo
   * POST /v1/todos
   */
  create: oc
    .route({
      method: 'POST',
      path: '/v1/todos',
      summary: 'Create todo',
      description: 'Create a new todo item',
      tags: ['Todos'],
    })
    .input(CreateTodoSchema)
    .output(TodoSchema),
};
```

### Advanced Contract Features

```typescript
// Query parameters and pagination
list: oc
  .route({
    method: 'GET',
    path: '/v1/todos',
    summary: 'List todos with pagination',
  })
  .input(z.object({
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    completed: z.coerce.boolean().optional(),
    search: z.string().optional(),
  }))
  .output(z.object({
    data: z.array(TodoSchema),
    meta: z.object({
      totalItems: z.number(),
      itemCount: z.number(),
      itemsPerPage: z.number(),
      totalPages: z.number(),
      currentPage: z.number(),
    }),
  })),

// File upload contracts
upload: oc
  .route({
    method: 'POST',
    path: '/v1/files/upload',
    summary: 'Upload file',
  })
  .input(z.object({
    file: z.any(), // Handled by multer
  }))
  .output(FileSchema),
```

### Contract Router

```typescript
// packages/orpc/src/contract.ts
import { router } from '@orpc/contract';
import { todoContract } from './contracts/todo.contract.js';
import { fileContract } from './contracts/file.contract.js';
import { mailContract } from './contracts/mail.contract.js';

/**
 * Main contract router combining all API contracts
 */
export const contract = router({
  todo: todoContract,
  file: fileContract,
  mail: mailContract,
});

/**
 * Export contract type for client generation
 */
export type { Contract } from './contract.js';
```

## Server Implementation

### NestJS Integration

The backend uses `@orpc/nest` for seamless NestJS integration.

```typescript
// apps/backend/src/todos/todos.controller.ts
import { Controller } from '@nestjs/common';
import { Implement } from '@orpc/nest';
import { implement } from '@orpc/server';
import { contract } from '@workspace/orpc';
import { TodosService } from './todos.service.js';

@Controller()
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  /**
   * List all todos
   */
  @Implement(contract.todo.list)
  listTodos(): any {
    return implement(contract.todo.list).handler(async () => {
      return this.todosService.findAll();
    });
  }

  /**
   * Get a single todo by ID
   */
  @Implement(contract.todo.get)
  getTodo(): any {
    return implement(contract.todo.get).handler(async ({ input }) => {
      return this.todosService.findOne(input.id);
    });
  }

  /**
   * Create a new todo
   */
  @Implement(contract.todo.create)
  createTodo(): any {
    return implement(contract.todo.create).handler(async ({ input }) => {
      return this.todosService.create(input);
    });
  }
}
```

### File Upload Handling

```typescript
// File upload with multer
@FileUpload('file')
@Implement(contract.file.upload)
@UseInterceptors(FileInterceptor('file'))
uploadFile(@UploadedFile() file: Express.Multer.File): any {
  return implement(contract.file.upload).handler(async () => {
    return this.filesService.uploadFile(file);
  });
}
```

### Error Handling

```typescript
// Automatic validation errors
@Implement(contract.todo.create)
createTodo(): any {
  return implement(contract.todo.create).handler(async ({ input }) => {
    // Input is automatically validated
    // Throws ZodError if validation fails
    return this.todosService.create(input);
  });
}
```

### Module Configuration

```typescript
// apps/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ORPCModule } from '@orpc/nest';
import { contract } from '@workspace/orpc';

@Module({
  imports: [
    ORPCModule.forRoot({
      contract,
      // Additional configuration
    }),
  ],
})
export class AppModule {}
```

## Client Integration

### oRPC Client Setup

The frontend uses the type-safe oRPC client for API communication.

```typescript
// apps/web/lib/orpc-client.ts
import { createORPCClient } from '@orpc/client';
import { OpenAPILink } from '@orpc/openapi-client/fetch';
import { contract, type Contract } from '@workspace/orpc';

/**
 * OpenAPI Link configuration for backend communication
 */
const link = new OpenAPILink(contract, {
  url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Type-safe oRPC client
 */
export const orpc: JsonifiedClient<ContractRouterClient<Contract>> = createORPCClient(link);
```

### Client Usage

```typescript
// apps/web/components/TodoList.tsx
import { useEffect, useState } from 'react';
import { orpc } from '@/lib/orpc-client';

export function TodoList() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const result = await orpc.todo.list();
      setTodos(result);
    } catch (error) {
      console.error('Failed to load todos:', error);
    }
  };

  const createTodo = async (title: string) => {
    try {
      const newTodo = await orpc.todo.create({
        title,
        description: '',
        completed: false,
      });
      setTodos(prev => [...prev, newTodo]);
    } catch (error) {
      console.error('Failed to create todo:', error);
    }
  };

  return (
    <div>
      {/* Render todos */}
    </div>
  );
}
```

### React Hooks Integration

```typescript
// Custom hook for oRPC calls
import { useState, useEffect } from 'react';
import { orpc } from '@/lib/orpc-client';

export function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTodos = async () => {
    try {
      setLoading(true);
      const result = await orpc.todo.list();
      setTodos(result);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const createTodo = async (data) => {
    const newTodo = await orpc.todo.create(data);
    setTodos(prev => [...prev, newTodo]);
    return newTodo;
  };

  const updateTodo = async (id, data) => {
    const updatedTodo = await orpc.todo.update({ id, ...data });
    setTodos(prev => prev.map(todo =>
      todo.id === id ? updatedTodo : todo
    ));
    return updatedTodo;
  };

  const deleteTodo = async (id) => {
    await orpc.todo.delete({ id });
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  useEffect(() => {
    loadTodos();
  }, []);

  return {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    refetch: loadTodos,
  };
}
```

### File Upload with oRPC

```typescript
// File upload example
const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const uploadedFile = await orpc.file.upload(formData);
  return uploadedFile;
};

// Multiple files
const uploadMultipleFiles = async (files: FileList) => {
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('files', file);
  });

  const uploadedFiles = await orpc.file.uploadMultiple(formData);
  return uploadedFiles;
};
```

## Code Generation

### OpenAPI Specification

oRPC automatically generates OpenAPI specifications for documentation and testing.

```typescript
// Generate OpenAPI spec
import { generateOpenAPISpec } from '@orpc/openapi';
import { contract } from '@workspace/orpc';

const spec = generateOpenAPISpec(contract, {
  info: {
    title: 'My API',
    version: '1.0.0',
  },
});

// Access at /api/spec.json
```

### Type Generation

```typescript
// Generate TypeScript types for external consumption
import { generateTypes } from '@orpc/contract';
import { contract } from '@workspace/orpc';

const types = generateTypes(contract, {
  exportName: 'API',
});

// This creates type definitions that can be shared
```

## Best Practices

### Contract Organization

1. **Group Related Endpoints**: Use nested router structure
```typescript
export const contract = router({
  users: userContract,
  posts: postContract,
  comments: commentContract,
});
```

2. **Consistent Naming**: Use plural nouns for collections
```typescript
// Good
list: oc.route({ method: 'GET', path: '/v1/todos' })
create: oc.route({ method: 'POST', path: '/v1/todos' })

// Avoid
getAll: oc.route({ method: 'GET', path: '/v1/todos' })
add: oc.route({ method: 'POST', path: '/v1/todos' })
```

3. **Versioning**: Include API version in paths
```typescript
path: '/v1/todos' // Always use versioning
```

### Schema Design

1. **Separation of Concerns**: Separate input/output schemas
```typescript
// Input schema (what client sends)
export const CreateTodoSchema = TodoSchema.omit({ id: true, createdAt: true });

// Output schema (what server returns)
export const TodoSchema = z.object({ /* full schema */ });
```

2. **Validation Messages**: Provide helpful error messages
```typescript
title: z.string()
  .min(1, 'Title cannot be empty')
  .max(200, 'Title must be less than 200 characters'),
```

3. **Optional Fields**: Use `.optional()` or `.nullable()` appropriately
```typescript
description: z.string().max(1000).optional(), // Can be omitted
file: z.object({ /* ... */ }).nullable(),     // Can be null
```

### Error Handling

1. **Consistent Error Responses**: Use standard HTTP status codes
2. **Validation Errors**: Let Zod handle input validation automatically
3. **Custom Errors**: Use appropriate HTTP status codes for business logic errors

```typescript
// Server-side error handling
return implement(contract.todo.create).handler(async ({ input }) => {
  const existing = await this.todosService.findByTitle(input.title);
  if (existing) {
    throw new HttpException('Todo with this title already exists', 409);
  }
  return this.todosService.create(input);
});
```

### Client Error Handling

```typescript
// Client-side error handling
const createTodo = async (data) => {
  try {
    return await orpc.todo.create(data);
  } catch (error) {
    if (error.statusCode === 400) {
      // Validation error
      showValidationErrors(error.issues);
    } else if (error.statusCode === 409) {
      // Conflict error
      showToast('Todo with this title already exists');
    } else {
      // Generic error
      showToast('Failed to create todo');
    }
    throw error;
  }
};
```

## Examples

### Complete CRUD Implementation

```typescript
// Schema
export const TodoSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(200),
  completed: z.boolean(),
  createdAt: z.date(),
});

export const CreateTodoSchema = TodoSchema.omit({ id: true, createdAt: true });
export const TodoIdSchema = z.object({ id: z.number() });

// Contract
export const todoContract = {
  list: oc.route({ method: 'GET', path: '/v1/todos' })
    .output(z.array(TodoSchema)),

  create: oc.route({ method: 'POST', path: '/v1/todos' })
    .input(CreateTodoSchema).output(TodoSchema),

  update: oc.route({ method: 'PUT', path: '/v1/todos/{id}' })
    .input(TodoIdSchema.merge(CreateTodoSchema.partial()))
    .output(TodoSchema),

  delete: oc.route({ method: 'DELETE', path: '/v1/todos/{id}' })
    .input(TodoIdSchema).output(z.object({ deleted: z.boolean() })),
};

// Server Controller
@Implement(contract.todo.list)
listTodos(): any {
  return implement(contract.todo.list).handler(async () => {
    return this.todosService.findAll();
  });
}

// Client Component
function TodoApp() {
  const [todos, setTodos] = useState([]);

  const loadTodos = async () => {
    const result = await orpc.todo.list();
    setTodos(result);
  };

  const addTodo = async (title: string) => {
    const newTodo = await orpc.todo.create({ title, completed: false });
    setTodos(prev => [...prev, newTodo]);
  };

  // ... other methods

  return (
    <div>
      {/* Todo UI */}
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **Type Errors**: Ensure contracts are properly imported and exported
   ```typescript
   // Check contract exports
   import { contract } from '@workspace/orpc';
   ```

2. **Validation Errors**: Check schema definitions match expected data
   ```typescript
   // Debug validation errors
   console.log('Validation error:', error.issues);
   ```

3. **Client Connection Issues**: Verify API URL and CORS configuration
   ```typescript
   // Check client configuration
   const link = new OpenAPILink(contract, {
     url: process.env.NEXT_PUBLIC_API_URL,
   });
   ```

4. **OpenAPI Generation**: Ensure all contracts are properly defined
   ```typescript
   // Check for missing schemas or invalid routes
   const spec = generateOpenAPISpec(contract);
   ```

### Debug Mode

Enable detailed logging for development:

```typescript
// Server-side logging
return implement(contract.todo.create).handler(async ({ input }) => {
  console.log('Creating todo with input:', input);
  const result = await this.todosService.create(input);
  console.log('Created todo:', result);
  return result;
});
```

### Performance Considerations

1. **Bundle Size**: Only import needed oRPC modules
2. **Caching**: Cache OpenAPI specs in production
3. **Validation**: Skip validation in production for performance (optional)
4. **Connection Pooling**: Configure appropriate connection limits

### Migration from REST

When migrating existing REST APIs to oRPC:

1. **Identify Endpoints**: List all current REST endpoints
2. **Define Schemas**: Create Zod schemas for inputs/outputs
3. **Create Contracts**: Convert REST routes to oRPC contracts
4. **Update Controllers**: Replace REST decorators with `@Implement`
5. **Update Clients**: Replace fetch calls with oRPC client calls
6. **Test Thoroughly**: Ensure all functionality works correctly

**Migration Checklist:**
- ✅ Schemas defined and validated
- ✅ Contracts created and exported
- ✅ Server controllers updated
- ✅ Client code migrated
- ✅ Tests updated
- ✅ Documentation updated

Previous: [File Upload](file-upload.md)

Next: [Todos](todos.md)