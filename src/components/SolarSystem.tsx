import { useState, useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import Star from './Star'
import Planet from './Planet'
import Starfield from './Starfield'

const CameraController = ({ 
  isSupernova, 
  onCameraReady,
  sensitivity = 1.0,
  lockedPlanetIndex = null,
  planetPositions = [],
  cameraLockMode = 'follow'
}: { 
  isSupernova: boolean
  onCameraReady?: () => void
  sensitivity?: number
  lockedPlanetIndex?: number | null
  planetPositions?: THREE.Vector3[]
  cameraLockMode?: 'follow' | 'track'
}) => {
  const { camera } = useThree()
  const initialZ = useRef(camera.position.z)
  const isAnimating = useRef(false)
  const hasNotifiedReady = useRef(false)
  const keysPressed = useRef<Set<string>>(new Set())
  const velocity = useRef({ horizontal: 0, vertical: 0 })
  const lastPlanetPos = useRef<THREE.Vector3 | null>(null)
  
  useEffect(() => {
    if (isSupernova) {
      // Store initial position when supernova starts
      initialZ.current = camera.position.z
      isAnimating.current = true
      hasNotifiedReady.current = false
    }
  }, [isSupernova, camera])

  // Reset planet tracking when lock changes
  useEffect(() => {
    lastPlanetPos.current = null
  }, [lockedPlanetIndex, cameraLockMode])

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
    // Handle camera lock to planet
    if (lockedPlanetIndex !== null && planetPositions[lockedPlanetIndex]) {
      const targetPos = planetPositions[lockedPlanetIndex]
      
      if (cameraLockMode === 'follow') {
        // Follow mode: camera follows planet through space with keyboard rotation
        
        if (!lastPlanetPos.current) {
          // Initialize - first time locking to planet
          lastPlanetPos.current = targetPos.clone()
        } else {
          // Calculate how much the planet moved since last frame
          const planetDelta = targetPos.clone().sub(lastPlanetPos.current)
          
          // Move camera by the same amount (follows the planet)
          camera.position.add(planetDelta)
          
          // Update last position
          lastPlanetPos.current = targetPos.clone()
        }
        
        // Handle keyboard rotation around the planet
        if (!isSupernova && !isAnimating.current) {
          const acceleration = 0.001 * sensitivity / 3
          const maxSpeed = 0.02 * sensitivity / 3
          const verticalAcceleration = 0.04 * sensitivity / 3
          const maxVerticalSpeed = 1.2 * sensitivity / 3
          const damping = 0.5
          
          // Accelerate based on key presses
          if (keysPressed.current.has('ArrowRight')) {
            velocity.current.horizontal = Math.min(velocity.current.horizontal + acceleration, maxSpeed)
          } else if (keysPressed.current.has('ArrowLeft')) {
            velocity.current.horizontal = Math.max(velocity.current.horizontal - acceleration, -maxSpeed)
          } else {
            velocity.current.horizontal *= damping
            if (Math.abs(velocity.current.horizontal) < 0.0001) velocity.current.horizontal = 0
          }
          
          if (keysPressed.current.has('ArrowUp')) {
            velocity.current.vertical = Math.min(velocity.current.vertical + verticalAcceleration, maxVerticalSpeed)
          } else if (keysPressed.current.has('ArrowDown')) {
            velocity.current.vertical = Math.max(velocity.current.vertical - verticalAcceleration, -maxVerticalSpeed)
          } else {
            velocity.current.vertical *= damping
            if (Math.abs(velocity.current.vertical) < 0.001) velocity.current.vertical = 0
          }
          
          // Rotate around the locked planet
          if (velocity.current.horizontal !== 0 || velocity.current.vertical !== 0) {
            // Get current position relative to planet
            const relativePos = camera.position.clone().sub(targetPos)
            const radius = relativePos.length()
            
            // Calculate spherical coordinates
            const theta = Math.atan2(relativePos.x, relativePos.z) + velocity.current.horizontal
            const phi = Math.acos(relativePos.y / radius) - velocity.current.vertical * 0.1
            
            // Clamp phi to prevent flipping over poles
            const clampedPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi))
            
            // Convert back to Cartesian coordinates
            const newRelativePos = new THREE.Vector3(
              radius * Math.sin(clampedPhi) * Math.sin(theta),
              radius * Math.cos(clampedPhi),
              radius * Math.sin(clampedPhi) * Math.cos(theta)
            )
            
            // Set camera position relative to planet
            camera.position.copy(targetPos.clone().add(newRelativePos))
            
            // Update lastPlanetPos since we moved the camera
            lastPlanetPos.current = targetPos.clone()
          }
        }
        
        return // Skip sun-centric controls when locked
      } else {
        // Track mode: orbit around planet with keyboard/mouse controls
        const acceleration = 0.001 * sensitivity / 3
        const maxSpeed = 0.02 * sensitivity / 3
        const verticalAcceleration = 0.04 * sensitivity / 3
        const maxVerticalSpeed = 1.2 * sensitivity / 3
        const damping = 0.5
        
        // Accelerate based on key presses
        if (keysPressed.current.has('ArrowRight')) {
          velocity.current.horizontal = Math.min(velocity.current.horizontal + acceleration, maxSpeed)
        } else if (keysPressed.current.has('ArrowLeft')) {
          velocity.current.horizontal = Math.max(velocity.current.horizontal - acceleration, -maxSpeed)
        } else {
          velocity.current.horizontal *= damping
          if (Math.abs(velocity.current.horizontal) < 0.0001) velocity.current.horizontal = 0
        }
        
        if (keysPressed.current.has('ArrowUp')) {
          velocity.current.vertical = Math.min(velocity.current.vertical + verticalAcceleration, maxVerticalSpeed)
        } else if (keysPressed.current.has('ArrowDown')) {
          velocity.current.vertical = Math.max(velocity.current.vertical - verticalAcceleration, -maxVerticalSpeed)
        } else {
          velocity.current.vertical *= damping
          if (Math.abs(velocity.current.vertical) < 0.001) velocity.current.vertical = 0
        }
        
        // Rotate around the locked planet
        if (velocity.current.horizontal !== 0 || velocity.current.vertical !== 0) {
          // Get current position relative to planet
          const relativePos = camera.position.clone().sub(targetPos)
          const radius = relativePos.length()
          
          // Calculate spherical coordinates
          const theta = Math.atan2(relativePos.x, relativePos.z) + velocity.current.horizontal
          const phi = Math.acos(relativePos.y / radius) - velocity.current.vertical * 0.1
          
          // Clamp phi to prevent flipping over poles
          const clampedPhi = Math.max(0.1, Math.min(Math.PI - 0.1, phi))
          
          // Convert back to Cartesian coordinates
          const newRelativePos = new THREE.Vector3(
            radius * Math.sin(clampedPhi) * Math.sin(theta),
            radius * Math.cos(clampedPhi),
            radius * Math.sin(clampedPhi) * Math.cos(theta)
          )
          
          // Set camera position relative to planet
          camera.position.copy(targetPos.clone().add(newRelativePos))
        }
        
        camera.lookAt(targetPos)
        return // Skip sun-centric controls when locked
      }
    }

    // Handle keyboard camera rotation with easing (sun-centric)
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

