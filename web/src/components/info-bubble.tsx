'use client';

import * as React from 'react';

type Props = {
  label: string;
  children: React.ReactNode;
};

export function InfoBubble({ label, children }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen((v) => !v)}
        className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-[11px] font-bold text-slate-600 shadow-sm hover:border-slate-300"
      >
        i
      </button>

      {open ? (
        <span className="absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-lg">
          <span className="block font-semibold text-slate-900">{label}</span>
          <span className="mt-1 block leading-relaxed text-slate-600">{children}</span>
          <span className="mt-2 block text-right">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Close
            </button>
          </span>
        </span>
      ) : null}
    </span>
  );
}
