'use client';

import type { Task } from '@/types';
import { getSourceLabel, getStatusLabel, getPriorityLabel, formatTimeLabel } from '@/utils/formatters';

interface TaskCardProps {
  task: Task;
  onSetFocus?: (task: Task) => void;
  onMarkDone?: (taskId: string) => void;
}

export default function TaskCard({ task, onSetFocus, onMarkDone }: TaskCardProps) {
  const sourceColors: Record<string, string> = {
    jira: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    github: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    bitbucket: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    calendar: 'bg-green-500/10 text-green-400 border-green-500/20',
    teams: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    manual: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  const statusColors: Record<string, string> = {
    todo: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    done: 'bg-green-500/10 text-green-400 border-green-500/20',
    blocked: 'bg-red-500/10 text-red-400 border-red-500/20',
    paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const priorityColors: Record<string, string> = {
    urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };

  const sourceColor = sourceColors[task.source] || sourceColors.manual;
  const statusColor = statusColors[task.status] || statusColors.todo;
  const priorityColor = priorityColors[task.priority] || priorityColors.medium;

  return (
    <div className="card group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`badge ${sourceColor}`}>
              {getSourceLabel(task.source)}
            </span>
            <span className={`badge ${statusColor}`}>
              {getStatusLabel(task.status)}
            </span>
            <span className={`badge ${priorityColor}`}>
              {getPriorityLabel(task.priority)}
            </span>
            {task.externalKey && (
              <span className="text-xs text-muted font-mono">
                {task.externalKey}
              </span>
            )}
          </div>
          
          <h3 className="text-base font-semibold text-foreground mb-1 line-clamp-2">
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-sm text-muted line-clamp-2 mb-2">
              {task.description}
            </p>
          )}
          
          {task.scheduledTime && (
            <div className="flex items-center gap-1 text-xs text-muted">
              <span>🕐</span>
              <span>{formatTimeLabel(task.scheduledTime)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-card-border">
        {task.status !== 'done' && onSetFocus && (
          <button
            onClick={() => onSetFocus(task)}
            className="btn btn-primary text-xs flex-1"
          >
            🎯 Set Focus
          </button>
        )}
        {task.status !== 'done' && onMarkDone && (
          <button
            onClick={() => onMarkDone(task.id)}
            className="btn btn-outline text-xs flex-1"
          >
            ✓ Mark Done
          </button>
        )}
        {task.status === 'done' && (
          <div className="text-xs text-success flex items-center gap-1">
            <span>✓</span>
            <span>Completed</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob
