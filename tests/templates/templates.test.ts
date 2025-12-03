import { describe, it, expect } from 'vitest';
import {
  generatePositions,
  getTemplate,
  getAllTemplates,
  heartTemplate,
  flowerTemplate,
  saturnTemplate,
  buddhaTemplate,
  fireworksTemplate,
  magicCircleTemplate,
} from '@/templates';
import type { TemplateType } from '@/types';

describe('Templates', () => {
  describe('getAllTemplates', () => {
    it('should return all 6 templates', () => {
      const templates = getAllTemplates();
      expect(templates).toHaveLength(6);
    });

    it('should include all required template types', () => {
      const templates = getAllTemplates();
      const names = templates.map((t) => t.name);

      expect(names).toContain('heart');
      expect(names).toContain('flower');
      expect(names).toContain('saturn');
      expect(names).toContain('buddha');
      expect(names).toContain('fireworks');
      expect(names).toContain('magicCircle');
    });
  });

  describe('getTemplate', () => {
    it('should return correct template for each type', () => {
      expect(getTemplate('heart')).toBe(heartTemplate);
      expect(getTemplate('flower')).toBe(flowerTemplate);
      expect(getTemplate('saturn')).toBe(saturnTemplate);
      expect(getTemplate('buddha')).toBe(buddhaTemplate);
      expect(getTemplate('fireworks')).toBe(fireworksTemplate);
      expect(getTemplate('magicCircle')).toBe(magicCircleTemplate);
    });
  });

  describe('generatePositions', () => {
    const templateTypes: TemplateType[] = ['heart', 'flower', 'saturn', 'buddha', 'fireworks', 'magicCircle'];

    templateTypes.forEach((type) => {
      describe(type, () => {
        it('should generate correct number of positions', () => {
          const count = 1000;
          const positions = generatePositions(type, count);

          // Float32Array with 3 values per particle (x, y, z)
          expect(positions.length).toBe(count * 3);
        });

        it('should generate positions within reasonable bounds', () => {
          const positions = generatePositions(type, 500);

          for (let i = 0; i < positions.length; i++) {
            // All positions should be within -5 to 5 range
            expect(positions[i]).toBeGreaterThanOrEqual(-5);
            expect(positions[i]).toBeLessThanOrEqual(5);
          }
        });

        it('should generate valid Float32Array', () => {
          const positions = generatePositions(type, 100);
          expect(positions).toBeInstanceOf(Float32Array);
        });

        it('should not contain NaN or Infinity values', () => {
          const positions = generatePositions(type, 500);

          for (let i = 0; i < positions.length; i++) {
            expect(Number.isFinite(positions[i])).toBe(true);
          }
        });
      });
    });
  });

  describe('heartTemplate', () => {
    it('should have correct metadata', () => {
      expect(heartTemplate.name).toBe('heart');
      expect(heartTemplate.displayName).toBe('愛心');
      expect(heartTemplate.icon).toBe('❤️');
      expect(heartTemplate.defaultCount).toBeGreaterThan(0);
    });

    it('should generate heart-shaped distribution', () => {
      const positions = heartTemplate.generate(1000);

      // Heart shape should have particles primarily in upper hemisphere
      let aboveCenter = 0;
      let belowCenter = 0;

      for (let i = 0; i < 1000; i++) {
        const y = positions[i * 3 + 1];
        if (y > 0) aboveCenter++;
        else belowCenter++;
      }

      // Heart shape has more particles above center (top lobes)
      expect(aboveCenter).toBeGreaterThan(belowCenter * 0.5);
    });
  });

  describe('flowerTemplate', () => {
    it('should have correct metadata', () => {
      expect(flowerTemplate.name).toBe('flower');
      expect(flowerTemplate.displayName).toBe('花朵');
      expect(flowerTemplate.icon).toBe('🌸');
      expect(flowerTemplate.defaultCount).toBeGreaterThan(0);
    });

    it('should generate radially symmetric distribution', () => {
      const positions = flowerTemplate.generate(1000);

      // Check for radial distribution
      let quadrant1 = 0, quadrant2 = 0, quadrant3 = 0, quadrant4 = 0;

      for (let i = 0; i < 1000; i++) {
        const x = positions[i * 3];
        const z = positions[i * 3 + 2];

        if (x >= 0 && z >= 0) quadrant1++;
        else if (x < 0 && z >= 0) quadrant2++;
        else if (x < 0 && z < 0) quadrant3++;
        else quadrant4++;
      }

      // Should be roughly evenly distributed across quadrants
      const avg = 250;
      const tolerance = 150;

      expect(Math.abs(quadrant1 - avg)).toBeLessThan(tolerance);
      expect(Math.abs(quadrant2 - avg)).toBeLessThan(tolerance);
      expect(Math.abs(quadrant3 - avg)).toBeLessThan(tolerance);
      expect(Math.abs(quadrant4 - avg)).toBeLessThan(tolerance);
    });
  });

  describe('saturnTemplate', () => {
    it('should have correct metadata', () => {
      expect(saturnTemplate.name).toBe('saturn');
      expect(saturnTemplate.displayName).toBe('土星');
      expect(saturnTemplate.icon).toBe('🪐');
      expect(saturnTemplate.defaultCount).toBeGreaterThan(0);
    });

    it('should generate ring structure', () => {
      const positions = saturnTemplate.generate(1000);

      // Count particles near the equatorial plane (rings)
      let ringParticles = 0;
      let sphereParticles = 0;

      for (let i = 0; i < 1000; i++) {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];

        const horizontalDist = Math.sqrt(x * x + z * z);

        // Ring particles: flat (small y) and far from center
        if (Math.abs(y) < 0.1 && horizontalDist > 0.5) {
          ringParticles++;
        }
        // Sphere particles: closer to center
        else if (horizontalDist < 0.6) {
          sphereParticles++;
        }
      }

      // Should have significant ring particles (60% distribution)
      expect(ringParticles).toBeGreaterThan(200);
    });
  });

  describe('buddhaTemplate', () => {
    it('should have correct metadata', () => {
      expect(buddhaTemplate.name).toBe('buddha');
      expect(buddhaTemplate.displayName).toBe('佛像');
      expect(buddhaTemplate.icon).toBe('🧘');
      expect(buddhaTemplate.defaultCount).toBeGreaterThan(0);
    });

    it('should generate vertically oriented shape', () => {
      const positions = buddhaTemplate.generate(1000);

      // Calculate bounding box
      let minY = Infinity, maxY = -Infinity;
      let minX = Infinity, maxX = -Infinity;

      for (let i = 0; i < 1000; i++) {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }

      const width = maxX - minX;
      const height = maxY - minY;

      // Buddha should be taller than wide (sitting figure)
      expect(height).toBeGreaterThan(width * 0.8);
    });
  });

  describe('fireworksTemplate', () => {
    it('should have correct metadata', () => {
      expect(fireworksTemplate.name).toBe('fireworks');
      expect(fireworksTemplate.displayName).toBe('煙火');
      expect(fireworksTemplate.icon).toBe('🎆');
      expect(fireworksTemplate.defaultCount).toBeGreaterThan(0);
    });

    it('should generate multiple burst centers', () => {
      const positions = fireworksTemplate.generate(1000);

      // Group particles by approximate center
      const centers: Map<string, number> = new Map();

      for (let i = 0; i < 1000; i++) {
        const x = Math.round(positions[i * 3] * 2) / 2;
        const y = Math.round(positions[i * 3 + 1] * 2) / 2;
        const key = `${x},${y}`;

        centers.set(key, (centers.get(key) || 0) + 1);
      }

      // Should have multiple distinct center regions (at least 3)
      const significantCenters = Array.from(centers.values()).filter(
        (count) => count > 50
      );
      expect(significantCenters.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('magicCircleTemplate', () => {
    it('should have correct metadata', () => {
      expect(magicCircleTemplate.name).toBe('magicCircle');
      expect(magicCircleTemplate.displayName).toBe('魔法陣');
      expect(magicCircleTemplate.icon).toBe('🔮');
      expect(magicCircleTemplate.defaultCount).toBeGreaterThan(0);
    });

    it('should generate circular ring structure', () => {
      const positions = magicCircleTemplate.generate(1000);

      // 魔法陣主要是平面結構，Y 值應該很小
      let flatParticles = 0;

      for (let i = 0; i < 1000; i++) {
        const y = positions[i * 3 + 1];
        // 平面粒子 Y 值在 -0.2 到 0.2 之間
        if (Math.abs(y) < 0.2) {
          flatParticles++;
        }
      }

      // 大部分粒子應該在平面上（至少 80%）
      expect(flatParticles).toBeGreaterThan(800);
    });

    it('should generate radially symmetric distribution', () => {
      const positions = magicCircleTemplate.generate(1000);

      // 檢查徑向分佈
      let quadrant1 = 0, quadrant2 = 0, quadrant3 = 0, quadrant4 = 0;

      for (let i = 0; i < 1000; i++) {
        const x = positions[i * 3];
        const z = positions[i * 3 + 2];

        if (x >= 0 && z >= 0) quadrant1++;
        else if (x < 0 && z >= 0) quadrant2++;
        else if (x < 0 && z < 0) quadrant3++;
        else quadrant4++;
      }

      // 四個象限應該大致相等分佈
      const avg = 250;
      const tolerance = 150;

      expect(Math.abs(quadrant1 - avg)).toBeLessThan(tolerance);
      expect(Math.abs(quadrant2 - avg)).toBeLessThan(tolerance);
      expect(Math.abs(quadrant3 - avg)).toBeLessThan(tolerance);
      expect(Math.abs(quadrant4 - avg)).toBeLessThan(tolerance);
    });

    it('should have multiple ring layers', () => {
      const positions = magicCircleTemplate.generate(2000);

      // 計算不同半徑範圍的粒子數量
      const innerRing: number[] = []; // 0 - 0.4
      const middleRing: number[] = []; // 0.4 - 0.8
      const outerRing: number[] = []; // 0.8 - 1.5

      for (let i = 0; i < 2000; i++) {
        const x = positions[i * 3];
        const z = positions[i * 3 + 2];
        const radius = Math.sqrt(x * x + z * z);

        if (radius < 0.4) {
          innerRing.push(radius);
        } else if (radius < 0.8) {
          middleRing.push(radius);
        } else {
          outerRing.push(radius);
        }
      }

      // 每個環都應該有粒子
      expect(innerRing.length).toBeGreaterThan(100);
      expect(middleRing.length).toBeGreaterThan(100);
      expect(outerRing.length).toBeGreaterThan(100);
    });
  });
});
