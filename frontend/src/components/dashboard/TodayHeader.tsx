'use client';

import { formatDateLabel } from '@/utils/formatters';

export default function TodayHeader() {
  const today = new Date().toISOString();
  
  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-2">
            DevDay AI
          </h1>
          <p className="text-muted text-sm">
            Your private developer workday assistant
          </p>
        </div>
        
        <div className="flex flex-col items-start md:items-end gap-2">
          <div className="text-lg font-medium">
            {formatDateLabel(today)}
          </div>
          <div className="badge badge-success">
            <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Mock integrations connected
          </div>
        </div>
      </div>
    </header>
  );
}

// Made with Bob
