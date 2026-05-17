'use client';

import { useState, useEffect, useCallback } from 'react';
import TodayHeader from './TodayHeader';
import TaskList from '@/components/tasks/TaskList';
import ManualTaskForm from '@/components/tasks/ManualTaskForm';
import ActiveFocusCard from '@/components/focus/ActiveFocusCard';
import FocusSessionForm from '@/components/focus/FocusSessionForm';
import SwitchGuardModal from '@/components/focus/SwitchGuardModal';
import OpenLoopsPanel from '@/components/openloops/OpenLoopsPanel';
import WorkLogComposer from '@/components/worklog/WorkLogComposer';
import WorkLogFeed from '@/components/worklog/WorkLogFeed';
import BlockerPanel from '@/components/blockers/BlockerPanel';
import DailySummaryEditor from '@/components/summary/DailySummaryEditor';
import WeeklySummaryEditor from '@/components/summary/WeeklySummaryEditor';
import FinalDraftPanel from '@/components/summary/FinalDraftPanel';
import type { TodayData, Task, FocusSession, OpenLoop, WorkLog, Blocker, DailySummary, WeeklySummary } from '@/types';
import {
  getTodayData,
  getFreshMockTodayData,
  addWorkLog,
  addBlocker,
  resolveBlocker,
  generateDailySummary,
  generateWeeklySummary,
  createTask,
  updateTaskStatus,
  startFocusSession,
  completeFocusSession,
  pauseFocusSession,
} from '@/services/api';

