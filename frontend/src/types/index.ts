// DevDay AI TypeScript Type Definitions

// Integration source types
export type IntegrationSource = 
  | 'jira' 
  | 'github' 
  | 'bitbucket' 
  | 'calendar' 
  | 'teams' 
  | 'manual';

// Task status types
export type TaskStatus = 
  | 'todo' 
  | 'in_progress' 
  | 'done' 
  | 'blocked' 
  | 'paused';

// Work log type categories
export type WorkLogType = 
  | 'task_update' 
  | 'debugging' 
  | 'pr_review' 
  | 'meeting' 
  | 'helped_teammate' 
  | 'research' 
  | 'documentation' 
  | 'production_support' 
  | 'blocker';

// Open loop status types
export type OpenLoopStatus = 
  | 'paused' 
  | 'blocked' 
  | 'waiting' 
  | 'missing_next_action';

// Summary status types
export type SummaryStatus =
  | 'draft'
  | 'saved'
  | 'submitted';

// Focus session status types
export type FocusSessionStatus =
  | 'active'
  | 'completed'
  | 'paused'
  | 'blocked'
  | 'cancelled';

// Task entity
export interface Task {
  id: string;
  title: string;
  source: IntegrationSource;
  status: TaskStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description?: string;
  externalKey?: string; // e.g., JIRA-123, PR#456
  scheduledTime?: string; // ISO 8601 datetime
  createdAt: string; // ISO 8601 datetime
}

// Focus session entity
export interface FocusSession {
  id: string;
  taskId: string;
  durationMinutes: number;
  goal: string;
  status: FocusSessionStatus;
  startedAt?: string; // ISO 8601 datetime
  completedAt?: string; // ISO 8601 datetime
}

// Work log entity
export interface WorkLog {
  id: string;
  type: WorkLogType;
  relatedTaskId?: string;
  description: string;
  createdAt: string; // ISO 8601 datetime
}

// Blocker entity
export interface Blocker {
  id: string;
  relatedTaskId?: string;
  description: string;
  status: 'active' | 'resolved';
  createdAt: string; // ISO 8601 datetime
  resolvedAt?: string; // ISO 8601 datetime
}

// Open loop entity
export interface OpenLoop {
  id: string;
  taskId: string;
  taskTitle: string;
  status: OpenLoopStatus;
  currentState: string;
  nextAction: string;
  blocker?: string;
  createdAt: string; // ISO 8601 datetime
}

// Daily summary entity
export interface DailySummary {
  id: string;
  date: string; // ISO 8601 date (YYYY-MM-DD)
  whatIWorkedOn: string;
  completedWork: string;
  inProgressWork: string;
  blockers: string;
  collaboration: string;
  tomorrowPlan: string;
  leadFriendlySummary: string;
  status: SummaryStatus;
}

// Weekly summary entity
export interface WeeklySummary {
  id: string;
  weekStartDate: string; // ISO 8601 date (YYYY-MM-DD)
  weekEndDate: string; // ISO 8601 date (YYYY-MM-DD)
  mainOutcomes: string;
  progressMade: string;
  collaboration: string;
  blockersAndRisks: string;
  nextWeekFocus: string;
  status: SummaryStatus;
}

// Today data aggregate
export interface TodayData {
  date: string; // ISO 8601 date (YYYY-MM-DD)
  developerName: string;
  tasks: Task[];
  focusSession?: FocusSession;
  workLogs: WorkLog[];
  blockers: Blocker[];
  openLoops: OpenLoop[];
  dailySummary?: DailySummary;
  weeklySummary?: WeeklySummary;
}

// Made with Bob
