import { cn } from '@/lib/utils';

export function AnimatedShine({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100',
        'before:absolute before:inset-y-[-30%] before:left-[-40%] before:w-1/2 before:rotate-12 before:bg-gradient-to-r before:from-transparent before:via-white/18 before:to-transparent before:blur-sm before:transition-transform before:duration-1000 group-hover:before:translate-x-[280%]',
        className,
      )}
    />
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 inline-flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
      <span className="size-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_18px_var(--accent)]" />
      {children}
    </div>
  );
}
