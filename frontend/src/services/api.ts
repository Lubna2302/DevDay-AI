// DevDay AI Service Layer
// This layer abstracts data access. Currently uses mock data.
// Later, replace internals with Spring Boot API calls.

import type {
  TodayData,
  WorkLog,
  WorkLogType,
  FocusSession,
  OpenLoop,
  Blocker,
  DailySummary,
  WeeklySummary,
  Task,
} from '@/types';
import { mockTodayData } from '@/mock/mockData';

// Helper to generate unique IDs
const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper to get current ISO timestamp
const getCurrentTimestamp = () => new Date().toISOString();

// Get today's data
export async function getTodayData(): Promise<TodayData> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  // Return a deep copy to avoid mutations
  return JSON.parse(JSON.stringify(mockTodayData));
}

// Add a work log entry
export async function addWorkLog(input: {
  type: WorkLogType;
  relatedTaskId?: string;
  description: string;
}): Promise<WorkLog> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  const newWorkLog: WorkLog = {
    id: generateId(),
    type: input.type,
    relatedTaskId: input.relatedTaskId,
    description: input.description,
    createdAt: getCurrentTimestamp(),
  };
  
  return newWorkLog;
}

// Start a focus session
export async function startFocusSession(input: {
  taskId: string;
  durationMinutes: number;
  goal: string;
}): Promise<FocusSession> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  const newFocusSession: FocusSession = {
    id: generateId(),
    taskId: input.taskId,
    durationMinutes: input.durationMinutes,
    goal: input.goal,
    status: 'active',
    startedAt: getCurrentTimestamp(),
  };
  
  return newFocusSession;
}

// Pause a focus session and create an open loop
export async function pauseFocusSession(input: {
  focusSessionId: string;
  taskId: string;
  taskTitle: string;
  whatITried: string;
  currentState: string;
  nextAction: string;
  blocker?: string;
}): Promise<{ focusSession: FocusSession; openLoop: OpenLoop }> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  const updatedFocusSession: FocusSession = {
    id: input.focusSessionId,
    taskId: input.taskId,
    durationMinutes: 25, // Default, would come from existing session
    goal: 'Focus session goal', // Would come from existing session
    status: 'paused',
    startedAt: getCurrentTimestamp(),
  };
  
  const newOpenLoop: OpenLoop = {
    id: generateId(),
    taskId: input.taskId,
    taskTitle: input.taskTitle,
    status: input.blocker ? 'blocked' : 'paused',
    currentState: input.currentState,
    nextAction: input.nextAction,
    blocker: input.blocker,
    createdAt: getCurrentTimestamp(),
  };
  
  return {
    focusSession: updatedFocusSession,
    openLoop: newOpenLoop,
  };
}

// Complete a focus session
export async function completeFocusSession(
  focusSessionId: string
): Promise<FocusSession> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  const completedFocusSession: FocusSession = {
    id: focusSessionId,
    taskId: 'task-id', // Would come from existing session
    durationMinutes: 25, // Would come from existing session
    goal: 'Focus session goal', // Would come from existing session
    status: 'completed',
    startedAt: getCurrentTimestamp(),
    completedAt: getCurrentTimestamp(),
  };
  
  return completedFocusSession;
}

// Add a blocker
export async function addBlocker(input: {
  relatedTaskId?: string;
  description: string;
}): Promise<Blocker> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  const newBlocker: Blocker = {
    id: generateId(),
    relatedTaskId: input.relatedTaskId,
    description: input.description,
    status: 'active',
    createdAt: getCurrentTimestamp(),
  };
  
  return newBlocker;
}

// Resolve a blocker
export async function resolveBlocker(blockerId: string): Promise<Blocker> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  
  const resolvedBlocker: Blocker = {
    id: blockerId,
    description: 'Blocker description', // Would come from existing blocker
    status: 'resolved',
    createdAt: getCurrentTimestamp(),
    resolvedAt: getCurrentTimestamp(),
  };
  
  return resolvedBlocker;
}

// Generate daily summary (mock AI generation)
export async function generateDailySummary(input: {
  tasks: Task[];
  workLogs: WorkLog[];
  blockers: Blocker[];
  openLoops: OpenLoop[];
}): Promise<DailySummary> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Mock AI generation - create summary from input data
  const completedTasks = input.tasks.filter((t) => t.status === 'done');
  const inProgressTasks = input.tasks.filter((t) => t.status === 'in_progress');
  const activeBlockers = input.blockers.filter((b) => b.status === 'active');
  
  const whatIWorkedOn = input.tasks
    .slice(0, 3)
    .map((t) => t.title)
    .join(', ') || 'Various development tasks';
  
  const completedWork = completedTasks.length > 0
    ? `Completed ${completedTasks.length} task(s): ${completedTasks.map((t) => t.title).join(', ')}`
    : 'Made progress on ongoing tasks';
  
  const inProgressWork = inProgressTasks.length > 0
    ? `Working on ${inProgressTasks.length} task(s): ${inProgressTasks.map((t) => t.title).join(', ')}`
    : 'No tasks currently in progress';
  
  const blockersText = activeBlockers.length > 0
    ? activeBlockers.map((b) => b.description).join('. ')
    : 'No active blockers';
  
  const collaboration = input.workLogs
    .filter((w) => w.type === 'helped_teammate' || w.type === 'meeting')
    .map((w) => w.description)
    .join('. ') || 'Collaborated with team on various tasks';
  
  const dailySummary: DailySummary = {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    whatIWorkedOn,
    completedWork,
    inProgressWork,
    blockers: blockersText,
    collaboration,
    tomorrowPlan: 'Continue with in-progress tasks and address any blockers',
    leadFriendlySummary: `Made progress on ${input.tasks.length} tasks today. ${completedTasks.length > 0 ? `Completed ${completedTasks.length} items.` : ''} ${activeBlockers.length > 0 ? `Currently blocked on ${activeBlockers.length} item(s).` : 'No blockers.'}`,
    status: 'draft',
  };
  
  return dailySummary;
}

// Generate weekly summary (mock AI generation)
export async function generateWeeklySummary(input: {
  dailySummaries?: DailySummary[];
  tasks?: Task[];
  workLogs?: WorkLog[];
}): Promise<WeeklySummary> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Mock AI generation - create generic outcome-focused summary
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)
  
  const completedTasks = input.tasks?.filter((t) => t.status === 'done') || [];
  
  const weeklySummary: WeeklySummary = {
    id: generateId(),
    weekStartDate: weekStart.toISOString().split('T')[0],
    weekEndDate: weekEnd.toISOString().split('T')[0],
    mainOutcomes: `Delivered ${completedTasks.length} features and improvements this week. Enhanced system reliability and user experience through bug fixes and performance optimizations.`,
    progressMade: 'Advanced key initiatives across authentication, payment processing, and system architecture. Completed code reviews and contributed to technical discussions.',
    collaboration: 'Supported team members with technical guidance and code reviews. Participated in sprint planning and architecture discussions to align on technical direction.',
    blockersAndRisks: 'Some tasks blocked pending external dependencies. Actively working with stakeholders to resolve. No major risks identified.',
    nextWeekFocus: 'Continue delivering high-priority features. Address remaining blockers and support team initiatives. Participate in upcoming architecture planning sessions.',
    status: 'draft',
  };
  
  return weeklySummary;
}

// Made with Bob
