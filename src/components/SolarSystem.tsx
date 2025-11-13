import { useState, useEffect, useRef } from 'react'
import { Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import Star from './Star'
import Planet from './Planet'
import Starfield from './Starfield'

const CameraController = ({ 
  isSupernova, 
  onCameraReady,
  sensitivity = 1.0
}: { 
  isSupernova: boolean
  onCameraReady?: () => void
  sensitivity?: number
}) => {
  const { camera } = useThree()
  const initialZ = useRef(camera.position.z)
  const isAnimating = useRef(false)
  const hasNotifiedReady = useRef(false)
  const keysPressed = useRef<Set<string>>(new Set())
  const velocity = useRef({ horizontal: 0, vertical: 0 })
  
  useEffect(() => {
    if (isSupernova) {
      // Store initial position when supernova starts
      initialZ.current = camera.position.z
      isAnimating.current = true
      hasNotifiedReady.current = false
    }
  }, [isSupernova, camera])

  // Keyboard controls for camera rotation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        keysPressed.current.add(e.key)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])
  
  useFrame(() => {
    // Handle keyboard camera rotation with easing
    if (!isSupernova && !isAnimating.current) {
      const acceleration = 0.001 * sensitivity / 3
      const maxSpeed = 0.02 * sensitivity / 3
      const verticalAcceleration = 0.04 * sensitivity / 3 // 2x faster for up/down
      const maxVerticalSpeed = 1.2 * sensitivity / 3 // 2x faster max speed for up/down
      const damping = 0.5 // Much faster stop (lower = faster stop)
      const radius = Math.sqrt(camera.position.x ** 2 + camera.position.z ** 2)
      
      // Accelerate based on key presses (reversed directions)
      if (keysPressed.current.has('ArrowRight')) {
        velocity.current.horizontal = Math.min(velocity.current.horizontal + acceleration, maxSpeed)
      } else if (keysPressed.current.has('ArrowLeft')) {
        velocity.current.horizontal = Math.max(velocity.current.horizontal - acceleration, -maxSpeed)
      } else {
        // Apply damping when no key is pressed (ease out)
        velocity.current.horizontal *= damping
        // Stop completely when velocity is very small
        if (Math.abs(velocity.current.horizontal) < 0.0001) velocity.current.horizontal = 0
      }
      
      if (keysPressed.current.has('ArrowUp')) {
        velocity.current.vertical = Math.min(velocity.current.vertical + verticalAcceleration, maxVerticalSpeed)
      } else if (keysPressed.current.has('ArrowDown')) {
        velocity.current.vertical = Math.max(velocity.current.vertical - verticalAcceleration, -maxVerticalSpeed)
      } else {
        // Apply damping when no key is pressed (ease out)
        velocity.current.vertical *= damping
        // Stop completely when velocity is very small
        if (Math.abs(velocity.current.vertical) < 0.001) velocity.current.vertical = 0
      }
      
      // Apply horizontal rotation velocity
      if (velocity.current.horizontal !== 0) {
        const angle = Math.atan2(camera.position.x, camera.position.z) + velocity.current.horizontal
        camera.position.x = Math.sin(angle) * radius
        camera.position.z = Math.cos(angle) * radius
        camera.lookAt(0, 0, 0)
      }
      
      // Apply vertical movement velocity
      if (velocity.current.vertical !== 0) {
        camera.position.y += velocity.current.vertical
        camera.lookAt(0, 0, 0)
      }
    }

    // Only animate camera during supernova
    if (isSupernova) {
      const targetZ = 300
      const diff = targetZ - camera.position.z
      console.log('Camera Z position:', camera.position.z, 'Target:', targetZ, 'Diff:', diff)
      if (Math.abs(diff) > 0.5) {
        camera.position.z += diff * 0.05 // Smooth interpolation
        camera.lookAt(0, 0, 0)
      } else if (!hasNotifiedReady.current && onCameraReady) {
        // Camera has reached target, notify that supernova can start
        console.log('Camera reached target, triggering star expansion')
        hasNotifiedReady.current = true
        onCameraReady()
      }
    } else if (isAnimating.current) {
      // Smoothly return to initial position after supernova ends
      const diff = initialZ.current - camera.position.z
      if (Math.abs(diff) > 0.1) {
        camera.position.z += diff * 0.05
        camera.lookAt(0, 0, 0)
      } else {
        isAnimating.current = false
      }
    }
  })
  
  return null
}

const SolarSystem = () => {
  const [isSupernova, setIsSupernova] = useState(false)
  const [starCanExpand, setStarCanExpand] = useState(false)
  const [fov, setFov] = useState(60)
  const [speedMultiplier, setSpeedMultiplier] = useState(0.3)
  const [isWormhole, setIsWormhole] = useState(false)
  const [sensitivity, setSensitivity] = useState(3.0)
  const [isDraggingSlider, setIsDraggingSlider] = useState(false)
  const [orbitOpacity, setOrbitOpacity] = useState(0.6)
  const { camera, gl } = useThree()
  
  // Update camera FOV when slider changes
  useEffect(() => {
    if (camera && 'fov' in camera) {
      (camera as THREE.PerspectiveCamera).fov = fov
      camera.updateProjectionMatrix()
    }
  }, [fov, camera])

  // Disable OrbitControls when dragging sliders
  useEffect(() => {
    const canvas = gl.domElement
    // Find OrbitControls instance through the three-stdlib event system
    const handlePointerMove = (e: PointerEvent) => {
      if (isDraggingSlider) {
        e.stopPropagation()
      }
    }
    
    if (isDraggingSlider) {
      canvas.style.pointerEvents = 'none'
    } else {
      canvas.style.pointerEvents = 'auto'
    }
    
    window.addEventListener('pointermove', handlePointerMove, true)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove, true)
      canvas.style.pointerEvents = 'auto'
    }
  }, [isDraggingSlider, gl])
  
  // Define planet data with orbit radius, speed, color, and scale (relative to Earth)
  // Scale based on actual planet diameters relative to Earth
  // Speed based on actual orbital periods (Earth = 1.0, faster = higher number)
  const SIZE_SCALE = 0.5
  const PATH_SCALE = 3

  const planets = [
    { orbitRadius: 3 * PATH_SCALE, speed: 4.15 * speedMultiplier, color: '#8B7355', scale: 0.5 * SIZE_SCALE, name: 'Mercury' },    // 0.38x Earth size, 88 days
    { orbitRadius: 4.5 * PATH_SCALE, speed: 1.62 * speedMultiplier, color: '#FFC649', scale: 0.95 * SIZE_SCALE, name: 'Venus' },   // 0.95x Earth size, 225 days
    { orbitRadius: 6 * PATH_SCALE, speed: 1.0 * speedMultiplier, color: '#4A90E2', scale: 1.0 * SIZE_SCALE, name: 'Earth' },       // 1.0x Earth size (baseline), 365 days
    { orbitRadius: 7.5 * PATH_SCALE, speed: 0.53 * speedMultiplier, color: '#CD5C5C', scale: 0.53 * SIZE_SCALE, name: 'Mars' },    // 0.53x Earth size, 687 days
    { orbitRadius: 11 * PATH_SCALE, speed: 0.084 * speedMultiplier, color: '#C88B3A', scale: 4.5 * SIZE_SCALE, name: 'Jupiter' }, // 11.2x Earth size, 11.86 years
    { orbitRadius: 15 * PATH_SCALE, speed: 0.034 * speedMultiplier, color: '#F4E7C3', scale: 3.5 * SIZE_SCALE, name: 'Saturn' },  // 9.45x Earth size, 29.5 years
    { orbitRadius: 19 * PATH_SCALE, speed: 0.012 * speedMultiplier, color: '#4FD0E7', scale: 2.5 * SIZE_SCALE, name: 'Uranus' },   // 4.0x Earth size, 84 years
    { orbitRadius: 23 * PATH_SCALE, speed: 0.006 * speedMultiplier, color: '#4169E1', scale: 2 * SIZE_SCALE, name: 'Neptune' }, // 3.88x Earth size, 164.8 years
  ]

  const handleSupernova = () => {
    setIsSupernova(true)
    setStarCanExpand(false)
    setTimeout(() => {
      setIsSupernova(false)
      setStarCanExpand(false)
    }, 15000) // Reset after 15 seconds (camera pan ~3s + star expansion ~2s + viewing time ~10s)
  }

  const handleCameraReady = () => {
    // Camera has panned out, now allow the star to expand
    console.log('Setting starCanExpand to true')
    setStarCanExpand(true)
  }

  const handleWormhole = () => {
    if (isWormhole) return // Prevent multiple clicks
    
    setIsWormhole(true)
    const startFov = fov
    const targetFov = 170
    const startZ = camera.position.z
    const targetZ = 200
    const expandDuration = 1000 // 1 second to expand
    const holdDuration = 5000 // Hold at 170 for 5 seconds
    const startTime = Date.now()
    
    // Animate FOV expansion and camera zoom out
    const animateExpand = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / expandDuration, 1)
      const easeProgress = progress * progress // Ease in
      const newFov = startFov + (targetFov - startFov) * easeProgress
      const newZ = startZ + (targetZ - startZ) * easeProgress
      setFov(newFov)
      camera.position.z = newZ
      
      if (progress < 1) {
        requestAnimationFrame(animateExpand)
      } else {
        // Hold at 170 for 5 seconds, then animate back
        setTimeout(() => {
          const contractStartTime = Date.now()
          const animateContract = () => {
            const elapsed = Date.now() - contractStartTime
            const progress = Math.min(elapsed / expandDuration, 1)
            const easeProgress = progress * (2 - progress) // Ease out
            const newFov = targetFov - (targetFov - startFov) * easeProgress
            const newZ = targetZ - (targetZ - startZ) * easeProgress
            setFov(newFov)
            camera.position.z = newZ
            
            if (progress < 1) {
              requestAnimationFrame(animateContract)
            } else {
              setIsWormhole(false)
            }
          }
          animateContract()
        }, holdDuration)
      }
    }
    animateExpand()
  }

  return (
    <>
      <Starfield />
      <CameraController isSupernova={isSupernova} onCameraReady={handleCameraReady} sensitivity={sensitivity} />
      <ambientLight intensity={0.1} />
      <Star isSupernova={isSupernova} canExpand={starCanExpand} />
      {planets.map((planet, index) => (
        <Planet
          key={index}
          orbitRadius={planet.orbitRadius}
          speed={planet.speed}
          color={planet.color}
          scale={planet.scale}
          startAngle={index * Math.PI / 3} // Spread planets around the orbit
          orbitOpacity={orbitOpacity}
        />
      ))}
      
      {/* UI Controls */}
      <Html fullscreen>
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          zIndex: 1000,
          opacity: (isSupernova || isWormhole) ? 0 : 1,
          pointerEvents: (isSupernova || isWormhole) ? 'none' : 'auto',
          transition: 'opacity 0.5s ease'
        }}>
          {/* Supernova Button */}
          <button
            onClick={handleSupernova}
            disabled={isSupernova}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: isSupernova ? '#666' : '#251b17ff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isSupernova ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
            }}
          >
            {isSupernova ? 'Supernova Active...' : 'Trigger Supernova'}
          </button>

          {/* Wormhole Button */}
          <button
            onClick={handleWormhole}
            disabled={isWormhole}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              backgroundColor: isWormhole ? '#666' : '#251b17ff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isWormhole ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
            }}
          >
            {isWormhole ? 'Wormhole Active...' : 'Trigger Wormhole'}
          </button>
          
          {/* FOV Slider */}
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            color: 'white',
            minWidth: '250px'
          }}>
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Field of View</span>
                <span>{fov}°</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={fov}
                onChange={(e) => setFov(Number(e.target.value))}
                onPointerDown={() => setIsDraggingSlider(true)}
                onPointerUp={() => setIsDraggingSlider(false)}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  accentColor: '#3d281fff'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#aaa'
              }}>
              </div>
            </label>
          </div>

          {/* Speed Slider */}
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            color: 'white',
            minWidth: '250px'
          }}>
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Orbital Speed</span>
                <span>{speedMultiplier.toFixed(0)}</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                step="1"
                value={speedMultiplier}
                onChange={(e) => setSpeedMultiplier(Number(e.target.value))}
                onPointerDown={() => setIsDraggingSlider(true)}
                onPointerUp={() => setIsDraggingSlider(false)}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  accentColor: '#3d281fff'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#aaa'
              }}>
              </div>
            </label>
          </div>

          {/* Sensitivity Slider */}
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            color: 'white',
            minWidth: '250px'
          }}>
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Arrow Key Sensitivity</span>
                <span>{sensitivity.toFixed(0)}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                onPointerDown={() => setIsDraggingSlider(true)}
                onPointerUp={() => setIsDraggingSlider(false)}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  accentColor: '#3d281fff'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#aaa'
              }}>
              </div>
            </label>
          </div>

          {/* Orbit Opacity Slider */}
          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            color: 'white',
            minWidth: '250px'
          }}>
            <label style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 'bold'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Orbit Rings Opacity</span>
                <span>{(orbitOpacity * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={orbitOpacity}
                onChange={(e) => setOrbitOpacity(Number(e.target.value))}
                onPointerDown={() => setIsDraggingSlider(true)}
                onPointerUp={() => setIsDraggingSlider(false)}
                style={{
                  width: '100%',
                  cursor: 'pointer',
                  accentColor: '#3d281fff'
                }}
              />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: '#aaa'
              }}>
              </div>
            </label>
          </div>
        </div>
      </Html>
    </>
  )
}

export default SolarSystem
