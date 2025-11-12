import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const Star = () => {
  const starRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Gentle pulsing animation
    if (starRef.current) {
      const scale = 1 + Math.sin(time * 0.5) * 0.05
      starRef.current.scale.set(scale, scale, scale)
    }
    
    if (glowRef.current) {
      const glowScale = 1 + Math.sin(time * 0.5) * 0.08
      glowRef.current.scale.set(glowScale, glowScale, glowScale)
    }
  })

  return (
    <group>
      {/* Point light for illuminating planets */}
      <pointLight position={[0, 0, 0]} intensity={2} color="#FDB813" />
      
      {/* Star sphere */}
      <mesh ref={starRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>
      
      {/* Glow effect */}
      <mesh ref={glowRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1.3, 32, 32]} />
        <meshBasicMaterial 
          color="#FDB813" 
          transparent 
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Additional outer glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshBasicMaterial 
          color="#FDB813" 
          transparent 
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

export default Star
