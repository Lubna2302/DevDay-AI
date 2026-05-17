'use client';

import { useState, useEffect } from 'react';
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
import type { TodayData, Task, FocusSession, OpenLoop, WorkLog, Blocker, DailySummary, WeeklySummary } from '@/types';
import { getTodayData, addWorkLog, addBlocker, resolveBlocker, generateDailySummary, generateWeeklySummary } from '@/services/api';

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

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getTodayData();
        setTodayData(data);
        setOpenLoops(data.openLoops || []);
        setWorkLogs(data.workLogs || []);
        setBlockers(data.blockers || []);
        setDailySummary(data.dailySummary || null);
        setWeeklySummary(data.weeklySummary || null);
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

  const handleToggleComplete = (taskId: string, currentStatus: string) => {
    if (todayData) {
      const newStatus = currentStatus === 'done' ? 'todo' : 'done';
      setTodayData({
        ...todayData,
        tasks: todayData.tasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
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
    try {
      const newLog = await addWorkLog(logInput);
      setWorkLogs([...workLogs, newLog]);
    } catch (error) {
      console.error('Failed to add work log:', error);
    }
  };

  // Blocker Handlers
  const handleAddBlocker = async (blockerInput: {
    relatedTaskId?: string;
    description: string;
  }) => {
    try {
      const newBlocker = await addBlocker(blockerInput);
      setBlockers([...blockers, newBlocker]);

      // If blocker is related to a task, update task status to blocked
      if (blockerInput.relatedTaskId && todayData) {
        const task = todayData.tasks.find((t) => t.id === blockerInput.relatedTaskId);
        if (task) {
          // Update task status to blocked
          setTodayData({
            ...todayData,
            tasks: todayData.tasks.map((t) =>
              t.id === blockerInput.relatedTaskId ? { ...t, status: 'blocked' } : t
            ),
          });

          // Add or update open loop for the blocked task
          const existingLoop = openLoops.find((loop) => loop.taskId === blockerInput.relatedTaskId);
          if (!existingLoop) {
            const newOpenLoop: OpenLoop = {
              id: `loop-${Date.now()}`,
              taskId: task.id,
              taskTitle: task.title,
              status: 'blocked',
              currentState: 'Task is blocked',
              nextAction: blockerInput.description,
              blocker: blockerInput.description,
              createdAt: new Date().toISOString(),
            };
            setOpenLoops([...openLoops, newOpenLoop]);
          } else {
            // Update existing open loop to blocked status
            setOpenLoops(
              openLoops.map((loop) =>
                loop.taskId === blockerInput.relatedTaskId
                  ? { ...loop, status: 'blocked', blocker: blockerInput.description }
                  : loop
              )
            );
          }
        }
      }
    } catch (error) {
      console.error('Failed to add blocker:', error);
    }
  };

  const handleResolveBlocker = async (blockerId: string) => {
    try {
      const resolvedBlocker = await resolveBlocker(blockerId);
      
      // Update blocker in state
      setBlockers(
        blockers.map((b) =>
          b.id === blockerId
            ? { ...b, status: 'resolved', resolvedAt: resolvedBlocker.resolvedAt }
            : b
        )
      );

      // Find the blocker to get related task
      const blocker = blockers.find((b) => b.id === blockerId);
      if (blocker?.relatedTaskId && todayData) {
        const task = todayData.tasks.find((t) => t.id === blocker.relatedTaskId);
        if (task && task.status === 'blocked') {
          // Move task back to todo or paused
          const newStatus = task.status === 'blocked' ? 'todo' : task.status;
          setTodayData({
            ...todayData,
            tasks: todayData.tasks.map((t) =>
              t.id === blocker.relatedTaskId ? { ...t, status: newStatus } : t
            ),
          });
        }
      }
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
            <div className="stat-label">Today's Work</div>
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
                  Manual notes about what you're working on
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
