'use client';

import * as React from 'react';
import AuthModal from './auth-modal';

export default function GlobalHeader() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <header className="w-full border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="text-sm font-semibold">PMI Hub</div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded bg-black px-3 py-2 text-sm font-medium text-white hover:bg-black/90"
          >
            Log in
          </button>
        </div>
      </header>

      <AuthModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

