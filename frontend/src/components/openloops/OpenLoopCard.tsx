import { OpenLoop, Task } from '@/types';
import { formatTimeLabel } from '@/utils/formatters';

interface OpenLoopCardProps {
  openLoop: OpenLoop;
  task?: Task;
  onResume: (openLoop: OpenLoop) => void;
  onComplete: (openLoop: OpenLoop) => void;
  onDismiss: (openLoop: OpenLoop) => void;
}

export default function OpenLoopCard({
  openLoop,
  task,
  onResume,
  onComplete,
  onDismiss,
}: OpenLoopCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paused':
        return 'badge-muted';
      case 'blocked':
        return 'badge-danger';
      case 'waiting':
        return 'badge-warning';
      case 'missing_next_action':
        return 'badge-info';
      default:
        return 'badge-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground mb-2 truncate">
            {task?.title || openLoop.taskTitle || 'Untitled Task'}
          </h3>
          <span className={`badge ${getStatusColor(openLoop.status)}`}>
            {getStatusLabel(openLoop.status)}
          </span>
        </div>
        {openLoop.createdAt && (
          <span className="text-xs text-muted whitespace-nowrap">
            {formatTimeLabel(openLoop.createdAt)}
          </span>
        )}
      </div>

      {openLoop.currentState && (
        <div className="mb-2">
          <p className="text-xs text-foreground-muted mb-1">Current State:</p>
          <p className="text-sm text-foreground">{openLoop.currentState}</p>
        </div>
      )}

      {openLoop.nextAction && (
        <div className="mb-2">
          <p className="text-xs text-foreground-muted mb-1">Next Action:</p>
          <p className="text-sm text-primary">{openLoop.nextAction}</p>
        </div>
      )}

      {openLoop.blocker && (
        <div className="mb-3 p-2 rounded bg-danger-muted border border-danger/30">
          <p className="text-xs text-danger mb-1">⚠️ Blocker:</p>
          <p className="text-sm" style={{ color: 'var(--danger)' }}>{openLoop.blocker}</p>
        </div>
      )}

      <div className="flex gap-2 mt-3 pt-3 border-t border-card-border">
        <button
          onClick={() => onResume(openLoop)}
          className="btn btn-primary btn-sm flex-1"
        >
          Resume
        </button>
        <button
          onClick={() => onComplete(openLoop)}
          className="btn btn-sm flex-1"
          style={{ 
            background: 'var(--success-muted)', 
            color: 'var(--success)',
            border: '1px solid rgba(94, 234, 212, 0.3)'
          }}
        >
          Mark Done
        </button>
        <button
          onClick={() => onDismiss(openLoop)}
          className="btn btn-outline btn-sm"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

// Made with Bob
