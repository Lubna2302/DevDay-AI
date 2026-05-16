// DevDay AI Utility Formatters

import type {
  IntegrationSource,
  TaskStatus,
  OpenLoopStatus,
  SummaryStatus,
  FocusSessionStatus,
  WorkLogType,
} from '@/types';

// Format date string to readable label
// Example: "2026-05-16T12:00:00Z" -> "Saturday, May 16, 2026"
export function formatDateLabel(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// Format time string to readable label
// Example: "2026-05-16T11:00:00Z" -> "11:00 AM"
export function formatTimeLabel(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

// Get readable label for integration source
export function getSourceLabel(source: IntegrationSource): string {
  const sourceMap: Record<IntegrationSource, string> = {
    jira: 'Jira',
    github: 'GitHub',
    bitbucket: 'Bitbucket',
    calendar: 'Calendar',
    teams: 'Teams',
    manual: 'Manual',
  };
  return sourceMap[source] || source;
}

// Get readable label for any status type
export function getStatusLabel(
  status: TaskStatus | OpenLoopStatus | SummaryStatus | FocusSessionStatus
): string {
  // Convert snake_case to Title Case
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Get readable label for work log type
export function getWorkLogTypeLabel(type: WorkLogType): string {
  const typeMap: Record<WorkLogType, string> = {
    task_update: 'Task Update',
    debugging: 'Debugging',
    pr_review: 'PR Review',
    meeting: 'Meeting',
    helped_teammate: 'Helped Teammate',
    research: 'Research',
    documentation: 'Documentation',
    production_support: 'Production Support',
    blocker: 'Blocker',
  };
  return typeMap[type] || type;
}

// Get readable label for priority
export function getPriorityLabel(priority: string): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

// Made with Bob
