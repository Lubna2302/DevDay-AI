// DevDay AI Mock Data

import type {
  Task,
  WorkLog,
  Blocker,
  OpenLoop,
  DailySummary,
  WeeklySummary,
  TodayData,
} from '@/types';

// Mock Tasks
export const mockTasks: Task[] = [
  // Jira tasks
  {
    id: 'task-1',
    title: 'Fix login timeout',
    source: 'jira',
    status: 'todo',
    priority: 'high',
    description: 'Investigate token refresh issue causing login timeout.',
    externalKey: 'AUTH-231',
    createdAt: '2026-05-16T08:30:00Z',
  },
  {
    id: 'task-2',
    title: 'Investigate payment webhook retry issue',
    source: 'jira',
    status: 'todo',
    priority: 'medium',
    description: 'Check retry behavior for failed payment webhooks.',
    externalKey: 'PAY-442',
    createdAt: '2026-05-16T09:00:00Z',
  },
  // GitHub/Bitbucket PRs
  {
    id: 'task-3',
    title: 'Review payment webhook changes',
    source: 'github',
    status: 'todo',
    priority: 'medium',
    description: 'Code review for payment webhook retry logic implementation.',
    externalKey: 'PR #82',
    createdAt: '2026-05-16T09:30:00Z',
  },
  {
    id: 'task-4',
    title: 'Auth middleware cleanup',
    source: 'bitbucket',
    status: 'todo',
    priority: 'low',
    description: 'Review refactoring of authentication middleware.',
    externalKey: 'PR #91',
    createdAt: '2026-05-16T10:00:00Z',
  },
  // Calendar meetings
  {
    id: 'task-5',
    title: 'Sprint planning',
    source: 'calendar',
    status: 'todo',
    priority: 'medium',
    description: 'Sprint planning meeting with the team.',
    scheduledTime: '2026-05-16T11:00:00Z',
    createdAt: '2026-05-16T08:00:00Z',
  },
  {
    id: 'task-6',
    title: 'Architecture discussion',
    source: 'calendar',
    status: 'todo',
    priority: 'medium',
    description: 'Discuss microservices architecture for payment service.',
    scheduledTime: '2026-05-16T15:00:00Z',
    createdAt: '2026-05-16T08:00:00Z',
  },
  // Teams items
  {
    id: 'task-7',
    title: 'Backend team asked for API clarification',
    source: 'teams',
    status: 'blocked',
    priority: 'high',
    description: 'Need to clarify authentication API behavior for token refresh.',
    createdAt: '2026-05-16T10:30:00Z',
  },
  {
    id: 'task-8',
    title: 'Helped junior developer with deployment setup',
    source: 'teams',
    status: 'done',
    priority: 'medium',
    description: 'Walked through deployment pipeline configuration.',
    createdAt: '2026-05-16T09:45:00Z',
  },
  // Manual task
  {
    id: 'task-9',
    title: 'Write daily progress notes',
    source: 'manual',
    status: 'todo',
    priority: 'low',
    description: 'Document today\'s progress and blockers.',
    createdAt: '2026-05-16T08:15:00Z',
  },
];

// Mock Work Logs
export const mockWorkLogs: WorkLog[] = [
  {
    id: 'log-1',
    type: 'debugging',
    relatedTaskId: 'task-1',
    description: 'Investigated token refresh behavior in auth flow. Found that refresh tokens expire after 7 days but UI doesn\'t handle this gracefully.',
    createdAt: '2026-05-16T09:15:00Z',
  },
  {
    id: 'log-2',
    type: 'pr_review',
    relatedTaskId: 'task-3',
    description: 'Reviewed payment webhook PR comments. Suggested adding exponential backoff for retry logic and better error logging.',
    createdAt: '2026-05-16T10:45:00Z',
  },
  {
    id: 'log-3',
    type: 'helped_teammate',
    relatedTaskId: 'task-8',
    description: 'Helped teammate understand deployment setup. Explained CI/CD pipeline stages and environment variable configuration.',
    createdAt: '2026-05-16T11:30:00Z',
  },
];

// Mock Blockers
export const mockBlockers: Blocker[] = [
  {
    id: 'blocker-1',
    relatedTaskId: 'task-1',
    description: 'Waiting for backend API clarification on expected token refresh behavior. Need to confirm if 7-day expiry is intentional.',
    status: 'active',
    createdAt: '2026-05-16T10:00:00Z',
  },
];

// Mock Open Loops
export const mockOpenLoops: OpenLoop[] = [
  {
    id: 'loop-1',
    taskId: 'task-1',
    taskTitle: 'Fix login timeout (AUTH-231)',
    status: 'waiting',
    currentState: 'Paused after debugging token refresh issue. Found that refresh tokens expire after 7 days.',
    nextAction: 'Confirm expected API behavior with backend team. Check if 7-day expiry is intentional or needs adjustment.',
    blocker: 'Waiting for backend team response on token refresh API behavior.',
    createdAt: '2026-05-16T10:00:00Z',
  },
];

