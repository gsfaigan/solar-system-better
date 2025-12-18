# Solar System Better

An interactive 3D solar system visualization built with React Three Fiber.

## Features

- **Interactive 3D Scene**: Explore the solar system with smooth camera controls
- **Billboard Effect**: Planets are flat sprites that always face the camera to create a spherical appearance
- **Orbital Motion**: Each planet orbits around the central star at different speeds and distances
- **Moons**: Realistic moon systems for Earth, Mars, Jupiter, Saturn, Uranus, and Neptune
- **Starfield Background**: 5000 procedurally generated stars for immersive space environment
- **Texture Rotation**: Planets and moons spin on their axis for added visual effect
- **Star with Glow**: Central star features soft glow effects and gentle pulsing animation
- **Supernova Animation**: Trigger dramatic star expansion with camera zoom-out effect
- **Wormhole Effect**: Experience field-of-view warping animation
- **Camera Lock Modes**: Focus on individual planets with "track" or "follow" camera modes
- **Keyboard Controls**: Use arrow keys to rotate camera view around sun or locked planet
- **UI Controls Panel**: Adjust field of view, orbital speed, arrow key sensitivity, and orbit ring opacity in real-time
- **Lighting**: Point light from the star illuminates the scene
- **Dynamic Orbit Controls**: Custom orbit controls with camera lock and planet tracking capabilities
- **Reset Functionality**: Restore all settings to default values with a single click

## Setup

Install dependencies:

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

## Build

Build for production:

```bash
npm run build
```

## Technology Stack

- React 18
- TypeScript
- React Three Fiber (R3F)
- Three.js
- @react-three/drei
- Vite

## Project Structure

```
src/
├── components/
│   ├── SolarSystem.tsx           # Main scene composition and camera controller
│   ├── Star.tsx                  # Central star with glow effect and supernova
│   ├── Planet.tsx                # Planet component with billboard effect
│   ├── Moon.tsx                  # Moon component orbiting parent planets
│   ├── Starfield.tsx             # Background starfield with 5000 stars
│   ├── UI.tsx                    # Control panel UI with sliders and buttons
│   └── DynamicOrbitControls.tsx  # Custom orbit controls with planet locking
├── App.tsx                       # App component with Canvas setup and state
├── main.tsx                      # Entry point
└── index.css                     # Global styles
```

## Scene Details

### Star Component
- Spherical mesh with basic material for emissive appearance
- Multiple glow layers with transparency
- Gentle pulsing animation using useFrame
- Point light source for scene illumination
- Supernova effect with dramatic expansion animation

### Planet Component
- Flat plane geometry (sprite) with billboard effect
- useFrame hook to always face the camera (lookAt)
- Orbital motion around the star with configurable speeds
- Texture rotation for spin effect
- Multiple glow layers for visual depth
- Support for moon systems

### Moon Component
- Orbits around parent planets with independent speeds
- Billboard effect to face camera
- Multiple glow layers matching planet style
- Orbital path visualization

### Starfield Component
- 5000 procedurally generated stars
- Random distribution in spherical pattern around solar system
- Semi-transparent points with size attenuation

### UI Component
- Supernova trigger button
- Wormhole trigger button
- Planet focus buttons with color-coded labels
- Camera lock mode toggle (track/follow)
- Field of view slider (50-100 degrees)
- Orbital speed multiplier slider (1-40x)
- Arrow key sensitivity slider (1-10x)
- Orbit ring opacity slider (0-100%)
- Reset all settings button
- Responsive layout with backdrop blur

### Camera Controller
- Keyboard arrow key controls for camera rotation
- Smooth acceleration and damping for natural movement
- Sun-centric rotation when no planet locked
- Planet-centric rotation in track mode
- Planet-following camera in follow mode
- Automatic camera zoom for supernova effect

### DynamicOrbitControls
- Custom orbit controls extending three-stdlib
- Dynamic target updating for planet locking
- Mouse drag support with configurable damping
- Zoom constraints (min: 10, max: 350 units)
- Automatically disabled during UI slider interactions