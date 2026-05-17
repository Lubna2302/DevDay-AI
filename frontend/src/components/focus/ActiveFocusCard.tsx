'use client';

import type { Task, FocusSession } from '@/types';
import { getSourceLabel, getStatusLabel, getPriorityLabel } from '@/utils/formatters';

interface ActiveFocusCardProps {
  task: Task | null;
  session: FocusSession | null;
  onComplete: () => void;
  onPause: () => void;
  onBlocked: () => void;
  onExtend: () => void;
}

export default function ActiveFocusCard({
  task,
  session,
  onComplete,
  onPause,
  onBlocked,
  onExtend,
}: ActiveFocusCardProps) {
  if (!task) {
    return (
      <div className="section-placeholder">
        <div className="section-placeholder-icon">🎯</div>
        <p className="section-placeholder-text">
          Choose a task from Today's Work to start focusing.
        </p>
      </div>
    );
  }

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

  const sourceColor = sourceColors[task.source] || sourceColors.manual;
  const statusColor = statusColors[task.status] || statusColors.todo;
  const priorityColor = priorityColors[task.priority] || priorityColors.medium;

  return (
    <div className="space-y-4">
      {/* Task Info */}
      <div className="card focus-active" style={{
        background: 'var(--surface)',
        borderColor: 'rgba(214, 255, 107, 0.2)'
      }}>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
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

        <h3 className="text-lg font-semibold text-foreground mb-2">
          {task.title}
        </h3>

        {task.description && (
          <p className="text-sm text-muted mb-3">
            {task.description}
          </p>
        )}

        {/* Focus Session Details */}
        {session && (
          <div className="mt-4 pt-4 border-t border-card-border">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <div className="text-xs text-foreground-muted uppercase tracking-wide mb-1">
                  Duration
                </div>
                <div className="text-lg font-semibold text-primary">
                  {session.durationMinutes} min
                </div>
              </div>
              <div>
                <div className="text-xs text-foreground-muted uppercase tracking-wide mb-1">
                  Status
                </div>
                <div className="text-lg font-semibold" style={{ color: 'var(--muted-accent)' }}>
                  {getStatusLabel(session.status)}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-foreground-muted uppercase tracking-wide mb-1">
                Focus Goal
              </div>
              <p className="text-sm text-foreground">
                {session.goal}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onComplete}
          className="btn btn-primary btn-sm"
          disabled={task.status === 'done'}
        >
          ✓ Complete
        </button>
        <button
          onClick={onBlocked}
          className="btn btn-outline btn-sm"
          disabled={task.status === 'blocked'}
        >
          🚧 Blocked
        </button>
        <button
          onClick={onPause}
          className="btn btn-outline btn-sm"
        >
          ⏸ Pause
        </button>
        <button
          onClick={onExtend}
          className="btn btn-outline btn-sm"
          disabled={!session}
        >
          ⏱ +15 min
        </button>
      </div>
    </div>
  );
}

// Made with Bob
