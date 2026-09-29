import { Suspense, useMemo, useRef, useEffect, type MutableRefObject } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom, DepthOfField, SMAA } from '@react-three/postprocessing'
import * as THREE from 'three'
import Env from './Env'
import { content, asset, FOCUS_POINTS, FRAMES_PER_NODE } from '../content'

const MODEL_URL = asset(content.model.glbPath)!
useGLTF.preload(MODEL_URL)

// Focus anchors (focus-* empties in the glb), ordered to match the résumé nodes; the list is the single source of truth, see model.focusPoints in content-plan/content.json
const POINTS = FOCUS_POINTS as readonly string[]
const M = POINTS.length // number of timeline nodes (= résumé entries), derived from the list, not hardcoded
const RESUME_FRAMES = M * FRAMES_PER_NODE // frames in the résumé section: FRAMES_PER_NODE per node (node k → frame k·FRAMES_PER_NODE)
const WORKS_ENTRANCE = 50 // frames used by the works "entrance" (the gallery screen sliding up from the bottom to cover)
const FPS = 24 // all clips share a 24fps timeline; the camera animation's total frame count is read from the CameraAction clip at runtime (see totalFrames)
const NODE_LINE = 0.3 // node "arrival" line: when an entry's top reaches this viewport height (30% from the top), that node locks in

// Top-to-bottom gradient background sphere (surrounding the camera); both end colors are adjustable
function GradientBackground() {
  // The glb camera's FOV is very narrow (~23°), so only a middle strip of the gradient is visible; steepness stretches that strip into a full transition
  const top = '#6f906f'
  const bottom = '#dbd3b5'
  const steep = 1.4

  const uniforms = useMemo(
    () => ({
      uTop: { value: new THREE.Color() },
      uBottom: { value: new THREE.Color() },
      uSteep: { value: 1 },
    }),
    []
  )
  uniforms.uTop.value.set(top)
  uniforms.uBottom.value.set(bottom)
  uniforms.uSteep.value = steep

  return (
    <mesh scale={100}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={/* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = normalize(position);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={/* glsl */ `
          uniform vec3 uTop;
          uniform vec3 uBottom;
          uniform float uSteep;
          varying vec3 vDir;
          void main() {
            // Stretch around the horizon (y=0) by steepness so the full transition is visible even with a narrow FOV
            float t = clamp(vDir.y * uSteep * 0.5 + 0.5, 0.0, 1.0);
            gl_FragColor = vec4(mix(uBottom, uTop, t), 1.0);
          }
        `}
      />
    </mesh>
  )
}

// All lights (HDRI environment + hemisphere + key/fill directional lights)
function Lights() {
  const c = {
    envIntensity: 0.85,
    hemiIntensity: 1.15,
    hemiSky: '#ffffff',
    hemiGround: '#404040',
    keyIntensity: 2.35,
    keyColor: '#ffd9c6',
    keyPos: [5, 8, 5] as [number, number, number],
    fillIntensity: 2.25,
    fillColor: '#9fc6ff',
    fillPos: [-5, 4, -4] as [number, number, number],
  }

  return (
    <>
      <Env
        intensity={c.envIntensity}
        rotationX={0}
        rotationY={0}
        rotationZ={0}
        asBackground={false}
        bgIntensity={0.4}
        bgBlur={0}
      />
      <hemisphereLight args={[c.hemiSky, c.hemiGround, c.hemiIntensity]} />
      <directionalLight
        position={c.keyPos}
        intensity={c.keyIntensity}
        color={c.keyColor}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={c.fillPos} intensity={c.fillIntensity} color={c.fillColor} />
    </>
  )
}

