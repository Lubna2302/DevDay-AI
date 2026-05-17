'use client';

import { useState, useEffect } from 'react';
import type { DailySummary, Task, WorkLog, Blocker, OpenLoop } from '@/types';

interface DailySummaryEditorProps {
  dailySummary: DailySummary | null;
  tasks: Task[];
  workLogs: WorkLog[];
  blockers: Blocker[];
  openLoops: OpenLoop[];
  onGenerate: () => void;
  onSave: (summary: DailySummary) => void;
  onSubmit: (summary: DailySummary) => void;
  isGenerating: boolean;
}

export default function DailySummaryEditor({
  dailySummary,
  tasks,
  workLogs,
  blockers,
  openLoops,
  onGenerate,
  onSave,
  onSubmit,
  isGenerating,
}: DailySummaryEditorProps) {
  const [editedSummary, setEditedSummary] = useState<DailySummary | null>(dailySummary);

  // Update edited summary when dailySummary prop changes
  useEffect(() => {
    setEditedSummary(dailySummary);
  }, [dailySummary]);

  const handleFieldChange = (field: keyof DailySummary, value: string) => {
    if (editedSummary) {
      setEditedSummary({
        ...editedSummary,
        [field]: value,
      });
    }
  };

  const handleSave = () => {
    if (editedSummary) {
      onSave({
        ...editedSummary,
        status: 'saved',
      });
    }
  };

  const handleSubmit = () => {
    if (editedSummary) {
      onSubmit({
        ...editedSummary,
        status: 'submitted',
      });
    }
  };

  const getStatusBadge = () => {
    if (!editedSummary) return null;

    const statusConfig = {
      draft: { label: 'Draft', color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
      saved: { label: 'Saved', color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
      submitted: { label: 'Submitted to Lead', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
    };

    const config = statusConfig[editedSummary.status];

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // No summary yet - show generate option
  if (!editedSummary) {
    return (
      <div className="card ai-panel">
        <div className="card-header">
          <h2 className="card-title">📊 Daily Summary</h2>
          <p className="card-subtitle">Generate a draft from today's work</p>
        </div>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <span className="text-3xl">✨</span>
          </div>
          <p className="text-sm text-muted mb-4 leading-relaxed">
            AI will turn your work logs, tasks, and blockers into a clean daily summary.
            Review and edit before sharing.
          </p>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="btn btn-primary"
          >
            {isGenerating ? 'Generating...' : 'Generate Daily Summary'}
          </button>
        </div>
      </div>
    );
  }

  // Summary exists - show editor
  return (
    <div className="card ai-panel">
      <div className="card-header">
        <div className="flex items-center justify-between mb-2">
          <h2 className="card-title">📊 Daily Summary</h2>
          {getStatusBadge()}
        </div>
        <p className="card-subtitle">Review and edit before sharing</p>
      </div>

      <div className="space-y-4">
        {/* What I Worked On */}
        <div>
          <label className="block text-sm font-medium mb-1">
            What I worked on today
          </label>
          <textarea
            value={editedSummary.whatIWorkedOn}
            onChange={(e) => handleFieldChange('whatIWorkedOn', e.target.value)}
            rows={2}
            className="input w-full resize-none text-sm"
            disabled={editedSummary.status === 'submitted'}
          />
        </div>

        {/* Completed Work */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Completed work
          </label>
          <textarea
            value={editedSummary.completedWork}
            onChange={(e) => handleFieldChange('completedWork', e.target.value)}
            rows={2}
            className="input w-full resize-none text-sm"
            disabled={editedSummary.status === 'submitted'}
          />
        </div>

        {/* In-Progress Work */}
        <div>
          <label className="block text-sm font-medium mb-1">
            In-progress work
          </label>
          <textarea
            value={editedSummary.inProgressWork}
            onChange={(e) => handleFieldChange('inProgressWork', e.target.value)}
            rows={2}
            className="input w-full resize-none text-sm"
            disabled={editedSummary.status === 'submitted'}
          />
        </div>

        {/* Blockers */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Blockers
          </label>
          <textarea
            value={editedSummary.blockers}
            onChange={(e) => handleFieldChange('blockers', e.target.value)}
            rows={2}
            className="input w-full resize-none text-sm"
            disabled={editedSummary.status === 'submitted'}
          />
        </div>

        {/* Collaboration */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Collaboration/help provided
          </label>
          <textarea
            value={editedSummary.collaboration}
            onChange={(e) => handleFieldChange('collaboration', e.target.value)}
            rows={2}
            className="input w-full resize-none text-sm"
            disabled={editedSummary.status === 'submitted'}
          />
        </div>

        {/* Tomorrow Plan */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Tomorrow plan
          </label>
          <textarea
            value={editedSummary.tomorrowPlan}
            onChange={(e) => handleFieldChange('tomorrowPlan', e.target.value)}
            rows={2}
            className="input w-full resize-none text-sm"
            disabled={editedSummary.status === 'submitted'}
          />
        </div>

        {/* Lead-Friendly Summary */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Lead-friendly summary
          </label>
          <textarea
            value={editedSummary.leadFriendlySummary}
            onChange={(e) => handleFieldChange('leadFriendlySummary', e.target.value)}
            rows={3}
            className="input w-full resize-none text-sm"
            disabled={editedSummary.status === 'submitted'}
          />
        </div>

        {/* Action Buttons */}
        {editedSummary.status !== 'submitted' && (
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleSave}
              className="btn btn-outline flex-1 text-sm"
            >
              Save
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-primary flex-1 text-sm"
            >
              Submit to Lead
            </button>
          </div>
        )}

        {/* Regenerate Button */}
        {editedSummary.status !== 'submitted' && (
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="btn btn-outline w-full text-sm"
          >
            {isGenerating ? 'Regenerating...' : '✨ Regenerate from Current Work'}
          </button>
        )}

        {/* Submitted State */}
        {editedSummary.status === 'submitted' && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">✅</div>
            <p className="text-sm font-medium text-green-600">
              Submitted to lead
            </p>
            <p className="text-xs text-muted mt-1">
              Your daily summary has been shared
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob