'use client';

import { useEffect, useState } from 'react';
import { orpc } from '@/lib/orpc-client';
import type { Todo } from '@workspace/orpc';
import { transformTodo, transformTodos } from '@workspace/orpc';
import { TodoForm } from '@/components/todos/todo-form';
import { TodoList } from '@/components/todos/todo-list';
import { Card, CardContent } from '@workspace/ui/components/card';
import { AlertCircle, Loader2 } from 'lucide-react';

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch todos on mount
  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await orpc.todo.list();
      setTodos(transformTodos(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (input: {
    title: string;
    description?: string;
    completed: boolean;
  }) => {
    try {
      const newTodo = await orpc.todo.create(input);
      setTodos((prev) => [...prev, transformTodo(newTodo)]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create todo');
    }
  };

  const handleToggle = async (id: number, completed: boolean) => {
    const updated = await orpc.todo.update({ id, completed });
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? transformTodo(updated) : todo))
    );
  };

  const handleDelete = async (id: number) => {
    await orpc.todo.delete({ id });
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Todo List</h1>
        <p className="text-muted-foreground">
          Type-safe API with oRPC + NestJS + Next.js
        </p>
      </div>

      <div className="grid gap-8">
        <TodoForm onSubmit={handleCreate} />

        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-muted-foreground mt-4">Loading todos...</p>
            </CardContent>
          </Card>
        ) : (
          <TodoList
            todos={todos}
            onToggle={handleToggle}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}