// me.glb: model + the glb's own camera animation (scrubbed by scroll in 5 segments) + auto-focus + eye follow
function Man2({
  focusRef,
  frameRef,
  dofBokehRef,
  dofRangeRef,
}: {
  focusRef: MutableRefObject<THREE.Vector3>
  frameRef: MutableRefObject<number>
  dofBokehRef: MutableRefObject<number>
  dofRangeRef: MutableRefObject<number>
}) {
  const posX = 0
  const posY = 0.4
  const posZ = -0.7
  const scale = 2.25
  const rotationY = 0

  // mobilePullback: on mobile, how far the camera pulls back along the focus→camera direction (1 = unchanged, 1.2 = 20% farther)
  // mobileTimelineShift: on mobile, horizontal camera shift during the timeline stage, as a fraction of view distance (positive = left, negative = right, 0 = off)
  const cam = {
    damping: 0.1,
    dwell: 0.35,
    parallax: 4,
    parallaxEase: 0.1,
    mobilePullback: 1.2,
    mobileTimelineShift: 0.12,
  }

  const eye = {
    enabled: true,
    gain: 3,
    maxYaw: 15,
    maxPitch: 8,
    invertX: false,
    invertY: false,
    smooth: 0.44,
    crossEye: 45,
    crossRadius: 0.25,
  }

  const get = useThree((s) => s.get)
  const { scene, animations } = useGLTF(MODEL_URL)

  // Clone the model; collect the eye objects, focus anchors, the glb's own camera, and each anchor's depth-of-field settings
  const { model, eyes, points, startPoint, glbCam, focusNode, dof } = useMemo(() => {
    const clone = scene.clone(true)
    const eyes: any[] = []
    const pmap: Record<string, any> = {}
    let startPoint: any = null
    let glbCam: any = null
    let focusNode: any = null
    clone.traverse((o: any) => {
      if (o.isMesh) {
        o.castShadow = true
        o.receiveShadow = true
      }
      if (o.isCamera) glbCam = o
      // Hero anchor: accepts both the legacy name focus-start and intro3d's numbered focus-0
      if (o.name === 'focus-start' || o.name === 'focus-0') startPoint = o
      if (o.name === 'focus-works') focusNode = o
      if (POINTS.includes(o.name)) pmap[o.name] = o
      if (/eye/i.test(o.name)) {
        // Smooth shading: recompute smooth vertex normals + turn off flatShading
        if (o.isMesh) {
          o.geometry.computeVertexNormals()
          const mats = Array.isArray(o.material) ? o.material : [o.material]
          mats.forEach((m: any) => {
            m.flatShading = false
            m.needsUpdate = true
          })
        }
        eyes.push({ obj: o, base: o.quaternion.clone(), x: o.position.x })
      }
    })
    // Decide left/right by local x: leftmost eye sx=-1, rightmost eye sx=+1, used for the cross-eye inward rotation
    if (eyes.length > 1) {
      const xs = eyes.map((e) => e.x)
      const min = Math.min(...xs)
      const max = Math.max(...xs)
      const mid = (min + max) / 2
      eyes.forEach((e) => {
        e.sx = e.x < mid ? -1 : 1
      })
    } else {
      eyes.forEach((e) => (e.sx = 0))
    }
    const pts = POINTS.map((n) => pmap[n] || null)
    // Works anchor: prefer focus-works (older glbs); if absent (intro3d's numbered export omits it), reuse the last timeline node focus-M.
    const works = focusNode || pts[pts.length - 1] || null
    // Hero anchor: focus-start / focus-0; if neither exists, fall back to the first timeline node.
    const start = startPoint || pts[0] || null
    // Per-anchor depth-of-field params (written to userData/extras by intro3d exports): dofBokeh blur strength, dofFocusRange sharp range,
    // dofEnabled toggle (off → effective bokeh is 0). has=false (older glbs lack these fields) → Post2 uses the original global frame blend, behavior unchanged.
    const ud = (o: any): any => o?.userData ?? {}
    const hasDofParams = [...pts, start, works].some((o) => ud(o).dofBokeh !== undefined)
    const effBokeh = (o: any): number => (ud(o).dofEnabled === false ? 0 : (ud(o).dofBokeh ?? 0))
    const effRange = (o: any): number => ud(o).dofFocusRange ?? 0
    return {
      model: clone,
      eyes,
      points: pts,
      startPoint: start,
      glbCam,
      focusNode: works,
      dof: {
        has: hasDofParams,
        bokeh: pts.map(effBokeh),
        range: pts.map(effRange),
        startBokeh: effBokeh(start),
        startRange: effRange(start),
        worksBokeh: effBokeh(works),
        worksRange: effRange(works),
      },
    }
  }, [scene])

  // Total camera-animation frames: read from the CameraAction clip (falling back to the longest clip / a default of résumé + entrance + pan), not hardcoded.
  // Works frame segment = [RESUME_FRAMES, totalFrames]; its length depends on the glb (100 frames in the current me.glb).
  const totalFrames = useMemo(() => {
    const clips: any[] = animations || []
    const cam = clips.find((c: any) => c.name === 'CameraAction')
    const clip = cam || (clips.length ? clips.reduce((a, b) => (b.duration > a.duration ? b : a)) : null)
    return clip ? Math.round(clip.duration * FPS) : RESUME_FRAMES + 2 * WORKS_ENTRANCE
  }, [animations])

  // Animation mixer: attach every clip (manAction + CameraAction) and scrub each frame by setting time + update(0)
  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model])
  const actions = useRef<any[]>([])
  useEffect(() => {
    if (!animations || animations.length === 0) return
    mixer.stopAllAction()
    actions.current = animations.map((clip) => {
      const a = mixer.clipAction(clip)
      a.play()
      a.paused = true
      return { action: a, duration: clip.duration }
    })
    return () => {
      mixer.stopAllAction()
      actions.current = []
    }
  }, [mixer, animations])

  // Don't switch the active camera (post-processing's CoC would cache the old camera's near/far and blur everything).
  // Instead, copy the glb camera's world transform + fov onto the default camera every frame.

  // Window-level mouse input (smouse is the eased value)
  const mouse = useRef({ x: 0, y: 0 })
  const smouse = useRef({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // Mobile / touch screens (no mouse to follow): disable eye follow and keep the eyes at their default orientation.
  // Detection = coarse (touch) pointer or a narrow viewport (≤640px, matching the mobile style breakpoint).
  const isMobile = useRef(
    typeof window !== 'undefined' &&
      (window.matchMedia?.('(pointer: coarse)').matches === true ||
        window.innerWidth <= 640)
  )

  // Résumé anchor DOM elements (decide which segment is currently playing)
  const anchorEls = useRef<any>(null)
  // Works gallery DOM element (decides the frame during the works entrance / pan stage)
  const galleryEl = useRef<any>(null)

  // Reused objects to avoid per-frame allocation
  const frameSmooth = useRef(0)
  const posA = useRef(new THREE.Vector3())
  const posB = useRef(new THREE.Vector3())

  const tmpEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const tmpQuat = useRef(new THREE.Quaternion())
  const desiredQuat = useRef(new THREE.Quaternion())
  const tmpVec = useRef(new THREE.Vector3())

  // For copying the glb camera's world transform
  const camPos = useRef(new THREE.Vector3())
  const camQuat = useRef(new THREE.Quaternion())
  const camScl = useRef(new THREE.Vector3())
  const paraEuler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
  const paraQuat = useRef(new THREE.Quaternion())

  useFrame((_, dt) => {
    const a = 1 - Math.pow(cam.damping, dt)

    // 1) Compute a continuous index s from the résumé anchors (document coordinates):
    //    top s≈-1, first entry centered s=0, second = 1 … fifth = 4
    if (!anchorEls.current) {
      anchorEls.current = POINTS.map((n) => document.querySelector(`[data-point="${n}"]`))
    }
    const els = anchorEls.current
    // Node dwell: remap each scroll segment with a pause — s stays constant for a stretch of scroll near each node (the dwell),
    // then moves quickly to the next node mid-segment. Only the scroll→s pacing changes; the glb animation is still linear in s.
    const d = THREE.MathUtils.clamp(cam.dwell, 0, 0.49)
    const dwell = (t: number) => {
      if (d <= 0) return t
      if (t < d) return 0
      if (t > 1 - d) return 1
      return THREE.MathUtils.smoothstep((t - d) / (1 - 2 * d), 0, 1)
    }
    let sTarget = THREE.MathUtils.clamp(frameSmooth.current / FRAMES_PER_NODE - 1, -1, M - 1)
    if (els && els.length === M && els.every(Boolean)) {
      // The reference line is at viewport height NODE_LINE; anchors use the entry's top (the text position, excluding the large bottom padding)
      const refLine = window.scrollY + window.innerHeight * NODE_LINE
      const tops = els.map((el: any) => el.getBoundingClientRect().top + window.scrollY)
      if (refLine <= tops[0]) {
        // Top → first entry lead-in: s=-1 at scrollY=0 (frame 0), s=0 when the first entry reaches the reference line
        const heroScroll = Math.max(1, tops[0] - window.innerHeight * NODE_LINE)
        sTarget = -1 + dwell(THREE.MathUtils.clamp(window.scrollY / heroScroll, 0, 1))
      } else if (refLine >= tops[M - 1]) {
        sTarget = M - 1
      } else {
        for (let i = 0; i < M - 1; i++) {
          if (refLine <= tops[i + 1]) {
            const t = (refLine - tops[i]) / Math.max(1, tops[i + 1] - tops[i])
            sTarget = i + dwell(t)
            break
          }
        }
      }
    }
    // 2) Frame drive: first compute a "target frame" (unified for résumé/works; both sides of the boundary are RESUME_FRAMES → continuous),
    //    then ease the final frame once — avoids the jumps caused by the old inconsistent "smoothed s + raw rectTop" dual paths.
    //    Résumé 0–RESUME_FRAMES (node i → (i+1)·50); works = entrance (screen slides in) + first-section pan, up to the last frame
    let frameTarget = THREE.MathUtils.clamp((sTarget + 1) * FRAMES_PER_NODE, 0, RESUME_FRAMES)
    let inWorks = false
    if (!galleryEl.current) galleryEl.current = document.querySelector('.wk-gallery')
    if (galleryEl.current) {
      const ih = window.innerHeight
      const rectTop = galleryEl.current.getBoundingClientRect().top
      const range = Math.max(0, galleryEl.current.offsetHeight - ih)
      if (rectTop < ih) {
        inWorks = true
        // Frame where the entrance ends (works screen fully covering): end of résumé + entrance frames, clamped to the total
        const entranceEnd = Math.min(RESUME_FRAMES + WORKS_ENTRANCE, totalFrames)
        if (rectTop > 0) {
          // Works screen slides from the bottom (rectTop=ih) to fully covering (rectTop=0): the entrance segment
          const pA = THREE.MathUtils.clamp(1 - rectTop / ih, 0, 1)
          frameTarget = RESUME_FRAMES + (entranceEnd - RESUME_FRAMES) * pA
        } else {
          // Pinned; the first section pans in horizontally (the first full-screen 100vw pan): entrance end → last frame, then hold on the last frame
          // Vertical scroll maps 1:1 to the pan (px); a 100vw pan = innerWidth px
          const scrolled = THREE.MathUtils.clamp(-rectTop, 0, range)
          const pB = THREE.MathUtils.clamp(scrolled / window.innerWidth, 0, 1)
          frameTarget = entranceEnd + (totalFrames - entranceEnd) * pB
        }
      }
    }
    // Easing varies with the target frame: normal smoothing ≤ RESUME_FRAMES; fades out during the entrance; after it a=1 (tracks input directly, no smoothing)
    const smoothOff = THREE.MathUtils.smoothstep(frameTarget, RESUME_FRAMES, RESUME_FRAMES + WORKS_ENTRANCE)
    const aEff = THREE.MathUtils.lerp(a, 1, smoothOff)
    frameSmooth.current += (frameTarget - frameSmooth.current) * aEff
    const frame = frameSmooth.current
    // All clips share one timeline: time = frame/FPS, each clamped to its own duration
    // (shorter clips hold their last frame once finished; the CameraAction camera clip runs the full totalFrames)
    if (actions.current.length) {
      const t = frame / FPS
      for (const { action: act, duration } of actions.current) {
        act.time = Math.min(t, duration)
      }
      mixer.update(0)
    }
    if (frameRef) frameRef.current = frame

    // Continuous index used for focus in the résumé section: derived back from the smoothed frame so focus stays in sync with the camera
    const s = THREE.MathUtils.clamp(frame / FRAMES_PER_NODE - 1, -1, M - 1)

    // 3) Auto-focus: in works, follow the glb focus-works empty; in the résumé, interpolate between focus anchors
    //    (read world positions after mixer.update so they match the current frame)
    if (focusRef) {
      if (inWorks && focusNode) {
        focusNode.getWorldPosition(focusRef.current)
      } else if (s < 0 && startPoint && points[0]) {
        startPoint.getWorldPosition(posA.current)
        points[0].getWorldPosition(posB.current)
        focusRef.current.lerpVectors(posA.current, posB.current, THREE.MathUtils.clamp(s + 1, 0, 1))
      } else {
        const sc = THREE.MathUtils.clamp(s, 0, M - 1)
        const iA = Math.floor(sc)
        const iB = Math.min(iA + 1, M - 1)
        const f = sc - iA
        if (points[iA] && points[iB]) {
          points[iA].getWorldPosition(posA.current)
          points[iB].getWorldPosition(posB.current)
          focusRef.current.lerpVectors(posA.current, posB.current, f)
        }
      }
    }

    // 3b) Depth of field: when the glb carries per-anchor params (intro3d export), interpolate bokeh/focusRange between neighboring anchors along the current index,
    //     writing them to refs for Post2 to use directly (faithful to intro3d); without params (older glbs) write the sentinel -1 → Post2 uses the original global frame blend.
    if (dofBokehRef && dofRangeRef) {
      if (!dof.has) {
        dofBokehRef.current = -1
      } else {
        const sample = (arr: number[], sv: number, wv: number): number => {
          if (inWorks) return wv
          if (s < 0) return THREE.MathUtils.lerp(sv, arr[0] ?? sv, THREE.MathUtils.clamp(s + 1, 0, 1))
          const sc = THREE.MathUtils.clamp(s, 0, M - 1)
          const iA = Math.floor(sc)
          const iB = Math.min(iA + 1, M - 1)
          return THREE.MathUtils.lerp(arr[iA] ?? 0, arr[iB] ?? 0, sc - iA)
        }
        dofBokehRef.current = sample(dof.bokeh, dof.startBokeh, dof.worksBokeh)
        // Convert focusRange to world units by the model group's scale (the scene is scaled up by `scale`, so the sharp range must scale too to match intro3d's look).
        dofRangeRef.current = sample(dof.range, dof.startRange, dof.worksRange) * scale
      }
    }

    // 2b) Copy the glb camera's world transform to the default camera and add orbit-style mouse parallax around the focus point (the focus stays fixed on screen)
    const camera: any = get().camera
    if (glbCam && camera.isPerspectiveCamera) {
      glbCam.updateWorldMatrix(true, false)
      glbCam.matrixWorld.decompose(camPos.current, camQuat.current, camScl.current)
      // Mouse easing: asymptotically approach the target
      const me = 1 - Math.pow(cam.parallaxEase, dt)
      smouse.current.x += (mouse.current.x - smouse.current.x) * me
      smouse.current.y += (mouse.current.y - smouse.current.y) * me
      const ax = THREE.MathUtils.degToRad(cam.parallax)
      paraEuler.current.set(-smouse.current.y * ax, -smouse.current.x * ax, 0)
      paraQuat.current.setFromEuler(paraEuler.current)
      // Rotate the camera position around the focus + rotate its orientation to match → the focus stays put and only the surroundings show parallax
      tmpVec.current
        .copy(camPos.current)
        .sub(focusRef.current)
        .applyQuaternion(paraQuat.current)
      // On mobile, pull back along the focus→camera direction: the focus stays in place on screen, the subject gets smaller with more breathing room
      if (isMobile.current) tmpVec.current.multiplyScalar(cam.mobilePullback)
      tmpVec.current.add(focusRef.current)
      camera.position.copy(tmpVec.current)
      camera.quaternion.multiplyQuaternions(paraQuat.current, camQuat.current)
      // On mobile during the timeline stage, shift the whole shot left so the subject is offset from the full-width text.
      // Weight: fades in from the hero (s: -0.8→0.3) and fades out with smoothOff on entering works → no jumps.
      if (isMobile.current && cam.mobileTimelineShift !== 0) {
        const tlWeight = THREE.MathUtils.smoothstep(s, -0.8, 0.3) * (1 - smoothOff)
        if (tlWeight > 0) {
          // translateX moves along local +X (screen right); negate → camera moves left
          const dist = camera.position.distanceTo(focusRef.current)
          camera.translateX(-dist * cam.mobileTimelineShift * tlWeight)
        }
      }
      if (camera.fov !== glbCam.fov) {
        camera.fov = glbCam.fov
        camera.updateProjectionMatrix()
      }
    }

    // 4) Eye follow (project to screen with the active camera); skipped on mobile / touch
    if (!eye.enabled || eyes.length === 0 || isMobile.current) return
    const sx = eye.invertX ? -1 : 1
    const sy = eye.invertY ? -1 : 1

    let ax = 0
    let ay = 0
    for (const e of eyes) {
      e.obj.getWorldPosition(tmpVec.current).project(camera)
      ax += tmpVec.current.x
      ay += tmpVec.current.y
    }
    ax /= eyes.length
    ay /= eyes.length

    const mx = mouse.current.x - ax
    const my = mouse.current.y - ay
    const yawBase = sx * mx * THREE.MathUtils.degToRad(eye.maxYaw) * eye.gain
    const pitch = sy * -my * THREE.MathUtils.degToRad(eye.maxPitch) * eye.gain

    const dist = Math.hypot(mx, my)
    const convWeight = THREE.MathUtils.clamp(1 - dist / eye.crossRadius, 0, 1)
    const convRad = THREE.MathUtils.degToRad(eye.crossEye) * convWeight

    for (const e of eyes) {
      const yaw = yawBase - e.sx * convRad
      tmpEuler.current.set(pitch, yaw, 0)
      tmpQuat.current.setFromEuler(tmpEuler.current)
      desiredQuat.current.copy(tmpQuat.current).multiply(e.base)
      e.obj.quaternion.slerp(desiredQuat.current, eye.smooth)
    }
  })

  return (
    <group
      position={[posX, posY, posZ]}
      rotation={[0, (rotationY * Math.PI) / 180, 0]}
      scale={scale}
    >
      <primitive object={model} />
    </group>
  )
}

// Post-processing: DepthOfField → Bloom → SMAA.
// The DoF target follows focusRef every frame (auto-focus); between the start and end blend frames the sharp range tightens and blur increases.
function Post2({
  focusRef,
  frameRef,
  dofBokehRef,
  dofRangeRef,
}: {
  focusRef: MutableRefObject<THREE.Vector3>
  frameRef: MutableRefObject<number>
  dofBokehRef: MutableRefObject<number>
  dofRangeRef: MutableRefObject<number>
}) {
  const post = {
    bloomIntensity: 0.6,
    bloomThreshold: 0.82,
    dof: true,
    startBokeh: 7.4,
    startRange: 2.0,
    focusBokeh: 11.0,
    focusRange: 0.15,
    startBlendFrame: 48,
    endBlendFrame: RESUME_FRAMES - 50, // return to the "start frame" DoF preset near the last node (originally 250−50=200)
  }

  const dofRef = useRef<any>(null)
  useFrame(() => {
    const e = dofRef.current
    if (!e) return
    if (e.target && focusRef) e.target.copy(focusRef.current)
    // Weight w=1 uses the "start frame preset", w=0 uses the "focus preset".
    // The beginning (f→0) and the last node (f→RESUME_FRAMES) use the start preset; the nodes in between use the focus preset.
    const f = frameRef ? frameRef.current : 0
    const wStart = 1 - THREE.MathUtils.smoothstep(f, 0, post.startBlendFrame)
    const wEnd = THREE.MathUtils.smoothstep(f, post.endBlendFrame, RESUME_FRAMES)
    const w = Math.max(wStart, wEnd)
    if (dofBokehRef && dofBokehRef.current >= 0) {
      // The glb carries per-anchor DoF params (intro3d export): use them directly to faithfully reproduce intro3d's blur strength / sharp range (bokeh=0 means DoF is off at that point).
      e.bokehScale = dofBokehRef.current
      if (e.cocMaterial) e.cocMaterial.focusRange = Math.max(1e-4, dofRangeRef ? dofRangeRef.current : post.focusRange)
    } else {
      // Older glbs (no per-anchor params): keep the original global frame-blend presets.
      e.bokehScale = THREE.MathUtils.lerp(post.focusBokeh, post.startBokeh, w)
      if (e.cocMaterial) e.cocMaterial.focusRange = THREE.MathUtils.lerp(post.focusRange, post.startRange, w)
    }
  })

  return (
    <EffectComposer multisampling={0} stencilBuffer={false} depthBuffer>
      {(post.dof ? (
        <DepthOfField
          ref={dofRef}
          target={[0, 1.3, 0]}
          worldFocusRange={post.focusRange}
          bokehScale={post.focusBokeh}
          height={480}
        />
      ) : null) as any}
      <Bloom
        mipmapBlur
        intensity={post.bloomIntensity}
        luminanceThreshold={post.bloomThreshold}
        luminanceSmoothing={0.3}
      />
      <SMAA />
    </EffectComposer>
  )
}

// Scene root: shows me.glb (camera driven by the glb animation + scroll)
export default function Scene() {
  const focusRef = useRef(new THREE.Vector3(0, 1.3, 0))
  const frameRef = useRef(0)
  // Per-anchor DoF (carried by intro3d-exported glbs): Man2 writes every frame, Post2 reads. dofBokeh=-1 means no params → Post2 uses the old global blend.
  const dofBokehRef = useRef(-1)
  const dofRangeRef = useRef(0.15)
  return (
    <>
      <GradientBackground />

      <Suspense fallback={null}>
        <Lights />
        <Man2 focusRef={focusRef} frameRef={frameRef} dofBokehRef={dofBokehRef} dofRangeRef={dofRangeRef} />
      </Suspense>

      <Post2 focusRef={focusRef} frameRef={frameRef} dofBokehRef={dofBokehRef} dofRangeRef={dofRangeRef} />
    </>
  )
}
