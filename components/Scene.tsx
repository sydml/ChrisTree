import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { ParticleTree } from './ParticleTree';
import { FloatingPhotos } from './FloatingPhotos';
import { GestureType } from '../types';

interface SceneProps {
  gesture: GestureType;
}

export const Scene: React.FC<SceneProps> = ({ gesture }) => {
  return (
    <Canvas camera={{ position: [0, 0, 25], fov: 45 }}>
      {/* Pure black background for better contrast */}
      <color attach="background" args={['#000000']} />
      
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={10} 
        maxDistance={40} 
        autoRotate={gesture === GestureType.FIST || gesture === GestureType.NONE}
        autoRotateSpeed={0.8}
      />
      
      {/* Lights don't affect BasicMaterial much, but kept for photos/star depth */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffaa00" />

      {/* The main tree/explosion effect */}
      <ParticleTree gesture={gesture} count={3500} />
      
      {/* Photos that appear */}
      <FloatingPhotos gesture={gesture} />
      
      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={150} scale={15} size={3} speed={0.4} opacity={0.3} color="#fff" />

      {/* Post Processing for Glow - Adjusted for Sharpness */}
      <EffectComposer enableNormalPass={false}>
        {/* 
            luminanceThreshold: 0.2 -> only bright things glow
            radius: 0.4 -> tighter glow (sharper), less foggy
            intensity: 1.2 -> bright neon look
        */}
        <Bloom luminanceThreshold={0.2} mipmapBlur intensity={1.2} radius={0.4} />
        <Vignette eskil={false} offset={0.1} darkness={1.0} />
      </EffectComposer>
    </Canvas>
  );
};