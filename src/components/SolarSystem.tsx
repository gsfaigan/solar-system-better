import Star from './Star'
import Planet from './Planet'

const SolarSystem = () => {
  // Define planet data with orbit radius, speed, color, and scale
  const planets = [
    { orbitRadius: 3, speed: 0.5, color: '#8B7355', scale: 0.4, name: 'Mercury' },
    { orbitRadius: 4.5, speed: 0.35, color: '#FFC649', scale: 0.6, name: 'Venus' },
    { orbitRadius: 6, speed: 0.3, color: '#4A90E2', scale: 0.65, name: 'Earth' },
    { orbitRadius: 7.5, speed: 0.24, color: '#CD5C5C', scale: 0.5, name: 'Mars' },
    { orbitRadius: 10, speed: 0.13, color: '#DAA520', scale: 1.2, name: 'Jupiter' },
    { orbitRadius: 13, speed: 0.1, color: '#F4E7C3', scale: 1.0, name: 'Saturn' },
  ]

  return (
    <>
      <ambientLight intensity={0.1} />
      <Star />
      {planets.map((planet, index) => (
        <Planet
          key={index}
          orbitRadius={planet.orbitRadius}
          speed={planet.speed}
          color={planet.color}
          scale={planet.scale}
          startAngle={index * Math.PI / 3} // Spread planets around the orbit
        />
      ))}
    </>
  )
}

export default SolarSystem
