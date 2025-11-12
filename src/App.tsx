import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import SolarSystem from './components/SolarSystem'

function App() {
  return (
    <Canvas camera={{ position: [0, 5, 15], fov: 60 }}>
      <color attach="background" args={['#000000']} />
      <OrbitControls 
        enableDamping 
        dampingFactor={0.05} 
        rotateSpeed={0.5}
        minDistance={5}
        maxDistance={50}
      />
      <SolarSystem />
    </Canvas>
  )
}

export default App
