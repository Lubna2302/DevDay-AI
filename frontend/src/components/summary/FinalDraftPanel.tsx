'use client';

import { useState } from 'react';
import type { DailySummary, WeeklySummary } from '@/types';

interface FinalDraftPanelProps {
  dailySummary: DailySummary | null;
  weeklySummary: WeeklySummary | null;
  onCopyDaily: () => void;
  onCopyWeekly: () => void;
}

export default function FinalDraftPanel({
  dailySummary,
  weeklySummary,
  onCopyDaily,
  onCopyWeekly,
}: FinalDraftPanelProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [copiedDaily, setCopiedDaily] = useState(false);
  const [copiedWeekly, setCopiedWeekly] = useState(false);

  const handleCopyDaily = async () => {
    if (!dailySummary) return;
    
    const mailContent = generateDailyMailContent(dailySummary);
    await navigator.clipboard.writeText(mailContent);
    setCopiedDaily(true);
    setTimeout(() => setCopiedDaily(false), 2000);
    onCopyDaily();
  };

  const handleCopyWeekly = async () => {
    if (!weeklySummary) return;
    
    const mailContent = generateWeeklyMailContent(weeklySummary);
    await navigator.clipboard.writeText(mailContent);
    setCopiedWeekly(true);
    setTimeout(() => setCopiedWeekly(false), 2000);
    onCopyWeekly();
  };

  const generateDailyMailContent = (summary: DailySummary): string => {
    const date = new Date(summary.date).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    return `Subject: Daily Update - ${date}

Hi Team,

Here's my daily update for ${date}:

📋 What I Worked On:
${summary.whatIWorkedOn}

✅ Completed Work:
${summary.completedWork}

🔄 In-Progress Work:
${summary.inProgressWork}

${summary.blockers ? `🚧 Blockers:\n${summary.blockers}\n\n` : ''}${summary.collaboration ? `🤝 Collaboration:\n${summary.collaboration}\n\n` : ''}📅 Tomorrow's Plan:
${summary.tomorrowPlan}

---
Summary for Leadership:
${summary.leadFriendlySummary}

Best regards`;
  };

  const generateWeeklyMailContent = (summary: WeeklySummary): string => {
    const startDate = new Date(summary.weekStartDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const endDate = new Date(summary.weekEndDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });

    return `Subject: Weekly Summary - ${startDate} to ${endDate}

Hi Team,

Here's my weekly summary for ${startDate} - ${endDate}:

🎯 Main Outcomes:
${summary.mainOutcomes}

📈 Progress Made:
${summary.progressMade}

🤝 Collaboration:
${summary.collaboration}

${summary.blockersAndRisks ? `⚠️ Blockers and Risks:\n${summary.blockersAndRisks}\n\n` : ''}🔮 Next Week Focus:
${summary.nextWeekFocus}

Best regards`;
  };

  const hasDailySummary = dailySummary && (dailySummary.status === 'saved' || dailySummary.status === 'submitted');
  const hasWeeklySummary = weeklySummary && (weeklySummary.status === 'saved' || weeklySummary.status === 'submitted');

  if (!hasDailySummary && !hasWeeklySummary) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📧 Final Draft</h2>
          <p className="card-subtitle">Mail-ready summaries</p>
        </div>
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/10 mb-4">
            <span className="text-3xl">📝</span>
          </div>
          <p className="text-sm text-muted leading-relaxed">
            Generate and save your daily or weekly summary first.
            <br />
            Then come here to copy the mail-ready version.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">📧 Final Draft</h2>
        <p className="card-subtitle">Mail-ready summaries</p>
      </div>

      {/* Tabs */}
      {hasDailySummary && hasWeeklySummary && (
        <div className="flex gap-2 mb-4 border-b border-card-border">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'daily'
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Daily Summary
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'weekly'
                ? 'text-secondary border-b-2 border-secondary'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Weekly Summary
          </button>
        </div>
      )}

      {/* Daily Summary Content */}
      {activeTab === 'daily' && hasDailySummary && (
        <div className="space-y-4">
          <div className="bg-card-hover rounded-lg p-4 border border-card-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">📧 Daily Update Email</span>
                <span className="text-xs text-muted">
                  {new Date(dailySummary.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <button
                onClick={handleCopyDaily}
                className="btn btn-sm btn-primary"
              >
                {copiedDaily ? '✓ Copied!' : '📋 Copy to Clipboard'}
              </button>
            </div>
            
            <div className="bg-background rounded border border-card-border p-4 text-sm font-mono whitespace-pre-wrap">
              {generateDailyMailContent(dailySummary)}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-600">
              💡 <strong>Tip:</strong> This format is ready to paste into your email client or Slack.
              You can customize the greeting and signature as needed.
            </p>
          </div>
        </div>
      )}

      {/* Weekly Summary Content */}
      {activeTab === 'weekly' && hasWeeklySummary && (
        <div className="space-y-4">
          <div className="bg-card-hover rounded-lg p-4 border border-card-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">📧 Weekly Summary Email</span>
                <span className="text-xs text-muted">
                  {new Date(weeklySummary.weekStartDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric'
                  })} - {new Date(weeklySummary.weekEndDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <button
                onClick={handleCopyWeekly}
                className="btn btn-sm btn-secondary"
              >
                {copiedWeekly ? '✓ Copied!' : '📋 Copy to Clipboard'}
              </button>
            </div>
            
            <div className="bg-background rounded border border-card-border p-4 text-sm font-mono whitespace-pre-wrap">
              {generateWeeklyMailContent(weeklySummary)}
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
            <p className="text-xs text-purple-600">
              💡 <strong>Tip:</strong> This weekly summary is perfect for team updates, 
              1-on-1s with your manager, or status reports to stakeholders.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Made with Bob