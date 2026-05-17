'use client';

import { useState } from 'react';
import type { Task, FocusSession } from '@/types';
import { getSourceLabel, getPriorityLabel } from '@/utils/formatters';

interface FocusSessionFormProps {
  tasks: Task[];
  onStartSession: (session: FocusSession, task: Task) => void;
}

export default function FocusSessionForm({ tasks, onStartSession }: FocusSessionFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [duration, setDuration] = useState(25);
  const [goal, setGoal] = useState('');

  // Filter out completed tasks
  const availableTasks = tasks.filter(t => t.status !== 'done');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTaskId || !goal.trim()) {
      return;
    }

    const selectedTask = tasks.find(t => t.id === selectedTaskId);
    if (!selectedTask) return;

    const newSession: FocusSession = {
      id: `session-${Date.now()}`,
      taskId: selectedTaskId,
      durationMinutes: duration,
      goal: goal.trim(),
      status: 'active',
      startedAt: new Date().toISOString(),
    };

    onStartSession(newSession, selectedTask);
    
    // Reset form
    setSelectedTaskId('');
    setDuration(25);
    setGoal('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn btn-primary w-full"
        disabled={availableTasks.length === 0}
      >
        🎯 Start Focus Session
      </button>
    );
  }

  return (
    <div className="card bg-gradient-to-br from-blue-500/10 to-violet-500/10 border-blue-500/20">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="focus-task" className="block text-sm font-medium text-foreground mb-2">
            Select Task *
          </label>
          <select
            id="focus-task"
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            <option value="">Choose a task...</option>
            {availableTasks.map((task) => (
              <option key={task.id} value={task.id}>
                [{getSourceLabel(task.source)}] {task.title} - {getPriorityLabel(task.priority)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="focus-duration" className="block text-sm font-medium text-foreground mb-2">
            Duration
          </label>
          <select
            id="focus-duration"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value={25}>25 minutes (Pomodoro)</option>
            <option value={45}>45 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
          </select>
        </div>

        <div>
          <label htmlFor="focus-goal" className="block text-sm font-medium text-foreground mb-2">
            Focus Goal *
          </label>
          <textarea
            id="focus-goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What do you want to accomplish in this session?"
            rows={3}
            className="w-full px-3 py-2 bg-background border border-card-border rounded-lg text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            required
          />
        </div>

        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary flex-1">
            Start Session
          </button>
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setSelectedTaskId('');
              setDuration(25);
              setGoal('');
            }}
            className="btn btn-outline flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// Made with Bob
