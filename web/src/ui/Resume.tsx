import { motion } from 'framer-motion'
import { socialIcon } from './SocialIcons'
import {
  content,
  asset,
  nonEmpty,
  FOCUS_POINTS,
  type ResumeEntry,
  type ResumeGroup,
  type SocialLink,
} from '../content'

const SOCIAL_LINKS: SocialLink[] = content.socialLinks ?? []

const EASE = [0.22, 1, 0.36, 1]
const containerV = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
}
const itemV = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
}

function Group({ group }: { group: ResumeGroup }) {
  const links = (group.linkIds ?? [])
    .map((id) => SOCIAL_LINKS.find((l) => l.id === id))
    .filter((l): l is SocialLink => !!l && !!l.href)
  const logoImg = asset(group.logoImg)

  return (
    <motion.div className="tl-group" variants={itemV}>
      <div className="tl-group-head">
        {logoImg && (
          <span className="tl-group-logo">
            <img src={logoImg} alt={group.heading || ''} loading="lazy" />
          </span>
        )}
        {group.heading &&
          (group.link ? (
            <a className="about-link" href={group.link} target="_blank" rel="noopener noreferrer">
              {group.heading}
            </a>
          ) : (
            <span>{group.heading}</span>
          ))}
        {group.sub && <span className="tl-group-sub">{group.sub}</span>}
      </div>
      {nonEmpty(group.items) && (
        <ul className="tl-points">
          {group.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )}
      {links.length > 0 && (
        <div className="tl-logos">
          {links.map((l) => {
            const Icon = socialIcon(l.id)
            return (
              <a
                key={l.id}
                className="tl-logo"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={l.label || l.id}
                title={l.label || l.id}
              >
                <Icon />
              </a>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

function Entry({ entry, index }: { entry: ResumeEntry; index: number }) {
  const logoSrc = asset(entry.logo?.src)
  return (
    <motion.div
      className="tl-entry"
      data-point={FOCUS_POINTS[index]}
      variants={containerV}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-12% 0px -12% 0px' }}
    >
      <motion.span className="tl-dot" variants={itemV} aria-hidden="true" />
      {/* tl-body wraps the text content (the dot stays outside as the timeline marker): on mobile it can get a card backing,
          and it hugs the content height, excluding tl-entry's large layout padding.
          It is a plain div (not motion): framer variants pass through it via React context, so the leaf elements are still
          tl-entry's direct stagger children and the entrance animation is identical to before wrapping. */}
      <div className="tl-body">
        {entry.period && (
          <motion.div className="tl-period" variants={itemV}>
            {entry.period}
          </motion.div>
        )}
        <motion.div className="tl-head" variants={itemV}>
          {logoSrc && (
            <span className="tl-logo-chip">
              <img src={logoSrc} alt={entry.logo?.alt || entry.place || ''} loading="lazy" />
            </span>
          )}
          <h3 className="tl-place">{entry.place}</h3>
        </motion.div>
        {entry.role && (
          <motion.div className="tl-role" variants={itemV}>
            {entry.role}
          </motion.div>
        )}
        {nonEmpty(entry.points) && (
          <motion.ul className="tl-points" variants={itemV}>
            {entry.points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </motion.ul>
        )}
        {entry.groups?.map((g, i) => <Group key={i} group={g} />)}
      </div>
    </motion.div>
  )
}

export default function Resume() {
  const { title, entries = [] } = content.resume
  return (
    <section className="resume">
      {title && (
        <motion.h2
          className="resume-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10% 0px' }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          {title}
        </motion.h2>
      )}
      <div className="timeline">
        {entries.map((e, i) => (
          <Entry key={i} entry={e} index={i} />
        ))}
      </div>
    </section>
  )
}
