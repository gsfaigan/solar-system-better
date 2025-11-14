import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import SolarSystem from './components/SolarSystem'
import UI from './components/UI'

function App() {
  const [isSupernova, setIsSupernova] = useState(false)
  const [isWormhole, setIsWormhole] = useState(false)
  const [fov, setFov] = useState(60)
  const [speedMultiplier, setSpeedMultiplier] = useState(1)
  const [sensitivity, setSensitivity] = useState(3)
  const [isDraggingSlider, setIsDraggingSlider] = useState(false)
  const [orbitOpacity, setOrbitOpacity] = useState(0.6)
  const [lockedPlanet, setLockedPlanet] = useState<number | null>(null)
  const [cameraLockMode, setCameraLockMode] = useState<'follow' | 'track'>('follow')

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
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          rotateSpeed={0.5}
          minDistance={10}
          maxDistance={350}
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
      />
    </>
  )
}

export default App
