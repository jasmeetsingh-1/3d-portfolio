import { useEffect, useRef, useState, type Ref } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { content, asset, nonEmpty, type WorkItem, type WorkSection, type WorksLabels } from '../content'
import { getWorkDoc } from '../data/workDocs'

const EASE = [0.22, 1, 0.36, 1]

// Root-relative URLs in markdown (/works/...) resolve against the deploy base, so they also work from a subdirectory.
const mdUrl = (url: string) => (url.startsWith('/') && !url.startsWith('//') ? asset(url)! : defaultUrlTransform(url))

// One row of the minimal list: work name on the left, stats (views/tags) on the right, hairline separators; the whole row opens the full-screen detail
function WorkLine({ item, onOpen }: { item: WorkItem; onOpen: (item: WorkItem) => void }) {
  const hasMeta = item.meta || (item.tags && item.tags.length)
  return (
    <li className="wk-line">
      <button className="wk-line-btn" onClick={() => onOpen(item)}>
        <span className="wk-line-name">{item.name}</span>
        {hasMeta && (
          <span className="wk-line-meta">
            {item.meta && <span className="wk-line-num">{item.meta}</span>}
            {item.tags &&
              item.tags.map((t, i) => (
                <span key={i} className="wk-line-tag">
                  {t}
                </span>
              ))}
          </span>
        )}
      </button>
    </li>
  )
}

// A full-height section card: full-height image on the left, text on the right (number + title + list)
function SectionCard({
  section,
  data,
  onOpen,
}: {
  section: WorkSection
  data: WorksLabels
  onOpen: (item: WorkItem) => void
}) {
  const [coverError, setCoverError] = useState(false)
  const cover = asset(section.coverImage)
  return (
    <div className="wk-card">
      <div className="wk-card-head">
        <span className="wk-card-no">{section.no}</span>
        <h3 className="wk-card-title">
          {section.titleAccent && <span className="wk-card-title-accent">{section.titleAccent} </span>}
          {section.title}
        </h3>
        {(section.company || section.location) && (
          <span className="wk-card-company">
            {section.company}
            {section.company && section.location && ' - '}
            {section.location && <em>{section.location}</em>}
          </span>
        )}
        {section.tagline && <span className="wk-card-tagline">{section.tagline}</span>}
      </div>
      <div className="wk-card-cover">
        {cover && !coverError ? (
          <img src={cover} alt="" onError={() => setCoverError(true)} />
        ) : (
          <div className="wk-card-cover-ph" aria-hidden="true">
            <span className="wk-card-cover-no">{section.no}</span>
          </div>
        )}
      </div>
      <SectionWorks section={section} data={data} onOpen={onOpen} />
    </div>
  )
}

// A section's work list (flat items / grouped groups / awards · footer small print)
function SectionWorks({
  section,
  data,
  onOpen,
}: {
  section: WorkSection
  data: WorksLabels
  onOpen: (item: WorkItem) => void
}) {
  return (
    <div className="wk-card-body">
      {nonEmpty(section.items) && (
        <ul className="wk-list">
          {section.items.map((it, i) => (
            <WorkLine key={i} item={it} onOpen={onOpen} />
          ))}
        </ul>
      )}

      {nonEmpty(section.groups) &&
        section.groups.map((g, gi) => (
          <div key={gi} className="wk-sub">
            {g.heading && <div className="wk-sub-head">{g.heading}</div>}
            <ul className="wk-list">
              {(g.items ?? []).map((it, i) => (
                <WorkLine key={i} item={{ name: it }} onOpen={onOpen} />
              ))}
            </ul>
          </div>
        ))}

      {(nonEmpty(section.awards) || section.footer) && (
        <div className="wk-foot">
          {nonEmpty(section.awards) && (
            <p className="wk-foot-line">
              {data.awardsLabel && <span className="wk-foot-label">{data.awardsLabel}</span>}
              <span className="wk-foot-val accent">{section.awards.join('  ·  ')}</span>
            </p>
          )}
          {section.footer && <p className="wk-foot-line">{section.footer}</p>}
        </div>
      )}
    </div>
  )
}

