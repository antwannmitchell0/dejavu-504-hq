import { useEffect, useState, type ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { useHQ } from "@/lib/store";

export function AppShell({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(() =>
    typeof window === "undefined" ? true : useHQ.persist.hasHydrated(),
  );

  useEffect(() => {
    if (useHQ.persist.hasHydrated()) {
      setReady(true);
      return;
    }
    return useHQ.persist.onFinishHydration(() => setReady(true));
  }, []);

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <div className="pointer-events-none fixed inset-0 hidden lg:block" aria-hidden>
        <img
          src="/artist/portrait.jpg"
          alt=""
          className="h-full w-full scale-110 object-cover opacity-[0.22] blur-3xl"
        />
        <div className="absolute inset-0 bg-bg/80" />
      </div>
      <div className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-bg shadow-card">
        {ready ? (
          children
        ) : (
          <div className="flex min-h-dvh flex-col items-center justify-center gap-3">
            <p className="font-display text-5xl italic text-fg">Deja Vu 504</p>
            <p className="rounded-full bg-accent px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-accent-fg">
              Slime Princess
            </p>
          </div>
        )}
        <BottomNav />
      </div>
    </div>
  );
}

export function Screen({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <main
      className={`page-enter flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom))] ${className}`}
    >
      {children}
    </main>
  );
}
