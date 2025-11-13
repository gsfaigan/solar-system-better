import { useRef, useMemo } from 'react'
import * as THREE from 'three'

const Starfield = () => {
  const starsRef = useRef<THREE.Points>(null)

  // Generate random star positions
  const starPositions = useMemo(() => {
    const positions = new Float32Array(5000 * 3) // 5000 stars, 3 coordinates each
    
    for (let i = 0; i < 5000; i++) {
      // Random positions in a large sphere around the solar system
      const radius = 200 + Math.random() * 300 // Between 200 and 500 units away
      const theta = Math.random() * Math.PI * 2 // Random angle around
      const phi = Math.acos(2 * Math.random() - 1) // Random angle up/down
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)     // x
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) // y
      positions[i * 3 + 2] = radius * Math.cos(phi)                   // z
    }
    
    return positions
  }, [])

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={starPositions.length / 3}
          array={starPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        color="#ffffffff"
        sizeAttenuation={true}
        transparent={true}
        opacity={0.8}
      />
    </points>
  )
}

export default Starfield
