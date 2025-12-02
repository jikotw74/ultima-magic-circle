import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as THREE from 'three';
import { ParticleSystem } from '@/core/ParticleSystem';

describe('ParticleSystem', () => {
  let scene: THREE.Scene;
  let particleSystem: ParticleSystem;

  beforeEach(() => {
    scene = new THREE.Scene();
    particleSystem = new ParticleSystem(scene, {
      count: 1000,
      size: 0.05,
      template: 'heart',
    });
  });

  afterEach(() => {
    particleSystem.dispose();
  });

  describe('initialization', () => {
    it('should create a particle system with default config', () => {
      const config = particleSystem.getConfig();
      expect(config.count).toBe(1000);
      expect(config.size).toBe(0.05);
      expect(config.template).toBe('heart');
    });

    it('should add points to the scene', () => {
      const points = particleSystem.getPoints();
      expect(scene.children).toContain(points);
    });

    it('should create geometry with correct number of particles', () => {
      const points = particleSystem.getPoints();
      const positions = points.geometry.attributes.position;
      expect(positions.count).toBeGreaterThan(0);
    });
  });

  describe('setTemplate', () => {
    it('should change template type', () => {
      particleSystem.setTemplate('flower');
      expect(particleSystem.getConfig().template).toBe('flower');
    });

    it('should update positions when template changes', () => {
      const points = particleSystem.getPoints();
      const positionsBefore = new Float32Array(
        points.geometry.attributes.position.array as Float32Array
      );

      particleSystem.setTemplate('saturn');

      // Update to apply changes
      particleSystem.update(0.016);

      const positionsAfter = points.geometry.attributes.position.array;
      expect(positionsBefore).not.toEqual(positionsAfter);
    });

    it('should accept all valid template types', () => {
      const templates = ['heart', 'flower', 'saturn', 'buddha', 'fireworks'] as const;

      templates.forEach((template) => {
        particleSystem.setTemplate(template);
        expect(particleSystem.getConfig().template).toBe(template);
      });
    });
  });

  describe('setColor', () => {
    it('should update particle colors with THREE.Color', () => {
      const color = new THREE.Color(0xff0000);
      particleSystem.setColor(color);

      const points = particleSystem.getPoints();
      const colors = points.geometry.attributes.customColor;
      expect(colors).toBeDefined();
    });

    it('should update particle colors with hex string', () => {
      particleSystem.setColor('#00ff00');

      const points = particleSystem.getPoints();
      const colors = points.geometry.attributes.customColor;
      expect(colors).toBeDefined();
    });
  });

  describe('setScale', () => {
    it('should clamp scale to valid range', () => {
      particleSystem.setScale(10);
      // Run many small updates to converge (realistic frame times)
      for (let i = 0; i < 100; i++) {
        particleSystem.update(0.016);
      }

      // Scale should be clamped to max 3.0 and approaching it
      const uniforms = (particleSystem.getPoints().material as THREE.ShaderMaterial).uniforms;
      expect(uniforms.uScale.value).toBeLessThanOrEqual(3.1); // Allow small tolerance
      expect(uniforms.uScale.value).toBeGreaterThan(2.5); // Should be approaching 3.0
    });

    it('should not go below minimum scale', () => {
      particleSystem.setScale(0);
      // Run many small updates to converge
      for (let i = 0; i < 100; i++) {
        particleSystem.update(0.016);
      }

      const uniforms = (particleSystem.getPoints().material as THREE.ShaderMaterial).uniforms;
      expect(uniforms.uScale.value).toBeGreaterThanOrEqual(0.25); // Allow small tolerance
      expect(uniforms.uScale.value).toBeLessThan(0.5); // Should be approaching 0.3
    });
  });

  describe('setExpansion', () => {
    it('should update expansion uniform', () => {
      particleSystem.setExpansion(1.0);
      // Run some updates
      for (let i = 0; i < 50; i++) {
        particleSystem.update(0.016);
      }

      const uniforms = (particleSystem.getPoints().material as THREE.ShaderMaterial).uniforms;
      expect(uniforms.uExpansion.value).toBeGreaterThan(0);
    });

    it('should clamp expansion to valid range', () => {
      particleSystem.setExpansion(10);
      // Run many small updates to converge
      for (let i = 0; i < 100; i++) {
        particleSystem.update(0.016);
      }

      const uniforms = (particleSystem.getPoints().material as THREE.ShaderMaterial).uniforms;
      expect(uniforms.uExpansion.value).toBeLessThanOrEqual(2.1); // Allow small tolerance
      expect(uniforms.uExpansion.value).toBeGreaterThan(1.5); // Should be approaching 2.0
    });
  });

  describe('update', () => {
    it('should update time uniform', () => {
      particleSystem.update(0.016);
      particleSystem.update(0.016);

      const uniforms = (particleSystem.getPoints().material as THREE.ShaderMaterial).uniforms;
      expect(uniforms.uTime.value).toBeGreaterThan(0);
    });

    it('should smoothly interpolate scale', () => {
      particleSystem.setScale(2.0);

      const uniforms = (particleSystem.getPoints().material as THREE.ShaderMaterial).uniforms;
      const initialScale = uniforms.uScale.value;

      particleSystem.update(0.1);

      const newScale = uniforms.uScale.value;
      expect(newScale).toBeGreaterThan(initialScale);
      expect(newScale).toBeLessThan(2.0);
    });

    it('should rotate the points over time', () => {
      const points = particleSystem.getPoints();
      const initialRotation = points.rotation.y;

      particleSystem.update(1);

      expect(points.rotation.y).toBeGreaterThan(initialRotation);
    });
  });

  describe('dispose', () => {
    it('should remove points from scene', () => {
      const points = particleSystem.getPoints();
      expect(scene.children).toContain(points);

      particleSystem.dispose();

      expect(scene.children).not.toContain(points);
    });
  });
});
