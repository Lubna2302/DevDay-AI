'use client';

import { formatDateLabel } from '@/utils/formatters';

export default function TodayHeader() {
  const today = new Date().toISOString();
  
  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <span style={{ color: 'var(--text-primary)' }}>DevDay</span>
            <span style={{
              color: 'var(--accent-lime)',
              textShadow: '0 0 20px rgba(214, 255, 107, 0.3)'
            }}>AI</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Your private developer workday assistant
          </p>
        </div>
        
        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            {formatDateLabel(today)}
          </div>
          <div className="badge badge-lime">
            <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{
              background: 'var(--accent-lime)',
              boxShadow: '0 0 6px var(--accent-lime)'
            }}></span>
            Mock integrations connected
          </div>
        </div>
      </div>
    </header>
  );
}

// Made with Bob
