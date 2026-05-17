'use client';

import { useEffect, useState } from 'react';
import { login, register } from '@/services/api';
import { isAuthenticated } from '@/lib/auth';

interface LoginGateProps {
  children: React.ReactNode;
}

export default function LoginGate({ children }: LoginGateProps) {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('demo@devday.ai');
  const [password, setPassword] = useState('demo123');
  const [name, setName] = useState('Demo Developer');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setAuthed(isAuthenticated());
      setReady(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      setAuthed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (!ready) {
    return (
      <MotionlessCenter>
        <p className="text-muted">Loading...</p>
      </MotionlessCenter>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 dashboard-container">
        <div className="card w-full max-w-md p-8">
          <h1 className="text-2xl font-bold mb-2">DevDay AI</h1>
          <p className="text-muted text-sm mb-6">
            Sign in to your developer workday assistant
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <MotionlessField label="Name">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-card-border bg-background"
                  required
                />
              </MotionlessField>
            )}
            <MotionlessField label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-card-border bg-background"
                required
              />
            </MotionlessField>
            <MotionlessField label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-card-border bg-background"
                required
                minLength={6}
              />
            </MotionlessField>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button type="submit" disabled={loading} className="btn btn-primary w-full">
              {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="text-xs text-muted mt-4 text-center">
            Demo: <code>demo@devday.ai</code> / <code>demo123</code>
          </p>

          <button
            type="button"
            className="text-sm text-primary mt-3 w-full text-center"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Already have an account? Sign in' : 'Need an account? Register'}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function MotionlessCenter({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center dashboard-container">
      {children}
    </div>
  );
}

function MotionlessField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}