interface SolarSystemProps {
  isSupernova: boolean
  setIsSupernova: (value: boolean) => void
  isWormhole: boolean
  setIsWormhole: (value: boolean) => void
  fov: number
  speedMultiplier: number
  sensitivity: number
  isDraggingSlider: boolean
  orbitOpacity: number
  lockedPlanet: number | null
  cameraLockMode: 'follow' | 'track'
  planetPositionsRef: React.MutableRefObject<THREE.Vector3[]>
}

const SolarSystem = ({
  isSupernova,
  setIsSupernova,
  isWormhole,
  setIsWormhole,
  fov,
  speedMultiplier,
  sensitivity,
  isDraggingSlider,
  orbitOpacity,
  lockedPlanet,
  cameraLockMode,
  planetPositionsRef
}: SolarSystemProps) => {
  const [starCanExpand, setStarCanExpand] = useState(false)
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
    { orbitRadius: 3 * PATH_SCALE, speed: 4.15 * speedMultiplier, color: '#8B7355', scale: 0.5 * SIZE_SCALE, name: 'Mercury', moons: [] },
    { orbitRadius: 4.5 * PATH_SCALE, speed: 1.62 * speedMultiplier, color: '#FFC649', scale: 0.95 * SIZE_SCALE, name: 'Venus', moons: [] },
    { 
      orbitRadius: 6 * PATH_SCALE, 
      speed: 1.0 * speedMultiplier, 
      color: '#4A90E2', 
      scale: 1.0 * SIZE_SCALE, 
      name: 'Earth',
      moons: [
        { orbitRadius: 0.8, speed: 13.0 * speedMultiplier, color: '#CCCCCC', scale: 0.15 * SIZE_SCALE }
      ]
    },
    { 
      orbitRadius: 7.5 * PATH_SCALE, 
      speed: 0.53 * speedMultiplier, 
      color: '#CD5C5C', 
      scale: 0.53 * SIZE_SCALE, 
      name: 'Mars',
      moons: [
        { orbitRadius: 0.4, speed: 7.0 * speedMultiplier, color: '#AAA', scale: 0.08 * SIZE_SCALE },
        { orbitRadius: 0.6, speed: 4.0 * speedMultiplier, color: '#999', scale: 0.06 * SIZE_SCALE }
      ]
    },
    { 
      orbitRadius: 11 * PATH_SCALE, 
      speed: 0.084 * speedMultiplier, 
      color: '#C88B3A', 
      scale: 4.5 * SIZE_SCALE, 
      name: 'Jupiter',
      moons: [
        { orbitRadius: 2.5, speed: 2.4 * speedMultiplier, color: '#E6D5AC', scale: 0.2 * SIZE_SCALE }, // Io
        { orbitRadius: 3.0, speed: 1.8 * speedMultiplier, color: '#C9B18C', scale: 0.18 * SIZE_SCALE }, // Europa
        { orbitRadius: 3.8, speed: 1.2 * speedMultiplier, color: '#B8A68A', scale: 0.25 * SIZE_SCALE }, // Ganymede
        { orbitRadius: 4.5, speed: 0.9 * speedMultiplier, color: '#A89677', scale: 0.23 * SIZE_SCALE }  // Callisto
      ]
    },
    { 
      orbitRadius: 15 * PATH_SCALE, 
      speed: 0.034 * speedMultiplier, 
      color: '#F4E7C3', 
      scale: 3.5 * SIZE_SCALE, 
      name: 'Saturn',
      moons: [
        { orbitRadius: 2.0, speed: 3.5 * speedMultiplier, color: '#E8DCC8', scale: 0.15 * SIZE_SCALE }, // Titan
        { orbitRadius: 2.8, speed: 2.0 * speedMultiplier, color: '#D4C4B0', scale: 0.1 * SIZE_SCALE }   // Rhea
      ]
    },
    { 
      orbitRadius: 19 * PATH_SCALE, 
      speed: 0.012 * speedMultiplier, 
      color: '#4FD0E7', 
      scale: 2.5 * SIZE_SCALE, 
      name: 'Uranus',
      moons: [
        { orbitRadius: 1.5, speed: 4.0 * speedMultiplier, color: '#B8D8E8', scale: 0.12 * SIZE_SCALE }
      ]
    },
    { 
      orbitRadius: 23 * PATH_SCALE, 
      speed: 0.006 * speedMultiplier, 
      color: '#4169E1', 
      scale: 2 * SIZE_SCALE, 
      name: 'Neptune',
      moons: [
        { orbitRadius: 1.3, speed: 5.0 * speedMultiplier, color: '#7BA3D1', scale: 0.11 * SIZE_SCALE }
      ]
    }
  ]

  useEffect(() => {
    if (!isSupernova) return
    
    setStarCanExpand(false)
    const timeout = setTimeout(() => {
      setIsSupernova(false)
      setStarCanExpand(false)
    }, 15000) // Reset after 15 seconds
    
    return () => clearTimeout(timeout)
  }, [isSupernova, setIsSupernova])

  const handleCameraReady = () => {
    // Camera has panned out, now allow the star to expand
    console.log('Setting starCanExpand to true')
    setStarCanExpand(true)
  }

  useEffect(() => {
    if (!isWormhole) return
    
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
      
      if (camera && 'fov' in camera) {
        (camera as THREE.PerspectiveCamera).fov = newFov
        camera.updateProjectionMatrix()
      }
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
            
            if (camera && 'fov' in camera) {
              (camera as THREE.PerspectiveCamera).fov = newFov
              camera.updateProjectionMatrix()
            }
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
  }, [isWormhole, camera, fov, setIsWormhole])

  return (
    <>
      <Starfield />
      <CameraController 
        isSupernova={isSupernova} 
        onCameraReady={handleCameraReady} 
        sensitivity={sensitivity}
        lockedPlanetIndex={lockedPlanet}
        planetPositions={planetPositionsRef.current}
        cameraLockMode={cameraLockMode}
      />
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
          moons={planet.moons}
          onPositionUpdate={(pos) => {
            planetPositionsRef.current[index] = pos.clone()
          }}
        />
      ))}
    </>
  )
}

export default SolarSystem
