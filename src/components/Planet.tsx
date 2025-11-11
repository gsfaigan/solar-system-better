import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface PlanetProps {
  orbitRadius: number
  speed: number
  color: string
  scale: number
  startAngle?: number
}

const Planet = ({ orbitRadius, speed, color, scale, startAngle = 0 }: PlanetProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const angleRef = useRef(startAngle)
  const textureRotationRef = useRef(0)

  useFrame((state) => {
    // Update orbital position
    angleRef.current += speed * 0.01
    
    if (groupRef.current) {
      const x = Math.cos(angleRef.current) * orbitRadius
      const z = Math.sin(angleRef.current) * orbitRadius
      groupRef.current.position.set(x, 0, z)
    }

    // Billboard effect - make sprite always face the camera
    if (meshRef.current) {
      meshRef.current.lookAt(state.camera.position)
      
      // Add texture rotation/spin for visual effect
      textureRotationRef.current += 0.005
      meshRef.current.rotation.z = textureRotationRef.current
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={meshRef}>
        {/* Use PlaneGeometry for flat sprite */}
        <planeGeometry args={[scale, scale]} />
        <meshBasicMaterial 
          color={color}
          side={THREE.DoubleSide}
          transparent
          opacity={0.95}
        />
      </mesh>
      
      {/* Add a subtle rim light effect */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[scale * 1.1, scale * 1.1]} />
        <meshBasicMaterial 
          color={color}
          side={THREE.DoubleSide}
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  )
}

export default Planet
