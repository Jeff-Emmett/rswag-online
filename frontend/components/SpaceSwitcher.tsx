'use client';

import { useState, useRef, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface SpaceInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  domain: string;
  logo_url: string | null;
}

interface SpaceSwitcherProps {
  currentSpaceId?: string;
}

export function SpaceSwitcher({ currentSpaceId = 'default' }: SpaceSwitcherProps) {
  const [open, setOpen] = useState(false);
  const [spaces, setSpaces] = useState<SpaceInfo[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  // Click-outside to close
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Fetch available spaces
  useEffect(() => {
    fetch(`${API_URL}/spaces`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: SpaceInfo[]) => setSpaces(data))
      .catch(() => {});
  }, []);

  const currentSpace = spaces.find((s) => s.id === currentSpaceId) || {
    id: 'default',
    name: 'rSwag',
    tagline: 'Community Merch',
    domain: 'rswag.online',
    logo_url: null,
  };

  function switchSpace(spaceId: string) {
    // Set cookie and reload to apply space theme
    document.cookie = `space_id=${spaceId}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setOpen(false);
    window.location.reload();
  }

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-semibold bg-white/[0.08] hover:bg-white/[0.12] text-slate-200 transition-colors"
      >
        <span className="w-6 h-6 rounded-md bg-gradient-to-br from-primary/80 to-secondary/80 flex items-center justify-center text-[9px] font-black text-white leading-none flex-shrink-0">
          {currentSpace.name.charAt(0).toUpperCase()}
        </span>
        <span className="hidden sm:inline max-w-[100px] truncate">{currentSpace.name}</span>
        <span className="text-[0.7em] opacity-60">&#9662;</span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-[280px] rounded-xl bg-slate-800 border border-white/10 shadow-xl shadow-black/30 z-[200]">
          {/* Header */}
          <div className="px-3.5 py-3 border-b border-white/[0.08]">
            <div className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-500 select-none">
              Spaces
            </div>
          </div>

          {/* Space list */}
          {spaces.length > 0 ? (
            spaces.map((s) => (
              <button
                key={s.id}
                onClick={() => switchSpace(s.id)}
                className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 text-left transition-colors ${
                  s.id === currentSpaceId
                    ? 'bg-white/[0.07]'
                    : 'hover:bg-white/[0.04]'
                }`}
              >
                {/* Space avatar */}
                <span className="w-7 h-7 rounded-md bg-gradient-to-br from-primary/60 to-secondary/60 flex items-center justify-center text-[10px] font-black text-white leading-none flex-shrink-0">
                  {s.name.charAt(0).toUpperCase()}
                </span>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-200 truncate">
                      {s.name}
                    </span>
                    {s.id === currentSpaceId && (
                      <span className="text-[10px] text-primary">&#10003;</span>
                    )}
                  </div>
                  {s.tagline && (
                    <span className="text-[11px] text-slate-400 truncate">
                      {s.tagline}
                    </span>
                  )}
                </div>
              </button>
            ))
          ) : (
            <div className="px-3.5 py-4 text-sm text-slate-500 text-center">
              No spaces available
            </div>
          )}

          {/* Footer */}
          <div className="px-3.5 py-2.5 border-t border-white/[0.08] flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {spaces.length} space{spaces.length !== 1 ? 's' : ''}
            </span>
            <a
              href="/spaces/new"
              className="text-[11px] text-primary hover:text-primary/80 transition-colors no-underline font-medium"
              onClick={() => setOpen(false)}
            >
              + Create Space
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
