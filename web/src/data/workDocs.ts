// Work details come from `workDetails` in content-plan/content.json (matched by slug).
// Optional fallback: a markdown file at src/content/works/<slug>.md, used only when content.json has no entry for that slug.
//
// md frontmatter fields (between ---), all optional:
//   title   title (falls back to the work's name in the list)
//   banner  top banner image path (e.g. /works/guqin/banner.jpg; defaults to a gradient placeholder)
//   year    year
//   role    role / responsibility
//   tags    tag array: [Interactive, Tiger Roar Award]
//   link    external link (the "Visit site" button)
//   linkLabel  text of that button (defaults to works.uiLabels.visitLabel)
// The body (after the frontmatter) is markdown: text / images ![](...) / video <video src=...>.
//
// Media (images/videos) go under public/works/ and are referenced with /works/... absolute paths.
// Work items (works.sections[].items in content.json) link to a detail via `slug`; items without one use the placeholder detail.

import { content } from '../content'

export interface WorkDoc {
  slug: string
  title?: string
  banner?: string
  year?: string
  role?: string
  tags?: string[]
  link?: string
  linkLabel?: string
  body?: string
}

// Inline every md file as a raw string at build time
const files = import.meta.glob('../content/works/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// Minimal frontmatter parser (key: value, arrays as [a, b]) — avoids pulling in a library that depends on Buffer
function parseFrontmatter(raw: string): {
  data: Record<string, string | string[]>
  body: string
} {
  const m = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(raw)
  if (!m) return { data: {}, body: raw }
  const data: Record<string, string | string[]> = {}
  for (const line of m[1].split('\n')) {
    const mm = /^([A-Za-z0-9_-]+)\s*:\s*(.*)$/.exec(line.trim())
    if (!mm) continue
    const rawVal = mm[2].trim()
    let val: string | string[]
    if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
      val = rawVal
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
    } else {
      val = rawVal.replace(/^['"]|['"]$/g, '')
    }
    data[mm[1]] = val
  }
  return { data, body: m[2].trim() }
}

const docs: Record<string, WorkDoc> = {}
for (const path in files) {
  const slug = path.split('/').pop()!.replace(/\.md$/, '')
  const { data, body } = parseFrontmatter(files[path])
  docs[slug] = { slug, ...data, body } as WorkDoc
}

for (const d of content.workDetails ?? []) {
  if (d.slug) docs[d.slug] = d
}

export function getWorkDoc(slug?: string): WorkDoc | null {
  return slug ? docs[slug] || null : null
}
