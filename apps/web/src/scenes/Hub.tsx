import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Text, Box, Plane, useGLTF, Html } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { useNavigate } from 'react-router-dom';
import { useState, Suspense, useRef } from 'react';
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

function GalleryModel() {
  const { scene } = useGLTF('/assets/sect-hub.glb');
  const navigate = useNavigate();
  const modelRef = useRef<THREE.Group>();
  
  // Set up interactive areas (you can adjust these based on your model)
  const handleClick = (event: any) => {
    event.stopPropagation();
    const clickedObject = event.object;
    
    // You can add specific navigation based on clicked objects
    // For now, adding some example interactions
    if (clickedObject.name.toLowerCase().includes('portal') || 
        clickedObject.name.toLowerCase().includes('door')) {
      if (clickedObject.name.toLowerCase().includes('create')) {
        navigate('/create');
      } else if (clickedObject.name.toLowerCase().includes('gallery')) {
        navigate('/gallery');
      } else if (clickedObject.name.toLowerCase().includes('white')) {
        navigate('/whitepaper');
      }
    }
  };
  
  // Apply emissive materials to enhance the red glow effect
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      // Enhance materials with emissive properties for the red aesthetic
      if (child.material) {
        const mat = child.material as THREE.MeshStandardMaterial;
        if (mat.color && (mat.color.r > 0.5 || mat.name?.toLowerCase().includes('red'))) {
          mat.emissive = new THREE.Color(0xff0000);
          mat.emissiveIntensity = 0.2;
        }
      }
    }
  });
  
  return (
    <primitive 
      ref={modelRef}
      object={scene} 
      scale={1} 
      position={[0, 0, 0]}
      onClick={handleClick}
    />
  );
}

function Room() {
  const navigate = useNavigate();
  const [showLabels, setShowLabels] = useState(true);
  
  return (
    <>
      <Suspense fallback={<LoadingScreen />}>
        <GalleryModel />
      </Suspense>
      
      {/* Overlay UI for navigation hints */}
      {showLabels && (
        <>
          <Html position={[-5, 3, 0]} center>
            <div 
              style={{ 
                color: '#ff0000', 
                background: 'rgba(0,0,0,0.8)', 
                padding: '8px',
                cursor: 'pointer',
                border: '1px solid #ff0000'
              }}
              onClick={() => navigate('/whitepaper')}
            >
              WHITEPAPER →
            </div>
          </Html>
          
          <Html position={[0, 3, -5]} center>
            <div 
              style={{ 
                color: '#ff0000', 
                background: 'rgba(0,0,0,0.8)', 
                padding: '8px',
                cursor: 'pointer',
                border: '1px solid #ff0000'
              }}
              onClick={() => navigate('/create')}
            >
              CREATE CULT →
            </div>
          </Html>
          
          <Html position={[5, 3, 0]} center>
            <div 
              style={{ 
                color: '#ff0000', 
                background: 'rgba(0,0,0,0.8)', 
                padding: '8px',
                cursor: 'pointer',
                border: '1px solid #ff0000'
              }}
              onClick={() => navigate('/gallery')}
            >
              GALLERY →
            </div>
          </Html>
        </>
      )}
    </>
  );
}

function Hub() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={60} />
        <OrbitControls 
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={20}
        />
        
        <ambientLight intensity={0.1} />
        <pointLight position={[0, 8, 0]} intensity={0.5} color="#ff0000" />
        
        <Suspense fallback={null}>
          <Room />
        </Suspense>
        
        <EffectComposer>
          <Bloom 
            intensity={1}
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>
      </Canvas>
      
      <div className="nav">
        <button onClick={() => window.location.href = '/gallery'}>Gallery</button>
        <button onClick={() => window.location.href = '/create'}>Create</button>
      </div>
    </div>
  );
}

export default Hub;