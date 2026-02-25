'use client';

import { useState, useRef, useEffect } from 'react';
import { getSpaceIdFromCookie } from '@/lib/spaces';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface SpaceItem {
  id: string;
  name: string;
  tagline: string;
  domain: string;
  logo_url: string | null;
}

export function SpaceSwitcher() {
  const [open, setOpen] = useState(false);
  const [spaces, setSpaces] = useState<SpaceItem[]>([]);
  const [currentSpaceId, setCurrentSpaceId] = useState('default');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentSpaceId(getSpaceIdFromCookie());
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/spaces`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: SpaceItem[]) => setSpaces(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const currentSpace = spaces.find((s) => s.id === currentSpaceId) || {
    id: 'default',
    name: 'rSwag',
    tagline: 'Community Merch, On Demand',
    domain: 'rswag.online',
    logo_url: null,
  };

  if (spaces.length <= 1) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm font-medium bg-white/[0.08] hover:bg-white/[0.12] text-slate-200 transition-colors"
      >
        {currentSpace.logo_url ? (
          <img src={currentSpace.logo_url} alt="" className="w-5 h-5 rounded" />
        ) : (
          <span className="w-5 h-5 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[9px] font-bold text-primary-foreground leading-none flex-shrink-0">
            {currentSpace.name.slice(0, 2)}
          </span>
        )}
        <span className="hidden sm:inline">{currentSpace.name}</span>
        <span className="text-[0.7em] opacity-60">&#9662;</span>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-[260px] rounded-xl bg-slate-800 border border-white/10 shadow-xl shadow-black/30 z-[200]">
          <div className="px-3.5 py-2.5 border-b border-white/[0.08]">
            <div className="text-[0.6rem] font-bold uppercase tracking-widest text-slate-500 select-none">
              Spaces
            </div>
          </div>

          {spaces.map((s) => (
            <a
              key={s.id}
              href={s.domain ? `https://${s.domain}` : '#'}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 text-slate-200 no-underline transition-colors ${
                s.id === currentSpaceId
                  ? 'bg-white/[0.07]'
                  : 'hover:bg-white/[0.04]'
              }`}
              onClick={() => setOpen(false)}
            >
              {s.logo_url ? (
                <img src={s.logo_url} alt="" className="w-7 h-7 rounded-md flex-shrink-0" />
              ) : (
                <span className="w-7 h-7 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-[10px] font-bold text-primary-foreground leading-none flex-shrink-0">
                  {s.name.slice(0, 2)}
                </span>
              )}
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold">{s.name}</span>
                <span className="text-[11px] text-slate-400 truncate">{s.tagline}</span>
              </div>
              {s.id === currentSpaceId && (
                <span className="text-xs text-cyan-400 flex-shrink-0">&#10003;</span>
              )}
            </a>
          ))}

          <div className="px-3.5 py-2 border-t border-white/[0.08] text-center">
            <span className="text-[11px] text-slate-500">
              Each space has its own designs & theme
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
