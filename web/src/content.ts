// All site content comes from content-plan/content.json at the repo root; keys starting with "_" are docs only.
import raw from '../../content-plan/content.json'

export interface SocialLink {
  id: string
  label?: string
  href?: string
}

export interface ResumeGroup {
  heading?: string
  logoImg?: string
  sub?: string
  items?: string[]
  linkIds?: string[]
  link?: string
}

export interface ResumeEntry {
  period?: string
  place?: string
  role?: string
  logo?: { src?: string; alt?: string }
  points?: string[]
  groups?: ResumeGroup[]
}

export interface WorkItem {
  name: string
  meta?: string
  tags?: string[]
  link?: string
  slug?: string
}

export interface WorkGroup {
  heading?: string
  items?: string[]
}

export interface WorkSection {
  id: string
  no?: string
  titleAccent?: string
  title?: string
  company?: string
  location?: string
  tagline?: string
  coverImage?: string
  items?: WorkItem[]
  groups?: WorkGroup[]
  awards?: string[]
  footer?: string
}

export interface WorkDetail {
  slug: string
  title?: string
  banner?: string
  role?: string
  tags?: string[]
  link?: string
  linkLabel?: string
  body?: string
}

export interface WorksLabels {
  title?: string
  closeLabel?: string
  hint?: string
  awardsLabel?: string
  visitLabel?: string
  detailPlaceholder?: string
  phImageLabel?: string
  phButtonLabel?: string
}

export interface SiteContent {
  site: { title?: string }
  hero: {
    aboutHeading?: string
    aboutParagraphs?: string[]
    scrollCueLabel?: string
    cornerMeta?: {
      name?: string
      role?: string
      tagline?: string
      focusLine?: string
      location?: string
    }
  }
  socialLinks?: SocialLink[]
  resume: { title?: string; entries?: ResumeEntry[] }
  works: { uiLabels?: WorksLabels; sections?: WorkSection[] }
  workDetails?: WorkDetail[]
  model: { glbPath: string; focusPoints: string[]; framesPerNode?: number }
}

export const content = raw as unknown as SiteContent

export const FOCUS_POINTS: readonly string[] = content.model.focusPoints
export const FRAMES_PER_NODE = content.model.framesPerNode || 50

// Resolve a content.json asset path (relative to web/public/, leading "/" optional) against the deploy base.
export function asset(path?: string): string | undefined {
  if (!path) return undefined
  if (/^([a-z][a-z0-9+.-]*:|\/\/)/i.test(path)) return path
  return import.meta.env.BASE_URL + path.replace(/^\/+/, '')
}

export function nonEmpty<T>(list?: T[]): list is T[] {
  return Array.isArray(list) && list.length > 0
}

if (import.meta.env.DEV && (content.resume.entries?.length ?? 0) !== FOCUS_POINTS.length) {
  console.warn(
    `[content.json] resume.entries has ${content.resume.entries?.length ?? 0} items but model.focusPoints has ${FOCUS_POINTS.length}; they must match for the camera to line up with each entry.`
  )
}
