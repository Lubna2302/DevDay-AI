'use client';

import type { WorkLog, Task } from '@/types';
import WorkLogItem from './WorkLogItem';

interface WorkLogFeedProps {
  workLogs: WorkLog[];
  tasks: Task[];
}

export default function WorkLogFeed({ workLogs, tasks }: WorkLogFeedProps) {
  // Sort work logs in reverse chronological order (newest first)
  const sortedLogs = [...workLogs].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Empty state
  if (sortedLogs.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/20 mb-4">
          <span className="text-3xl">📝</span>
        </div>
        <p className="text-muted text-sm">
          No work logs yet. Add quick notes as your day progresses.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedLogs.map((workLog) => {
        // Find related task if exists
        const relatedTask = workLog.relatedTaskId
          ? tasks.find((task) => task.id === workLog.relatedTaskId)
          : undefined;

        return (
          <WorkLogItem
            key={workLog.id}
            workLog={workLog}
            relatedTask={relatedTask}
          />
        );
      })}
    </div>
  );
}

// Made with Bob