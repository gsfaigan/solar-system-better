import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface StarProps {
  isSupernova?: boolean
  canExpand?: boolean
}

const Star = ({ isSupernova = false, canExpand = false }: StarProps) => {
  const starRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const outerGlowRef = useRef<THREE.Mesh>(null)
  const [supernovaScale, setSupernovaScale] = useState(1)

  useEffect(() => {
    if (isSupernova && canExpand) {
      // Only start expansion when camera is ready (canExpand = true)
      console.log('Starting supernova expansion!')
      setSupernovaScale(1)
      // Animate expansion over 3 seconds for more dramatic effect
      const duration = 3000
      const startTime = Date.now()
      const maxScale = 60 // Expand to 60x size for more dramatic effect
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        const easeProgress = 1 - Math.pow(1 - progress, 3) // Ease out cubic
        const newScale = 1 + easeProgress * (maxScale - 1)
        setSupernovaScale(newScale)
        console.log('Supernova scale:', newScale)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      animate()
    } else if (!isSupernova) {
      // Reset to normal
      setSupernovaScale(1)
    }
  }, [isSupernova, canExpand])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    const SCALE = 2
    const finalScale = SCALE * supernovaScale
    
    // Gentle pulsing animation (or rapid during supernova)
    if (starRef.current) {
      const pulseAmount = isSupernova ? 0.15 : 0.05
      const pulseSpeed = isSupernova ? 5 : 0.5
      const scale = finalScale * (1 + Math.sin(time * pulseSpeed) * pulseAmount)
      starRef.current.scale.set(scale, scale, scale)
    }
    
    if (glowRef.current) {
      const pulseAmount = isSupernova ? 0.2 : 0.08
      const pulseSpeed = isSupernova ? 5 : 0.5
      const glowScale = finalScale * (1 + Math.sin(time * pulseSpeed) * pulseAmount)
      glowRef.current.scale.set(glowScale, glowScale, glowScale)
    }
    
    if (outerGlowRef.current) {
      const pulseAmount = isSupernova ? 0.25 : 0.1
      const pulseSpeed = isSupernova ? 5 : 0.5
      const outerScale = finalScale * (1 + Math.sin(time * pulseSpeed) * pulseAmount)
      outerGlowRef.current.scale.set(outerScale, outerScale, outerScale)
    }
  })

  // Change color to superhot blue-white during supernova
  const starColor = isSupernova ? '#00BFFF' : '#FDB813'
  const lightIntensity = isSupernova ? 10 : 2

  return (
    <group>
      {/* Point light for illuminating planets */}
      <pointLight position={[0, 0, 0]} intensity={lightIntensity} color={starColor} />
      
      {/* Star sphere */}
      <mesh ref={starRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color={starColor} />
      </mesh>
      
      {/* Glow effect */}
      <mesh ref={glowRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1.3, 32, 32]} />
        <meshBasicMaterial 
          color={starColor} 
          transparent 
          opacity={isSupernova ? 0.5 : 0.3}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Additional outer glow */}
      <mesh ref={outerGlowRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1.6, 32, 32]} />
        <meshBasicMaterial 
          color={starColor} 
          transparent 
          opacity={isSupernova ? 0.3 : 0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

export default Star
