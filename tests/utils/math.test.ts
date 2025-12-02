import { describe, it, expect } from 'vitest';
import {
  lerp,
  clamp,
  mapRange,
  distance2D,
  distance3D,
  calculateCenter,
  smoothValue,
  random,
  randomGaussian,
  easeInOutCubic,
  easeOutElastic,
  sphericalToCartesian,
  createNoise,
} from '@/utils/math';

describe('Math Utilities', () => {
  describe('lerp', () => {
    it('should return start value when t is 0', () => {
      expect(lerp(0, 100, 0)).toBe(0);
    });

    it('should return end value when t is 1', () => {
      expect(lerp(0, 100, 1)).toBe(100);
    });

    it('should interpolate correctly at t = 0.5', () => {
      expect(lerp(0, 100, 0.5)).toBe(50);
    });

    it('should handle negative values', () => {
      expect(lerp(-100, 100, 0.5)).toBe(0);
    });

    it('should extrapolate for t > 1', () => {
      expect(lerp(0, 100, 2)).toBe(200);
    });
  });

  describe('clamp', () => {
    it('should return value when within range', () => {
      expect(clamp(50, 0, 100)).toBe(50);
    });

    it('should clamp to min when below range', () => {
      expect(clamp(-10, 0, 100)).toBe(0);
    });

    it('should clamp to max when above range', () => {
      expect(clamp(150, 0, 100)).toBe(100);
    });

    it('should handle equal min and max', () => {
      expect(clamp(50, 10, 10)).toBe(10);
    });
  });

  describe('mapRange', () => {
    it('should map value from one range to another', () => {
      expect(mapRange(50, 0, 100, 0, 1)).toBe(0.5);
    });

    it('should handle inverted ranges', () => {
      expect(mapRange(25, 0, 100, 100, 0)).toBe(75);
    });

    it('should map edge values correctly', () => {
      expect(mapRange(0, 0, 100, 0, 1)).toBe(0);
      expect(mapRange(100, 0, 100, 0, 1)).toBe(1);
    });
  });

  describe('distance2D', () => {
    it('should calculate horizontal distance', () => {
      expect(distance2D(0, 0, 3, 0)).toBe(3);
    });

    it('should calculate vertical distance', () => {
      expect(distance2D(0, 0, 0, 4)).toBe(4);
    });

    it('should calculate diagonal distance (3-4-5 triangle)', () => {
      expect(distance2D(0, 0, 3, 4)).toBe(5);
    });

    it('should return 0 for same point', () => {
      expect(distance2D(5, 5, 5, 5)).toBe(0);
    });
  });

  describe('distance3D', () => {
    it('should calculate 3D distance', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 1, y: 0, z: 0 };
      expect(distance3D(p1, p2)).toBe(1);
    });

    it('should handle all axes', () => {
      const p1 = { x: 0, y: 0, z: 0 };
      const p2 = { x: 1, y: 1, z: 1 };
      expect(distance3D(p1, p2)).toBeCloseTo(Math.sqrt(3));
    });
  });

  describe('calculateCenter', () => {
    it('should calculate center of single point', () => {
      const points = [{ x: 5, y: 10, z: 15 }];
      const center = calculateCenter(points);
      expect(center).toEqual({ x: 5, y: 10, z: 15 });
    });

    it('should calculate center of multiple points', () => {
      const points = [
        { x: 0, y: 0, z: 0 },
        { x: 10, y: 10, z: 10 },
      ];
      const center = calculateCenter(points);
      expect(center).toEqual({ x: 5, y: 5, z: 5 });
    });

    it('should return origin for empty array', () => {
      const center = calculateCenter([]);
      expect(center).toEqual({ x: 0, y: 0, z: 0 });
    });
  });

  describe('smoothValue', () => {
    it('should return target when smoothing is 0', () => {
      expect(smoothValue(0, 100, 0)).toBe(100);
    });

    it('should return current when smoothing is 1', () => {
      expect(smoothValue(0, 100, 1)).toBe(0);
    });

    it('should interpolate based on smoothing', () => {
      const result = smoothValue(0, 100, 0.5);
      expect(result).toBe(50);
    });
  });

  describe('random', () => {
    it('should return values within range', () => {
      for (let i = 0; i < 100; i++) {
        const value = random(10, 20);
        expect(value).toBeGreaterThanOrEqual(10);
        expect(value).toBeLessThanOrEqual(20);
      }
    });

    it('should handle negative ranges', () => {
      for (let i = 0; i < 100; i++) {
        const value = random(-20, -10);
        expect(value).toBeGreaterThanOrEqual(-20);
        expect(value).toBeLessThanOrEqual(-10);
      }
    });
  });

  describe('randomGaussian', () => {
    it('should generate values around the mean', () => {
      const values = Array(1000)
        .fill(0)
        .map(() => randomGaussian(50, 10));

      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      expect(avg).toBeCloseTo(50, 0); // Within 1 of mean
    });

    it('should use default mean of 0', () => {
      const values = Array(1000)
        .fill(0)
        .map(() => randomGaussian());

      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      expect(avg).toBeCloseTo(0, 0);
    });
  });

  describe('easeInOutCubic', () => {
    it('should return 0 at t=0', () => {
      expect(easeInOutCubic(0)).toBe(0);
    });

    it('should return 1 at t=1', () => {
      expect(easeInOutCubic(1)).toBe(1);
    });

    it('should return 0.5 at t=0.5', () => {
      expect(easeInOutCubic(0.5)).toBe(0.5);
    });

    it('should ease slowly at start', () => {
      const value = easeInOutCubic(0.25);
      expect(value).toBeLessThan(0.25);
    });
  });

  describe('easeOutElastic', () => {
    it('should return 0 at t=0', () => {
      expect(easeOutElastic(0)).toBe(0);
    });

    it('should return 1 at t=1', () => {
      expect(easeOutElastic(1)).toBe(1);
    });

    it('should overshoot at mid values', () => {
      // Elastic easing typically overshoots
      const value = easeOutElastic(0.7);
      expect(value).toBeGreaterThan(0.9);
    });
  });

  describe('sphericalToCartesian', () => {
    it('should convert to correct x position', () => {
      const result = sphericalToCartesian(1, 0, Math.PI / 2);
      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(0);
      expect(result.z).toBeCloseTo(0);
    });

    it('should convert to correct y position (pole)', () => {
      const result = sphericalToCartesian(1, 0, 0);
      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(1);
      expect(result.z).toBeCloseTo(0);
    });

    it('should respect radius', () => {
      const result = sphericalToCartesian(5, 0, Math.PI / 2);
      expect(result.x).toBeCloseTo(5);
    });
  });

  describe('createNoise', () => {
    it('should create a noise function', () => {
      const noise = createNoise(42);
      expect(typeof noise).toBe('function');
    });

    it('should return values between -1 and 1', () => {
      const noise = createNoise(42);

      for (let i = 0; i < 100; i++) {
        const value = noise(Math.random() * 10, Math.random() * 10);
        expect(value).toBeGreaterThanOrEqual(-1);
        expect(value).toBeLessThanOrEqual(1);
      }
    });

    it('should be deterministic for same seed', () => {
      const noise1 = createNoise(42);
      const noise2 = createNoise(42);

      expect(noise1(1.5, 2.5)).toBe(noise2(1.5, 2.5));
    });

    it('should produce different values for different seeds', () => {
      const noise1 = createNoise(42);
      const noise2 = createNoise(123);

      expect(noise1(1.5, 2.5)).not.toBe(noise2(1.5, 2.5));
    });
  });
});
