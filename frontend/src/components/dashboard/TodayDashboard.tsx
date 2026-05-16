'use client';

import { useState, useEffect } from 'react';
import TodayHeader from './TodayHeader';
import TaskList from '@/components/tasks/TaskList';
import ManualTaskForm from '@/components/tasks/ManualTaskForm';
import ActiveFocusCard from '@/components/focus/ActiveFocusCard';
import FocusSessionForm from '@/components/focus/FocusSessionForm';
import SwitchGuardModal from '@/components/focus/SwitchGuardModal';
import type { TodayData, Task, FocusSession, OpenLoop } from '@/types';
import { getTodayData } from '@/services/api';

export default function TodayDashboard() {
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);
  const [focusSession, setFocusSession] = useState<FocusSession | null>(null);
  const [openLoops, setOpenLoops] = useState<OpenLoop[]>([]);
  const [showSwitchGuard, setShowSwitchGuard] = useState(false);
  const [pendingTask, setPendingTask] = useState<Task | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getTodayData();
        setTodayData(data);
        setOpenLoops(data.openLoops || []);
      } catch (error) {
        console.error('Failed to load today data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddTask = (newTask: Task) => {
    if (todayData) {
      setTodayData({
        ...todayData,
        tasks: [...todayData.tasks, newTask],
      });
    }
  };

  const handleSetFocus = (task: Task) => {
    // Check if there's already an active focus task
    if (activeFocusTask && activeFocusTask.id !== task.id) {
      // Show switch guard modal
      setPendingTask(task);
      setShowSwitchGuard(true);
      return;
    }

    // No active focus, proceed normally
    console.log('Set focus on task:', task);
    setActiveFocusTask(task);
    // Update task status to in_progress
    if (todayData) {
      setTodayData({
        ...todayData,
        tasks: todayData.tasks.map((t) =>
          t.id === task.id ? { ...t, status: 'in_progress' } : t
        ),
      });
    }
  };

  const handleStartSession = (session: FocusSession, task: Task) => {
    setFocusSession(session);
    setActiveFocusTask(task);
    // Update task status to in_progress
    if (todayData) {
      setTodayData({
        ...todayData,
        tasks: todayData.tasks.map((t) =>
          t.id === task.id ? { ...t, status: 'in_progress' } : t
        ),
      });
    }
  };

  const handleCompleteFocus = () => {
    if (activeFocusTask && todayData) {
      setTodayData({
        ...todayData,
        tasks: todayData.tasks.map((t) =>
          t.id === activeFocusTask.id ? { ...t, status: 'done' } : t
        ),
      });
      setActiveFocusTask(null);
      setFocusSession(null);
    }
  };

  const handlePauseFocus = () => {
    console.log('Pause focus session');
    // TODO: Implement pause logic with open loop creation
    if (focusSession) {
      setFocusSession({ ...focusSession, status: 'paused' });
    }
  };

  const handleBlockedFocus = () => {
    if (activeFocusTask && todayData) {
      setTodayData({
        ...todayData,
        tasks: todayData.tasks.map((t) =>
          t.id === activeFocusTask.id ? { ...t, status: 'blocked' } : t
        ),
      });
      if (focusSession) {
        setFocusSession({ ...focusSession, status: 'blocked' });
      }
    }
  };

  const handleExtendFocus = () => {
    if (focusSession) {
      setFocusSession({
        ...focusSession,
        durationMinutes: focusSession.durationMinutes + 15,
      });
    }
  };

  const handleMarkDone = (taskId: string) => {
    if (todayData) {
      setTodayData({
        ...todayData,
        tasks: todayData.tasks.map((task) =>
          task.id === taskId ? { ...task, status: 'done' } : task
        ),
      });
    }
  };

  // Switch Guard Modal Handlers
  const handleSwitchComplete = () => {
    if (!activeFocusTask || !pendingTask || !todayData) return;

    // Mark current task as done
    setTodayData({
      ...todayData,
      tasks: todayData.tasks.map((t) =>
        t.id === activeFocusTask.id
          ? { ...t, status: 'done' }
          : t.id === pendingTask.id
          ? { ...t, status: 'in_progress' }
          : t
      ),
    });

    // Switch to new task
    setActiveFocusTask(pendingTask);
    setFocusSession(null);
    setShowSwitchGuard(false);
    setPendingTask(null);
  };

  const handleSwitchPauseWithNote = (openLoop: OpenLoop) => {
    if (!activeFocusTask || !pendingTask || !todayData) return;

    // Add open loop
    setOpenLoops([...openLoops, openLoop]);

    // Mark current task as paused
    setTodayData({
      ...todayData,
      tasks: todayData.tasks.map((t) =>
        t.id === activeFocusTask.id
          ? { ...t, status: 'paused' }
          : t.id === pendingTask.id
          ? { ...t, status: 'in_progress' }
          : t
      ),
    });

    // Switch to new task
    setActiveFocusTask(pendingTask);
    if (focusSession) {
      setFocusSession({ ...focusSession, status: 'paused' });
    }
    setShowSwitchGuard(false);
    setPendingTask(null);
  };

  const handleSwitchBlocked = () => {
    if (!activeFocusTask || !pendingTask || !todayData) return;

    // Create open loop for blocked task
    const blockedLoop: OpenLoop = {
      id: `loop-${Date.now()}`,
      taskId: activeFocusTask.id,
      taskTitle: activeFocusTask.title,
      status: 'blocked',
      currentState: 'Task is blocked',
      nextAction: 'Resolve blocker before continuing',
      createdAt: new Date().toISOString(),
    };
    setOpenLoops([...openLoops, blockedLoop]);

    // Mark current task as blocked
    setTodayData({
      ...todayData,
      tasks: todayData.tasks.map((t) =>
        t.id === activeFocusTask.id
          ? { ...t, status: 'blocked' }
          : t.id === pendingTask.id
          ? { ...t, status: 'in_progress' }
          : t
      ),
    });

    // Switch to new task
    setActiveFocusTask(pendingTask);
    if (focusSession) {
      setFocusSession({ ...focusSession, status: 'blocked' });
    }
    setShowSwitchGuard(false);
    setPendingTask(null);
  };

  const handleSwitchAnyway = () => {
    if (!pendingTask || !todayData) return;

    // Just switch without creating open loop
    setTodayData({
      ...todayData,
      tasks: todayData.tasks.map((t) =>
        t.id === pendingTask.id ? { ...t, status: 'in_progress' } : t
      ),
    });

    setActiveFocusTask(pendingTask);
    setShowSwitchGuard(false);
    setPendingTask(null);
  };

  const handleSwitchCancel = () => {
    setShowSwitchGuard(false);
    setPendingTask(null);
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-muted">Loading your workday...</p>
            </div>
          </div>
  
          {/* Switch Guard Modal */}
          {activeFocusTask && pendingTask && (
            <SwitchGuardModal
              isOpen={showSwitchGuard}
              currentTask={activeFocusTask}
              newTask={pendingTask}
              currentSession={focusSession}
              onComplete={handleSwitchComplete}
              onPauseWithNote={handleSwitchPauseWithNote}
              onMarkBlocked={handleSwitchBlocked}
              onSwitchAnyway={handleSwitchAnyway}
              onCancel={handleSwitchCancel}
            />
          )}
        </div>
      </div>
    );
  }

  const stats = {
    todaysWork: todayData?.tasks.length || 0,
    activeFocus: focusSession ? 1 : 0,
    openLoops: openLoops.length,
    blockers: todayData?.blockers.filter(b => b.status === 'active').length || 0,
  };

  return (
    <div className="dashboard-container">
      <div className="max-w-7xl mx-auto">
        <TodayHeader />

        {/* Hero Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="stat-label">Today's Work</div>
            <div className="stat-value">{stats.todaysWork}</div>
            <div className="text-xs text-muted">Tasks & meetings</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Active Focus</div>
            <div className="stat-value text-violet-400">{stats.activeFocus}</div>
            <div className="text-xs text-muted">Focus session</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Open Loops</div>
            <div className="stat-value text-amber-400">{stats.openLoops}</div>
            <div className="text-xs text-muted">Unfinished work</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Blockers</div>
            <div className="stat-value text-rose-400">{stats.blockers}</div>
            <div className="text-xs text-muted">Active blockers</div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Work Section */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Today's Work</h2>
                <p className="card-subtitle">
                  Tasks from Jira, GitHub, Calendar, Teams, and manual entries
                </p>
              </div>
              <div className="mb-4">
                <ManualTaskForm onAddTask={handleAddTask} />
              </div>
              <TaskList
                tasks={todayData?.tasks || []}
                onSetFocus={handleSetFocus}
                onMarkDone={handleMarkDone}
              />
            </div>

            {/* Active Focus Section */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Active Focus</h2>
                <p className="card-subtitle">
                  Current focus session with Pomodoro timer
                </p>
              </div>
              {!activeFocusTask && (
                <div className="mb-4">
                  <FocusSessionForm
                    tasks={todayData?.tasks || []}
                    onStartSession={handleStartSession}
                  />
                </div>
              )}
              <ActiveFocusCard
                task={activeFocusTask}
                session={focusSession}
                onComplete={handleCompleteFocus}
                onPause={handlePauseFocus}
                onBlocked={handleBlockedFocus}
                onExtend={handleExtendFocus}
              />
            </div>

            {/* Work Log Section */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Work Log</h2>
                <p className="card-subtitle">
                  Manual notes about what you're working on
                </p>
              </div>
              <div className="section-placeholder">
                <div className="section-placeholder-icon">📝</div>
                <p className="section-placeholder-text">
                  Add work log entries to track your progress
                </p>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* AI Assistant Panel */}
            <div className="card bg-gradient-to-br from-blue-500/10 to-violet-500/10 border-blue-500/20">
              <div className="card-header">
                <h2 className="card-title">✨ AI Assistant</h2>
                <p className="card-subtitle">
                  Generate summaries from your work
                </p>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-muted leading-relaxed">
                  AI will turn your work logs, focus sessions, blockers, and open loops 
                  into a clean daily summary.
                </p>
                <div className="flex flex-col gap-2">
                  <button 
                    className="btn btn-primary w-full"
                    onClick={() => console.log('Generate Daily Summary')}
                  >
                    Generate Daily Summary
                  </button>
                  <button 
                    className="btn btn-secondary w-full"
                    onClick={() => console.log('Generate Weekly Summary')}
                  >
                    Generate Weekly Summary
                  </button>
                </div>
              </div>
            </div>

            {/* Blockers Section */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">🚧 Blockers</h2>
                <p className="card-subtitle">
                  Track what's blocking your progress
                </p>
              </div>
              <div className="section-placeholder">
                <div className="section-placeholder-icon">🚧</div>
                <p className="section-placeholder-text">
                  No active blockers
                </p>
              </div>
            </div>

            {/* Open Loops Section */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">🔄 Open Loops</h2>
                <p className="card-subtitle">
                  Paused tasks and next actions
                </p>
              </div>
              <div className="section-placeholder">
                <div className="section-placeholder-icon">🔄</div>
                <p className="section-placeholder-text">
                  No open loops
                </p>
              </div>
            </div>

            {/* Summary Actions Section */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">📊 Summaries</h2>
                <p className="card-subtitle">
                  View and edit your summaries
                </p>
              </div>
              <div className="space-y-2">
                <button className="btn btn-outline w-full text-sm">
                  View Daily Summary
                </button>
                <button className="btn btn-outline w-full text-sm">
                  View Weekly Summary
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
