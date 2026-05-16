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
    <div className="space-y-4">
      {/* Task Info */}
      <div className="card bg-gradient-to-br from-blue-500/5 to-violet-500/5 border-blue-500/20">
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
                <div className="text-xs text-muted uppercase tracking-wide mb-1">
                  Duration
                </div>
                <div className="text-lg font-semibold text-primary">
                  {session.durationMinutes} min
                </div>
              </div>
              <div>
                <div className="text-xs text-muted uppercase tracking-wide mb-1">
                  Status
                </div>
                <div className="text-lg font-semibold text-violet-400">
                  {getStatusLabel(session.status)}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-muted uppercase tracking-wide mb-1">
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
          className="btn btn-primary text-sm"
          disabled={task.status === 'done'}
        >
          ✓ Complete
        </button>
        <button
          onClick={onBlocked}
          className="btn btn-outline text-sm"
          disabled={task.status === 'blocked'}
        >
          🚧 Blocked
        </button>
        <button
          onClick={onPause}
          className="btn btn-outline text-sm"
        >
          ⏸ Pause
        </button>
        <button
          onClick={onExtend}
          className="btn btn-outline text-sm"
          disabled={!session}
        >
          ⏱ +15 min
        </button>
      </div>
    </div>
  );
}

// Made with Bob
