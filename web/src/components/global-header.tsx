'use client';

import * as React from 'react';
import AuthModal from './auth-modal';

export default function GlobalHeader() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <header className="w-full border-b border-slate-900/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="text-sm font-semibold tracking-wide text-slate-900">PM Intelligence Hub</div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            Log in
          </button>
        </div>
      </header>

      <AuthModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

