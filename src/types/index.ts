import * as THREE from 'three';

// Hand Detection Types
export interface HandLandmark {
  x: number;  // 0-1 normalized
  y: number;  // 0-1 normalized
  z: number;  // depth
}

export interface HandState {
  isDetected: boolean;
  landmarks: HandLandmark[];
  isOpen: boolean;
  isClosed: boolean;
  isOkSign: boolean;  // OK 手勢 (大拇指和食指形成圓圈)
  openness: number;  // 0-1 scale (0 = closed fist, 1 = fully open)
  center: HandLandmark;
}

export interface GestureState {
  leftHand: HandState | null;
  rightHand: HandState | null;
  handsDistance: number;  // normalized distance between hands (0-1)
  tension: number;        // derived from openness average (0-1)
  expansion: number;      // derived from hands distance (0-1)
  isActive: boolean;      // at least one hand detected
  hasOkSign: boolean;     // 任一手比出 OK 手勢
}

// Particle System Types
export type TemplateType = 'heart' | 'flower' | 'saturn' | 'buddha' | 'fireworks' | 'magicCircle';

export interface ParticleConfig {
  count: number;
  size: number;
  color: THREE.Color;
  template: TemplateType;
  baseScale: number;
  glowIntensity: number;
}

export interface ParticleState {
  positions: Float32Array;
  velocities: Float32Array;
  targetPositions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
}

// Template Generator Types
export interface TemplateGenerator {
  name: TemplateType;
  displayName: string;
  icon: string;
  generate: (count: number) => Float32Array;
  defaultCount: number;
}

// UI Types
export interface UIState {
  selectedTemplate: TemplateType;
  selectedColor: string;
  showCameraPreview: boolean;
  isFullscreen: boolean;
}

// Scene Configuration
export interface SceneConfig {
  backgroundColor: number;
  cameraFOV: number;
  cameraPosition: THREE.Vector3;
  ambientLightIntensity: number;
}

// App Configuration
export interface AppConfig {
  particleConfig: Partial<ParticleConfig>;
  sceneConfig: Partial<SceneConfig>;
  gestureConfig: {
    smoothing: number;
    sensitivity: number;
  };
}

// Event Types
export type GestureUpdateCallback = (state: GestureState) => void;
export type HandsDetectedCallback = (count: number) => void;
export type TemplateChangeCallback = (template: TemplateType) => void;
export type ColorChangeCallback = (color: string) => void;

// MediaPipe Types (external library)
export interface MediaPipeHandsResults {
  multiHandLandmarks?: HandLandmark[][];
  multiHandedness?: { label: string; score: number }[];
}

// Constants
export const TEMPLATE_TYPES: TemplateType[] = ['heart', 'flower', 'saturn', 'buddha', 'fireworks', 'magicCircle'];

export const DEFAULT_PARTICLE_CONFIG: ParticleConfig = {
  count: 5000,
  size: 0.05,
  color: new THREE.Color(0xff6b9d),
  template: 'heart',
  baseScale: 1.0,
  glowIntensity: 0.8,
};

export const DEFAULT_SCENE_CONFIG: SceneConfig = {
  backgroundColor: 0x0a0a0f,
  cameraFOV: 60,
  cameraPosition: new THREE.Vector3(0, 0, 5),
  ambientLightIntensity: 0.5,
};
