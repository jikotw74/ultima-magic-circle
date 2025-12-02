# Software Design Document (SDD)
# Ultima Magic Circle - 3D Particle Hand Gesture System

## 1. Project Overview

### 1.1 Purpose
Create a real-time interactive 3D particle system controlled by hand gestures through webcam detection. Users can manipulate particle formations representing various shapes (hearts, flowers, saturn, buddha statues, fireworks) using natural hand movements.

### 1.2 Scope
- Real-time hand gesture detection via MediaPipe Hands
- 3D particle rendering using Three.js
- Multiple particle template shapes
- Color customization
- Responsive gesture-based scaling and expansion

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Template   │  │   Color     │  │   Camera Preview    │  │
│  │  Selector   │  │   Picker    │  │   (optional)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Core                          │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Gesture Controller                      ││
│  │  - Hand Detection (MediaPipe)                           ││
│  │  - Gesture Recognition (open/close, distance)           ││
│  │  - State Management                                     ││
│  └─────────────────────────────────────────────────────────┘│
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Particle Engine                         ││
│  │  - Particle System Manager                              ││
│  │  - Template Generator                                   ││
│  │  - Animation Controller                                 ││
│  │  - Scale/Expansion Calculator                           ││
│  └─────────────────────────────────────────────────────────┘│
│                              │                               │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                  Three.js Renderer                       ││
│  │  - Scene Management                                     ││
│  │  - Camera Control                                       ││
│  │  - Particle Material/Geometry                           ││
│  │  - Post-processing Effects                              ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 3. Component Specifications

### 3.1 Gesture Controller Module

#### 3.1.1 HandDetector Class
```typescript
interface HandLandmark {
  x: number;  // 0-1 normalized
  y: number;  // 0-1 normalized
  z: number;  // depth
}

interface HandState {
  isDetected: boolean;
  landmarks: HandLandmark[];
  isOpen: boolean;        // fingers extended
  isClosed: boolean;      // fist
  openness: number;       // 0-1 scale
}

interface GestureState {
  leftHand: HandState | null;
  rightHand: HandState | null;
  handsDistance: number;  // distance between hands (0-1)
  tension: number;        // derived from openness average
  expansion: number;      // derived from hands distance
}
```

#### 3.1.2 Gesture Recognition Logic
- **Openness Detection**: Calculate average distance from fingertips to palm center
- **Tension Calculation**: `tension = 1 - averageOpenness` (closed fist = high tension)
- **Expansion Calculation**: Distance between left and right hand centers, normalized

### 3.2 Particle Engine Module

#### 3.2.1 ParticleSystem Class
```typescript
interface ParticleConfig {
  count: number;           // number of particles
  size: number;            // base particle size
  color: THREE.Color;      // particle color
  template: TemplateType;  // shape template
  baseScale: number;       // initial scale
}

interface ParticleState {
  positions: Float32Array;    // x, y, z for each particle
  velocities: Float32Array;   // velocity vectors
  targetPositions: Float32Array; // template target positions
  colors: Float32Array;       // r, g, b for each particle
}

type TemplateType = 'heart' | 'flower' | 'saturn' | 'buddha' | 'fireworks';
```

#### 3.2.2 Template Generators
Each template generates a set of 3D coordinates forming the shape:

| Template | Description | Particle Count |
|----------|-------------|----------------|
| Heart | 3D heart curve | 2000-5000 |
| Flower | Multi-petal flower | 3000-6000 |
| Saturn | Planet with rings | 4000-8000 |
| Buddha | Buddha silhouette | 5000-10000 |
| Fireworks | Explosion pattern | 2000-4000 |

### 3.3 Three.js Renderer Module

#### 3.3.1 Scene Configuration
```typescript
interface SceneConfig {
  backgroundColor: number;
  cameraFOV: number;
  cameraPosition: THREE.Vector3;
  ambientLightIntensity: number;
  pointLightPositions: THREE.Vector3[];
}
```

