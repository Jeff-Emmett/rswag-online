'use client';

import Link from 'next/link';
import { AppSwitcher } from '@/components/AppSwitcher';
import { SpaceSwitcher } from '@/components/SpaceSwitcher';
import { AuthButton } from '@/components/AuthButton';

interface HeaderBarProps {
  name: string;
  logoUrl: string | null;
}

export function HeaderBar({ name, logoUrl }: HeaderBarProps) {
  return (
    <header className="border-b border-slate-800 sticky top-0 z-50 bg-background/90 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: App switcher + Space switcher + Logo */}
        <div className="flex items-center gap-1 min-w-0">
          <AppSwitcher current="swag" />
          <SpaceSwitcher />
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg ml-1"
          >
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-7 w-7 rounded" />
            ) : (
              <div className="h-7 w-7 bg-gradient-to-br from-cyan-300 to-amber-300 rounded-lg flex items-center justify-center text-slate-900 text-[10px] font-black leading-none">
                rSw
              </div>
            )}
            <span className="hidden sm:inline">
              <span className="text-primary">r</span>
              {name === 'rSwag' ? 'Swag' : name}
            </span>
          </Link>
        </div>

        {/* Center: Nav links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/design"
            className="text-sm text-slate-300 hover:text-white transition-colors px-2.5 py-1.5 rounded-md hover:bg-white/[0.06] hidden sm:inline-flex"
          >
            Design
          </Link>
          <Link
            href="/upload"
            className="text-sm text-slate-300 hover:text-white transition-colors px-2.5 py-1.5 rounded-md hover:bg-white/[0.06]"
          >
            Upload
          </Link>
          <Link
            href="/products"
            className="text-sm px-4 py-1.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Shop
          </Link>
        </nav>

        {/* Right: Auth + Cart */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <AuthButton />
          </div>
          <Link
            href="/cart"
            className="text-slate-300 hover:text-white transition-colors p-2 rounded-md hover:bg-white/[0.06]"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
