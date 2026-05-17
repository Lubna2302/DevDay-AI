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
import { getToken, setAuth, clearAuth, type StoredUser } from '@/lib/auth';
import { generateDailySummary as mockDailySummary, generateWeeklySummary as mockWeeklySummary } from '@/mock/mockData';

// Function to generate fresh mock data on each call
export function generateFreshMockData(): TodayData {
  const taskId = () => `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const logId = () => `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const blockerId = () => `blocker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const loopId = () => `loop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const taskTitles = [
    'Fix authentication bug in login flow',
    'Implement new payment gateway integration',
    'Review pull request for API refactoring',
    'Update documentation for REST endpoints',
    'Optimize database query performance',
    'Debug production issue with webhooks',
    'Add unit tests for user service',
    'Refactor legacy code in auth module',
    'Setup CI/CD pipeline for staging',
    'Investigate memory leak in background jobs',
    'Design new microservice architecture',
    'Fix CORS issues in API gateway',
    'Implement rate limiting middleware',
    'Update dependencies to latest versions',
    'Code review for security patches',
  ];
  
  const sources: Array<'jira' | 'github' | 'bitbucket' | 'calendar' | 'teams' | 'manual'> =
    ['jira', 'github', 'bitbucket', 'calendar', 'teams', 'manual'];
  const priorities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
  const statuses: Array<'todo' | 'in_progress' | 'blocked' | 'done'> = ['todo', 'in_progress', 'blocked', 'done'];
  
  // Generate 5-8 random tasks
  const numTasks = 5 + Math.floor(Math.random() * 4);
  const tasks: Task[] = Array.from({ length: numTasks }, (_, i) => {
    const source = sources[Math.floor(Math.random() * sources.length)];
    const title = taskTitles[Math.floor(Math.random() * taskTitles.length)];
    const status = i === 0 ? 'in_progress' : statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: taskId(),
      title,
      source,
      status,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      description: `Working on ${title.toLowerCase()}`,
      externalKey: source === 'jira' ? `TASK-${100 + i}` : source === 'github' ? `PR #${80 + i}` : undefined,
      scheduledTime: source === 'calendar' ? new Date(Date.now() + i * 3600000).toISOString() : undefined,
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    };
  });
  
  // Generate 2-4 work logs
  const numLogs = 2 + Math.floor(Math.random() * 3);
  const logTypes: WorkLogType[] = ['debugging', 'pr_review', 'helped_teammate', 'meeting', 'research'];
  const workLogs: WorkLog[] = Array.from({ length: numLogs }, (_, i) => ({
    id: logId(),
    type: logTypes[Math.floor(Math.random() * logTypes.length)],
    relatedTaskId: tasks[Math.floor(Math.random() * tasks.length)]?.id,
    description: `Work log entry ${i + 1}: Made progress on task implementation and debugging.`,
    createdAt: new Date(Date.now() - i * 1800000).toISOString(),
  }));
  
  // Generate 0-2 blockers
  const numBlockers = Math.floor(Math.random() * 3);
  const blockers: Blocker[] = Array.from({ length: numBlockers }, (_, i) => ({
    id: blockerId(),
    relatedTaskId: tasks[Math.floor(Math.random() * tasks.length)]?.id,
    description: `Blocker ${i + 1}: Waiting for external dependency or team response.`,
    status: 'active',
    createdAt: new Date(Date.now() - i * 3600000).toISOString(),
  }));
  
  // Generate 0-2 open loops
  const numLoops = Math.floor(Math.random() * 3);
  const openLoops: OpenLoop[] = Array.from({ length: numLoops }, (_, i) => {
    const task = tasks[Math.floor(Math.random() * tasks.length)];
    return {
      id: loopId(),
      taskId: task.id,
      taskTitle: task.title,
      status: 'waiting',
      currentState: `Paused work on ${task.title}. Need to follow up.`,
      nextAction: 'Resume when dependencies are ready or blockers are resolved.',
      blocker: i % 2 === 0 ? 'Waiting for team response' : undefined,
      createdAt: new Date(Date.now() - i * 3600000).toISOString(),
    };
  });
  
  return {
    date: new Date().toISOString().split('T')[0],
    developerName: 'Developer',
    tasks,
    workLogs,
    blockers,
    openLoops,
    dailySummary: undefined,
    weeklySummary: undefined,
  };
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !API_BASE;
const DEMO_DB_KEY = 'devday_demo_today_data';