#### 3.3.2 Particle Material
- Use `THREE.PointsMaterial` or custom shader material
- Support for glow effects via additive blending
- Dynamic size based on gesture tension

### 3.4 UI Components

#### 3.4.1 Template Selector
- Grid of 5 template icons
- Visual preview on hover
- Active state indication

#### 3.4.2 Color Picker
- HSL color wheel or gradient strip
- Real-time preview
- Preset color options

#### 3.4.3 Camera Preview
- Small overlay showing webcam feed
- Hand landmark visualization
- Toggle visibility

## 4. Data Flow

```
Webcam Stream
     │
     ▼
MediaPipe Hands Detection
     │
     ▼
Gesture State Calculation
     │
     ├──► Tension Value ──► Particle Scale
     │
     └──► Expansion Value ──► Particle Spread

User Interaction (UI)
     │
     ├──► Template Selection ──► Regenerate Particle Positions
     │
     └──► Color Selection ──► Update Particle Colors
```

## 5. API Specifications

### 5.1 GestureController API
```typescript
class GestureController {
  constructor(videoElement: HTMLVideoElement);

  // Start/stop detection
  start(): Promise<void>;
  stop(): void;

  // Event callbacks
  onGestureUpdate: (state: GestureState) => void;
  onHandsDetected: (count: number) => void;

  // State getters
  getCurrentState(): GestureState;
  isRunning(): boolean;
}
```

### 5.2 ParticleSystem API
```typescript
class ParticleSystem {
  constructor(scene: THREE.Scene, config: ParticleConfig);

  // Template control
  setTemplate(type: TemplateType): void;

  // Visual control
  setColor(color: THREE.Color): void;
  setScale(scale: number): void;
  setExpansion(expansion: number): void;

  // Animation
  update(deltaTime: number): void;

  // Cleanup
  dispose(): void;
}
```

### 5.3 App Controller API
```typescript
class AppController {
  constructor(container: HTMLElement);

  // Lifecycle
  initialize(): Promise<void>;
  start(): void;
  stop(): void;

  // Configuration
  setTemplate(type: TemplateType): void;
  setColor(color: string): void;

  // State
  getGestureState(): GestureState;
}
```

## 6. Performance Requirements

| Metric | Target |
|--------|--------|
| Frame Rate | 60 FPS |
| Gesture Latency | < 50ms |
| Particle Count | 5000-10000 |
| Memory Usage | < 200MB |
| Initial Load | < 3s |

## 7. Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

## 8. Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| three | ^0.160.0 | 3D rendering |
| @mediapipe/hands | ^0.4.0 | Hand detection |
| @mediapipe/camera_utils | ^0.3.0 | Camera access |

## 9. File Structure

```
ultima-magic-circle/
├── docs/
│   ├── SDD.md              # This document
│   └── API.md              # API documentation
├── src/
│   ├── core/
│   │   ├── GestureController.ts
│   │   ├── ParticleSystem.ts
│   │   └── AppController.ts
│   ├── templates/
│   │   ├── index.ts
│   │   ├── heart.ts
│   │   ├── flower.ts
│   │   ├── saturn.ts
│   │   ├── buddha.ts
│   │   └── fireworks.ts
│   ├── ui/
│   │   ├── TemplateSelector.ts
│   │   ├── ColorPicker.ts
│   │   └── CameraPreview.ts
│   ├── utils/
│   │   └── math.ts
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── main.css
│   ├── main.ts
│   └── index.html
├── tests/
│   ├── core/
│   │   ├── GestureController.test.ts
│   │   ├── ParticleSystem.test.ts
│   │   └── AppController.test.ts
│   ├── templates/
│   │   └── templates.test.ts
│   └── setup.ts
├── public/
│   └── assets/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
└── README.md
```

## 10. Deployment

### 10.1 GitHub Pages
- Build command: `npm run build`
- Output directory: `dist/`
- Base URL configuration for GitHub Pages

### 10.2 CI/CD Pipeline
- Run tests on push
- Build on merge to main
- Auto-deploy to GitHub Pages
