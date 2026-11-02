import HeaderSessionControls from "@/components/header-session-controls";

export default function GlobalHeader() {
  return (
    <header className="w-full border-b border-slate-900/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="text-sm font-semibold tracking-wide text-slate-900">PM Intelligence Hub</div>

        <HeaderSessionControls />
      </div>
    </header>
  );
}

