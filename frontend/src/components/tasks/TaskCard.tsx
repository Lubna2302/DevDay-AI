'use client';

import type { Task } from '@/types';
import { getSourceLabel, getStatusLabel, getPriorityLabel, formatTimeLabel } from '@/utils/formatters';

interface TaskCardProps {
  task: Task;
  onSetFocus?: (task: Task) => void;
  onMarkDone?: (taskId: string) => void;
  onToggleComplete?: (taskId: string, currentStatus: string) => void;
}

export default function TaskCard({ task, onSetFocus, onMarkDone, onToggleComplete }: TaskCardProps) {
  // New premium color palette
  const sourceColors: Record<string, string> = {
    jira: 'badge-jira',
    github: 'badge-github',
    bitbucket: 'badge-bitbucket',
    calendar: 'badge-calendar',
    teams: 'badge-teams',
    manual: 'badge-manual',
  };

  const statusColors: Record<string, string> = {
    todo: 'badge-muted',
    in_progress: 'badge-warning',
    done: 'badge-success',
    blocked: 'badge-danger',
    paused: 'badge-muted',
  };

  const priorityColors: Record<string, string> = {
    urgent: 'badge-danger',
    high: 'badge-warning',
    medium: 'badge-info',
    low: 'badge-muted',
  };

  const sourceDotColors: Record<string, string> = {
    jira: 'source-dot-jira',
    github: 'source-dot-github',
    bitbucket: 'source-dot-bitbucket',
    calendar: 'source-dot-calendar',
    teams: 'source-dot-teams',
    manual: 'source-dot-manual',
  };

  const sourceColor = sourceColors[task.source] || sourceColors.manual;
  const statusColor = statusColors[task.status] || statusColors.todo;
  const priorityColor = priorityColors[task.priority] || priorityColors.medium;
  const sourceDotColor = sourceDotColors[task.source] || sourceDotColors.manual;

  const isCompleted = task.status === 'done';

  const handleCheckboxChange = () => {
    if (onToggleComplete) {
      onToggleComplete(task.id, task.status);
    } else if (onMarkDone && !isCompleted) {
      onMarkDone(task.id);
    }
  };

  return (
    <div className={`card group animate-fade-in ${isCompleted ? 'task-completed' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Custom Checkbox */}
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleCheckboxChange}
          className="task-checkbox mt-1"
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {/* Source dot indicator */}
            <span className={`source-dot ${sourceDotColor}`} title={getSourceLabel(task.source)}></span>
            
            <span className={`badge ${sourceColor}`}>
              {getSourceLabel(task.source)}
            </span>
            <span className={`badge ${statusColor}`}>
              {getStatusLabel(task.status)}
            </span>
            {task.priority !== 'low' && (
              <span className={`badge ${priorityColor}`}>
                {getPriorityLabel(task.priority)}
              </span>
            )}
            {task.externalKey && (
              <span className="text-xs text-muted font-mono">
                {task.externalKey}
              </span>
            )}
          </div>
          
          <h3 className={`text-base font-semibold mb-1 line-clamp-2 task-title ${isCompleted ? '' : 'text-foreground'}`}>
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

          {/* Action buttons - only show for non-completed tasks */}
          {!isCompleted && (
            <div className="flex items-center gap-2 mt-3">
              {onSetFocus && (
                <button
                  onClick={() => onSetFocus(task)}
                  className="btn btn-primary btn-sm"
                >
                  🎯 Set Focus
                </button>
              )}
            </div>
          )}

          {/* Completed indicator */}
          {isCompleted && (
            <div className="text-xs text-success flex items-center gap-1 mt-2">
              <span>✓</span>
              <span>Completed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob
