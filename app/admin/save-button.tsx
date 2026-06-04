'use client';

import { useFormStatus } from 'react-dom';

export function SaveButton({ children = 'Save changes' }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-xs font-bold uppercase tracking-[0.18em] text-black transition hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending && (
        <svg className="size-3.5 shrink-0 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {pending ? 'Saving…' : children}
    </button>
  );
}
