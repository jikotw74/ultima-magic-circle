import type { TemplateGenerator } from '@/types';
import { random, sphericalToCartesian } from '@/utils/math';

/**
 * Generate 3D flower shape with multiple petals
 */
export function generateFlowerPositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const petalCount = 6;
  const particlesPerPetal = Math.floor(count * 0.7 / petalCount);
  const centerParticles = count - particlesPerPetal * petalCount;

  let index = 0;

  // Generate center (pistil)
  for (let i = 0; i < centerParticles; i++) {
    const r = random(0, 0.15);
    const theta = random(0, Math.PI * 2);
    const phi = random(0, Math.PI);

    const pos = sphericalToCartesian(r, theta, phi);
    positions[index++] = pos.x;
    positions[index++] = pos.y * 0.5 + 0.1; // Slightly raised
    positions[index++] = pos.z;
  }

  // Generate petals
  for (let petal = 0; petal < petalCount; petal++) {
    const petalAngle = (petal / petalCount) * Math.PI * 2;

    for (let i = 0; i < particlesPerPetal; i++) {
      // Petal shape using modified rose curve
      const t = random(0.1, 1);
      const spread = random(-0.3, 0.3);

      // Rose petal shape
      const petalLength = 0.8;
      const petalWidth = 0.3;

      // Position along petal
      const alongPetal = t * petalLength;

      // Width varies along petal length (wider in middle)
      const widthFactor = Math.sin(t * Math.PI) * petalWidth;
      const crossPetal = spread * widthFactor;

      // Curl the petal upward slightly
      const curl = Math.pow(t, 2) * 0.3;

      // Transform to world coordinates
      const x = Math.cos(petalAngle) * alongPetal - Math.sin(petalAngle) * crossPetal;
      const z = Math.sin(petalAngle) * alongPetal + Math.cos(petalAngle) * crossPetal;
      const y = curl + random(-0.02, 0.02);

      positions[index++] = x;
      positions[index++] = y;
      positions[index++] = z;
    }
  }

  return positions;
}

export const flowerTemplate: TemplateGenerator = {
  name: 'flower',
  displayName: 'Flower',
  icon: '🌸',
  generate: generateFlowerPositions,
  defaultCount: 5000,
};
