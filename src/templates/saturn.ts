import type { TemplateGenerator } from '@/types';
import { random, sphericalToCartesian } from '@/utils/math';

/**
 * Generate Saturn with rings
 */
export function generateSaturnPositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);

  // Distribution: 40% planet, 60% rings
  const planetParticles = Math.floor(count * 0.4);
  const ringParticles = count - planetParticles;

  let index = 0;

  // Generate planet (slightly oblate spheroid)
  for (let i = 0; i < planetParticles; i++) {
    const theta = random(0, Math.PI * 2);
    const phi = Math.acos(random(-1, 1));
    const r = 0.5 * Math.cbrt(random(0.3, 1)); // Cube root for uniform distribution

    const pos = sphericalToCartesian(r, theta, phi);

    // Make it slightly oblate
    positions[index++] = pos.x;
    positions[index++] = pos.y * 0.85;
    positions[index++] = pos.z;
  }

  // Generate rings
  const innerRadius = 0.7;
  const outerRadius = 1.3;
  const ringThickness = 0.03;

  for (let i = 0; i < ringParticles; i++) {
    const theta = random(0, Math.PI * 2);

    // Ring radius with gaps (Cassini division effect)
    let r: number;
    const ringSection = random(0, 1);

    if (ringSection < 0.4) {
      // Inner ring (B ring)
      r = random(innerRadius, innerRadius + 0.2);
    } else if (ringSection < 0.45) {
      // Cassini division (sparse)
      r = random(innerRadius + 0.2, innerRadius + 0.25);
      if (random(0, 1) > 0.3) continue; // Skip most particles in gap
    } else {
      // Outer ring (A ring)
      r = random(innerRadius + 0.25, outerRadius);
    }

    // Tilt the ring plane slightly
    const tilt = 0.3;
    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    const y = random(-ringThickness, ringThickness) + x * Math.sin(tilt) * 0.1;

    positions[index++] = x;
    positions[index++] = y;
    positions[index++] = z;
  }

  // Fill remaining positions if any were skipped
  while (index < count * 3) {
    const theta = random(0, Math.PI * 2);
    const r = random(innerRadius, outerRadius);
    positions[index++] = r * Math.cos(theta);
    positions[index++] = random(-ringThickness, ringThickness);
    positions[index++] = r * Math.sin(theta);
  }

  return positions;
}

export const saturnTemplate: TemplateGenerator = {
  name: 'saturn',
  displayName: '土星',
  icon: '🪐',
  generate: generateSaturnPositions,
  defaultCount: 6000,
};
