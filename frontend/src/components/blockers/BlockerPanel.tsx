'use client';

import { useState } from 'react';
import type { Blocker, Task } from '@/types';
import BlockerCard from './BlockerCard';

interface BlockerPanelProps {
  blockers: Blocker[];
  tasks: Task[];
  onAddBlocker: (blocker: { relatedTaskId?: string; description: string }) => void;
  onResolveBlocker: (blockerId: string) => void;
}

export default function BlockerPanel({
  blockers,
  tasks,
  onAddBlocker,
  onResolveBlocker,
}: BlockerPanelProps) {
  const [relatedTaskId, setRelatedTaskId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ description?: string }>({});
  const [showForm, setShowForm] = useState(false);

  const activeBlockers = blockers.filter((b) => b.status === 'active');
  const resolvedBlockers = blockers.filter((b) => b.status === 'resolved');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { description?: string } = {};

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit the blocker
    onAddBlocker({
      relatedTaskId: relatedTaskId || undefined,
      description: description.trim(),
    });

    // Clear form
    setDescription('');
    setRelatedTaskId('');
    setErrors({});
    setShowForm(false);
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="card-title">🚧 Blockers</h2>
            <p className="card-subtitle">Track what's blocking your progress</p>
          </div>
          {activeBlockers.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20">
              {activeBlockers.length} Active
            </span>
          )}
        </div>
      </div>

      {/* Add Blocker Form Toggle */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-outline w-full mb-4"
        >
          + Add Blocker
        </button>
      )}

      {/* Add Blocker Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 p-4 border border-border rounded-lg bg-muted/20">
          <div className="space-y-3">
            {/* Related Task Dropdown */}
            <div>
              <label htmlFor="blocker-task" className="block text-sm font-medium mb-1">
                Related Task
              </label>
              <select
                id="blocker-task"
                value={relatedTaskId}
                onChange={(e) => setRelatedTaskId(e.target.value)}
                className="input w-full text-sm"
              >
                <option value="">No related task</option>
                {tasks.map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Description Textarea */}
            <div>
              <label htmlFor="blocker-description" className="block text-sm font-medium mb-1">
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                id="blocker-description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setErrors({ ...errors, description: undefined });
                }}
                placeholder="What's blocking you? What do you need to unblock?"
                rows={3}
                className={`input w-full resize-none text-sm ${
                  errors.description ? 'border-danger' : ''
                }`}
              />
              {errors.description && (
                <p className="text-xs text-danger mt-1">{errors.description}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-2">
              <button type="submit" className="btn btn-danger flex-1 text-sm">
                Add Blocker
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setDescription('');
                  setRelatedTaskId('');
                  setErrors({});
                }}
                className="btn btn-outline flex-1 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Blockers List */}
      <div className="space-y-3">
        {/* Active Blockers */}
        {activeBlockers.map((blocker) => {
          const relatedTask = blocker.relatedTaskId
            ? tasks.find((task) => task.id === blocker.relatedTaskId)
            : undefined;

          return (
            <BlockerCard
              key={blocker.id}
              blocker={blocker}
              relatedTask={relatedTask}
              onResolve={onResolveBlocker}
            />
          );
        })}

        {/* Resolved Blockers */}
        {resolvedBlockers.map((blocker) => {
          const relatedTask = blocker.relatedTaskId
            ? tasks.find((task) => task.id === blocker.relatedTaskId)
            : undefined;

          return (
            <BlockerCard
              key={blocker.id}
              blocker={blocker}
              relatedTask={relatedTask}
              onResolve={onResolveBlocker}
            />
          );
        })}

        {/* Empty State */}
        {blockers.length === 0 && (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/20 mb-3">
              <span className="text-2xl">🚧</span>
            </div>
            <p className="text-muted text-sm">No active blockers</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob