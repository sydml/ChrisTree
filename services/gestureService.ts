import { FilesetResolver, HandLandmarker, DrawingUtils } from "@mediapipe/tasks-vision";
import { GestureType } from "../types";

let handLandmarker: HandLandmarker | null = null;
let runningMode: "IMAGE" | "VIDEO" = "VIDEO";

export const initializeHandLandmarker = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
  );
  
  handLandmarker = await HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
      delegate: "GPU"
    },
    runningMode: runningMode,
    numHands: 1
  });
  
  return handLandmarker;
};

export const detectGesture = (video: HTMLVideoElement): GestureType => {
  if (!handLandmarker) return GestureType.NONE;

  const startTimeMs = performance.now();
  const result = handLandmarker.detectForVideo(video, startTimeMs);

  if (result.landmarks && result.landmarks.length > 0) {
    const landmarks = result.landmarks[0];
    
    // Simple heuristic for Open Palm vs Fist
    // Check if fingers are extended relative to the palm
    
    // Tips IDs: 4 (Thumb), 8 (Index), 12 (Middle), 16 (Ring), 20 (Pinky)
    // PIP Joints (knuckles): 2, 6, 10, 14, 18
    // Wrist: 0
    
    const wrist = landmarks[0];
    const tips = [8, 12, 16, 20]; // Exclude thumb for simpler fist detection
    const knuckles = [5, 9, 13, 17];
    
    let extendedFingers = 0;
    
    tips.forEach((tipIdx, i) => {
      const knuckleIdx = knuckles[i];
      // Calculate distance from wrist to tip vs wrist to knuckle
      const distTip = Math.hypot(landmarks[tipIdx].x - wrist.x, landmarks[tipIdx].y - wrist.y);
      const distKnuckle = Math.hypot(landmarks[knuckleIdx].x - wrist.x, landmarks[knuckleIdx].y - wrist.y);
      
      if (distTip > distKnuckle * 1.2) { // 1.2 threshold ensures it's clearly extended
        extendedFingers++;
      }
    });

    // Thumb logic (check if tip is far from index base)
    const thumbTip = landmarks[4];
    const indexBase = landmarks[5];
    const distThumb = Math.hypot(thumbTip.x - indexBase.x, thumbTip.y - indexBase.y);
    const isThumbOpen = distThumb > 0.05; // Tunable threshold

    if (extendedFingers >= 4) return GestureType.PALM;
    if (extendedFingers === 0) return GestureType.FIST;
    if (extendedFingers === 1 && landmarks[8].y < landmarks[6].y) return GestureType.POINTING; // Index up
    
    return GestureType.NONE;
  }

  return GestureType.NONE;
};
