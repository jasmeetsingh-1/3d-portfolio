import { useEffect, useRef } from 'react'
import { useThree, useLoader } from '@react-three/fiber'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import * as THREE from 'three'

// env.hdr as the lighting / reflection environment (IBL), optionally also as the visible background (replacing the Sky.jsx sky sphere).
// three r163+ natively supports scene.environmentRotation / scene.backgroundRotation.
export default function Env({
  intensity,
  rotationX,
  rotationY,
  rotationZ,
  asBackground,
  bgIntensity,
  bgBlur,
}: {
  intensity: number
  rotationX: number
  rotationY: number
  rotationZ: number
  asBackground: boolean
  bgIntensity: number
  bgBlur: number
}) {
  const scene = useThree((s) => s.scene)
  const texture = useLoader(RGBELoader, `${import.meta.env.BASE_URL}textures/env.hdr`)

  // Remember the background from before we took over (the dark color set in App.tsx) and restore it when asBackground is turned off.
  const initialBg = useRef<any>(null)
  useEffect(() => {
    initialBg.current = scene.background
  }, [scene])

  // As the lighting/reflection environment
  useEffect(() => {
    texture.mapping = THREE.EquirectangularReflectionMapping
    scene.environment = texture
    return () => {
      scene.environment = null
    }
  }, [scene, texture])

  useEffect(() => {
    scene.environmentIntensity = intensity
  }, [scene, intensity])

  // Rotation: one set of Euler angles (degrees → radians) drives both the environment reflection and the background orientation
  useEffect(() => {
    const x = THREE.MathUtils.degToRad(rotationX)
    const y = THREE.MathUtils.degToRad(rotationY)
    const z = THREE.MathUtils.degToRad(rotationZ)
    scene.environmentRotation.set(x, y, z)
    scene.backgroundRotation.set(x, y, z)
  }, [scene, rotationX, rotationY, rotationZ])

  // As the visible background
  useEffect(() => {
    scene.background = asBackground ? texture : initialBg.current
    return () => {
      scene.background = initialBg.current
    }
  }, [scene, texture, asBackground])

  // Background exposure: backgroundIntensity only scales how bright the background looks, not the scene lighting;
  // backgroundBlurriness softens the background and tames harsh highlights.
  useEffect(() => {
    scene.backgroundIntensity = bgIntensity
    scene.backgroundBlurriness = bgBlur
  }, [scene, bgIntensity, bgBlur])

  return null
}
