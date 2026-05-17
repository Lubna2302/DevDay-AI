'use client';

import { useState } from 'react';
import type { WorkLogType, Task } from '@/types';
import { getWorkLogTypeLabel } from '@/utils/formatters';

interface WorkLogComposerProps {
  tasks: Task[];
  onAddLog: (log: {
    type: WorkLogType;
    relatedTaskId?: string;
    description: string;
  }) => void;
}

const WORK_LOG_TYPES: WorkLogType[] = [
  'task_update',
  'debugging',
  'pr_review',
  'meeting',
  'helped_teammate',
  'research',
  'documentation',
  'production_support',
  'blocker',
];

export default function WorkLogComposer({ tasks, onAddLog }: WorkLogComposerProps) {
  const [type, setType] = useState<WorkLogType>('task_update');
  const [relatedTaskId, setRelatedTaskId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<{ type?: string; description?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: { type?: string; description?: string } = {};
    
    if (!type) {
      newErrors.type = 'Type is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Submit the log
    onAddLog({
      type,
      relatedTaskId: relatedTaskId || undefined,
      description: description.trim(),
    });
    
    // Clear form
    setDescription('');
    setRelatedTaskId('');
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type Dropdown */}
        <div>
          <label htmlFor="worklog-type" className="block text-sm font-medium mb-1">
            Type <span className="text-danger">*</span>
          </label>
          <select
            id="worklog-type"
            value={type}
            onChange={(e) => {
              setType(e.target.value as WorkLogType);
              setErrors({ ...errors, type: undefined });
            }}
            className={`input w-full ${errors.type ? 'border-danger' : ''}`}
          >
            {WORK_LOG_TYPES.map((logType) => (
              <option key={logType} value={logType}>
                {getWorkLogTypeLabel(logType)}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="text-xs text-danger mt-1">{errors.type}</p>
          )}
        </div>

        {/* Related Task Dropdown */}
        <div>
          <label htmlFor="related-task" className="block text-sm font-medium mb-1">
            Related Task
          </label>
          <select
            id="related-task"
            value={relatedTaskId}
            onChange={(e) => setRelatedTaskId(e.target.value)}
            className="input w-full"
          >
            <option value="">No related task</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description Textarea */}
      <div>
        <label htmlFor="worklog-description" className="block text-sm font-medium mb-1">
          Description <span className="text-danger">*</span>
        </label>
        <textarea
          id="worklog-description"
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            setErrors({ ...errors, description: undefined });
          }}
          placeholder="What are you working on? What progress did you make?"
          rows={3}
          className={`input w-full resize-none ${errors.description ? 'border-danger' : ''}`}
        />
        {errors.description && (
          <p className="text-xs text-danger mt-1">{errors.description}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary">
          Add Log
        </button>
      </div>
    </form>
  );
}

// Made with Bob