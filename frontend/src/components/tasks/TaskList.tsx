'use client';

import { useState } from 'react';
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
  const [showCompleted, setShowCompleted] = useState(false);

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

  // Separate completed and pending tasks
  const pendingTasks = tasks.filter(task => task.status !== 'done');
  const completedTasks = tasks.filter(task => task.status === 'done');

  // Group pending tasks by source
  const pendingTasksBySource = pendingTasks.reduce((acc, task) => {
    if (!acc[task.source]) {
      acc[task.source] = [];
    }
    acc[task.source].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Group completed tasks by source
  const completedTasksBySource = completedTasks.reduce((acc, task) => {
    if (!acc[task.source]) {
      acc[task.source] = [];
    }
    acc[task.source].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const sourceOrder: IntegrationSource[] = ['jira', 'github', 'bitbucket', 'calendar', 'teams', 'manual'];
  const sortedPendingSources = sourceOrder.filter(source => pendingTasksBySource[source]);
  const sortedCompletedSources = sourceOrder.filter(source => completedTasksBySource[source]);

  return (
    <div className="space-y-6">
      {/* Pending Tasks Section */}
      {sortedPendingSources.length > 0 && (
        <div className="space-y-6">
          {sortedPendingSources.map((source) => (
            <div key={source}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wide">
                  {getSourceLabel(source)}
                </h3>
                <div className="flex-1 h-px bg-card-border"></div>
                <span className="text-xs text-muted">
                  {pendingTasksBySource[source].length} {pendingTasksBySource[source].length === 1 ? 'task' : 'tasks'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {pendingTasksBySource[source].map((task) => (
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
      )}

      {/* Completed Tasks Section */}
      {completedTasks.length > 0 && (
        <div className="border-t border-card-border pt-6">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center justify-between w-full mb-4 px-3 py-2 rounded-lg hover:bg-card-hover transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-success text-xl">✓</span>
              <div className="text-left">
                <h3 className="text-sm font-semibold text-foreground">
                  Completed Tasks
                </h3>
                <p className="text-xs text-muted">
                  {completedTasks.length} {completedTasks.length === 1 ? 'task' : 'tasks'} completed today
                </p>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-muted transition-transform ${showCompleted ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showCompleted && (
            <div className="space-y-6 animate-fade-in">
              {sortedCompletedSources.map((source) => (
                <div key={source}>
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-semibold text-foreground-muted uppercase tracking-wide">
                      {getSourceLabel(source)}
                    </h3>
                    <div className="flex-1 h-px bg-card-border"></div>
                    <span className="text-xs text-muted">
                      {completedTasksBySource[source].length} {completedTasksBySource[source].length === 1 ? 'task' : 'tasks'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    {completedTasksBySource[source].map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleComplete={onToggleComplete}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state for all tasks completed */}
      {pendingTasks.length === 0 && completedTasks.length > 0 && (
        <div className="section-placeholder">
          <div className="section-placeholder-icon">🎉</div>
          <p className="section-placeholder-text">
            All tasks completed! Great work today.
          </p>
        </div>
      )}
    </div>
  );
}

// Made with Bob
