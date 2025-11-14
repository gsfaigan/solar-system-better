import { useState, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import SolarSystem from './components/SolarSystem'
import UI from './components/UI'
import DynamicOrbitControls from './components/DynamicOrbitControls'

function App() {
  const planetPositionsRef = useRef<THREE.Vector3[]>([])
  const cameraResetTrigger = useRef(0)
  
  // Default values
  const DEFAULT_FOV = 60
  const DEFAULT_SPEED = 1
  const DEFAULT_SENSITIVITY = 3
  const DEFAULT_ORBIT_OPACITY = 0.6
  const DEFAULT_CAMERA_LOCK_MODE = 'follow' as const
  
  const [isSupernova, setIsSupernova] = useState(false)
  const [isWormhole, setIsWormhole] = useState(false)
  const [fov, setFov] = useState(DEFAULT_FOV)
  const [speedMultiplier, setSpeedMultiplier] = useState(DEFAULT_SPEED)
  const [sensitivity, setSensitivity] = useState(DEFAULT_SENSITIVITY)
  const [isDraggingSlider, setIsDraggingSlider] = useState(false)
  const [orbitOpacity, setOrbitOpacity] = useState(DEFAULT_ORBIT_OPACITY)
  const [lockedPlanet, setLockedPlanet] = useState<number | null>(null)
  const [cameraLockMode, setCameraLockMode] = useState<'follow' | 'track'>(DEFAULT_CAMERA_LOCK_MODE)

  const handleReset = () => {
    // Reset all settings to defaults
    setFov(DEFAULT_FOV)
    setSpeedMultiplier(DEFAULT_SPEED)
    setSensitivity(DEFAULT_SENSITIVITY)
    setOrbitOpacity(DEFAULT_ORBIT_OPACITY)
    setLockedPlanet(null)
    setCameraLockMode(DEFAULT_CAMERA_LOCK_MODE)
    setIsSupernova(false)
    setIsWormhole(false)
    
    // Trigger camera reset in the scene
    cameraResetTrigger.current += 1
  }

  // Planet data for UI buttons
  const planets = [
    { name: 'Mercury', color: '#8B7355' },
    { name: 'Venus', color: '#FFC649' },
    { name: 'Earth', color: '#4A90E2' },
    { name: 'Mars', color: '#CD5C5C' },
    { name: 'Jupiter', color: '#C88B3A' },
    { name: 'Saturn', color: '#FAD5A5' },
    { name: 'Uranus', color: '#4FD0E7' },
    { name: 'Neptune', color: '#4169E1' }
  ]

  return (
    <>
      <Canvas camera={{ position: [0, 5, 15], fov: 30 }}>
        <color attach="background" args={['#000000']} />
        <DynamicOrbitControls 
          lockedPlanet={lockedPlanet}
          planetPositions={planetPositionsRef.current}
          isDraggingSlider={isDraggingSlider}
        />
        <SolarSystem 
          isSupernova={isSupernova}
          setIsSupernova={setIsSupernova}
          isWormhole={isWormhole}
          setIsWormhole={setIsWormhole}
          fov={fov}
          speedMultiplier={speedMultiplier}
          sensitivity={sensitivity}
          isDraggingSlider={isDraggingSlider}
          orbitOpacity={orbitOpacity}
          lockedPlanet={lockedPlanet}
          cameraLockMode={cameraLockMode}
          planetPositionsRef={planetPositionsRef}
          cameraResetTrigger={cameraResetTrigger.current}
        />
      </Canvas>
      <UI
        planets={planets}
        onSupernova={() => setIsSupernova(true)}
        onWormhole={() => setIsWormhole(true)}
        onPlanetFocus={(index) => setLockedPlanet(index)}
        onUnlockCamera={() => setLockedPlanet(null)}
        isSupernova={isSupernova}
        isWormhole={isWormhole}
        lockedPlanet={lockedPlanet}
        cameraLockMode={cameraLockMode}
        onCameraLockModeChange={setCameraLockMode}
        fov={fov}
        onFovChange={setFov}
        speedMultiplier={speedMultiplier}
        onSpeedMultiplierChange={setSpeedMultiplier}
        sensitivity={sensitivity}
        onSensitivityChange={setSensitivity}
        orbitOpacity={orbitOpacity}
        onOrbitOpacityChange={setOrbitOpacity}
        onDragStart={() => setIsDraggingSlider(true)}
        onDragEnd={() => setIsDraggingSlider(false)}
        onReset={handleReset}
      />
    </>
  )
}

export default App
