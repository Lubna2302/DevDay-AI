'use client';

import { useState } from 'react';
import type { Task } from '@/types';

interface ManualTaskFormProps {
  onAddTask: (task: Task) => void;
}

export default function ManualTaskForm({ onAddTask }: ManualTaskFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    const newTask: Task = {
      id: `manual-${Date.now()}`,
      title: title.trim(),
      source: 'manual',
      status: 'todo',
      priority,
      description: description.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onAddTask(newTask);
    
    // Reset form
    setTitle('');
    setPriority('medium');
    setDescription('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary w-full"
      >
        + Add Manual Task
      </button>
    );
  }

  return (
    <div className="card bg-card-bg border-2 border-primary/20">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-foreground mb-2">
            Task Title *
          </label>
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you need to do?"
            className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            autoFocus
            required
          />
        </div>

        <div>
          <label htmlFor="task-priority" className="block text-sm font-medium text-foreground mb-2">
            Priority
          </label>
          <select
            id="task-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-foreground mb-2">
            Description (optional)
          </label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add more details..."
            rows={3}
            className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary flex-1">
            Add Task
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setTitle('');
              setPriority('medium');
              setDescription('');
            }}
            className="btn btn-outline flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// Made with Bob
