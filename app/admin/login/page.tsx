import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
import { loginAction } from '@/app/admin/actions';

type Props = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  if (await isAdminAuthenticated()) redirect('/admin');
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#06080d] px-5 text-[#f5f5f5]">
      <form
        action={loginAction}
        className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.035] p-8 shadow-2xl"
      >
        <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Admin</div>
        <h1 className="mt-3 text-4xl font-light tracking-[-0.05em] text-white">Portfolio login</h1>
        <p className="mt-3 text-sm leading-7 text-white/50">
          Sign in to update projects, case studies, testimonials, skills, and timeline content.
        </p>

        {params.error && (
          <div className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
            Invalid username or password.
          </div>
        )}

        <input type="hidden" name="next" value={params.next ?? '/admin'} />
        <label className="mt-7 grid gap-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/42">Username</span>
          <input
            name="username"
            defaultValue="admin"
            className="h-12 rounded-full border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-[var(--accent)]"
          />
        </label>
        <label className="mt-4 grid gap-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-white/42">Password</span>
          <input
            name="password"
            type="password"
            className="h-12 rounded-full border border-white/10 bg-black/20 px-4 text-sm text-white outline-none focus:border-[var(--accent)]"
          />
        </label>
        <button className="mt-7 h-12 w-full rounded-full bg-[var(--accent)] text-xs font-bold uppercase tracking-[0.16em] text-black">
          Sign in
        </button>
        <p className="mt-4 text-xs leading-6 text-white/35">
          Development fallback password is <span className="text-white/60">admin123</span> until
          ADMIN_PASSWORD_HASH is set.
        </p>
      </form>
    </main>
  );
}
