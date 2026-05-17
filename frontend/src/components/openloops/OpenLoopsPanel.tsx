import { OpenLoop, Task } from '@/types';
import OpenLoopCard from './OpenLoopCard';

interface OpenLoopsPanelProps {
  openLoops: OpenLoop[];
  tasks: Task[];
  onResume: (openLoop: OpenLoop) => void;
  onComplete: (openLoop: OpenLoop) => void;
  onDismiss: (openLoop: OpenLoop) => void;
}

export default function OpenLoopsPanel({
  openLoops,
  tasks,
  onResume,
  onComplete,
  onDismiss,
}: OpenLoopsPanelProps) {
  // Count by status
  const statusCounts = openLoops.reduce(
    (acc, loop) => {
      acc[loop.status] = (acc[loop.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Find task for each open loop
  const getTaskForLoop = (openLoop: OpenLoop): Task | undefined => {
    return tasks.find((t) => t.id === openLoop.taskId);
  };

  if (openLoops.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">✨</div>
        <h3 className="text-lg font-medium text-white mb-2">
          No Open Loops
        </h3>
        <p className="text-sm text-slate-400 max-w-xs mx-auto">
          Everything is either done, focused, or intentionally parked.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with counts */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-3">
          Open Loops ({openLoops.length})
        </h2>
        
        {/* Status breakdown */}
        <div className="flex flex-wrap gap-2">
          {statusCounts.paused && (
            <span className="px-2 py-1 rounded text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20">
              {statusCounts.paused} Paused
            </span>
          )}
          {statusCounts.blocked && (
            <span className="px-2 py-1 rounded text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20">
              {statusCounts.blocked} Blocked
            </span>
          )}
          {statusCounts.waiting && (
            <span className="px-2 py-1 rounded text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {statusCounts.waiting} Waiting
            </span>
          )}
          {statusCounts.missing_next_action && (
            <span className="px-2 py-1 rounded text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {statusCounts.missing_next_action} Missing Next Action
            </span>
          )}
        </div>
      </div>

      {/* Open loop cards */}
      <div className="space-y-3">
        {openLoops.map((openLoop) => (
          <OpenLoopCard
            key={openLoop.id}
            openLoop={openLoop}
            task={getTaskForLoop(openLoop)}
            onResume={onResume}
            onComplete={onComplete}
            onDismiss={onDismiss}
          />
        ))}
      </div>
    </div>
  );
}

// Made with Bob
