import { useEffect, useRef } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'

interface DynamicOrbitControlsProps {
  lockedPlanet: number | null
  planetPositions: THREE.Vector3[]
  isDraggingSlider: boolean
}

const DynamicOrbitControls = ({ 
  lockedPlanet, 
  planetPositions, 
  isDraggingSlider 
}: DynamicOrbitControlsProps) => {
  const { camera, gl } = useThree()
  const controlsRef = useRef<OrbitControlsImpl | null>(null)

  useEffect(() => {
    const controls = new OrbitControlsImpl(camera, gl.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5
    controls.minDistance = 10
    controls.maxDistance = 350
    controlsRef.current = controls

    return () => {
      controls.dispose()
    }
  }, [camera, gl])

  useFrame(() => {
    if (!controlsRef.current) return

    // Update target to locked planet position when any planet is locked
    if (lockedPlanet !== null && planetPositions[lockedPlanet]) {
      const targetPos = planetPositions[lockedPlanet]
      controlsRef.current.target.copy(targetPos)
    } else {
      // Reset to sun when no planet is locked
      controlsRef.current.target.set(0, 0, 0)
    }

    // Disable controls when dragging sliders
    controlsRef.current.enabled = !isDraggingSlider

    controlsRef.current.update()
  })

  return null
}

export default DynamicOrbitControls
