import { Injectable, NotFoundException } from '@nestjs/common';
import type { Todo, CreateTodoInput } from '@workspace/orpc';

@Injectable()
export class TodosService {
  private todos: Todo[] = [];
  private nextId = 1;

  findAll(): Todo[] {
    return this.todos;
  }

  findOne(id: number): Todo {
    const todo = this.todos.find((t) => t.id === id);
    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    return todo;
  }

  create(input: any): Todo {
    const newTodo: Todo = {
      id: this.nextId++,
      title: input.title,
      description: input.description,
      completed: input.completed ?? false,
      createdAt: new Date(),
    };
    this.todos.push(newTodo);
    return newTodo;
  }

  update(
    id: number,
    updates: { title?: string; description?: string; completed?: boolean }
  ): Todo {
    const todo = this.findOne(id);
    
    if (updates.title !== undefined) {
      todo.title = updates.title;
    }
    if (updates.description !== undefined) {
      todo.description = updates.description;
    }
    if (updates.completed !== undefined) {
      todo.completed = updates.completed;
    }

    return todo;
  }

  delete(id: number): { success: boolean; id: number } {
    const index = this.todos.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }
    this.todos.splice(index, 1);
    return { success: true, id };
  }
}