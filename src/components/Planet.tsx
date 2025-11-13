import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Moon from './Moon'

interface PlanetProps {
  orbitRadius: number
  speed: number
  color: string
  scale: number
  startAngle?: number
  orbitOpacity?: number
  moons?: Array<{
    orbitRadius: number
    speed: number
    color: string
    scale: number
    startAngle?: number
  }>
}

const Planet = ({ orbitRadius, speed, color, scale, startAngle = 0, orbitOpacity = 0.6, moons = [] }: PlanetProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const outerGlowRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const angleRef = useRef(startAngle)
  const textureRotationRef = useRef(0)
  const positionRef = useRef(new THREE.Vector3(0, 0, 0))

  // Create orbital path geometry
  const orbitPoints = []
  const segments = 64
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    orbitPoints.push(
      new THREE.Vector3(
        Math.cos(angle) * orbitRadius,
        0,
        Math.sin(angle) * orbitRadius
      )
    )
  }
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Update orbital position
    angleRef.current += speed * 0.01
    
    if (groupRef.current) {
      const x = Math.cos(angleRef.current) * orbitRadius
      const z = Math.sin(angleRef.current) * orbitRadius
      groupRef.current.position.set(x, 0, z)
      positionRef.current.set(x, 0, z)
    }

    // Calculate pulsing scales
    const pulseScale = 1 + Math.sin(time * 0.5) * 0.05
    const glowScale = 1 + Math.sin(time * 0.5) * 0.08

    // Apply billboard effect and animations to main planet
    if (meshRef.current) {
      // Billboard: make it face the camera
      meshRef.current.lookAt(state.camera.position)
      
      // Apply scale first
      meshRef.current.scale.set(pulseScale, pulseScale, pulseScale)
      
      // Then apply rotation on Z axis (after lookAt)
      textureRotationRef.current += 0.005
      meshRef.current.rotation.z += textureRotationRef.current * 0.01
    }
    
    // Apply to glow layers
    if (glowRef.current) {
      glowRef.current.lookAt(state.camera.position)
      glowRef.current.scale.set(glowScale, glowScale, glowScale)
    }
    
    if (outerGlowRef.current) {
      outerGlowRef.current.lookAt(state.camera.position)
    }
  })

  return (
    <>
      {/* Orbital path line */}
      <line>
        <primitive object={orbitGeometry} attach="geometry" />
        <lineBasicMaterial 
          color={color} 
          transparent 
          opacity={orbitOpacity} 
        />
      </line>

      <group ref={groupRef}>
        {/* Main planet circle */}
        <mesh ref={meshRef}>
          <circleGeometry args={[scale / 2, 32]} />
          <meshBasicMaterial 
            color={color}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Glow effect */}
        <mesh ref={glowRef} position={[0, 0, -0.01]}>
          <circleGeometry args={[scale / 2 * 1.3, 32]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        {/* Additional outer glow */}
        <mesh ref={outerGlowRef} position={[0, 0, -0.02]}>
          <circleGeometry args={[scale / 2 * 1.6, 32]} />
          <meshBasicMaterial 
            color={color} 
            transparent 
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Render moons */}
      {moons.map((moon, index) => (
        <Moon
          key={index}
          orbitRadius={moon.orbitRadius}
          speed={moon.speed}
          color={moon.color}
          scale={moon.scale}
          startAngle={moon.startAngle || index * Math.PI / 2}
          parentPosition={positionRef.current}
          orbitOpacity={orbitOpacity}
        />
      ))}
    </>
  )
}

export default Planet