function demoDelay(ms = 200) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readDemoTodayData(): TodayData {
  if (typeof window === 'undefined') {
    return generateFreshMockData();
  }

  const raw = localStorage.getItem(DEMO_DB_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as TodayData;
    } catch {
      localStorage.removeItem(DEMO_DB_KEY);
    }
  }

  const seeded = generateFreshMockData();
  localStorage.setItem(DEMO_DB_KEY, JSON.stringify(seeded));
  return seeded;
}

function writeDemoTodayData(data: TodayData): TodayData {
  if (typeof window !== 'undefined') {
    localStorage.setItem(DEMO_DB_KEY, JSON.stringify(data));
  }
  return data;
}

function updateDemoTodayData(updater: (data: TodayData) => TodayData): TodayData {
  return writeDemoTodayData(updater(readDemoTodayData()));
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ApiEnvelope<T> {
  data: T;
  timestamp?: string;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = true
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const json = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      json?.error?.message || json?.message || `Request failed (${response.status})`;
    throw new Error(message);
  }

  if (json && typeof json === 'object' && 'data' in json) {
    return (json as ApiEnvelope<T>).data;
  }

  return json as T;
}

export async function login(email: string, password: string): Promise<StoredUser> {
  if (DEMO_MODE) {
    await demoDelay();
    const user = { id: 1, email, name: email === 'demo@devday.ai' ? 'Demo Developer' : email.split('@')[0] };
    setAuth('demo-token', user);
    return user;
  }

  const data = await request<{ token: string; user: StoredUser }>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
    false
  );
  setAuth(data.token, data.user);
  return data.user;
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<StoredUser> {
  if (DEMO_MODE) {
    await demoDelay();
    const user = { id: 1, email, name };
    setAuth('demo-token', user);
    return user;
  }

  const data = await request<{ token: string; user: StoredUser }>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    },
    false
  );
  setAuth(data.token, data.user);
  return data.user;
}

export function logout(): void {
  clearAuth();
}

export async function getTodayData(): Promise<TodayData> {
  if (DEMO_MODE) {
    await demoDelay();
    return readDemoTodayData();
  }

  try {
    return await request<TodayData>('/today');
  } catch (error) {
    console.warn('Backend API failed, generating fresh mock data:', error);
    // Generate fresh mock data on each call
    await new Promise((r) => setTimeout(r, 300)); // Simulate API delay
    return generateFreshMockData();
  }
}

export async function getFreshMockTodayData(): Promise<TodayData> {
  await new Promise((r) => setTimeout(r, 300));
  return writeDemoTodayData(generateFreshMockData());
}

