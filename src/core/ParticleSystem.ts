import * as THREE from 'three';
import type { ParticleConfig, TemplateType, ParticleState } from '@/types';
import { DEFAULT_PARTICLE_CONFIG } from '@/types';
import { generatePositions, getTemplate } from '@/templates';
import { lerp, clamp } from '@/utils/math';

export class ParticleSystem {
  private scene: THREE.Scene;
  private config: ParticleConfig;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private points: THREE.Points;
  private state: ParticleState;
  private time: number = 0;
  private currentScale: number = 1;
  private currentExpansion: number = 0;
  private targetScale: number = 1;
  private targetExpansion: number = 0;

  // Vertex shader for particles
  private vertexShader = `
    attribute float size;
    attribute vec3 customColor;
    varying vec3 vColor;
    varying float vAlpha;
    uniform float uTime;
    uniform float uScale;
    uniform float uExpansion;

    void main() {
      vColor = customColor;

      // Apply expansion
      vec3 pos = position * uScale;
      pos += normalize(position) * uExpansion * 0.5;

      // Add subtle animation
      float wave = sin(uTime * 2.0 + position.x * 3.0 + position.y * 2.0) * 0.02;
      pos += normalize(position) * wave;

      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_PointSize = size * (300.0 / -mvPosition.z) * uScale;
      gl_Position = projectionMatrix * mvPosition;

      // Fade based on distance
      vAlpha = clamp(1.0 - length(mvPosition.xyz) / 10.0, 0.3, 1.0);
    }
  `;

  // Fragment shader for particles with glow
  private fragmentShader = `
    varying vec3 vColor;
    varying float vAlpha;
    uniform float uGlowIntensity;

    void main() {
      // Create circular particle with soft edges
      vec2 center = gl_PointCoord - vec2(0.5);
      float dist = length(center);

      if (dist > 0.5) discard;

      // Soft glow effect
      float alpha = 1.0 - smoothstep(0.0, 0.5, dist);
      alpha *= vAlpha;

      // Add glow
      vec3 glow = vColor * uGlowIntensity * (1.0 - dist * 2.0);

      gl_FragColor = vec4(vColor + glow, alpha);
    }
  `;

  constructor(scene: THREE.Scene, config: Partial<ParticleConfig> = {}) {
    this.scene = scene;
    this.config = { ...DEFAULT_PARTICLE_CONFIG, ...config };

    // Initialize state
    this.state = {
      positions: new Float32Array(this.config.count * 3),
      velocities: new Float32Array(this.config.count * 3),
      targetPositions: new Float32Array(this.config.count * 3),
      colors: new Float32Array(this.config.count * 3),
      sizes: new Float32Array(this.config.count),
    };

    // Create geometry
    this.geometry = new THREE.BufferGeometry();

    // Create material
    this.material = new THREE.ShaderMaterial({
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uScale: { value: this.config.baseScale },
        uExpansion: { value: 0 },
        uGlowIntensity: { value: this.config.glowIntensity },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    // Create points
    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);

    // Initialize with default template
    this.setTemplate(this.config.template);
    this.setColor(this.config.color);
    this.initializeSizes();
  }

  private initializeSizes(): void {
    for (let i = 0; i < this.config.count; i++) {
      this.state.sizes[i] = this.config.size * (0.5 + Math.random() * 0.5);
    }
    this.geometry.setAttribute(
      'size',
      new THREE.BufferAttribute(this.state.sizes, 1)
    );
  }

  setTemplate(type: TemplateType): void {
    const template = getTemplate(type);
    const count = Math.min(this.config.count, template.defaultCount);

    // Generate new target positions
    const newPositions = generatePositions(type, count);

    // Copy to target positions
    this.state.targetPositions = newPositions;

    // If first time, also set current positions
    if (this.state.positions.every(v => v === 0)) {
      this.state.positions = new Float32Array(newPositions);
    }

    // Update geometry
    this.geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(this.state.positions, 3)
    );

    this.config.template = type;
  }

  setColor(color: THREE.Color | string): void {
    const threeColor = color instanceof THREE.Color
      ? color
      : new THREE.Color(color);

    this.config.color = threeColor;

    // Set all particle colors with slight variation
    for (let i = 0; i < this.config.count; i++) {
      const hsl = { h: 0, s: 0, l: 0 };
      threeColor.getHSL(hsl);

      // Add variation
      const variation = new THREE.Color().setHSL(
        hsl.h + (Math.random() - 0.5) * 0.05,
        clamp(hsl.s + (Math.random() - 0.5) * 0.1, 0, 1),
        clamp(hsl.l + (Math.random() - 0.5) * 0.1, 0, 1)
      );

      this.state.colors[i * 3] = variation.r;
      this.state.colors[i * 3 + 1] = variation.g;
      this.state.colors[i * 3 + 2] = variation.b;
    }

    this.geometry.setAttribute(
      'customColor',
      new THREE.BufferAttribute(this.state.colors, 3)
    );
  }

  setScale(scale: number): void {
    this.targetScale = clamp(scale, 0.3, 3.0);
  }

  setExpansion(expansion: number): void {
    this.targetExpansion = clamp(expansion, 0, 2.0);
  }

  setGlowIntensity(intensity: number): void {
    this.config.glowIntensity = clamp(intensity, 0, 2);
    this.material.uniforms.uGlowIntensity.value = this.config.glowIntensity;
  }

  update(deltaTime: number): void {
    this.time += deltaTime;

    // Smooth scale and expansion transitions
    this.currentScale = lerp(this.currentScale, this.targetScale, deltaTime * 5);
    this.currentExpansion = lerp(this.currentExpansion, this.targetExpansion, deltaTime * 5);

    // Update uniforms
    this.material.uniforms.uTime.value = this.time;
    this.material.uniforms.uScale.value = this.currentScale;
    this.material.uniforms.uExpansion.value = this.currentExpansion;

    // Animate particles toward target positions
    const positions = this.geometry.attributes.position;
    if (positions) {
      const posArray = positions.array as Float32Array;
      const targetArray = this.state.targetPositions;

      for (let i = 0; i < this.config.count * 3; i++) {
        posArray[i] = lerp(posArray[i], targetArray[i], deltaTime * 3);
      }

      positions.needsUpdate = true;
    }

    // Slowly rotate the entire system
    this.points.rotation.y += deltaTime * 0.1;
  }

  getPoints(): THREE.Points {
    return this.points;
  }

  getConfig(): ParticleConfig {
    return { ...this.config };
  }

  dispose(): void {
    this.scene.remove(this.points);
    this.geometry.dispose();
    this.material.dispose();
  }
}
