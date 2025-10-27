'use client';

import { useState } from 'react';
import type { Todo } from '@workspace/orpc';
import { Button } from '@workspace/ui/components/button';
import { Checkbox } from '@workspace/ui/components/checkbox';
import { Card, CardContent } from '@workspace/ui/components/card';
import { Trash2, Calendar } from 'lucide-react';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      await onToggle(todo.id, !todo.completed);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this todo?')) {
      setIsDeleting(true);
      try {
        await onDelete(todo.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className={isDeleting ? 'opacity-50' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={handleToggle}
            disabled={isUpdating || isDeleting}
            className="mt-1"
          />
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium ${
              todo.completed ? 'line-through text-muted-foreground' : ''
            }`}>
              {todo.title}
            </h3>
            
            {todo.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {todo.description}
              </p>
            )}
            
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
              <Calendar className="h-3 w-3" />
              {new Date(todo.createdAt).toLocaleDateString()}
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}