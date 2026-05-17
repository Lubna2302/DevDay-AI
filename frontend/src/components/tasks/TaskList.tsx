'use client';

import type { Task, IntegrationSource } from '@/types';
import TaskCard from './TaskCard';
import { getSourceLabel } from '@/utils/formatters';

interface TaskListProps {
  tasks: Task[];
  onSetFocus?: (task: Task) => void;
  onMarkDone?: (taskId: string) => void;
  onToggleComplete?: (taskId: string, currentStatus: string) => void;
}

export default function TaskList({ tasks, onSetFocus, onMarkDone, onToggleComplete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="section-placeholder">
        <div className="section-placeholder-icon">📋</div>
        <p className="section-placeholder-text">
          No tasks for today. Add a manual task to get started.
        </p>
      </div>
    );
  }

  // Group tasks by source
  const tasksBySource = tasks.reduce((acc, task) => {
    if (!acc[task.source]) {
      acc[task.source] = [];
    }
    acc[task.source].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const sourceOrder: IntegrationSource[] = ['jira', 'github', 'bitbucket', 'calendar', 'teams', 'manual'];
  const sortedSources = sourceOrder.filter(source => tasksBySource[source]);

  return (
    <div className="space-y-6">
      {sortedSources.map((source) => (
        <div key={source}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wide">
              {getSourceLabel(source)}
            </h3>
            <div className="flex-1 h-px bg-card-border"></div>
            <span className="text-xs text-muted">
              {tasksBySource[source].length} {tasksBySource[source].length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {tasksBySource[source].map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onSetFocus={onSetFocus}
                onMarkDone={onMarkDone}
                onToggleComplete={onToggleComplete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Made with Bob
