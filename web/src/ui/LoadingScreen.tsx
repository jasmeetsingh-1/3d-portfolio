import { useEffect, useRef, useState } from 'react'
import { useProgress } from '@react-three/drei'

// Full-screen loading mask: reads three's LoadingManager progress (useProgress),
// fades out and unmounts once the model/textures have all loaded (progress has hit 100), so the scene is ready on entry.
// Purely animated UI: a spinning ring that fills with real progress, no text.
// CSS transitions + setTimeout control fade-out/unmount (doesn't rely on rAF, so it's reliable in background/offscreen tabs).
export default function LoadingScreen() {
  const { progress } = useProgress()
  // reached: whether progress has ever hit 100% (one-way false→true, avoids jitter from batched loading)
  const [reached, setReached] = useState(false)
  const [hiding, setHiding] = useState(false) // fade-out started
  const [removed, setRemoved] = useState(false) // fully unmounted
  // Track the highest progress so the ring never shrinks back as resources register in batches
  const peak = useRef(0)
  peak.current = Math.max(peak.current, Math.min(Math.max(progress, 0), 100))

  useEffect(() => {
    if (progress >= 100) setReached(true)
  }, [progress])

  // After hitting 100%: pause briefly → fade out → unmount (one-shot, locked against later progress changes)
  useEffect(() => {
    if (!reached) return
    const t1 = setTimeout(() => setHiding(true), 400)
    const t2 = setTimeout(() => setRemoved(true), 1100)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [reached])

  if (removed) return null

  const R = 34
  const C = 2 * Math.PI * R
  const offset = C * (1 - peak.current / 100)

  return (
    <div className={`loading-screen${hiding ? ' is-hidden' : ''}`} aria-hidden="true">
      <div className="loading-ring">
        <svg viewBox="0 0 80 80">
          <circle className="lr-track" cx="40" cy="40" r={R} />
          <circle
            className="lr-arc"
            cx="40"
            cy="40"
            r={R}
            style={{ strokeDasharray: C, strokeDashoffset: offset }}
          />
        </svg>
      </div>
    </div>
  )
}
