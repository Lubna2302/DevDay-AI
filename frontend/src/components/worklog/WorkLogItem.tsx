'use client';

import type { WorkLog, Task } from '@/types';
import { getWorkLogTypeLabel, formatTimeLabel } from '@/utils/formatters';

interface WorkLogItemProps {
  workLog: WorkLog;
  relatedTask?: Task;
}

// Get badge color based on work log type
function getTypeBadgeColor(type: string): string {
  const colorMap: Record<string, string> = {
    task_update: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    debugging: 'bg-red-500/10 text-red-600 border-red-500/20',
    pr_review: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    meeting: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    helped_teammate: 'bg-green-500/10 text-green-600 border-green-500/20',
    research: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
    documentation: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    production_support: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    blocker: 'bg-red-500/10 text-red-600 border-red-500/20',
  };
  return colorMap[type] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
}

export default function WorkLogItem({ workLog, relatedTask }: WorkLogItemProps) {
  return (
    <div className="border border-border rounded-lg p-4 hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        {/* Type Badge */}
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeBadgeColor(
            workLog.type
          )}`}
        >
          {getWorkLogTypeLabel(workLog.type)}
        </span>

        {/* Time */}
        <span className="text-xs text-muted whitespace-nowrap">
          {formatTimeLabel(workLog.createdAt)}
        </span>
      </div>

      {/* Related Task */}
      {relatedTask && (
        <div className="mb-2">
          <span className="text-xs text-muted">Related to: </span>
          <span className="text-xs font-medium">{relatedTask.title}</span>
        </div>
      )}

      {/* Description */}
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {workLog.description}
      </p>
    </div>
  );
}

// Made with Bob