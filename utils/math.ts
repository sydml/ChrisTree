export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;

// Generate a point on a cone (Tree shape)
export const getTreePosition = (
  height: number,
  radiusBase: number,
  yOffset: number = 0
): [number, number, number] => {
  const y = randomRange(0, height);
  
  // Inverse relationship: higher y = smaller radius
  const radiusAtY = (1 - y / height) * radiusBase;
  
  // Use square root for more even distribution on the disc at this height,
  // or bias towards edge for a "shell" look.
  // Here we bias slightly towards the center but allow edge variation
  const rRandom = Math.sqrt(Math.random()); 
  const r = radiusAtY * rRandom; 

  const angle = y * 12 + Math.random() * Math.PI * 2; // Tighter spiral
  
  const x = r * Math.cos(angle);
  const z = r * Math.sin(angle);
  
  return [x, y - height / 2 + yOffset, z];
};

// Generate a point in a sphere (Explosion shape)
export const getSpherePosition = (radius: number): [number, number, number] => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  
  const r = Math.cbrt(Math.random()) * radius; // Uniform distribution
  
  const x = r * Math.sin(phi) * Math.cos(theta);
  const y = r * Math.sin(phi) * Math.sin(theta);
  const z = r * Math.cos(phi);
  
  return [x, y, z];
};