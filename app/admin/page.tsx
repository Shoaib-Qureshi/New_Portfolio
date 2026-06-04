import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  createProjectAction,
  deleteProjectAction,
  logoutAction,
  saveProjectAction,
  saveSharedContentAction,
  saveSiteSettingsAction,
} from '@/app/admin/actions';
import { SaveButton } from '@/app/admin/save-button';
import { isAdminAuthenticated } from '@/lib/auth';
import { getPortfolioContent } from '@/lib/content-store';
import { iconOptions, projectCategories, type GalleryImage, type Project } from '@/lib/content-types';

export const dynamic = 'force-dynamic';

// ── Helpers ──────────────────────────────────────────────────────────────────

function joinHighlights(project: Project) {
  return project.highlights.map((item) => `${item.metric} | ${item.label}`).join('\n');
}
function joinProcess(project: Project) {
  return project.process.map((item) => `${item.phase} | ${item.title} | ${item.detail}`).join('\n');
}

// ── Design tokens ─────────────────────────────────────────────────────────────

function inputCls() {
  return 'h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none transition focus:border-white/30 focus:bg-white/[0.06] placeholder:text-white/25';
}
function textareaCls() {
  return 'w-full min-h-28 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-white outline-none transition focus:border-white/30 focus:bg-white/[0.06] resize-y';
}
function sectionCard(className = '') {
  return `rounded-2xl border border-white/10 bg-white/[0.035] p-5 sm:p-6 ${className}`;
}

function sectionLabel() {
  return 'text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40';
}

// ── Reusable form components ─────────────────────────────────────────────────

function Field({ label, name, defaultValue, type = 'text', placeholder }: {
  label: string; name: string; defaultValue?: string; type?: string; placeholder?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className={sectionLabel()}>{label}</span>
      <input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} className={inputCls()} />
    </label>
  );
}

function TextArea({ label, name, defaultValue, hint }: {
  label: string; name: string; defaultValue?: string; hint?: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className={sectionLabel()}>{label}</span>
      <textarea name={name} defaultValue={defaultValue} className={textareaCls()} />
      {hint && <span className="text-[11px] leading-5 text-white/30">{hint}</span>}
    </label>
  );
}

function SelectField({ label, name, defaultValue, options }: {
  label: string; name: string; defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="grid gap-1.5">
      <span className={sectionLabel()}>{label}</span>
      <select name={name} defaultValue={defaultValue} className={inputCls()}>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#0d0f14]">{o.label}</option>
        ))}
      </select>
    </label>
  );
}

// ── Toggle switch — ON = visible ─────────────────────────────────────────────

// Toggle uses group-has-[input:checked]: — pure CSS, no JS, works in Server Components.
// The checkbox is the source of truth; all visual states derive from it via :has().
function VisibilityToggle({ name, value, label, sub, isVisible }: {
  name: string; value: string; label: string; sub?: string; isVisible: boolean;
}) {
  return (
    <label className="group flex min-h-[56px] cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3 transition hover:bg-white/[0.045]">
      {/* Checkbox first in DOM — CSS :has() watches it */}
      <input type="checkbox" name={name} value={value} defaultChecked={isVisible} className="sr-only" />
      <div className="min-w-0">
        <span className="block truncate text-sm font-medium text-white/85">{label}</span>
        {sub && <span className="block text-[10px] text-white/35">{sub}</span>}
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        {/* Label text */}
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/28 transition group-has-[input:checked]:text-[var(--accent)]">
          <span className="hidden group-has-[input:checked]:inline">On</span>
          <span className="inline group-has-[input:checked]:hidden">Off</span>
        </span>
        {/* Track */}
        <div className="relative h-6 w-11 rounded-full bg-white/10 transition-colors duration-200 group-has-[input:checked]:bg-[var(--accent)]/30">
          {/* Knob */}
          <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-all duration-200 group-has-[input:checked]:left-[calc(100%-1.25rem)] group-has-[input:checked]:shadow-[0_0_8px_rgba(var(--accent-rgb),0.5)]" />
        </div>
      </div>
    </label>
  );
}

// ── Gallery editor ────────────────────────────────────────────────────────────

