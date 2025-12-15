import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GestureType } from '../types';

interface StarProps {
  gesture: GestureType;
  position: [number, number, number];
}

export const Star: React.FC<StarProps> = ({ gesture, position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const gestureRef = useRef(gesture);
  const clockRef = useRef(new THREE.Clock());

  useEffect(() => {
    gestureRef.current = gesture;
  }, [gesture]);
  
  // Create a 5-point star shape
  const starGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.2;
    const innerRadius = 0.5;

    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings = {
      depth: 0.4,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 2,
      bevelSize: 0.1,
      bevelThickness: 0.1,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  useEffect(() => {
    let animationId: number;
    const animate = () => {
      if (!meshRef.current) {
        animationId = requestAnimationFrame(animate);
        return;
      }

      const time = clockRef.current.getElapsedTime();
      
      // Rotate the star
      meshRef.current.rotation.y = time * 1.5;
      meshRef.current.rotation.z = Math.sin(time) * 0.1;

      // Scale logic: Explode = 0, Tree = 1
      const targetScale = gestureRef.current === GestureType.PALM ? 0 : 1;
      
      // Smooth transition
      const currentScale = meshRef.current.scale.x;
      const lerpScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.1);
      
      meshRef.current.scale.set(lerpScale, lerpScale, lerpScale);
      
      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <mesh ref={meshRef} geometry={starGeometry} position={position}>
      <meshBasicMaterial color="#FFD700" toneMapped={false} />
    </mesh>
  );
};