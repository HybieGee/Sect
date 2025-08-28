import { Canvas, useFrame } from '@react-three/fiber';
import { PointerLockControls, useGLTF, Html, Box, Plane } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useNavigate } from 'react-router-dom';
import { useState, Suspense, useRef, useEffect } from 'react';
import * as THREE from 'three';

function LoadingScreen() {
  return (
    <Html center>
      <div style={{ color: '#ff0000', fontSize: '24px', textAlign: 'center' }}>
        Loading The Sect...
      </div>
    </Html>
  );
}


// FPS Camera movement component
function FPSCamera() {
  const controlsRef = useRef<any>();
  const [movement, setMovement] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          setMovement(prev => ({ ...prev, forward: true }));
          break;
        case 'ArrowLeft':
        case 'KeyA':
          setMovement(prev => ({ ...prev, left: true }));
          break;
        case 'ArrowDown':
        case 'KeyS':
          setMovement(prev => ({ ...prev, backward: true }));
          break;
        case 'ArrowRight':
        case 'KeyD':
          setMovement(prev => ({ ...prev, right: true }));
          break;
      }
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          setMovement(prev => ({ ...prev, forward: false }));
          break;
        case 'ArrowLeft':
        case 'KeyA':
          setMovement(prev => ({ ...prev, left: false }));
          break;
        case 'ArrowDown':
        case 'KeyS':
          setMovement(prev => ({ ...prev, backward: false }));
          break;
        case 'ArrowRight':
        case 'KeyD':
          setMovement(prev => ({ ...prev, right: false }));
          break;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);
  
  useFrame((state, delta) => {
    const camera = state.camera;
    if (!camera) return;
    
    const speed = 15;
    velocity.current.set(0, 0, 0);
    
    // Get forward direction
    direction.current.set(0, 0, -1);
    direction.current.applyQuaternion(camera.quaternion);
    direction.current.y = 0; // Keep movement on horizontal plane
    direction.current.normalize();
    
    // Get right direction
    const right = new THREE.Vector3();
    right.crossVectors(direction.current, camera.up).normalize();
    
    // Apply movement
    if (movement.forward) {
      velocity.current.add(direction.current.clone().multiplyScalar(speed * delta));
    }
    if (movement.backward) {
      velocity.current.add(direction.current.clone().multiplyScalar(-speed * delta));
    }
    if (movement.left) {
      velocity.current.add(right.clone().multiplyScalar(-speed * delta));
    }
    if (movement.right) {
      velocity.current.add(right.clone().multiplyScalar(speed * delta));
    }
    
    // Apply movement to camera
    camera.position.add(velocity.current);
    
    // Keep camera at reasonable height
    camera.position.y = Math.max(2, camera.position.y);
  });
  
  return (
    <PointerLockControls 
      ref={controlsRef}
    />
  );
}

