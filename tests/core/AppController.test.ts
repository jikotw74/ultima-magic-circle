import { describe, it, expect } from 'vitest';

// Note: AppController requires full WebGL context which is complex to mock.
// These tests focus on interface behavior and skip WebGL-dependent functionality.
// Integration tests should be run in a browser environment.

describe('AppController', () => {
  describe('interface contract', () => {
    it('should export AppController class', async () => {
      const module = await import('@/core/AppController');
      expect(module.AppController).toBeDefined();
      expect(typeof module.AppController).toBe('function');
    });
  });

  describe('type definitions', () => {
    it('should have correct method signatures', async () => {
      // Verify the class structure through TypeScript
      const module = await import('@/core/AppController');
      const AppController = module.AppController;

      // Check that required methods exist on prototype
      expect(typeof AppController.prototype.initialize).toBe('function');
      expect(typeof AppController.prototype.start).toBe('function');
      expect(typeof AppController.prototype.stop).toBe('function');
      expect(typeof AppController.prototype.setTemplate).toBe('function');
      expect(typeof AppController.prototype.setColor).toBe('function');
      expect(typeof AppController.prototype.getGestureState).toBe('function');
      expect(typeof AppController.prototype.getVideoElement).toBe('function');
      expect(typeof AppController.prototype.isGestureControlActive).toBe('function');
      expect(typeof AppController.prototype.dispose).toBe('function');
    });
  });

  describe('template types', () => {
    it('should accept all valid template types', async () => {
      const { TEMPLATE_TYPES } = await import('@/types');
      expect(TEMPLATE_TYPES).toContain('heart');
      expect(TEMPLATE_TYPES).toContain('flower');
      expect(TEMPLATE_TYPES).toContain('saturn');
      expect(TEMPLATE_TYPES).toContain('buddha');
      expect(TEMPLATE_TYPES).toContain('fireworks');
      expect(TEMPLATE_TYPES).toContain('magicCircle');
      expect(TEMPLATE_TYPES).toHaveLength(6);
    });
  });

  describe('default configuration', () => {
    it('should have sensible defaults', async () => {
      const { DEFAULT_PARTICLE_CONFIG, DEFAULT_SCENE_CONFIG } = await import('@/types');

      expect(DEFAULT_PARTICLE_CONFIG.count).toBeGreaterThan(0);
      expect(DEFAULT_PARTICLE_CONFIG.size).toBeGreaterThan(0);
      expect(DEFAULT_PARTICLE_CONFIG.baseScale).toBe(1.0);
      expect(DEFAULT_SCENE_CONFIG.cameraFOV).toBeGreaterThan(0);
    });
  });
});
