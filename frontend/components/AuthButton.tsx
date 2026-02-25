'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/auth';

export function AuthButton() {
  const { isAuthenticated, username, did, loading, login, register, logout } = useAuthStore();
  const [showRegister, setShowRegister] = useState(false);
  const [regUsername, setRegUsername] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <span className="text-white/60">Signed in as </span>
          <span className="text-primary font-medium">{username || did?.slice(0, 16) + '...'}</span>
        </div>
        <button
          onClick={logout}
          className="text-xs text-white/40 hover:text-white/60 transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  if (showRegister) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={regUsername}
          onChange={(e) => setRegUsername(e.target.value)}
          placeholder="Choose a username"
          className="text-sm py-1 px-2 w-36 rounded-md bg-white/10 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-primary"
          maxLength={20}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && regUsername.trim()) {
              setError('');
              register(regUsername.trim()).catch((err: Error) => {
                setError(err.message || 'Registration failed');
              });
            }
          }}
        />
        <button
          onClick={async () => {
            if (!regUsername.trim()) return;
            setError('');
            try {
              await register(regUsername.trim());
            } catch (e: unknown) {
              setError(e instanceof Error ? e.message : 'Registration failed');
            }
          }}
          disabled={loading || !regUsername.trim()}
          className="text-sm py-1 px-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? '...' : 'Register'}
        </button>
        <button
          onClick={() => setShowRegister(false)}
          className="text-xs text-white/40 hover:text-white/60"
        >
          Cancel
        </button>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={async () => {
          setError('');
          try {
            await login();
          } catch (e: unknown) {
            if (e instanceof DOMException && (e.name === 'NotAllowedError' || e.name === 'SecurityError' || e.name === 'AbortError')) {
              setShowRegister(true);
            } else {
              setError(e instanceof Error ? e.message : 'Sign in failed');
            }
          }
        }}
        disabled={loading}
        className="text-sm text-white/60 hover:text-primary transition-colors flex items-center gap-1.5"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
          <circle cx={12} cy={10} r={3} />
          <path d="M12 13v8" />
          <path d="M9 18h6" />
          <circle cx={12} cy={10} r={7} />
        </svg>
        {loading ? 'Signing in...' : 'Sign in with Passkey'}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
