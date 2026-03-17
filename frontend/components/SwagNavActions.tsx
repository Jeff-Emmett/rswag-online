'use client';

import Link from 'next/link';

export function SwagNavActions() {
  return (
    <>
      <Link
        href="/design"
        className="text-sm text-slate-300 hover:text-white transition-colors px-2.5 py-1.5 rounded-md hover:bg-white/[0.06] hidden sm:inline-flex"
      >
        Design
      </Link>
      <Link
        href="/upload"
        className="text-sm text-slate-300 hover:text-white transition-colors px-2.5 py-1.5 rounded-md hover:bg-white/[0.06] hidden sm:inline-flex"
      >
        Upload
      </Link>
      <Link
        href="/hitherdither"
        className="text-sm text-slate-300 hover:text-white transition-colors px-2.5 py-1.5 rounded-md hover:bg-white/[0.06] hidden sm:inline-flex"
      >
        Hitherdither
      </Link>
      <Link
        href="/products"
        className="text-sm text-slate-300 hover:text-white transition-colors px-2.5 py-1.5 rounded-md hover:bg-white/[0.06] hidden sm:inline-flex"
      >
        Shop
      </Link>
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
    </>
  );
}