export default function TodayDashboard() {
  const [todayData, setTodayData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);
  const [focusSession, setFocusSession] = useState<FocusSession | null>(null);
  const [openLoops, setOpenLoops] = useState<OpenLoop[]>([]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [blockers, setBlockers] = useState<Blocker[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [isGeneratingWeeklySummary, setIsGeneratingWeeklySummary] = useState(false);
  const [showSwitchGuard, setShowSwitchGuard] = useState(false);
  const [pendingTask, setPendingTask] = useState<Task | null>(null);

  const isBackendId = (id?: string) => Boolean(id && /^\d+$/.test(id));
  const isMockTodayData = () => todayData?.tasks.some((task) => !isBackendId(task.id)) ?? false;

  const updateTaskStatusLocally = useCallback((taskId: string, status: Task['status']) => {
    setTodayData((current) =>
      current
        ? {
            ...current,
            tasks: current.tasks.map((task) =>
              task.id === taskId ? { ...task, status } : task
            ),
          }
        : current
    );
    setActiveFocusTask((current) =>
      current?.id === taskId ? { ...current, status } : current
    );
  }, []);

  const addWorkLogLocally = useCallback((logInput: {
    type: WorkLog['type'];
    relatedTaskId?: string;
    description: string;
  }) => {
    const newLog: WorkLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      type: logInput.type,
      relatedTaskId: logInput.relatedTaskId,
      description: logInput.description,
      createdAt: new Date().toISOString(),
    };
    setWorkLogs((current) => [newLog, ...current]);
  }, []);

  const addBlockerLocally = useCallback((blockerInput: {
    relatedTaskId?: string;
    description: string;
  }) => {
    const newBlocker: Blocker = {
      id: `blocker-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      relatedTaskId: blockerInput.relatedTaskId,
      description: blockerInput.description,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setBlockers((current) => [newBlocker, ...current]);

    if (blockerInput.relatedTaskId) {
      updateTaskStatusLocally(blockerInput.relatedTaskId, 'blocked');
    }
  }, [updateTaskStatusLocally]);

  const applyTodayData = useCallback((data: TodayData) => {
    setTodayData(data);
    setOpenLoops(data.openLoops || []);
    setWorkLogs(data.workLogs || []);
    setBlockers(data.blockers || []);
    setDailySummary(data.dailySummary || null);
    setWeeklySummary(data.weeklySummary || null);
    if (data.focusSession) {
      const task = data.tasks.find((t) => t.id === data.focusSession!.taskId);
      setFocusSession(data.focusSession);
      setActiveFocusTask(task ?? null);
    } else {
      setFocusSession(null);
      setActiveFocusTask(null);
    }
  }, []);

  const refreshToday = useCallback(async () => {
    const data = await getTodayData();
    applyTodayData(data);
  }, [applyTodayData]);

  const refreshTodayWithMockData = useCallback(async () => {
    const data = await getFreshMockTodayData();
    applyTodayData(data);
  }, [applyTodayData]);

  useEffect(() => {
    async function loadData() {
      try {
        await refreshToday();
      } catch (error) {
        console.error('Failed to load today data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [refreshToday]);

  const handleAddTask = async (newTask: Task) => {
    try {
      await createTask({
        title: newTask.title,
        description: newTask.description,
        priority: newTask.priority,
        source: 'manual',
      });
      await refreshToday();
    } catch (error) {
      console.error('Failed to add task:', error);
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

  const handleStartSession = async (session: FocusSession, task: Task) => {
    if (!isBackendId(task.id)) {
      const localSession: FocusSession = {
        ...session,
        id: `focus-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        taskId: task.id,
        status: 'active',
        startedAt: new Date().toISOString(),
      };
      setFocusSession(localSession);
      setActiveFocusTask({ ...task, status: 'in_progress' });
      updateTaskStatusLocally(task.id, 'in_progress');
      return;
    }

    try {
      await startFocusSession({
        taskId: task.id,
        durationMinutes: session.durationMinutes,
        goal: session.goal,
      });
      await refreshToday();
    } catch (error) {
      console.error('Failed to start focus session:', error);
    }
  };

  const handleCompleteFocus = async () => {
    if (!focusSession) return;

    if (!isBackendId(focusSession.id)) {
      if (activeFocusTask) {
        updateTaskStatusLocally(activeFocusTask.id, 'done');
      }
      setFocusSession(null);
      setActiveFocusTask(null);
      return;
    }

    try {
      await completeFocusSession(focusSession.id);
      await refreshToday();
    } catch (error) {
      console.error('Failed to complete focus session:', error);
    }
  };

  const handlePauseFocus = async () => {
    if (!focusSession || !activeFocusTask) return;

    if (!isBackendId(focusSession.id)) {
      const openLoop: OpenLoop = {
        id: `loop-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        taskId: activeFocusTask.id,
        taskTitle: activeFocusTask.title,
        status: 'paused',
        currentState: `Paused while working on ${activeFocusTask.title}`,
        nextAction: 'Resume from the open loops panel.',
        createdAt: new Date().toISOString(),
      };
      setOpenLoops((current) => [openLoop, ...current]);
      updateTaskStatusLocally(activeFocusTask.id, 'paused');
      setFocusSession({ ...focusSession, status: 'paused' });
      setActiveFocusTask(null);
      return;
    }

    try {
      await pauseFocusSession({
        focusSessionId: focusSession.id,
        context: `Paused while working on ${activeFocusTask.title}`,
        reason: 'Check open loops panel to resume',
      });
      await refreshToday();
    } catch (error) {
      console.error('Failed to pause focus session:', error);
    }
  };

  const handleBlockedFocus = async () => {
    if (!activeFocusTask) return;

    if (!isBackendId(activeFocusTask.id)) {
      updateTaskStatusLocally(activeFocusTask.id, 'blocked');
      if (focusSession) {
        setFocusSession({ ...focusSession, status: 'blocked' });
      }
      return;
    }

    try {
      await updateTaskStatus(activeFocusTask.id, 'blocked');
      if (focusSession) {
        await pauseFocusSession({
          focusSessionId: focusSession.id,
          context: 'Marked as blocked from focus panel',
          reason: 'Resolve blocker before continuing',
        });
      }
      await refreshToday();
    } catch (error) {
      console.error('Failed to mark blocked:', error);
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

  const handleMarkDone = async (taskId: string) => {
    if (!isBackendId(taskId)) {
      updateTaskStatusLocally(taskId, 'done');
      return;
    }

    try {
      await updateTaskStatus(taskId, 'done');
      await refreshToday();
    } catch (error) {
      console.error('Failed to mark task done:', error);
    }
  };

  const handleToggleComplete = async (taskId: string, currentStatus: string) => {
    const newStatus: Task['status'] = currentStatus === 'done' ? 'todo' : 'done';

    if (!isBackendId(taskId)) {
      updateTaskStatusLocally(taskId, newStatus);
      return;
    }

    try {
      await updateTaskStatus(taskId, newStatus);
      await refreshToday();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  // Switch Guard Modal Handlers
  const handleSwitchComplete = async () => {
    if (!activeFocusTask || !pendingTask || !focusSession) return;
    try {
      await completeFocusSession(focusSession.id);
      await updateTaskStatus(activeFocusTask.id, 'done');
      await updateTaskStatus(pendingTask.id, 'in_progress');
      setShowSwitchGuard(false);
      setPendingTask(null);
      await refreshToday();
      setActiveFocusTask(pendingTask);
    } catch (error) {
      console.error('Failed switch complete:', error);
    }
  };

  const handleSwitchPauseWithNote = async (openLoop: OpenLoop) => {
    if (!activeFocusTask || !pendingTask || !focusSession) return;
    try {
      await pauseFocusSession({
        focusSessionId: focusSession.id,
        context: openLoop.currentState,
        reason: openLoop.nextAction,
        toTaskId: pendingTask.id,
      });
      await updateTaskStatus(activeFocusTask.id, 'paused');
      await updateTaskStatus(pendingTask.id, 'in_progress');
      setShowSwitchGuard(false);
      setPendingTask(null);
      await refreshToday();
    } catch (error) {
      console.error('Failed switch pause:', error);
    }
  };

  const handleSwitchBlocked = async () => {
    if (!activeFocusTask || !pendingTask || !focusSession) return;
    try {
      await pauseFocusSession({
        focusSessionId: focusSession.id,
        context: 'Task is blocked',
        reason: 'Resolve blocker before continuing',
        toTaskId: pendingTask.id,
      });
      await updateTaskStatus(activeFocusTask.id, 'blocked');
      await updateTaskStatus(pendingTask.id, 'in_progress');
      setShowSwitchGuard(false);
      setPendingTask(null);
      await refreshToday();
    } catch (error) {
      console.error('Failed switch blocked:', error);
    }
  };

  const handleSwitchAnyway = async () => {
    if (!pendingTask || !focusSession) return;
    try {
      await completeFocusSession(focusSession.id);
      await updateTaskStatus(pendingTask.id, 'in_progress');
      setShowSwitchGuard(false);
      setPendingTask(null);
      await refreshToday();
      setActiveFocusTask(pendingTask);
    } catch (error) {
      console.error('Failed switch anyway:', error);
    }
  };

  const handleSwitchCancel = () => {
    setShowSwitchGuard(false);
    setPendingTask(null);
  };

  // Open Loops Handlers
  const handleResumeOpenLoop = (openLoop: OpenLoop) => {
    if (!todayData) return;

    // Find the task associated with this open loop
    const task = todayData.tasks.find((t) => t.id === openLoop.taskId);
    if (!task) return;

    // Check if there's already an active focus task
    if (activeFocusTask && activeFocusTask.id !== task.id) {
      // Show switch guard modal
      setPendingTask(task);
      setShowSwitchGuard(true);
      // Remove the open loop after switch guard completes
      // (The switch guard handlers will handle the task switching)
      setOpenLoops(openLoops.filter((loop) => loop.id !== openLoop.id));
      return;
    }

    // No active focus, proceed normally
    setActiveFocusTask(task);
    setTodayData({
      ...todayData,
      tasks: todayData.tasks.map((t) =>
        t.id === task.id ? { ...t, status: 'in_progress' } : t
      ),
    });
    // Remove the open loop
    setOpenLoops(openLoops.filter((loop) => loop.id !== openLoop.id));
  };

  const handleCompleteOpenLoop = (openLoop: OpenLoop) => {
    if (!todayData) return;

    // Mark task as done
    setTodayData({
      ...todayData,
      tasks: todayData.tasks.map((t) =>
        t.id === openLoop.taskId ? { ...t, status: 'done' } : t
      ),
    });

    // Remove the open loop
    setOpenLoops(openLoops.filter((loop) => loop.id !== openLoop.id));
  };

  const handleDismissOpenLoop = (openLoop: OpenLoop) => {
    // Just remove the open loop without changing task status
    setOpenLoops(openLoops.filter((loop) => loop.id !== openLoop.id));
  };

  // Work Log Handler
  const handleAddWorkLog = async (logInput: {
    type: WorkLog['type'];
    relatedTaskId?: string;
    description: string;
  }) => {
    if (isMockTodayData() || Boolean(logInput.relatedTaskId && !isBackendId(logInput.relatedTaskId))) {
      addWorkLogLocally(logInput);
      return;
    }

    try {
      await addWorkLog(logInput);
      await refreshToday();
    } catch (error) {
      console.error('Failed to add work log:', error);
    }
  };

  // Blocker Handlers
  const handleAddBlocker = async (blockerInput: {
    relatedTaskId?: string;
    description: string;
  }) => {
    if (isMockTodayData() || Boolean(blockerInput.relatedTaskId && !isBackendId(blockerInput.relatedTaskId))) {
      addBlockerLocally(blockerInput);
      return;
    }

    try {
      await addBlocker(blockerInput);
      await refreshToday();
    } catch (error) {
      console.error('Failed to add blocker:', error);
    }
  };

  const handleResolveBlocker = async (blockerId: string) => {
    if (!isBackendId(blockerId)) {
      setBlockers((current) =>
        current.map((blocker) =>
          blocker.id === blockerId
            ? { ...blocker, status: 'resolved', resolvedAt: new Date().toISOString() }
            : blocker
        )
      );
      return;
    }

    try {
      await resolveBlocker(blockerId);
      await refreshToday();
    } catch (error) {
      console.error('Failed to resolve blocker:', error);
    }
  };

  // Daily Summary Handlers
  const handleGenerateDailySummary = async () => {
    if (!todayData) return;

    setIsGeneratingSummary(true);
    try {
      const generatedSummary = await generateDailySummary({
        tasks: todayData.tasks,
        workLogs,
        blockers,
        openLoops,
      });
      setDailySummary(generatedSummary);
    } catch (error) {
      console.error('Failed to generate daily summary:', error);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSaveDailySummary = (summary: DailySummary) => {
    setDailySummary(summary);
  };

  const handleSubmitDailySummary = (summary: DailySummary) => {
    setDailySummary(summary);
  };

  // Weekly Summary Handlers
  const handleGenerateWeeklySummary = async () => {
    if (!todayData) return;

    setIsGeneratingWeeklySummary(true);
    try {
      const generatedSummary = await generateWeeklySummary({
        dailySummaries: dailySummary ? [dailySummary] : undefined,
        tasks: todayData.tasks,
        workLogs,
      });
      setWeeklySummary(generatedSummary);
    } catch (error) {
      console.error('Failed to generate weekly summary:', error);
    } finally {
      setIsGeneratingWeeklySummary(false);
    }
  };

  const handleSaveWeeklySummary = (summary: WeeklySummary) => {
    setWeeklySummary(summary);
  };

  // Final Draft Handlers
  const handleCopyDailyDraft = () => {
    console.log('Daily draft copied to clipboard');
  };

  const handleCopyWeeklyDraft = () => {
    console.log('Weekly draft copied to clipboard');
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
    activeFocus: activeFocusTask ? 1 : 0,
    openLoops: openLoops.length,
    blockers: blockers.filter(b => b.status === 'active').length,
  };

  return (
    <div className="dashboard-container">
      <div className="max-w-7xl mx-auto">
        <TodayHeader />

        {/* Hero Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <div className="stat-label">Today&apos;s Work</div>
            <div className="stat-value">{stats.todaysWork}</div>
            <div className="text-xs text-muted">Tasks & meetings</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Active Focus</div>
            <div className="stat-value" style={{ color: 'var(--muted-accent)' }}>{stats.activeFocus}</div>
            <div className="text-xs text-muted">Focus session</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Open Loops</div>
            <div className="stat-value text-warning">{stats.openLoops}</div>
            <div className="text-xs text-muted">Unfinished work</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Blockers</div>
            <div className="stat-value text-danger">{stats.blockers}</div>
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
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="card-title">Today&apos;s Work</h2>
                    <p className="card-subtitle">
                      Tasks from Jira, GitHub, Calendar, Teams, and manual entries
                    </p>
                  </div>
                  <button
                    onClick={refreshTodayWithMockData}
                    className="px-3 py-1.5 text-sm font-medium text-foreground-muted hover:text-foreground bg-card-hover rounded-lg transition-colors flex items-center gap-2"
                    title="Refresh tasks"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>
              <div className="mb-4">
                <ManualTaskForm onAddTask={handleAddTask} />
              </div>
              <TaskList
                tasks={todayData?.tasks || []}
                onSetFocus={handleSetFocus}
                onMarkDone={handleMarkDone}
                onToggleComplete={handleToggleComplete}
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
                  Manual notes about what you&apos;re working on
                </p>
              </div>
              <div className="mb-4">
                <WorkLogComposer
                  tasks={todayData?.tasks || []}
                  onAddLog={handleAddWorkLog}
                />
              </div>
              <WorkLogFeed
                workLogs={workLogs}
                tasks={todayData?.tasks || []}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Daily Summary Section */}
            <DailySummaryEditor
              dailySummary={dailySummary}
              tasks={todayData?.tasks || []}
              workLogs={workLogs}
              blockers={blockers}
              openLoops={openLoops}
              onGenerate={handleGenerateDailySummary}
              onSave={handleSaveDailySummary}
              onSubmit={handleSubmitDailySummary}
              isGenerating={isGeneratingSummary}
            />

            {/* Weekly Summary Section */}
            <WeeklySummaryEditor
              weeklySummary={weeklySummary}
              dailySummary={dailySummary}
              tasks={todayData?.tasks || []}
              workLogs={workLogs}
              onGenerate={handleGenerateWeeklySummary}
              onSave={handleSaveWeeklySummary}
              isGenerating={isGeneratingWeeklySummary}
            />

            {/* Final Draft Section */}
            <FinalDraftPanel
              dailySummary={dailySummary}
              weeklySummary={weeklySummary}
              onCopyDaily={handleCopyDailyDraft}
              onCopyWeekly={handleCopyWeeklyDraft}
            />

            {/* Blockers Section */}
            <BlockerPanel
              blockers={blockers}
              tasks={todayData?.tasks || []}
              onAddBlocker={handleAddBlocker}
              onResolveBlocker={handleResolveBlocker}
            />

            {/* Open Loops Section */}
            <OpenLoopsPanel
              openLoops={openLoops}
              tasks={todayData?.tasks || []}
              onResume={handleResumeOpenLoop}
              onComplete={handleCompleteOpenLoop}
              onDismiss={handleDismissOpenLoop}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
