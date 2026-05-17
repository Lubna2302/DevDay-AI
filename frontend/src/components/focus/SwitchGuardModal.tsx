'use client';

import { useState } from 'react';
import type { Task, FocusSession, OpenLoop } from '@/types';
import { getSourceLabel, getStatusLabel } from '@/utils/formatters';

interface SwitchGuardModalProps {
  isOpen: boolean;
  currentTask: Task;
  newTask: Task;
  currentSession: FocusSession | null;
  onComplete: () => void;
  onPauseWithNote: (openLoop: OpenLoop) => void;
  onMarkBlocked: () => void;
  onSwitchAnyway: () => void;
  onCancel: () => void;
}

export default function SwitchGuardModal({
  isOpen,
  currentTask,
  newTask,
  currentSession,
  onComplete,
  onPauseWithNote,
  onMarkBlocked,
  onSwitchAnyway,
  onCancel,
}: SwitchGuardModalProps) {
  const [showPauseForm, setShowPauseForm] = useState(false);
  const [whatITried, setWhatITried] = useState('');
  const [currentState, setCurrentState] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [blocker, setBlocker] = useState('');

  if (!isOpen) return null;

  const handlePauseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentState.trim() || !nextAction.trim()) {
      return;
    }

    const openLoop: OpenLoop = {
      id: `loop-${Date.now()}`,
      taskId: currentTask.id,
      taskTitle: currentTask.title,
      status: blocker.trim() ? 'blocked' : 'paused',
      currentState: currentState.trim(),
      nextAction: nextAction.trim(),
      blocker: blocker.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onPauseWithNote(openLoop);
    
    // Reset form
    setShowPauseForm(false);
    setWhatITried('');
    setCurrentState('');
    setNextAction('');
    setBlocker('');
  };

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-card-bg border-2 border-primary/30 shadow-2xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            You already have an active focus task
          </h2>
          <p className="text-foreground-muted">
            Before switching, close the loop on your current task so it does not get forgotten.
          </p>
        </div>

        {/* Current Task */}
        <div className="mb-6">
          <div className="text-sm font-medium text-foreground-muted uppercase tracking-wide mb-2">
            Current Focus
          </div>
          <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={`badge ${sourceColors[currentTask.source]}`}>
                {getSourceLabel(currentTask.source)}
              </span>
              <span className={`badge ${statusColors[currentTask.status]}`}>
                {getStatusLabel(currentTask.status)}
              </span>
            </div>
            <h3 className="text-base font-semibold text-foreground mb-2">
              {currentTask.title}
            </h3>
            {currentSession && (
              <p className="text-sm text-muted">
                <span className="font-medium">Goal:</span> {currentSession.goal}
              </p>
            )}
          </div>
        </div>

        {/* New Task */}
        <div className="mb-6">
          <div className="text-sm font-medium text-foreground-muted uppercase tracking-wide mb-2">
            Switching To
          </div>
          <div className="card bg-background-secondary border-card-border">
            <div className="flex items-center gap-2 mb-2">
              <span className={`badge ${sourceColors[newTask.source]}`}>
                {getSourceLabel(newTask.source)}
              </span>
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {newTask.title}
            </h3>
          </div>
        </div>

        {/* Pause Form */}
        {showPauseForm ? (
          <form onSubmit={handlePauseSubmit} className="mb-6 space-y-4">
            <div className="card bg-gradient-to-br from-warning/5 to-secondary/5 border-warning/20">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                📝 Pause with Resume Note
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label htmlFor="current-state" className="block text-sm font-medium text-foreground mb-1">
                    Current State *
                  </label>
                  <textarea
                    id="current-state"
                    value={currentState}
                    onChange={(e) => setCurrentState(e.target.value)}
                    placeholder="Where did you leave off?"
                    rows={2}
                    className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="next-action" className="block text-sm font-medium text-foreground mb-1">
                    Next Action *
                  </label>
                  <textarea
                    id="next-action"
                    value={nextAction}
                    onChange={(e) => setNextAction(e.target.value)}
                    placeholder="What should you do when you return?"
                    rows={2}
                    className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="blocker" className="block text-sm font-medium text-foreground mb-1">
                    Blocker (optional)
                  </label>
                  <input
                    id="blocker"
                    type="text"
                    value={blocker}
                    onChange={(e) => setBlocker(e.target.value)}
                    placeholder="What's blocking progress?"
                    className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button type="submit" className="btn btn-primary flex-1 btn-sm">
                    Save & Switch
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPauseForm(false)}
                    className="btn btn-outline flex-1 btn-sm"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-3 mb-6">
            <button
              onClick={() => setShowPauseForm(true)}
              className="btn btn-primary w-full"
            >
              ⏸ Pause with Resume Note
            </button>
            
            <button
              onClick={onComplete}
              className="btn btn-outline w-full"
            >
              ✓ Complete Current Task
            </button>
            
            <button
              onClick={onMarkBlocked}
              className="btn btn-outline w-full"
            >
              🚧 Mark Current Task Blocked
            </button>
          </div>
        )}

        {/* Secondary Actions */}
        {!showPauseForm && (
          <div className="flex gap-2 pt-4 border-t border-card-border">
            <button
              onClick={onSwitchAnyway}
              className="btn btn-outline flex-1 btn-sm text-muted"
            >
              Switch Anyway
            </button>
            <button
              onClick={onCancel}
              className="btn btn-outline flex-1 btn-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob
