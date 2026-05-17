'use client';

import type { Blocker, Task } from '@/types';
import { formatTimeLabel } from '@/utils/formatters';

interface BlockerCardProps {
  blocker: Blocker;
  relatedTask?: Task;
  onResolve: (blockerId: string) => void;
}

export default function BlockerCard({ blocker, relatedTask, onResolve }: BlockerCardProps) {
  const isActive = blocker.status === 'active';

  return (
    <div className={`border rounded-lg p-4 ${isActive ? 'border-danger/30 bg-danger/5' : 'border-border bg-muted/20'}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        {/* Status Badge */}
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
            isActive
              ? 'bg-red-500/10 text-red-600 border-red-500/20'
              : 'bg-green-500/10 text-green-600 border-green-500/20'
          }`}
        >
          {isActive ? '🚧 Active' : '✅ Resolved'}
        </span>

        {/* Created Time */}
        <span className="text-xs text-muted whitespace-nowrap">
          {formatTimeLabel(blocker.createdAt)}
        </span>
      </div>

      {/* Related Task */}
      {relatedTask && (
        <div className="mb-2">
          <span className="text-xs text-muted">Blocking: </span>
          <span className="text-xs font-medium">{relatedTask.title}</span>
        </div>
      )}

      {/* Description */}
      <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3">
        {blocker.description}
      </p>

      {/* Resolved Time */}
      {blocker.resolvedAt && (
        <div className="mb-3">
          <span className="text-xs text-muted">
            Resolved at {formatTimeLabel(blocker.resolvedAt)}
          </span>
        </div>
      )}

      {/* Action Button */}
      {isActive && (
        <button
          onClick={() => onResolve(blocker.id)}
          className="btn btn-sm btn-success w-full"
        >
          Mark Resolved
        </button>
      )}
    </div>
  );
}

// Made with Bob