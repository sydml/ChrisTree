import React, { useRef, useEffect } from 'react';
import { Image, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { GestureType } from '../types';

// Use Picsum for placeholder images
const PHOTO_URLS = [
  'https://picsum.photos/id/1011/300/300',
  'https://picsum.photos/id/1015/300/300',
  'https://picsum.photos/id/1018/300/300',
  'https://picsum.photos/id/1025/300/300',
  'https://picsum.photos/id/1040/300/300'
];

interface FloatingPhotosProps {
  gesture: GestureType;
}

export const FloatingPhotos: React.FC<FloatingPhotosProps> = ({ gesture }) => {
  const groupRef = useRef<THREE.Group>(null);
  const gestureRef = useRef(gesture);
  const clockRef = useRef(new THREE.Clock());

  useEffect(() => {
    gestureRef.current = gesture;
  }, [gesture]);

  useEffect(() => {
    let animationId: number;
    const animate = () => {
      if (!groupRef.current) {
        animationId = requestAnimationFrame(animate);
        return;
      }
      
      const time = clockRef.current.getElapsedTime();
      
      // Rotate the group of photos
      groupRef.current.rotation.y = time * 0.1;
      
      // If exploded (PALM), expand photos outward and show them
      // If tree (FIST/NONE), hide them or keep them close
      const targetScale = gestureRef.current === GestureType.PALM ? 1.5 : 0;
      
      // Animate visibility/scale of photos
      groupRef.current.children.forEach((child, i) => {
          // Individual float animation
          // const floatOffset = Math.sin(time + i * 2) * 0.2;
          
          // Scale effect based on gesture
          const currentScale = child.scale.x;
          const lerpScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.05);
          child.scale.set(lerpScale, lerpScale, lerpScale);
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <group ref={groupRef}>
      {PHOTO_URLS.map((url, i) => {
        const angle = (i / PHOTO_URLS.length) * Math.PI * 2;
        const radius = 8; // Distance from center
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = (i - 2) * 2.5; // Spread vertically

        return (
          <Billboard
            key={i}
            position={[x, y, z]}
            scale={[0, 0, 0]} // Start hidden (scale 0)
            follow={true}
          >
            <Image 
                url={url} 
                transparent 
                opacity={0.9}
                side={THREE.DoubleSide}
            />
            {/* Simple frame border */}
            <mesh position={[0,0,-0.01]}>
                <planeGeometry args={[1.1, 1.1]} />
                <meshBasicMaterial color="#d4af37" />
            </mesh>
          </Billboard>
        );
      })}
    </group>
  );
};