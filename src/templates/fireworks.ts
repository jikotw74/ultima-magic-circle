import type { TemplateGenerator } from '@/types';
import { random, sphericalToCartesian } from '@/utils/math';

/**
 * Generate fireworks explosion pattern
 * Multiple bursts radiating outward
 */
export function generateFireworksPositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);

  const burstCount = 5; // Number of explosion centers
  const particlesPerBurst = Math.floor(count / burstCount);

  // Burst centers
  const centers = [
    { x: 0, y: 0.2, z: 0 },      // Center
    { x: -0.5, y: 0.5, z: 0.2 }, // Top left
    { x: 0.5, y: 0.4, z: -0.1 }, // Top right
    { x: -0.3, y: -0.3, z: 0.1 },// Bottom left
    { x: 0.4, y: -0.2, z: -0.2 },// Bottom right
  ];

  let index = 0;

  for (let burst = 0; burst < burstCount; burst++) {
    const center = centers[burst];
    const burstSize = random(0.4, 0.8);

    // Create different burst patterns
    const pattern = burst % 3;

    for (let i = 0; i < particlesPerBurst && index < count * 3; i++) {
      const theta = random(0, Math.PI * 2);
      const phi = Math.acos(random(-1, 1));

      let r: number;
      let pos: { x: number; y: number; z: number };

      switch (pattern) {
        case 0: // Spherical burst
          r = random(0.1, burstSize);
          pos = sphericalToCartesian(r, theta, phi);
          break;

        case 1: // Willow (drooping trails)
          r = random(0.1, burstSize);
          pos = sphericalToCartesian(r, theta, phi);
          // Add drooping effect
          pos.y -= r * r * 0.5;
          break;

        case 2: // Chrysanthemum (dense center, trailing)
          {
            const t = random(0, 1);
            r = t * burstSize;
            pos = sphericalToCartesian(r, theta, phi);
            // Trail effect - particles spread more at edges
            const spread = t * 0.3;
            pos.x += random(-spread, spread);
            pos.z += random(-spread, spread);
          }
          break;

        default:
          r = random(0.1, burstSize);
          pos = sphericalToCartesian(r, theta, phi);
      }

      positions[index++] = pos.x + center.x;
      positions[index++] = pos.y + center.y;
      positions[index++] = pos.z + center.z;
    }
  }

  // Fill any remaining positions
  while (index < count * 3) {
    const theta = random(0, Math.PI * 2);
    const phi = Math.acos(random(-1, 1));
    const r = random(0.1, 0.6);
    const pos = sphericalToCartesian(r, theta, phi);
    positions[index++] = pos.x;
    positions[index++] = pos.y;
    positions[index++] = pos.z;
  }

  return positions;
}

export const fireworksTemplate: TemplateGenerator = {
  name: 'fireworks',
  displayName: '煙火',
  icon: '🎆',
  generate: generateFireworksPositions,
  defaultCount: 4000,
};