export async function createTask(input: {
  title: string;
  description?: string;
  priority?: string;
  source?: string;
}): Promise<Task> {
  if (DEMO_MODE) {
    await demoDelay();
    const task: Task = {
      id: makeId('task'),
      title: input.title,
      description: input.description,
      source: 'manual',
      status: 'todo',
      priority: (input.priority as Task['priority']) || 'medium',
      createdAt: new Date().toISOString(),
    };
    updateDemoTodayData((data) => ({ ...data, tasks: [task, ...data.tasks] }));
    return task;
  }

  return request<Task>('/tasks', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateTaskStatus(
  taskId: string,
  status: string
): Promise<Task> {
  if (DEMO_MODE) {
    await demoDelay();
    let updatedTask: Task | undefined;
    updateDemoTodayData((data) => ({
      ...data,
      tasks: data.tasks.map((task) => {
        if (task.id !== taskId) return task;
        updatedTask = { ...task, status: status as Task['status'] };
        return updatedTask;
      }),
    }));
    if (!updatedTask) {
      throw new Error('Task not found');
    }
    return updatedTask;
  }

  return request<Task>(`/tasks/${taskId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function startFocusSession(input: {
  taskId: string;
  durationMinutes: number;
  goal: string;
}): Promise<FocusSession> {
  if (DEMO_MODE) {
    await demoDelay();
    const session: FocusSession = {
      id: makeId('focus'),
      taskId: input.taskId,
      durationMinutes: input.durationMinutes,
      goal: input.goal,
      status: 'active',
      startedAt: new Date().toISOString(),
    };
    updateDemoTodayData((data) => ({
      ...data,
      focusSession: session,
      tasks: data.tasks.map((task) =>
        task.id === input.taskId ? { ...task, status: 'in_progress' } : task
      ),
    }));
    return session;
  }

  return request<FocusSession>('/focus-sessions/start', {
    method: 'POST',
    body: JSON.stringify({
      taskId: Number(input.taskId),
      plannedDurationMinutes: input.durationMinutes,
      goal: input.goal,
    }),
  });
}

export async function getActiveFocusSession(): Promise<FocusSession | null> {
  if (DEMO_MODE) {
    return readDemoTodayData().focusSession || null;
  }

  try {
    return await request<FocusSession>('/focus-sessions/active');
  } catch {
    return null;
  }
}

export async function completeFocusSession(focusSessionId: string): Promise<FocusSession> {
  if (DEMO_MODE) {
    await demoDelay();
    let completed: FocusSession | undefined;
    updateDemoTodayData((data) => {
      if (!data.focusSession || data.focusSession.id !== focusSessionId) return data;
      completed = {
        ...data.focusSession,
        status: 'completed',
        completedAt: new Date().toISOString(),
      };
      return {
        ...data,
        focusSession: undefined,
        tasks: data.tasks.map((task) =>
          task.id === completed!.taskId ? { ...task, status: 'done' } : task
        ),
      };
    });
    if (!completed) throw new Error('Focus session not found');
    return completed;
  }

  return request<FocusSession>(`/focus-sessions/${focusSessionId}/complete`, {
    method: 'POST',
  });
}

export async function pauseFocusSession(input: {
  focusSessionId: string;
  context: string;
  reason: string;
  toTaskId?: string;
}): Promise<FocusSession> {
  if (DEMO_MODE) {
    await demoDelay();
    let paused: FocusSession | undefined;
    updateDemoTodayData((data) => {
      if (!data.focusSession || data.focusSession.id !== input.focusSessionId) return data;
      paused = { ...data.focusSession, status: 'paused' };
      const task = data.tasks.find((item) => item.id === data.focusSession?.taskId);
      const openLoop: OpenLoop | undefined = task
        ? {
            id: makeId('loop'),
            taskId: task.id,
            taskTitle: task.title,
            status: 'paused',
            currentState: input.context,
            nextAction: input.reason,
            createdAt: new Date().toISOString(),
          }
        : undefined;
      return {
        ...data,
        focusSession: undefined,
        openLoops: openLoop ? [openLoop, ...data.openLoops] : data.openLoops,
        tasks: data.tasks.map((item) =>
          item.id === task?.id ? { ...item, status: 'paused' } : item
        ),
      };
    });
    if (!paused) throw new Error('Focus session not found');
    return paused;
  }

  return request<FocusSession>(`/focus-sessions/${input.focusSessionId}/pause`, {
    method: 'POST',
    body: JSON.stringify({
      context: input.context,
      reason: input.reason,
      toTaskId: input.toTaskId ? Number(input.toTaskId) : undefined,
    }),
  });
}

function mapWorkLogType(type: WorkLogType): string {
  const map: Record<WorkLogType, string> = {
    task_update: 'OTHER',
    debugging: 'DEBUGGING',
    pr_review: 'OTHER',
    meeting: 'MEETING',
    helped_teammate: 'HELPED_TEAMMATE',
    research: 'RESEARCH',
    documentation: 'DOCUMENTATION',
    production_support: 'PRODUCTION_SUPPORT',
    blocker: 'OTHER',
  };
  return map[type] || 'OTHER';
}

export async function addWorkLog(input: {
  type: WorkLogType;
  relatedTaskId?: string;
  description: string;
}): Promise<WorkLog> {
  if (DEMO_MODE) {
    await demoDelay();
    const workLog: WorkLog = {
      id: makeId('log'),
      type: input.type,
      relatedTaskId: input.relatedTaskId,
      description: input.description,
      createdAt: new Date().toISOString(),
    };
    updateDemoTodayData((data) => ({ ...data, workLogs: [workLog, ...data.workLogs] }));
    return workLog;
  }

  return request<WorkLog>('/work-logs', {
    method: 'POST',
    body: JSON.stringify({
      logType: mapWorkLogType(input.type),
      title: input.description.slice(0, 200),
      description: input.description,
      durationMinutes: 15,
      taskId: input.relatedTaskId ? Number(input.relatedTaskId) : undefined,
    }),
  });
}

export async function addBlocker(input: {
  relatedTaskId?: string;
  description: string;
}): Promise<Blocker> {
  if (DEMO_MODE) {
    await demoDelay();
    const blocker: Blocker = {
      id: makeId('blocker'),
      relatedTaskId: input.relatedTaskId,
      description: input.description,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    updateDemoTodayData((data) => ({
      ...data,
      blockers: [blocker, ...data.blockers],
      tasks: data.tasks.map((task) =>
        task.id === input.relatedTaskId ? { ...task, status: 'blocked' } : task
      ),
    }));
    return blocker;
  }

  return request<Blocker>('/blockers', {
    method: 'POST',
    body: JSON.stringify({
      taskId: input.relatedTaskId ? Number(input.relatedTaskId) : undefined,
      description: input.description,
    }),
  });
}

export async function resolveBlocker(blockerId: string): Promise<Blocker> {
  if (DEMO_MODE) {
    await demoDelay();
    let resolved: Blocker | undefined;
    updateDemoTodayData((data) => ({
      ...data,
      blockers: data.blockers.map((blocker) => {
        if (blocker.id !== blockerId) return blocker;
        resolved = { ...blocker, status: 'resolved', resolvedAt: new Date().toISOString() };
        return resolved;
      }),
    }));
    if (!resolved) throw new Error('Blocker not found');
    return resolved;
  }

  return request<Blocker>(`/blockers/${blockerId}/resolve`, {
    method: 'POST',
  });
}

/** Generate AI-powered daily summary from backend */
export async function generateDailySummary(input: {
  tasks: Task[];
  workLogs: WorkLog[];
  blockers: Blocker[];
  openLoops: OpenLoop[];
}): Promise<DailySummary> {
  if (DEMO_MODE) {
    await demoDelay(400);
    const summary = mockDailySummary(input);
    updateDemoTodayData((data) => ({ ...data, dailySummary: summary }));
    return summary;
  }

  try {
    const summary = await request<DailySummary>('/summaries/daily/generate', {
      method: 'POST',
    });
    return summary;
  } catch (error) {
    console.warn('Backend summary generation failed, using mock:', error);
    // Fallback to mock if backend fails
    await new Promise((r) => setTimeout(r, 400));
    return mockDailySummary(input);
  }
}

/** Generate AI-powered weekly summary from backend */
export async function generateWeeklySummary(input: {
  dailySummaries?: DailySummary[];
  tasks?: Task[];
  workLogs?: WorkLog[];
}): Promise<WeeklySummary> {
  if (DEMO_MODE) {
    await demoDelay(400);
    const summary = mockWeeklySummary(input);
    updateDemoTodayData((data) => ({ ...data, weeklySummary: summary }));
    return summary;
  }

  try {
    const summary = await request<WeeklySummary>('/summaries/weekly/generate', {
      method: 'POST',
    });
    return summary;
  } catch (error) {
    console.warn('Backend summary generation failed, using mock:', error);
    // Fallback to mock if backend fails
    await new Promise((r) => setTimeout(r, 400));
    return mockWeeklySummary(input);
  }
}
