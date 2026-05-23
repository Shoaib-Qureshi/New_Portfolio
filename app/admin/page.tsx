import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  createProjectAction,
  deleteProjectAction,
  logoutAction,
  saveProjectAction,
  saveSharedContentAction,
} from '@/app/admin/actions';
import { isAdminAuthenticated } from '@/lib/auth';
import { getPortfolioContent } from '@/lib/content-store';
import { iconOptions, projectCategories, type Project } from '@/lib/content-types';

export const dynamic = 'force-dynamic';

function joinHighlights(project: Project) {
  return project.highlights.map((item) => `${item.metric} | ${item.label}`).join('\n');
}

function joinProcess(project: Project) {
  return project.process.map((item) => `${item.phase} | ${item.title} | ${item.detail}`).join('\n');
}

function inputClass() {
  return 'h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-white outline-none transition focus:border-[var(--accent)]';
}

function textareaClass() {
  return 'min-h-28 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-[var(--accent)]';
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] uppercase tracking-[0.18em] text-white/42">{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} className={inputClass()} />
    </label>
  );
}

function TextArea({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] uppercase tracking-[0.18em] text-white/42">{label}</span>
      <textarea name={name} defaultValue={defaultValue} className={textareaClass()} />
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="grid gap-2">
      <span className="text-[10px] uppercase tracking-[0.18em] text-white/42">{label}</span>
      <select name={name} defaultValue={defaultValue} className={inputClass()}>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0d0f14]">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ProjectForm({ project, isNew = false }: { project?: Project; isNew?: boolean }) {
  const fallback: Project = project ?? {
    num: '',
    id: '',
    title: '',
    category: 'Apps',
    tags: [],
    color: '#F5F5F5',
    desc: '',
    year: new Date().getFullYear().toString(),
    role: '',
    impact: '',
    iconKey: 'workflow',
    image: { src: '', alt: '' },
    processImage: { src: '', alt: '' },
    challenge: '',
    solution: '',
    highlights: [],
    process: [],
  };

  return (
    <form
      action={isNew ? createProjectAction : saveProjectAction}
      className="grid gap-6"
    >
      {!isNew && <input type="hidden" name="currentId" value={fallback.id} />}

      <div className="rounded-[22px] border border-white/10 bg-black/15 p-4">
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Basics
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          <Field label="Order number" name="num" defaultValue={fallback.num} />
          <Field label="Slug / URL" name="id" defaultValue={fallback.id} />
          <Field label="Title" name="title" defaultValue={fallback.title} />
          <Field label="Year" name="year" defaultValue={fallback.year} />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-4">
          <SelectField
            label="Category"
            name="category"
            defaultValue={fallback.category}
            options={projectCategories.map((category) => ({ value: category, label: category }))}
          />
          <SelectField
            label="Icon"
            name="iconKey"
            defaultValue={fallback.iconKey}
            options={iconOptions.map((option) => ({ value: option.key, label: option.label }))}
          />
          <Field label="Accent color" name="color" type="color" defaultValue={fallback.color} />
          <Field label="Tags, comma-separated" name="tags" defaultValue={fallback.tags.join(', ')} />
        </div>
      </div>

      <div className="rounded-[22px] border border-white/10 bg-black/15 p-4">
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Card and case-study copy
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <TextArea label="Short description" name="desc" defaultValue={fallback.desc} />
          <TextArea label="Role" name="role" defaultValue={fallback.role} />
          <TextArea label="Impact" name="impact" defaultValue={fallback.impact} />
          <Field label="Live link" name="link" defaultValue={fallback.link ?? ''} />
          <TextArea label="Challenge" name="challenge" defaultValue={fallback.challenge} />
          <TextArea label="Solution" name="solution" defaultValue={fallback.solution} />
        </div>
      </div>

      <div className="rounded-[22px] border border-white/10 bg-black/15 p-4">
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Images
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-4 rounded-2xl border border-white/8 p-4">
            <Field label="Project image URL" name="imageSrc" defaultValue={fallback.image.src} />
            <Field label="Project image alt" name="imageAlt" defaultValue={fallback.image.alt} />
            <label className="grid gap-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/42">Or upload project image</span>
              <input name="imageFile" type="file" accept="image/*" className="text-sm text-white/65" />
            </label>
          </div>
          <div className="grid gap-4 rounded-2xl border border-white/8 p-4">
            <Field label="Process image URL" name="processImageSrc" defaultValue={fallback.processImage.src} />
            <Field label="Process image alt" name="processImageAlt" defaultValue={fallback.processImage.alt} />
            <label className="grid gap-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/42">Or upload process image</span>
              <input name="processImageFile" type="file" accept="image/*" className="text-sm text-white/65" />
            </label>
          </div>
        </div>
      </div>

      <div className="rounded-[22px] border border-white/10 bg-black/15 p-4">
        <div className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Repeaters
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <TextArea label="Highlights: metric | label" name="highlights" defaultValue={joinHighlights(fallback)} />
          <TextArea label="Process: phase | title | detail" name="process" defaultValue={joinProcess(fallback)} />
        </div>
        <p className="mt-3 text-xs leading-6 text-white/38">
          Add each item on a new line. Use the vertical bar to separate columns.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button className="rounded-full bg-[var(--accent)] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-black">
          {isNew ? 'Add project' : 'Save project'}
        </button>
      </div>
    </form>
  );
}

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login');
  const content = getPortfolioContent();

  return (
    <main className="admin-shell min-h-screen cursor-auto bg-[#06080d] px-5 py-8 text-[#f5f5f5] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[30px] border border-white/10 bg-white/[0.035] p-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
              Portfolio CMS
            </div>
            <h1 className="mt-2 text-5xl font-light tracking-[-0.055em] text-white">Admin dashboard</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">
              Manage the content that appears on the public portfolio. Save buttons update the live site immediately.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/65"
            >
              View site
            </Link>
            <form action={logoutAction}>
              <button className="rounded-full border border-white/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/65">
                Logout
              </button>
            </form>
          </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            {[
              ['Projects', String(content.projects.length), '#projects'],
              ['Skills', String(content.skills.length), '#shared-content'],
              ['Timeline', String(content.timeline.length), '#shared-content'],
              ['Testimonials', String(content.testimonials.length), '#shared-content'],
            ].map(([label, value, href]) => (
              <a key={label} href={href} className="rounded-2xl border border-white/10 bg-black/18 p-4 transition hover:border-[var(--accent)]">
                <div className="text-3xl font-light tracking-[-0.05em] text-white">{value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-white/40">{label}</div>
              </a>
            ))}
          </div>
        </header>

        <section className="py-8">
          <details className="rounded-[28px] border border-white/10 bg-white/[0.03] p-5">
            <summary className="cursor-pointer list-none text-3xl font-light tracking-[-0.04em] text-white">
              Add a new project
              <span className="ml-3 text-sm text-white/38">Click to open</span>
            </summary>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">
              Fill the basics first. The slug becomes the case-study URL, for example /work/my-project.
            </p>
            <div className="mt-5">
            <ProjectForm isNew />
            </div>
          </details>
        </section>

        <section id="projects" className="py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-light tracking-[-0.04em] text-white">Projects</h2>
              <p className="mt-2 text-sm text-white/42">Open a project card to edit its portfolio card and case-study details.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-6">
            {content.projects.map((project) => (
              <details key={project.id} className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5">
                <summary className="cursor-pointer list-none">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.2em] text-white/36">
                        {project.num} / {project.category} / {project.year}
                      </div>
                      <h3 className="mt-2 text-3xl font-light tracking-[-0.045em] text-white">{project.title}</h3>
                      <p className="mt-2 max-w-2xl text-sm leading-7 text-white/45">{project.desc}</p>
                    </div>
                    <div className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
                      Edit
                    </div>
                  </div>
                </summary>
                <div className="mt-6 border-t border-white/10 pt-6">
                <ProjectForm project={project} />
                <form action={deleteProjectAction} className="rounded-[20px] border border-red-400/20 bg-red-400/5 p-4">
                  <input type="hidden" name="currentId" value={project.id} />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-red-100/70">
                      Delete <span className="text-red-100">{project.title}</span> from the public portfolio.
                    </p>
                    <label className="flex items-center gap-2 text-xs text-red-100/70">
                      <input type="checkbox" name="confirmDelete" value="delete" />
                      Confirm delete
                    </label>
                    <button className="rounded-full border border-red-300/35 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-red-100">
                      Delete project
                    </button>
                  </div>
                </form>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section id="shared-content" className="py-8">
          <h2 className="text-3xl font-light tracking-[-0.04em] text-white">Shared content</h2>
          <form action={saveSharedContentAction} className="mt-5 grid gap-5 rounded-[24px] border border-white/10 bg-white/[0.035] p-5">
            <TextArea label="Skills: one per line" name="skills" defaultValue={content.skills.join('\n')} />
            <TextArea label="Marquee: one per line" name="marquee" defaultValue={content.marquee.join('\n')} />
            <TextArea
              label="Timeline: period | title | place | iconKey | detail"
              name="timeline"
              defaultValue={content.timeline
                .map((item) => `${item.period} | ${item.title} | ${item.place} | ${item.iconKey} | ${item.detail}`)
                .join('\n')}
            />
            <TextArea
              label="Testimonials: name | title | initials | quote"
              name="testimonials"
              defaultValue={content.testimonials
                .map((item) => `${item.name} | ${item.title} | ${item.initials} | ${item.quote}`)
                .join('\n')}
            />
            <button className="w-max rounded-full bg-[var(--accent)] px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-black">
              Save shared content
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
