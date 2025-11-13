import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface MoonProps {
  orbitRadius: number
  speed: number
  color: string
  scale: number
  startAngle?: number
  parentPosition: THREE.Vector3
  orbitOpacity?: number
}

const Moon = ({ orbitRadius, speed, color, scale, startAngle = 0, parentPosition, orbitOpacity = 0.6 }: MoonProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const outerGlowRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const orbitLineRef = useRef<THREE.Line>(null)
  const angleRef = useRef(startAngle)

  // Create orbital path geometry around parent planet
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
    
    // Update orbital position around parent planet
    angleRef.current += speed * 0.01
    
    // Update orbit line position to follow parent
    if (orbitLineRef.current) {
      orbitLineRef.current.position.set(parentPosition.x, 0, parentPosition.z)
    }
    
    if (groupRef.current) {
      const x = parentPosition.x + Math.cos(angleRef.current) * orbitRadius
      const z = parentPosition.z + Math.sin(angleRef.current) * orbitRadius
      groupRef.current.position.set(x, 0, z)
      
      // Make moon face camera
      groupRef.current.lookAt(state.camera.position)
    }

    // Calculate pulsing scales
    const pulseScale = 1 + Math.sin(time * 0.5) * 0.05
    const glowScale = 1 + Math.sin(time * 0.5) * 0.08

    // Apply pulsing to moon
    if (meshRef.current) {
      meshRef.current.scale.set(pulseScale, pulseScale, 1)
    }
    if (glowRef.current) {
      glowRef.current.scale.set(glowScale, glowScale, 1)
    }
    if (outerGlowRef.current) {
      outerGlowRef.current.scale.set(glowScale * 1.1, glowScale * 1.1, 1)
    }
  })

  return (
    <>
      {/* Orbital path line around parent */}
      <primitive object={new THREE.Line(orbitGeometry, new THREE.LineBasicMaterial({ 
        color, 
        transparent: true, 
        opacity: orbitOpacity * 0.5 
      }))} ref={orbitLineRef} />

      <group ref={groupRef}>
        {/* Main moon circle */}
        <mesh ref={meshRef}>
          <circleGeometry args={[scale / 2, 32]} />
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Inner glow */}
        <mesh ref={glowRef} position={[0, 0, -0.01]}>
          <circleGeometry args={[scale * 0.55, 32]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.4}
          />
        </mesh>

        {/* Outer glow */}
        <mesh ref={outerGlowRef} position={[0, 0, -0.02]}>
          <circleGeometry args={[scale * 0.8, 32]} />
          <meshBasicMaterial 
            color={color}
            transparent
            opacity={0.2}
          />
        </mesh>
      </group>
    </>
  )
}

export default Moon
