# Solar System Better

An interactive 3D solar system visualization built with React Three Fiber.

## Features

- **Interactive 3D Scene**: Explore the solar system with smooth camera controls
- **Billboard Effect**: Planets are flat sprites that always face the camera to create a spherical appearance
- **Orbital Motion**: Each planet orbits around the central star at different speeds and distances
- **Texture Rotation**: Planets spin on their axis for added visual effect
- **Star with Glow**: Central star features soft glow effects and gentle pulsing animation
- **Lighting**: Point light from the star illuminates the scene
- **OrbitControls**: Smooth, interactive camera movement with damping

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
│   ├── SolarSystem.tsx    # Main scene composition
│   ├── Star.tsx           # Central star with glow effect
│   └── Planet.tsx         # Planet component with billboard effect
├── App.tsx                # App component with Canvas setup
├── main.tsx               # Entry point
└── index.css              # Global styles
```

## Scene Details

### Star Component
- Spherical mesh with basic material for emissive appearance
- Multiple glow layers with transparency
- Gentle pulsing animation using useFrame
- Point light source for scene illumination

### Planet Component
- Flat plane geometry (sprite) with billboard effect
- useFrame hook to always face the camera (lookAt)
- Orbital motion around the star
- Texture rotation for spin effect
- Subtle rim light for depth

### OrbitControls
- Enabled damping for smooth camera movement
- Configurable min/max zoom distances
- Smooth rotation speed