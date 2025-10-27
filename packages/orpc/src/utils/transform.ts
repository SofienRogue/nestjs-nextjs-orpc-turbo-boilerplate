/**
 * Utilities for transforming API responses to match runtime types
 */

/**
 * Transform a single todo from API response (with string dates) to runtime type (with Date objects)
 */
export function transformTodo<T extends { createdAt: string | Date }>(
  todo: T
): Omit<T, 'createdAt'> & { createdAt: Date } {
  return {
    ...todo,
    createdAt: typeof todo.createdAt === 'string' ? new Date(todo.createdAt) : todo.createdAt,
  };
}

/**
 * Transform an array of todos from API response to runtime types
 */
export function transformTodos<T extends { createdAt: string | Date }>(
  todos: T[]
): Array<Omit<T, 'createdAt'> & { createdAt: Date }> {
  return todos.map(transformTodo);
}

/**
 * Generic date field transformer for any entity
 * Useful for entities with multiple date fields
 */
export function transformDateFields<
  T extends Record<string, any>,
  K extends keyof T
>(obj: T, dateFields: K[]): T {
  const result = { ...obj };
  for (const field of dateFields) {
    if (typeof result[field] === 'string') {
      result[field] = new Date(result[field] as string) as T[K];
    }
  }
  return result;
}