function GalleryModel() {
  const navigate = useNavigate();
  const modelRef = useRef<THREE.Group>();
  const [modelReady, setModelReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load the GLTF model
  const gltf = useGLTF('/assets/TheSect.gltf');
  
  useEffect(() => {
    if (gltf?.scene) {
      console.log('GLTF model loaded successfully', gltf);
      console.log('Scene children:', gltf.scene.children.length);
      setModelReady(true);
      setError(null);
      
      // Apply materials to enhance the model
      gltf.scene.traverse((child) => {
        console.log('Processing child:', child.name, child.type);
        
        if (child instanceof THREE.Mesh) {
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            
            materials.forEach((material) => {
              if (material instanceof THREE.MeshStandardMaterial || 
                  material instanceof THREE.MeshBasicMaterial) {
                // Make sure the material is visible
                material.visible = true;
                
                // Only enhance materials that don't already have emissive properties
                // Keep chandelier and other emissive materials as they are
                if (material instanceof THREE.MeshStandardMaterial) {
                  // Check if this material already has emissive properties from the GLTF
                  if (!material.emissiveMap && material.emissive.getHex() === 0x000000) {
                    // Only add subtle emissive to non-emissive materials
                    material.emissive = new THREE.Color(0x050505);
                    material.emissiveIntensity = 0.05;
                  }
                  // Preserve original metalness and roughness from GLTF
                  // material.metalness and material.roughness are already set from GLTF
                }
                
                material.needsUpdate = true;
              }
            });
          }
          
          // Make sure geometry is visible
          if (child.geometry) {
            child.geometry.computeVertexNormals();
          }
          
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
      
      // Set a reasonable scale if the model is too big/small
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = box.getSize(new THREE.Vector3());
      console.log('Model size:', size);
      console.log('Model bounds:', box.min, box.max);
      
      // Always scale up if the model is too small (gallery should be room-sized)
      if (size.length() < 10) {
        const targetSize = 30; // Make it larger for a proper gallery
        const scale = targetSize / size.length();
        gltf.scene.scale.setScalar(scale);
        console.log('Applied scale:', scale);
      } else if (size.length() > 100) {
        // Only scale down if really huge
        const targetSize = 50;
        const scale = targetSize / size.length();
        gltf.scene.scale.setScalar(scale);
        console.log('Applied scale:', scale);
      }
      
      // Center the model at origin
      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.sub(center);
      console.log('Centered model at:', gltf.scene.position);
    }
  }, [gltf]);
  
  // Set up interactive areas
  const handleClick = (event: any) => {
    event.stopPropagation();
    const clickedObject = event.object;
    console.log('Clicked object:', clickedObject.name, clickedObject);
    
    // Navigate based on clicks anywhere for now
    const position = event.point;
    if (position.x < -5) {
      navigate('/whitepaper');
    } else if (position.x > 5) {
      navigate('/gallery');
    } else if (position.z < -5) {
      navigate('/create');
    }
  };
  
  if (error) {
    console.error('Gallery model error:', error);
    return null;
  }
  
  if (!modelReady || !gltf?.scene) {
    return null;
  }
  
  return (
    <primitive 
      ref={modelRef}
      object={gltf.scene} 
      position={[0, 0, 0]}
      onClick={handleClick}
    />
  );
}

// Gallery-like fallback room
function FallbackRoom() {
  const navigate = useNavigate();
  
  return (
    <>
      {/* Floor with pattern */}
      <Plane args={[50, 50]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#0d0d0d" />
      </Plane>
      
      {/* Floor pattern */}
      {[-15, -5, 5, 15].map((x, i) =>
        [-15, -5, 5, 15].map((z, j) => (
          <Box key={`${i}-${j}`} args={[0.1, 0.05, 8]} position={[x, 0.025, z]} rotation={[0, j % 2 ? Math.PI / 2 : 0, 0]}>
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.1} />
          </Box>
        ))
      )}
      
      {/* Main walls */}
      <Plane args={[50, 20]} position={[0, 10, -25]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Plane>
      <Plane args={[50, 20]} position={[0, 10, 25]} rotation={[0, Math.PI, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Plane>
      <Plane args={[50, 20]} position={[-25, 10, 0]} rotation={[0, Math.PI / 2, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Plane>
      <Plane args={[50, 20]} position={[25, 10, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <meshStandardMaterial color="#1a1a1a" />
      </Plane>
      
      {/* Gallery ceiling */}
      <Plane args={[50, 50]} rotation={[Math.PI / 2, 0, 0]} position={[0, 20, 0]}>
        <meshStandardMaterial color="#0a0a0a" />
      </Plane>
      
      {/* Interactive portals with pedestals */}
      {[
        { pos: [-12, 0, 0], name: 'WHITEPAPER', nav: '/whitepaper' },
        { pos: [0, 0, -18], name: 'CREATE CULT', nav: '/create' },
        { pos: [12, 0, 0], name: 'GALLERY', nav: '/gallery' }
      ].map((portal, i) => (
        <group key={i} position={portal.pos as [number, number, number]}>
          {/* Pedestal */}
          <Box args={[6, 1, 6]} position={[0, 0.5, 0]}>
            <meshStandardMaterial color="#2a2a2a" />
          </Box>
          {/* Portal */}
          <Box 
            args={[4, 8, 0.8]} 
            position={[0, 5, 0]}
            onClick={() => navigate(portal.nav)}
          >
            <meshStandardMaterial 
              color="#000000" 
              emissive="#ff0000" 
              emissiveIntensity={0.6} 
            />
          </Box>
          {/* Portal frame */}
          <Box args={[5, 9, 1]} position={[0, 5, 0]}>
            <meshStandardMaterial 
              color="#330000" 
              emissive="#ff0000" 
              emissiveIntensity={0.2}
              transparent
              opacity={0.3}
            />
          </Box>
        </group>
      ))}
      
      {/* Gallery lighting fixtures */}
      {[-10, 0, 10].map((x, i) =>
        [-10, 0, 10].map((z, j) => (
          <pointLight 
            key={`${i}-${j}`}
            position={[x, 15, z]} 
            intensity={0.3} 
            color="#ff0000"
            distance={20}
          />
        ))
      )}
      
      {/* Decorative elements */}
      {[-20, -10, 10, 20].map((x, i) => (
        <Box key={i} args={[2, 6, 0.2]} position={[x, 8, -24.5]}>
          <meshStandardMaterial
            color="#000000"
            emissive="#ff0000"
            emissiveIntensity={0.4}
          />
        </Box>
      ))}
    </>
  );
}

function Room() {
  const navigate = useNavigate();
  const [showFallback, setShowFallback] = useState(true);
  const [debugInfo, setDebugInfo] = useState('Loading...');
  
  useEffect(() => {
    // Preload the model
    console.log('Preloading GLTF model...');
    useGLTF.preload('/assets/TheSect.gltf');
    
    // Check model loading status
    const checkModel = async () => {
      try {
        // Test if we can fetch the file
        const response = await fetch('/assets/TheSect.gltf');
        console.log('GLTF fetch response:', response.status, response.headers.get('content-type'));
        
        if (response.ok) {
          setDebugInfo(`GLTF file found (${(response.headers.get('content-length') || '0')} bytes)`);
          // Give the model component more time to load
          setTimeout(() => {
            setShowFallback(false);
            setDebugInfo('Model should be loaded');
          }, 2000);
        } else {
          setDebugInfo(`GLTF file not found (${response.status})`);
        }
      } catch (error) {
        console.error('Error fetching GLTF:', error);
        setDebugInfo(`Error: ${error}`);
      }
    };
    
    checkModel();
  }, []);
  
  return (
    <>
      <FPSCamera />
      
      {/* Always try to show the gallery model */}
      <Suspense fallback={<LoadingScreen />}>
        <GalleryModel />
      </Suspense>
      
      {/* Show fallback room initially, then hide it */}
      {showFallback && <FallbackRoom />}
      
      {/* Debug info */}
      <Html position={[0, 8, 0]} center>
        <div style={{ 
          color: '#ff0000', 
          background: 'rgba(0,0,0,0.8)', 
          padding: '12px',
          fontSize: '14px',
          border: '2px solid #ff0000',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>
            🏛️ LOADING CUSTOM GALLERY
          </div>
          <div style={{ fontSize: '12px' }}>
            Loading your custom GLTF gallery with separate textures.
            <br />Fallback room will disappear when model loads.
          </div>
          <div style={{ fontSize: '11px', marginTop: '8px', opacity: 0.7 }}>
            Status: {debugInfo}
          </div>
        </div>
      </Html>
      
      {/* Navigation labels */}
      <Html position={[-12, 5, 0]} center>
        <div 
          style={{ 
            color: '#ff0000', 
            background: 'rgba(0,0,0,0.9)', 
            padding: '12px',
            cursor: 'pointer',
            border: '2px solid #ff0000',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
          onClick={() => navigate('/whitepaper')}
        >
          WHITEPAPER
        </div>
      </Html>
      
      <Html position={[0, 5, -15]} center>
        <div 
          style={{ 
            color: '#ff0000', 
            background: 'rgba(0,0,0,0.9)', 
            padding: '12px',
            cursor: 'pointer',
            border: '2px solid #ff0000',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
          onClick={() => navigate('/create')}
        >
          CREATE CULT
        </div>
      </Html>
      
      <Html position={[12, 5, 0]} center>
        <div 
          style={{ 
            color: '#ff0000', 
            background: 'rgba(0,0,0,0.9)', 
            padding: '12px',
            cursor: 'pointer',
            border: '2px solid #ff0000',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
          onClick={() => navigate('/gallery')}
        >
          GALLERY
        </div>
      </Html>
    </>
  );
}

function Hub() {
  const [instructionsVisible, setInstructionsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => setInstructionsVisible(false), 5000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 5, 15], fov: 75 }}>        
        {/* Lighting setup for better visibility */}
        <ambientLight intensity={1.2} color="#ffffff" />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={2.5} 
          color="#ffffff" 
          castShadow 
        />
        <pointLight position={[0, 8, 0]} intensity={4} color="#ffcc88" />
        <pointLight position={[-10, 5, -10]} intensity={3} color="#ff9966" />
        <pointLight position={[10, 5, -10]} intensity={3} color="#ff9966" />
        <pointLight position={[0, 6, 10]} intensity={3} color="#ffaa77" />
        <pointLight position={[0, 6, -20]} intensity={3} color="#ffaa77" />
        <pointLight position={[-15, 8, 0]} intensity={2.5} color="#ffbb88" />
        <pointLight position={[15, 8, 0]} intensity={2.5} color="#ffbb88" />
        
        <Suspense fallback={null}>
          <Room />
        </Suspense>
        
        <EffectComposer>
          <Bloom 
            intensity={1.2}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            radius={0.4}
          />
        </EffectComposer>
      </Canvas>
      
      {/* Instructions overlay */}
      {instructionsVisible && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#ff0000',
          padding: '20px',
          border: '2px solid #ff0000',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '14px',
          zIndex: 1000
        }}>
          <div style={{ marginBottom: '10px', fontSize: '16px', fontWeight: 'bold' }}>
            🎮 FPS CONTROLS
          </div>
          <div>• Click to lock pointer</div>
          <div>• WASD or Arrow keys to move</div>
          <div>• Mouse to look around</div>
          <div>• ESC to unlock pointer</div>
          <div>• Click red portals to navigate</div>
          <div style={{ marginTop: '10px', fontSize: '12px', opacity: 0.7 }}>
            (This message will disappear in 5 seconds)
          </div>
        </div>
      )}
      
      {/* Top navigation */}
      <div className="nav">
        <button onClick={() => window.location.href = '/gallery'}>Gallery</button>
        <button onClick={() => window.location.href = '/create'}>Create</button>
        <button onClick={() => setInstructionsVisible(!instructionsVisible)}>Help</button>
      </div>
    </div>
  );
}

export default Hub;