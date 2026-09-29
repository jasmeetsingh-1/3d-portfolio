import type { SVGProps } from 'react'

// Simplified single-color platform icons (currentColor) that suit the dark visuals.
// For official multi-color logos, just replace the corresponding path.

export function DouyinIcon(props: SVGProps<SVGSVGElement>) {
  // Music note + flag — Douyin's signature symbol
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M13 3h3a5 5 0 0 0 4.6 4.98V11A8 8 0 0 1 16 9.6V15a6 6 0 1 1-6-6c.34 0 .67.03 1 .08v3.12A3 3 0 1 0 13 15V3z" />
    </svg>
  )
}

export function BilibiliIcon(props: SVGProps<SVGSVGElement>) {
  // TV set + two antennas
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M7 3l3 3M17 3l-3 3" />
      <rect x="3" y="6" width="18" height="13" rx="3.5" />
      <path d="M9 11v2M15 11v2" />
    </svg>
  )
}

export function XiaohongshuIcon(props: SVGProps<SVGSVGElement>) {
  // Rounded square + heart
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M12 16.2c-2.1-1.5-4-3-4-5.1A2.1 2.1 0 0 1 12 9.9a2.1 2.1 0 0 1 4 1.2c0 2.1-1.9 3.6-4 5.1z" fill="currentColor" />
    </svg>
  )
}

function Stroke(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg" {...props} />
  )
}

export function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke {...props}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </Stroke>
  )
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </Stroke>
  )
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke {...props}>
      <path d="M4 4l11.7 16H20L8.3 4H4zM4 20l6.8-7.4M20 4l-6.8 7.4" />
    </Stroke>
  )
}

export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke {...props}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
      <path d="M9.75 15.02l5.75-3.27-5.75-3.27v6.54z" />
    </Stroke>
  )
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01" />
    </Stroke>
  )
}

export function EmailIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 6l-10 7L2 6" />
    </Stroke>
  )
}

export function WebsiteIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </Stroke>
  )
}

export function LinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Stroke {...props}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Stroke>
  )
}

export const SOCIAL_ICONS = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  x: XIcon,
  twitter: XIcon,
  youtube: YoutubeIcon,
  instagram: InstagramIcon,
  email: EmailIcon,
  website: WebsiteIcon,
  douyin: DouyinIcon,
  bilibili: BilibiliIcon,
  xiaohongshu: XiaohongshuIcon,
}

// Any id without its own icon gets a generic link icon.
export function socialIcon(id: string) {
  return SOCIAL_ICONS[id.toLowerCase() as keyof typeof SOCIAL_ICONS] ?? LinkIcon
}