function GalleryImagesEditor({ images }: { images: GalleryImage[] }) {
  return (
    <div className={sectionCard()}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={sectionLabel()}>Gallery images</p>
          <p className="mt-1.5 max-w-xl text-xs leading-6 text-white/40">
            Edit each tile. Add an optional click link to show an arrow on the public gallery.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/40">
          {images.length} images
        </span>
      </div>
      <input type="hidden" name="galleryImageCount" value={images.length} />
      <div className="grid gap-4 lg:grid-cols-2">
        {images.map((image, index) => (
          <article key={`${image.src}-${index}`} className="grid gap-4 rounded-xl border border-white/8 bg-black/20 p-4 sm:grid-cols-[120px_1fr]">
            <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30">
              <img src={image.src} alt="" className="aspect-[4/3] w-full object-cover" />
            </div>
            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Title" name={`galleryTitle_${index}`} defaultValue={image.title} />
                <Field label="Label" name={`gallerySub_${index}`} defaultValue={image.sub} />
              </div>
              <Field label="Image URL" name={`gallerySrc_${index}`} defaultValue={image.src} />
              <Field label="Click link (optional)" name={`galleryLink_${index}`} defaultValue={image.link ?? ''} />
              <Field label="Alt text" name={`galleryAlt_${index}`} defaultValue={image.alt} />
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <label className="flex cursor-pointer items-center gap-2 text-xs text-white/50">
                  <input type="checkbox" name={`galleryRemove_${index}`} value="yes" className="accent-white" />
                  Remove this image
                </label>
                {image.src && (
                  <a href={image.src} target="_blank" rel="noreferrer"
                    className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35 transition hover:text-white">
                    Open ↗
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
      <label className="mt-4 grid gap-2 rounded-xl border border-dashed border-white/12 bg-black/15 p-4">
        <span className={sectionLabel()}>Upload new gallery images</span>
        <input name="galleryImageFiles" type="file" accept="image/*" multiple className="text-sm text-white/60" />
        <span className="text-[11px] leading-5 text-white/30">Uploaded images are appended when you save.</span>
      </label>
    </div>
  );
}

// ── Project form ──────────────────────────────────────────────────────────────

function ProjectForm({ project, isNew = false }: { project?: Project; isNew?: boolean }) {
  const fb: Project = project ?? {
    num: '', id: '', title: '', category: 'Apps', tags: [], color: '#F5F5F5',
    desc: '', year: new Date().getFullYear().toString(), role: '', impact: '',
    iconKey: 'workflow', image: { src: '', alt: '' }, processImage: { src: '', alt: '' },
    challenge: '', solution: '', highlights: [], process: [],
  };
  return (
    <form action={isNew ? createProjectAction : saveProjectAction} className="grid gap-5">
      {!isNew && <input type="hidden" name="currentId" value={fb.id} />}

      {/* Basics */}
      <div className={sectionCard()}>
        <p className={`${sectionLabel()} mb-4`}>Basics</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Order #" name="num" defaultValue={fb.num} />
          <Field label="Slug / URL" name="id" defaultValue={fb.id} />
          <Field label="Title" name="title" defaultValue={fb.title} />
          <div className="grid gap-3">
            <Field label="Year" name="year" defaultValue={fb.year} />
            <label className="flex cursor-pointer items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-white/50">
              <input type="checkbox" name="showYear" value="true" defaultChecked={fb.showYear !== false} className="accent-white" />
              Show year on card
            </label>
          </div>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="grid gap-1.5">
            <span className={sectionLabel()}>Category</span>
            <input name="category" list="cat-suggestions" defaultValue={fb.category}
              placeholder="Apps, Brand…" className={inputCls()} />
            <datalist id="cat-suggestions">
              {projectCategories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </label>
          <SelectField label="Icon (preset)" name="iconKey" defaultValue={fb.iconKey}
            options={iconOptions.map((o) => ({ value: o.key, label: o.label }))} />
          <Field label="Accent color" name="color" type="color" defaultValue={fb.color} />
          <Field label="Tags (comma-separated)" name="tags" defaultValue={fb.tags.join(', ')} />
        </div>
        <div className="mt-4">
          <label className="grid gap-1.5">
            <span className={sectionLabel()}>Custom icon SVG <span className="normal-case text-white/25">(overrides preset, paste full &lt;svg&gt; tag)</span></span>
            <textarea name="customIcon" defaultValue={fb.customIcon ?? ''}
              placeholder='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" …>…</svg>'
              className={`${textareaCls()} min-h-[72px] font-mono text-xs`} />
          </label>
        </div>
      </div>

      {/* Copy */}
      <div className={sectionCard()}>
        <p className={`${sectionLabel()} mb-4`}>Card and case-study copy</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <TextArea label="Short description" name="desc" defaultValue={fb.desc} />
          <TextArea label="Role" name="role" defaultValue={fb.role} />
          <TextArea label="Impact" name="impact" defaultValue={fb.impact} />
          <Field label="Live link" name="link" defaultValue={fb.link ?? ''} placeholder="https://…" />
          <TextArea label="Challenge" name="challenge" defaultValue={fb.challenge} />
          <TextArea label="Solution" name="solution" defaultValue={fb.solution} />
        </div>
      </div>

      {/* Images */}
      <div className={sectionCard()}>
        <p className={`${sectionLabel()} mb-4`}>Images</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-4 rounded-xl border border-white/8 p-4">
            <Field label="Project image URL" name="imageSrc" defaultValue={fb.image.src} />
            <Field label="Project image alt" name="imageAlt" defaultValue={fb.image.alt} />
            <label className="grid gap-1.5">
              <span className={sectionLabel()}>Or upload project image</span>
              <input name="imageFile" type="file" accept="image/*" className="text-sm text-white/60" />
            </label>
          </div>
          <div className="grid gap-4 rounded-xl border border-white/8 p-4">
            <Field label="Process image URL" name="processImageSrc" defaultValue={fb.processImage.src} />
            <Field label="Process image alt" name="processImageAlt" defaultValue={fb.processImage.alt} />
            <label className="grid gap-1.5">
              <span className={sectionLabel()}>Or upload process image</span>
              <input name="processImageFile" type="file" accept="image/*" className="text-sm text-white/60" />
            </label>
          </div>
        </div>
      </div>

      {/* Repeaters */}
      <div className={sectionCard()}>
        <p className={`${sectionLabel()} mb-4`}>Repeaters</p>
        <div className="grid gap-4 lg:grid-cols-2">
          <TextArea label="Highlights: metric | label" name="highlights" defaultValue={joinHighlights(fb)}
            hint="One item per line, columns separated by |" />
          <TextArea label="Process: phase | title | detail" name="process" defaultValue={joinProcess(fb)}
            hint="One item per line, columns separated by |" />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <SaveButton>{isNew ? 'Add project' : 'Save project'}</SaveButton>
      </div>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect('/admin/login');
  const content = getPortfolioContent();

  const stats = [
    { label: 'Projects', value: content.projects.length, href: '#projects' },
    { label: 'Gallery', value: content.galleryImages.length, href: '#shared-content' },
    { label: 'Timeline', value: content.timeline.length, href: '#shared-content' },
    { label: 'Testimonials', value: content.testimonials.length, href: '#shared-content' },
    { label: 'Hidden', value: content.siteSettings.hiddenSections.length + content.siteSettings.hiddenProjects.length, href: '#site-settings' },
  ];

  return (
    <main className="admin-shell min-h-screen cursor-auto bg-[#06080d] text-[#f5f5f5]">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <header className={`${sectionCard('mb-6')}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className={sectionLabel()}>Portfolio CMS</p>
              <h1 className="mt-2 text-3xl font-light tracking-[-0.04em] text-white sm:text-4xl">Admin</h1>
              <p className="mt-1.5 text-sm text-white/40">Changes are live immediately after saving.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/" target="_blank"
                className="flex h-10 items-center rounded-full border border-white/10 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55 transition hover:border-white/25 hover:text-white">
                View site
              </Link>
              <form action={logoutAction}>
                <button className="flex h-10 cursor-pointer items-center rounded-full border border-white/10 px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55 transition hover:border-white/25 hover:text-white">
                  Logout
                </button>
              </form>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {stats.map(({ label, value, href }) => (
              <a key={label} href={href}
                className="group rounded-xl border border-white/8 bg-black/20 p-3.5 transition hover:border-white/20 hover:bg-white/[0.05]">
                <div className="text-2xl font-light tracking-[-0.04em] text-white">{value}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/38 group-hover:text-white/55 transition">{label}</div>
              </a>
            ))}
          </div>
        </header>

        {/* ── Add project ── */}
        <section className="mb-6">
          <details className={sectionCard()}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-light tracking-[-0.03em] text-white">Add new project</h2>
                <p className="mt-1 text-xs text-white/38">The slug becomes the case-study URL, e.g. /work/my-project.</p>
              </div>
              <span className="rounded-full border border-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                Open
              </span>
            </summary>
            <div className="mt-6 border-t border-white/8 pt-6">
              <ProjectForm isNew />
            </div>
          </details>
        </section>

        {/* ── Projects ── */}
        <section id="projects" className="mb-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-light tracking-[-0.03em] text-white">Projects</h2>
              <p className="mt-1 text-xs text-white/38">Tap a card to edit its portfolio card and case-study details.</p>
            </div>
            <span className="text-[10px] text-white/30">{content.projects.length} projects</span>
          </div>
          <div className="grid gap-3">
            {content.projects.map((project) => (
              <details key={project.id} className={sectionCard()}>
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                      {project.category}{project.showYear !== false && project.year ? ` · ${project.year}` : ''}
                    </p>
                    <h3 className="mt-1.5 text-lg font-light tracking-[-0.03em] text-white">{project.title}</h3>
                    <p className="mt-1 max-w-lg text-xs leading-6 text-white/38 line-clamp-2">{project.desc}</p>
                  </div>
                  <span className="mt-1 shrink-0 rounded-full border border-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                    Edit
                  </span>
                </summary>
                <div className="mt-6 border-t border-white/8 pt-6">
                  <ProjectForm project={project} />
                  {/* Delete zone */}
                  <div className="mt-5 rounded-xl border border-red-400/18 bg-red-400/[0.04] p-4">
                    <form action={deleteProjectAction}>
                      <input type="hidden" name="currentId" value={project.id} />
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs text-red-100/60">
                          Permanently delete <strong className="text-red-100/80">{project.title}</strong> from the portfolio.
                        </p>
                        <div className="flex flex-wrap items-center gap-3">
                          <label className="flex cursor-pointer items-center gap-2 text-xs text-red-100/55">
                            <input type="checkbox" name="confirmDelete" value="delete" className="accent-red-400" />
                            Confirm
                          </label>
                          <button className="cursor-pointer rounded-full border border-red-300/30 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-red-200/70 transition hover:border-red-300/55 hover:text-red-200">
                            Delete project
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* ── Visibility ── */}
        <section id="site-settings" className="mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-light tracking-[-0.03em] text-white">Visibility</h2>
            <p className="mt-1 text-xs text-white/38">Toggle sections and project cards on or off. Changes take effect after saving.</p>
          </div>
          <form action={saveSiteSettingsAction} className={sectionCard('grid gap-6')}>
            {/* Sections */}
            <div>
              <p className={`${sectionLabel()} mb-3`}>Sections</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(['testimonials', 'work', 'about', 'plugins', 'contact'] as const).map((id) => (
                  <VisibilityToggle
                    key={id}
                    name="visibleSections"
                    value={id}
                    label={id.charAt(0).toUpperCase() + id.slice(1)}
                    isVisible={!content.siteSettings.hiddenSections.includes(id)}
                  />
                ))}
              </div>
            </div>
            {/* Project cards */}
            <div>
              <p className={`${sectionLabel()} mb-3`}>Project cards</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {content.projects.map((project) => (
                  <VisibilityToggle
                    key={project.id}
                    name="visibleProjects"
                    value={project.id}
                    label={project.title}
                    sub={project.category}
                    isVisible={!content.siteSettings.hiddenProjects.includes(project.id)}
                  />
                ))}
              </div>
            </div>
            <div>
              <SaveButton>Save visibility</SaveButton>
            </div>
          </form>
        </section>

        {/* ── Shared content ── */}
        <section id="shared-content" className="mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-light tracking-[-0.03em] text-white">Shared content</h2>
            <p className="mt-1 text-xs text-white/38">Gallery, skills, marquee, timeline, and testimonials.</p>
          </div>
          {/* No encType — React 19 handles multipart automatically for Server Actions */}
          <form action={saveSharedContentAction} className={sectionCard('grid gap-5')}>
            <GalleryImagesEditor images={content.galleryImages} />
            <TextArea label="Skills — one per line" name="skills" defaultValue={content.skills.join('\n')} />
            <TextArea label="Marquee — one per line" name="marquee" defaultValue={content.marquee.join('\n')} />
            <TextArea
              label="Timeline — period | title | place | iconKey | detail"
              name="timeline"
              defaultValue={content.timeline.map((item) =>
                `${item.period} | ${item.title} | ${item.place} | ${item.iconKey} | ${item.detail}`).join('\n')}
              hint="One entry per line, columns separated by |"
            />
            <TextArea
              label="Testimonials — name | title | initials | quote"
              name="testimonials"
              defaultValue={content.testimonials.map((item) =>
                `${item.name} | ${item.title} | ${item.initials} | ${item.quote}`).join('\n')}
              hint="One entry per line, columns separated by |"
            />
            <div>
              <SaveButton>Save shared content</SaveButton>
            </div>
          </form>
        </section>

      </div>
    </main>
  );
}
