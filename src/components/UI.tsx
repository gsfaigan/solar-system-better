interface UIProps {
  planets: Array<{ name: string; color: string }>
  onSupernova: () => void
  onWormhole: () => void
  onPlanetFocus: (index: number) => void
  onUnlockCamera: () => void
  isSupernova: boolean
  isWormhole: boolean
  lockedPlanet: number | null
  cameraLockMode: 'follow' | 'track'
  onCameraLockModeChange: (mode: 'follow' | 'track') => void
  fov: number
  onFovChange: (fov: number) => void
  speedMultiplier: number
  onSpeedMultiplierChange: (speed: number) => void
  sensitivity: number
  onSensitivityChange: (sensitivity: number) => void
  orbitOpacity: number
  onOrbitOpacityChange: (opacity: number) => void
  onDragStart: () => void
  onDragEnd: () => void
}

const UI = ({
  planets,
  onSupernova,
  onWormhole,
  onPlanetFocus,
  onUnlockCamera,
  isSupernova,
  isWormhole,
  lockedPlanet,
  cameraLockMode,
  onCameraLockModeChange,
  fov,
  onFovChange,
  speedMultiplier,
  onSpeedMultiplierChange,
  sensitivity,
  onSensitivityChange,
  orbitOpacity,
  onOrbitOpacityChange,
  onDragStart,
  onDragEnd
}: UIProps) => {
  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      zIndex: 1000,
      opacity: (isSupernova || isWormhole) ? 0 : 1,
      pointerEvents: (isSupernova || isWormhole) ? 'none' : 'auto',
      transition: 'opacity 0.5s ease'
    }}>
      {/* Supernova Button */}
      <button
        onClick={onSupernova}
        disabled={isSupernova}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: isSupernova ? '#666' : '#251b17ff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isSupernova ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
        }}
      >
        {isSupernova ? 'Supernova Active...' : 'Trigger Supernova'}
      </button>

      {/* Wormhole Button */}
      <button
        onClick={onWormhole}
        disabled={isWormhole}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: isWormhole ? '#666' : '#251b17ff',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: isWormhole ? 'not-allowed' : 'pointer',
          boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
          transition: 'all 0.3s ease',
        }}
      >
        {isWormhole ? 'Wormhole Active...' : 'Trigger Wormhole'}
      </button>

      {/* Planet Focus Section */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        color: 'white',
        minWidth: '250px'
      }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 'bold',
          marginBottom: '10px'
        }}>
          Focus Planet
        </div>
        
        {/* Camera Mode Toggle */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '10px'
        }}>
          <button
            onClick={() => onCameraLockModeChange('track')}
            style={{
              flex: 1,
              padding: '6px',
              fontSize: '11px',
              fontWeight: 'bold',
              backgroundColor: cameraLockMode === 'track' ? '#4A90E2' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid #4A90E2',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Track Mode
          </button>
          <button
            onClick={() => onCameraLockModeChange('follow')}
            style={{
              flex: 1,
              padding: '6px',
              fontSize: '11px',
              fontWeight: 'bold',
              backgroundColor: cameraLockMode === 'follow' ? '#E24A90' : 'rgba(255,255,255,0.1)',
              color: 'white',
              border: '1px solid #E24A90',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            Follow Mode
          </button>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px'
        }}>
          {planets.map((planet, index) => (
            <button
              key={index}
              onClick={() => onPlanetFocus(index)}
              disabled={lockedPlanet === index}
              style={{
                padding: '8px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: lockedPlanet === index ? planet.color : 'rgba(255,255,255,0.1)',
                color: 'white',
                border: `2px solid ${planet.color}`,
                borderRadius: '6px',
                cursor: lockedPlanet === index ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {planet.name}
            </button>
          ))}
        </div>
        {lockedPlanet !== null && (
          <>
            <div style={{
              marginTop: '8px',
              fontSize: '10px',
              color: '#aaa',
              fontStyle: 'italic'
            }}>
              {cameraLockMode === 'track' ? 'Camera looks at planet (free control)' : 'Camera follows planet (locked position)'}
            </div>
            <button
              onClick={onUnlockCamera}
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                backgroundColor: '#CC0000',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              ✕ Unlock Camera
            </button>
          </>
        )}
      </div>
      
      {/* FOV Slider */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        color: 'white',
        minWidth: '250px'
      }}>
        <label style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Field of View</span>
            <span>{fov}°</span>
          </div>
          <input
            type="range"
            min="50"
            max="100"
            value={fov}
            onChange={(e) => onFovChange(Number(e.target.value))}
            onPointerDown={onDragStart}
            onPointerUp={onDragEnd}
            style={{
              width: '100%',
              cursor: 'pointer',
              accentColor: '#3d281fff'
            }}
          />
        </label>
      </div>

      {/* Speed Slider */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        color: 'white',
        minWidth: '250px'
      }}>
        <label style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Orbital Speed</span>
            <span>{speedMultiplier.toFixed(0)}</span>
          </div>
          <input
            type="range"
            min="1"
            max="40"
            step="1"
            value={speedMultiplier}
            onChange={(e) => onSpeedMultiplierChange(Number(e.target.value))}
            onPointerDown={onDragStart}
            onPointerUp={onDragEnd}
            style={{
              width: '100%',
              cursor: 'pointer',
              accentColor: '#3d281fff'
            }}
          />
        </label>
      </div>

      {/* Sensitivity Slider */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        color: 'white',
        minWidth: '250px'
      }}>
        <label style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Arrow Key Sensitivity</span>
            <span>{sensitivity.toFixed(0)}</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            step="0.1"
            value={sensitivity}
            onChange={(e) => onSensitivityChange(Number(e.target.value))}
            onPointerDown={onDragStart}
            onPointerUp={onDragEnd}
            style={{
              width: '100%',
              cursor: 'pointer',
              accentColor: '#3d281fff'
            }}
          />
        </label>
      </div>

      {/* Orbit Opacity Slider */}
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
        color: 'white',
        minWidth: '250px'
      }}>
        <label style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Orbit Rings Opacity</span>
            <span>{(orbitOpacity * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={orbitOpacity}
            onChange={(e) => onOrbitOpacityChange(Number(e.target.value))}
            onPointerDown={onDragStart}
            onPointerUp={onDragEnd}
            style={{
              width: '100%',
              cursor: 'pointer',
              accentColor: '#3d281fff'
            }}
          />
        </label>
      </div>
    </div>
  )
}

export default UI
