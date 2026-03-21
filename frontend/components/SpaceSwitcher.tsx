'use client';

import { useState, useRef, useEffect } from 'react';

interface SpaceInfo {
  slug: string;
  name: string;
  icon?: string;
  role?: string;
}

interface SpaceSwitcherProps {
  /** Current app domain, e.g. 'rcal.online'. Space links become <space>.<domain> */
  domain?: string;
}

/** Read the EncryptID token from localStorage (set by token-relay across r*.online) */
function getEncryptIDToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('encryptid_token');
  } catch {
    return null;
  }
}

/** Read the username from the EncryptID session in localStorage */
function getSessionUsername(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('encryptid_session');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    const claims = parsed?.claims || parsed;
    return claims?.eid?.username || claims?.username || null;
  } catch {
    return null;
  }
}

/** Read the current space_id from the cookie set by middleware */
function getCurrentSpaceId(): string {
  if (typeof document === 'undefined') return 'default';
  const match = document.cookie.match(/(?:^|;\s*)space_id=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : 'default';
}

export function SpaceSwitcher({ domain }: SpaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [spaces, setSpaces] = useState<SpaceInfo[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Derive domain from window.location if not provided
  const appDomain = domain || (typeof window !== 'undefined'
    ? window.location.hostname.split('.').slice(-2).join('.')
    : 'rspace.online');

  const currentSpaceId = getCurrentSpaceId();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Check auth status on mount
  useEffect(() => {
    const token = getEncryptIDToken();
    const sessionUsername = getSessionUsername();
    if (token) {
      setIsAuthenticated(true);
      if (sessionUsername) {
        setUsername(sessionUsername);
      }
    } else {
      // Fallback: check /api/me
      fetch('/api/me')
        .then((r) => r.json())
        .then((data) => {
          if (data.authenticated) {
            setIsAuthenticated(true);
            if (data.user?.username) setUsername(data.user.username);
          }
        })
        .catch(() => {});
    }
  }, []);

  const loadSpaces = async () => {
    if (loaded) return;
    try {
      // Pass EncryptID token so the proxy can forward it to rSpace
      const token = getEncryptIDToken();
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/spaces', { headers });
      if (res.ok) {
        const data = await res.json();
        // Handle both flat array and { spaces: [...] } response formats
        const raw: Array<{ id?: string; slug?: string; name: string; icon?: string; role?: string }> =
          Array.isArray(data) ? data : (data.spaces || []);
        setSpaces(raw.map((s) => ({
          slug: s.slug || s.id || '',
          name: s.name,
          icon: s.icon,
          role: s.role,
        })));
      }
    } catch {
      // API not available
    }
    setLoaded(true);
  };

  const handleOpen = async () => {
    const nowOpen = !open;
    setOpen(nowOpen);
    if (nowOpen && !loaded) {
      await loadSpaces();
    }
  };

  /** Build URL for a space: <space>.<current-app-domain> */
  const spaceUrl = (slug: string) => `https://${slug}.${appDomain}`;

  // Build personal space entry for logged-in user
  const personalSpace: SpaceInfo | null =
    isAuthenticated && username
      ? { slug: username, name: 'Personal', icon: '👤', role: 'owner' }
      : null;

  // Deduplicate: remove personal space from fetched list if it already appears
  const dedupedSpaces = personalSpace
    ? spaces.filter((s) => s.slug !== personalSpace.slug)
    : spaces;

  const mySpaces = dedupedSpaces.filter((s) => s.role);
  const publicSpaces = dedupedSpaces.filter((s) => !s.role);

  // Determine what to show in the button
  const currentLabel = currentSpaceId === 'default'
    ? (personalSpace ? 'personal' : 'public')
    : currentSpaceId;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); handleOpen(); }}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/[0.05] transition-colors"
      >
        <span className="opacity-40 font-light mr-0.5">/</span>
        <span className="max-w-[160px] truncate">{currentLabel}</span>
        <span className="text-[0.7em] opacity-50">&#9662;</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 min-w-[240px] max-h-[400px] overflow-y-auto rounded-xl bg-slate-800 border border-white/10 shadow-xl shadow-black/30 z-[200]">
          {!loaded ? (
            <div className="px-4 py-4 text-center text-sm text-slate-400">Loading spaces...</div>
          ) : !isAuthenticated && spaces.length === 0 ? (
            <>
              <div className="px-4 py-4 text-center text-sm text-slate-400">
                Sign in to see your spaces
              </div>
            </>
          ) : (
            <>
              {/* Personal space — always first when logged in */}
              {personalSpace && (
                <>
                  <div className="px-3.5 pt-2.5 pb-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-500 select-none">
                    Personal
                  </div>
                  <a
                    href={spaceUrl(personalSpace.slug)}
                    className={`flex items-center gap-2.5 px-3.5 py-2.5 text-slate-200 no-underline transition-colors hover:bg-white/[0.05] ${
                      currentSpaceId === personalSpace.slug ? 'bg-white/[0.07]' : ''
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <span className="text-base">{personalSpace.icon}</span>
                    <span className="text-sm font-medium flex-1">{username}</span>
                    <span className="text-[0.6rem] font-bold uppercase bg-cyan-500/15 text-cyan-300 px-1.5 py-0.5 rounded tracking-wide">
                      owner
                    </span>
                  </a>
                </>
              )}

              {/* Other spaces the user belongs to */}
              {mySpaces.length > 0 && (
                <>
                  {personalSpace && <div className="h-px bg-white/[0.08] my-1" />}
                  <div className="px-3.5 pt-2.5 pb-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-500 select-none">
                    Your spaces
                  </div>
                  {mySpaces.map((s) => (
                    <a
                      key={s.slug}
                      href={spaceUrl(s.slug)}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 text-slate-200 no-underline transition-colors hover:bg-white/[0.05] ${
                        currentSpaceId === s.slug ? 'bg-white/[0.07]' : ''
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      <span className="text-base">{s.icon || '🌐'}</span>
                      <span className="text-sm font-medium flex-1">{s.name}</span>
                      {s.role && (
                        <span className="text-[0.6rem] font-bold uppercase bg-cyan-500/15 text-cyan-300 px-1.5 py-0.5 rounded tracking-wide">
                          {s.role}
                        </span>
                      )}
                    </a>
                  ))}
                </>
              )}

              {/* Public spaces */}
              {publicSpaces.length > 0 && (
                <>
                  {(personalSpace || mySpaces.length > 0) && <div className="h-px bg-white/[0.08] my-1" />}
                  <div className="px-3.5 pt-2.5 pb-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-500 select-none">
                    Public spaces
                  </div>
                  {publicSpaces.map((s) => (
                    <a
                      key={s.slug}
                      href={spaceUrl(s.slug)}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 text-slate-200 no-underline transition-colors hover:bg-white/[0.05] ${
                        currentSpaceId === s.slug ? 'bg-white/[0.07]' : ''
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      <span className="text-base">{s.icon || '🌐'}</span>
                      <span className="text-sm font-medium flex-1">{s.name}</span>
                    </a>
                  ))}
                </>
              )}

              <div className="h-px bg-white/[0.08] my-1" />
              <a
                href="https://rspace.online/new"
                className="flex items-center px-3.5 py-2.5 text-sm font-semibold text-cyan-400 hover:bg-cyan-500/[0.08] transition-colors no-underline"
                onClick={() => setOpen(false)}
              >
                + Create new space
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}
