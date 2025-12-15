import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { getSpherePosition, getTreePosition, randomRange } from '../utils/math';
import { GestureType, ParticleData } from '../types';
import { Star } from './Star';

interface ParticleTreeProps {
  gesture: GestureType;
  count?: number;
}

const tempObject = new THREE.Object3D();
const tempColor = new THREE.Color();

// Updated Palette: Mostly greens, with ornaments
const COLORS = [
  '#00ff00', // Bright Green
  '#0f0',    // Neon Green
  '#2ecc71', // Emerald
  '#006400', // Dark Green
  '#ff0000', // Red Ornament
  '#ffd700', // Gold Ornament
  '#ffffff'  // White Snow/Light
];

export const ParticleTree: React.FC<ParticleTreeProps> = ({ gesture, count = 3500 }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // 0 = Tree, 1 = Exploded
  const currentMixRef = useRef(0);
  const clockRef = useRef(new THREE.Clock());
  const gestureRef = useRef(gesture);

  // Update gesture ref when prop changes
  useEffect(() => {
    gestureRef.current = gesture;
  }, [gesture]);

  // Generate particles once
  const particles = useMemo(() => {
    const data: ParticleData[] = [];
    for (let i = 0; i < count; i++) {
      const treePos = getTreePosition(16, 7, -1); // Taller, slightly lower base
      const explosionPos = getSpherePosition(18);
      
      // Weight random selection towards greens (indices 0-3)
      const colorIdx = Math.random() > 0.3 
        ? Math.floor(Math.random() * 4) // Greens
        : Math.floor(Math.random() * (COLORS.length - 4)) + 4; // Ornaments
        
      const color = COLORS[colorIdx];
      
      data.push({
        initialPos: treePos,
        treePos,
        explosionPos,
        color,
        size: randomRange(0.04, 0.15), // Slightly smaller, sharper particles
        speed: randomRange(0.01, 0.05),
        phase: Math.random() * Math.PI * 2
      });
    }
    return data;
  }, [count]);

  useEffect(() => {
    let animationId: number;
    const animate = () => {
      if (!meshRef.current) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      const time = clockRef.current.getElapsedTime();

      // Determine target state based on gesture
      const targetMix = gestureRef.current === GestureType.PALM ? 1 : 0;

      // Smooth transition between states
      currentMixRef.current = THREE.MathUtils.lerp(currentMixRef.current, targetMix, 0.05);

      particles.forEach((particle, i) => {
        const { treePos, explosionPos, size, phase, speed, color } = particle;

        // Calculate current position based on mix
        const x = THREE.MathUtils.lerp(treePos[0], explosionPos[0], currentMixRef.current);
        const y = THREE.MathUtils.lerp(treePos[1], explosionPos[1], currentMixRef.current);
        const z = THREE.MathUtils.lerp(treePos[2], explosionPos[2], currentMixRef.current);

        // Add some floating animation (reduced when in tree mode for stability)
        const floatY = Math.sin(time * speed * 5 + phase) * 0.1;
        
        // Rotate the whole tree slowly if in tree mode
        const rotationSpeed = 0.3 * (1 - currentMixRef.current); 
        const cosR = Math.cos(time * rotationSpeed);
        const sinR = Math.sin(time * rotationSpeed);

        // Apply rotation around Y axis
        const rotX = x * cosR - z * sinR;
        const rotZ = x * sinR + z * cosR;

        // Position
        tempObject.position.set(rotX, y + floatY, rotZ);
        
        // Twinkle effect (scale)
        const twinkle = Math.sin(time * 5 + phase) * 0.5 + 1;
        const scale = size * twinkle;
        tempObject.scale.set(scale, scale, scale);
        
        tempObject.updateMatrix();
        meshRef.current!.setMatrixAt(i, tempObject.matrix);
        
        // Update color
        tempColor.set(color);
        if (currentMixRef.current > 0.5) {
           // Whitewash when exploding
           tempColor.lerp(new THREE.Color('#ffffff'), (currentMixRef.current - 0.5));
        }
        meshRef.current!.setColorAt(i, tempColor);
      });

      meshRef.current.instanceMatrix.needsUpdate = true;
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, [particles]);

  return (
    <group>
        {/* The Tree Particles */}
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[1, 8, 8]} /> {/* Lower polygon for performance */}
        {/* MeshBasicMaterial is self-illuminated, making it much clearer and neon-like */}
        <meshBasicMaterial 
            toneMapped={false}
            color="#ffffff"
        />
        </instancedMesh>

        {/* The Star at the top */}
        <Star gesture={gesture} position={[0, 8, 0]} />
    </group>
  );
};