// Mock Daily Summary
export const mockDailySummary: DailySummary = {
  id: 'daily-1',
  date: '2026-05-16',
  whatIWorkedOn: 'Investigated authentication token refresh issue (AUTH-231) and reviewed payment webhook changes (PR #82). Helped junior developer with deployment setup.',
  completedWork: 'Completed code review for payment webhook PR. Identified root cause of login timeout issue - refresh tokens expiring after 7 days without proper UI handling.',
  inProgressWork: 'Still working on AUTH-231 fix. Waiting for backend team clarification on expected token refresh behavior before implementing the solution.',
  blockers: 'Blocked on AUTH-231 - need backend team to confirm if 7-day token expiry is intentional. This is blocking the login timeout fix.',
  collaboration: 'Helped junior developer understand deployment pipeline configuration. Reviewed payment webhook PR and provided feedback on retry logic.',
  tomorrowPlan: 'Follow up with backend team on token refresh API. Once clarified, implement fix for login timeout issue. Continue reviewing open PRs.',
  leadFriendlySummary: 'Made progress on authentication stability by identifying the root cause of login timeouts. Waiting on backend team clarification to complete the fix. Also supported team members with code reviews and deployment guidance.',
  status: 'draft',
};

// Mock Weekly Summary
export const mockWeeklySummary: WeeklySummary = {
  id: 'weekly-1',
  weekStartDate: '2026-05-12',
  weekEndDate: '2026-05-16',
  mainOutcomes: 'Improved authentication reliability by identifying and diagnosing login timeout issues. Contributed to payment system stability through code reviews and architectural discussions.',
  progressMade: 'Completed investigation of authentication token refresh behavior. Identified root cause of login timeouts affecting user experience. Reviewed and provided feedback on payment webhook retry implementation.',
  collaboration: 'Supported junior developers with deployment pipeline setup and best practices. Participated in sprint planning and architecture discussions for payment service improvements.',
  blockersAndRisks: 'Authentication fix blocked pending backend API clarification. Risk: Login timeout issue may affect more users if not resolved soon. Mitigation: Escalated to backend team for priority response.',
  nextWeekFocus: 'Complete authentication timeout fix once backend clarification received. Continue supporting payment system improvements through code reviews. Participate in architecture planning for microservices migration.',
  status: 'draft',
};

export function generateDailySummary(input: {
  tasks: Task[];
  workLogs: WorkLog[];
  blockers: Blocker[];
  openLoops: OpenLoop[];
}): DailySummary {
  const completedTasks = input.tasks.filter((t) => t.status === 'done');
  const inProgressTasks = input.tasks.filter((t) => t.status === 'in_progress');
  const activeBlockers = input.blockers.filter((b) => b.status === 'active');

  return {
    id: `daily-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    whatIWorkedOn:
      input.tasks
        .slice(0, 3)
        .map((t) => t.title)
        .join(', ') || 'Various development tasks',
    completedWork:
      completedTasks.length > 0
        ? `Completed ${completedTasks.length} task(s): ${completedTasks.map((t) => t.title).join(', ')}`
        : 'Made progress on ongoing tasks',
    inProgressWork:
      inProgressTasks.length > 0
        ? `Working on ${inProgressTasks.length} task(s): ${inProgressTasks.map((t) => t.title).join(', ')}`
        : 'No tasks currently in progress',
    blockers:
      activeBlockers.length > 0
        ? activeBlockers.map((b) => b.description).join('. ')
        : 'No active blockers',
    collaboration:
      input.workLogs
        .filter((w) => w.type === 'helped_teammate' || w.type === 'meeting')
        .map((w) => w.description)
        .join('. ') || 'Collaborated with team on various tasks',
    tomorrowPlan: 'Continue with in-progress tasks and address any blockers',
    leadFriendlySummary: `Made progress on ${input.tasks.length} tasks today.`,
    status: 'draft',
  };
}

export function generateWeeklySummary(input: {
  dailySummaries?: DailySummary[];
  tasks?: Task[];
  workLogs?: WorkLog[];
}): WeeklySummary {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const completedTasks = input.tasks?.filter((t) => t.status === 'done') || [];

  return {
    id: `weekly-${Date.now()}`,
    weekStartDate: weekStart.toISOString().split('T')[0],
    weekEndDate: weekEnd.toISOString().split('T')[0],
    mainOutcomes: `Delivered ${completedTasks.length} completed items this week.`,
    progressMade: 'Advanced key initiatives across the codebase.',
    collaboration: 'Supported team members with reviews and pairing.',
    blockersAndRisks: 'Some items blocked on external dependencies.',
    nextWeekFocus: 'Continue high-priority features and clear blockers.',
    status: 'draft',
  };
}

// Mock Today Data (aggregate)
export const mockTodayData: TodayData = {
  date: '2026-05-16',
  developerName: 'Aarav',
  tasks: mockTasks,
  workLogs: mockWorkLogs,
  blockers: mockBlockers,
  openLoops: mockOpenLoops,
  // Start with no summaries - user will generate them
  dailySummary: undefined,
  weeklySummary: undefined,
};

// Made with Bob