// Full-screen immersive detail: renders the work's md (banner + title + markdown body + external link);
// without an md, falls back to a placeholder banner + a meta/tags summary
function WorkDetail({
  item,
  data,
  onClose,
}: {
  item: WorkItem
  data: WorksLabels
  onClose: () => void
}) {
  const [bannerError, setBannerError] = useState(false)
  const doc = getWorkDoc(item.slug)
  const title = (doc && doc.title) || item.name
  const banner = asset(doc?.banner)
  // With an md detail show the full info; without one, the detail keeps only the title + the shared placeholder copy
  const link = doc ? doc.link || item.link : null
  const tags = doc ? doc.tags || item.tags : null
  // The subtitle excludes the year; tags are shown separately as badges
  const sub = doc ? [item.meta, doc.role].filter(Boolean).join('  ·  ') : ''

  return (
    <>
      <motion.div
        className="wk-detail-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      />
      <motion.div
        className="wk-detail"
        initial={{ opacity: 0, scale: 0.985, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.99, y: 6 }}
        transition={{ duration: 0.42, ease: EASE }}
      >
        <button className="wk-detail-close" onClick={onClose} aria-label={data.closeLabel}>
          ✕
        </button>

        {banner && !bannerError ? (
          <div className="wk-detail-banner">
            <img src={banner} alt={title} onError={() => setBannerError(true)} />
          </div>
        ) : (
          <div className="wk-detail-banner is-ph" aria-hidden="true">
            <span className="wk-detail-ph-text">{title}</span>
          </div>
        )}

        <article className="wk-detail-article">
          <header className="wk-detail-head">
            <h3 className="wk-detail-title">{title}</h3>
            {sub && <div className="wk-detail-sub">{sub}</div>}
            {tags && tags.length > 0 && (
              <div className="wk-detail-tags">
                {tags.map((t, i) => (
                  <span key={i} className="wk-badge">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </header>

          {doc && doc.body ? (
            <div className="wk-md">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} urlTransform={mdUrl}>
                {doc.body}
              </ReactMarkdown>
            </div>
          ) : (
            // No md: demo the components a detail page supports — intro text + image/video placeholder + link button
            <>
              <p className="wk-detail-desc">{data.detailPlaceholder}</p>
              <div className="wk-detail-ph-img" aria-hidden="true">
                <span className="wk-detail-ph-img-label">{data.phImageLabel}</span>
              </div>
              <span className="wk-detail-link is-ph" role="button" aria-disabled="true">
                {data.phButtonLabel} <span aria-hidden="true">↗</span>
              </span>
            </>
          )}

          {link && (
            <a
              className="wk-detail-link"
              href={link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {doc?.linkLabel || data.visitLabel} <span aria-hidden="true">↗</span>
            </a>
          )}
        </article>
      </motion.div>
    </>
  )
}

export default function Works({ innerRef }: { innerRef: Ref<HTMLElement> }) {
  const data: WorksLabels = content.works.uiLabels ?? {}
  const sections = content.works.sections ?? []
  const count = sections.length

  const [active, setActive] = useState<WorkItem | null>(null) // the work item whose detail is currently open

  // Pinned vertical scroll → horizontal pan: measure how far the row of cards can actually pan (px); vertical scroll progress → pan
  const galleryRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: galleryRef,
    offset: ['start start', 'end end'],
  })

  // actual track width − viewport width = distance to pan; re-measured when the size changes
  const [scrollRange, setScrollRange] = useState(0)
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const measure = () => setScrollRange(Math.max(0, el.scrollWidth - window.innerWidth))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [count])

  // Interpolate px numbers (smoother than vw strings); vertical scroll distance maps 1:1 to the pan
  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollRange])
  // The "Keep scrolling" hint fades out once the pan reaches the end
  const hintOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0])

  // Lock scrolling while a detail is open + close on ESC
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null)
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [active])

  return (
    <section className="works" ref={innerRef}>
      <div
        className="wk-gallery"
        ref={galleryRef}
        style={{ height: `calc(100vh + ${scrollRange}px)` }}
      >
        <div className="wk-gallery-sticky">
          {data.title && <span className="wk-gallery-title">{data.title}</span>}

          <motion.div className="wk-track" ref={trackRef} style={{ x }}>
            {sections.map((s) => (
              <SectionCard key={s.id} section={s} data={data} onOpen={setActive} />
            ))}
          </motion.div>

          <div className="wk-progress" aria-hidden="true">
            <motion.div className="wk-progress-fill" style={{ scaleX: scrollYProgress }} />
          </div>
          <motion.span className="wk-hint" style={{ opacity: hintOpacity }} aria-hidden="true">
            {data.hint}
          </motion.span>
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <WorkDetail
            key={active.slug || active.name}
            item={active}
            data={data}
            onClose={() => setActive(null)}
          />
        )}
      </AnimatePresence>
    </section>
  )
}
