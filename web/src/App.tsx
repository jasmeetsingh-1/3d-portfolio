import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import * as THREE from 'three'
import Scene from './scene/Scene'
import NoiseOverlay from './ui/NoiseOverlay'
import Resume from './ui/Resume'
import Works from './ui/Works'
import LoadingScreen from './ui/LoadingScreen'
import { useStore } from './store'
import { content } from './content'

function Backdrop() {
  // Click on empty space to close the detail view
  const setActive = useStore((s) => s.setActive)
  return (
    <mesh position={[0, 0, -40]} onClick={() => setActive(null)}>
      <planeGeometry args={[600, 300]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

function Hero({ cueOpacity }: { cueOpacity: MotionValue<number> }) {
  const { aboutHeading, aboutParagraphs = [], scrollCueLabel } = content.hero
  const aboutRef = useRef(null)
  // Start early: progress 0 when the top of .about is at 60% of the viewport (offset[0]), progress 1 when it reaches the top
  const { scrollYProgress } = useScroll({
    target: aboutRef,
    offset: ['start 0.6', 'start start'],
  })
  // Opacity reaches 0 when the top of .about rises to ~30vh: at progress p the top sits at 0.6×(1−p);
  // setting that to 0.3 gives p=0.5, hence the opacity range [0, 0.5]
  const blur = useTransform(scrollYProgress, [0, 0.5], ['blur(0px)', 'blur(16px)'])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  // Parallax: the title rises faster and its letter-spacing widens with scroll; the body rises a bit slower
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -96])
  const bodyY = useTransform(scrollYProgress, [0, 1], [0, -52])
  const titleSpacing = useTransform(scrollYProgress, [0, 1], ['0.01em', '0.42em'])
  return (
    <section className="hero">
      <motion.div
        className="about"
        ref={aboutRef}
        style={{ filter: blur, opacity }}
      >
        {/* Entrance animation lives on the inner layer so its fill doesn't lock opacity and override the outer scroll opacity */}
        <div className="about-intro">
          <motion.h1 className="about-title" style={{ y: titleY, letterSpacing: titleSpacing }}>
            {aboutHeading}
          </motion.h1>
          {aboutParagraphs.map((p, i) => (
            <motion.p key={i} className="about-body" style={{ y: bodyY }}>
              {p}
            </motion.p>
          ))}
        </div>
      </motion.div>
      <motion.div className="scroll-cue" style={{ opacity: cueOpacity }} aria-hidden="true">
        {scrollCueLabel && <span className="scroll-cue-label">{scrollCueLabel}</span>}
        <span className="scroll-cue-track">
          <span className="scroll-cue-dot" />
        </span>
      </motion.div>
    </section>
  )
}

export default function App() {
  const corner = content.hero.cornerMeta ?? {}
  const { scrollY } = useScroll()
  // Works overlay: progress of the works top moving from the viewport bottom to its middle drives the 3D darken + blur
  const worksRef = useRef(null)
  const { scrollYProgress: worksProgress } = useScroll({
    target: worksRef,
    offset: ['start end', 'start center'],
  })
  const fogBg = useTransform(
    worksProgress,
    [0, 1],
    ['rgba(8, 11, 18, 0)', 'rgba(8, 11, 18, 0.41)'] // darkening halved (was 0.82)
  )
  const fogBlur = useTransform(worksProgress, [0, 1], ['blur(0px)', 'blur(10px)'])
  // Scroll darken: dim the 3D scene after leaving the hero so the résumé text stays readable
  const scrimOpacity = useTransform(scrollY, [0, 520], [0, 0.4])
  // The hero scroll cue fades out along with it
  const cueOpacity = useTransform(scrollY, [0, 160], [1, 0])
  // Hero bottom gradient: fades out once scrolling starts
  const heroGradientOpacity = useTransform(scrollY, [0, 240], [1, 0])
  // Frosted right rail: fades in on entering the résumé (no frosting on the hero)
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const railOpacity = useTransform(scrollY, [vh * 0.5, vh * 1.1], [0, 1])
  // Hero decorative frame / corner marks: fade out on scroll
  const heroChromeOpacity = useTransform(scrollY, [0, 280], [1, 0])

  return (
    <>
      {/* Loading mask: covers the screen until the model has fully loaded, then fades out */}
      <LoadingScreen />

      {/* Fixed 3D background */}
      <div className="scene-bg">
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={[1, 1.5]}
          camera={{ position: [0, 5, 19], fov: 39, near: 0.1, far: 500 }}
          gl={{ antialias: false, stencil: false, depth: true, toneMapping: THREE.ACESFilmicToneMapping }}
        >
          <color attach="background" args={['#0a0e16']} />
          <Suspense fallback={null}>
            <Backdrop />
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Scroll-darken overlay */}
      <motion.div className="scrim" style={{ opacity: scrimOpacity }} aria-hidden="true" />

      {/* Fixed works overlay: darken only (halved); blur is commented out for now */}
      <motion.div
        className="stage-fog"
        style={{ background: fogBg /* , backdropFilter: fogBlur, WebkitBackdropFilter: fogBlur */ }}
        aria-hidden="true"
      />

      {/* Fixed frosted right rail (fades in on entering the résumé) */}
      <motion.div className="glass-rail" style={{ opacity: railOpacity }} aria-hidden="true" />

      {/* Hero bottom gradient, fades out on scroll — temporarily commented out to evaluate the look */}
      {/* <motion.div
        className="hero-gradient"
        style={{ opacity: heroGradientOpacity }}
        aria-hidden="true"
      /> */}

      {/* Hero decoration: hairline inner frame + four corner marks + corner metadata (fades on scroll) */}
      <motion.div className="hero-chrome" style={{ opacity: heroChromeOpacity }} aria-hidden="true">
        <div className="hero-frame" />
        <span className="hero-mark tl">+</span>
        <span className="hero-mark tr">+</span>
        <span className="hero-mark bl">+</span>
        <span className="hero-mark br">+</span>
        {(corner.name || corner.role) && (
          <div className="hero-meta hm-tl">
            {corner.name && <span className="hm-name">{corner.name}</span>}
            {corner.role && <span>{corner.role}</span>}
          </div>
        )}
        {corner.tagline && <div className="hero-meta hm-tr">{corner.tagline}</div>}
        {corner.focusLine && <div className="hero-meta hm-bl">{corner.focusLine}</div>}
        {corner.location && <div className="hero-meta hm-right">{corner.location}</div>}
      </motion.div>

      {/* Full-screen film-grain overlay (multiply blend) */}
      <NoiseOverlay />

      {/* Scrollable content */}
      <main className="content">
        <Hero cueOpacity={cueOpacity} />
        <Resume />
        <Works innerRef={worksRef} />
      </main>
    </>
  )
}
