import * as THREE from 'three';
import type {
  TemplateType,
  GestureState,
  AppConfig,
  SceneConfig,
} from '@/types';
import { DEFAULT_SCENE_CONFIG, DEFAULT_PARTICLE_CONFIG } from '@/types';
import { ParticleSystem } from './ParticleSystem';
import { GestureController } from './GestureController';

export class AppController {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private particleSystem: ParticleSystem;
  private gestureController: GestureController | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private animationId: number | null = null;
  private clock: THREE.Clock;
  private config: AppConfig;
  private isInitialized: boolean = false;
  private sceneConfig: SceneConfig;

  constructor(container: HTMLElement, config: Partial<AppConfig> = {}) {
    this.container = container;
    this.config = {
      particleConfig: config.particleConfig ?? {},
      sceneConfig: config.sceneConfig ?? {},
      gestureConfig: config.gestureConfig ?? {
        smoothing: 0.7,
        sensitivity: 1.0,
      },
    };

    this.sceneConfig = { ...DEFAULT_SCENE_CONFIG, ...this.config.sceneConfig };

    // Initialize Three.js
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.sceneConfig.backgroundColor);

    // Camera
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(
      this.sceneConfig.cameraFOV,
      aspect,
      0.1,
      1000
    );
    this.camera.position.copy(this.sceneConfig.cameraPosition);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      this.sceneConfig.ambientLightIntensity
    );
    this.scene.add(ambientLight);

    // Particle system
    this.particleSystem = new ParticleSystem(this.scene, {
      ...DEFAULT_PARTICLE_CONFIG,
      ...this.config.particleConfig,
    });

    // Clock for animations
    this.clock = new THREE.Clock();

    // Handle resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Create video element for camera
    this.videoElement = document.createElement('video');
    this.videoElement.setAttribute('playsinline', '');
    this.videoElement.style.display = 'none';
    document.body.appendChild(this.videoElement);

    // Initialize gesture controller
    this.gestureController = new GestureController(this.videoElement, {
      smoothing: this.config.gestureConfig.smoothing,
      sensitivity: this.config.gestureConfig.sensitivity,
    });

    // Set up gesture callbacks
    this.gestureController.onGestureUpdate = this.handleGestureUpdate.bind(this);

    try {
      await this.gestureController.start();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Gesture controller failed to start:', error);
      // Continue without gesture control
      this.isInitialized = true;
    }
  }

  start(): void {
    if (this.animationId !== null) return;

    this.clock.start();
    this.animate();
  }

  stop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    this.gestureController?.stop();
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);

    const deltaTime = this.clock.getDelta();

    // Update particle system
    this.particleSystem.update(deltaTime);

    // Render
    this.renderer.render(this.scene, this.camera);
  };

  private handleGestureUpdate(state: GestureState): void {
    if (!state.isActive) {
      // Gradually return to default state
      this.particleSystem.setScale(1.0);
      this.particleSystem.setExpansion(0);
      return;
    }

    // Map tension to scale (closed hands = larger scale)
    const scale = 0.8 + state.tension * 1.2;
    this.particleSystem.setScale(scale);

    // Map expansion to particle spread
    this.particleSystem.setExpansion(state.expansion * 1.5);

    // Adjust glow based on tension
    const glowIntensity = 0.5 + state.tension * 0.8;
    this.particleSystem.setGlowIntensity(glowIntensity);
  }

  private handleResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  setTemplate(type: TemplateType): void {
    this.particleSystem.setTemplate(type);
  }

  setColor(color: string): void {
    this.particleSystem.setColor(new THREE.Color(color));
  }

  getGestureState(): GestureState | null {
    return this.gestureController?.getCurrentState() ?? null;
  }

  getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }

  isGestureControlActive(): boolean {
    return this.gestureController?.getIsRunning() ?? false;
  }

  dispose(): void {
    this.stop();

    // Remove video element
    if (this.videoElement) {
      this.videoElement.remove();
    }

    // Dispose particle system
    this.particleSystem.dispose();

    // Dispose renderer
    this.renderer.dispose();
    this.container.removeChild(this.renderer.domElement);

    // Remove resize listener
    window.removeEventListener('resize', this.handleResize.bind(this));
  }
}
