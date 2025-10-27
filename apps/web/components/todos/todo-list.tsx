'use client';

import type { Todo } from '@workspace/orpc';
import { TodoItem } from './todo-item';
import { Card, CardContent } from '@workspace/ui/components/card';
import { CheckCircle2, Circle, ListTodo } from 'lucide-react';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number, completed: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            No todos yet. Create your first todo above!
          </p>
        </CardContent>
      </Card>
    );
  }

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <ListTodo className="h-4 w-4" />
            Total: {totalCount}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            Completed: {completedCount}
          </span>
          <span className="flex items-center gap-1">
            <Circle className="h-4 w-4" />
            Active: {totalCount - completedCount}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}