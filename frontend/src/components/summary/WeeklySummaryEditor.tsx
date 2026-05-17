'use client';

import { useState, useEffect } from 'react';
import type { WeeklySummary, DailySummary, Task, WorkLog } from '@/types';

interface WeeklySummaryEditorProps {
  weeklySummary: WeeklySummary | null;
  dailySummary: DailySummary | null;
  tasks: Task[];
  workLogs: WorkLog[];
  onGenerate: () => void;
  onSave: (summary: WeeklySummary) => void;
  isGenerating: boolean;
}

export default function WeeklySummaryEditor({
  weeklySummary,
  dailySummary,
  tasks,
  workLogs,
  onGenerate,
  onSave,
  isGenerating,
}: WeeklySummaryEditorProps) {
  const [editedSummary, setEditedSummary] = useState<WeeklySummary | null>(weeklySummary);

  // Update edited summary when weeklySummary prop changes
  useEffect(() => {
    setEditedSummary(weeklySummary);
  }, [weeklySummary]);

  const handleFieldChange = (field: keyof WeeklySummary, value: string) => {
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

  const handleMarkReady = () => {
    if (editedSummary) {
      onSave({
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
      submitted: { label: 'Ready to Share', color: 'bg-green-500/10 text-green-600 border-green-500/20' },
    };

    const config = statusConfig[editedSummary.status];

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatWeekRange = () => {
    if (!editedSummary) return '';
    const start = new Date(editedSummary.weekStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(editedSummary.weekEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  // No summary yet - show generate option
  if (!editedSummary) {
    return (
      <div className="card ai-panel">
        <div className="card-header">
          <h2 className="card-title">📈 Weekly Summary</h2>
          <p className="card-subtitle">Generate outcome-focused weekly summary</p>
        </div>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/10 mb-4">
            <span className="text-3xl">📊</span>
          </div>
          <p className="text-sm text-muted mb-4 leading-relaxed">
            AI will create a high-level summary of your week's outcomes and progress.
            Review and edit before sharing.
          </p>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="btn btn-secondary"
          >
            {isGenerating ? 'Generating...' : 'Generate Weekly Summary'}
          </button>
        </div>
      </div>
    );
  }

  // Summary exists - show editor
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="card-title">📈 Weekly Summary</h2>
            <p className="text-xs text-muted">{formatWeekRange()}</p>
          </div>
          {getStatusBadge()}
        </div>
        <p className="card-subtitle">Outcome-focused weekly overview</p>
      </div>

      <div className="space-y-4">
        {/* Main Outcomes */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Main outcomes
          </label>
          <textarea
            value={editedSummary.mainOutcomes}
            onChange={(e) => handleFieldChange('mainOutcomes', e.target.value)}
            rows={3}
            placeholder="What were the key deliverables and outcomes this week?"
            className="input w-full resize-none text-sm"
            disabled={editedSummary.status === 'submitted'}
          />
        </div>

        {/* Progress Made */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Progress made
          </label>
          <textarea
            value={editedSummary.progressMade}
            onChange={(e) => handleFieldChange('progressMade', e.target.value)}
            rows={3}
            placeholder="What initiatives moved forward? What technical work was completed?"
            className="input w-full resize-none text-sm"
            disabled={editedSummary.status === 'submitted'}
          />
        </div>

        {/* Collaboration */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Collaboration
          </label>
          <textarea
            value={editedSummary.collaboration}
            onChange={(e) => handleFieldChange('collaboration', e.target.value)}
            rows={2}
            placeholder="How did you support the team? What discussions or reviews did you participate in?"
            className="input w-full resize-none text-sm"
            disabled={editedSummary.status === 'submitted'}
          />
        </div>

        {/* Blockers and Risks */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Blockers and risks
          </label>
          <textarea
            value={editedSummary.blockersAndRisks}
            onChange={(e) => handleFieldChange('blockersAndRisks', e.target.value)}
            rows={2}
            placeholder="What's blocking progress? Any risks to be aware of?"
            className="input w-full resize-none text-sm"
            disabled={editedSummary.status === 'submitted'}
          />
        </div>

        {/* Next Week Focus */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Next week focus
          </label>
          <textarea
            value={editedSummary.nextWeekFocus}
            onChange={(e) => handleFieldChange('nextWeekFocus', e.target.value)}
            rows={2}
            placeholder="What are the priorities for next week?"
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
              Save Weekly Summary
            </button>
            <button
              onClick={handleMarkReady}
              className="btn btn-secondary flex-1 text-sm"
            >
              Mark Ready to Share
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

        {/* Ready State */}
        {editedSummary.status === 'submitted' && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">✅</div>
            <p className="text-sm font-medium text-green-600">
              Ready to share
            </p>
            <p className="text-xs text-muted mt-1">
              Your weekly summary is ready for distribution
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob