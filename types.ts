export enum GestureType {
  NONE = 'NONE',
  FIST = 'FIST',
  PALM = 'PALM',
  POINTING = 'POINTING'
}

export interface ParticleData {
  initialPos: [number, number, number];
  treePos: [number, number, number];
  explosionPos: [number, number, number];
  color: string;
  size: number;
  speed: number;
  phase: number;
}
