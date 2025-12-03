import type { TemplateGenerator } from '@/types';
import { random, randomGaussian } from '@/utils/math';

/**
 * Generate simplified Buddha silhouette using geometric primitives
 * Creates a meditation pose silhouette
 */
export function generateBuddhaPositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);

  // Distribution across body parts
  const headCount = Math.floor(count * 0.15);
  const bodyCount = Math.floor(count * 0.35);
  const legsCount = Math.floor(count * 0.3);
  const haloCount = Math.floor(count * 0.2);

  let index = 0;

  // Head (sphere)
  for (let i = 0; i < headCount; i++) {
    const theta = random(0, Math.PI * 2);
    const phi = Math.acos(random(-1, 1));
    const r = 0.18 * Math.cbrt(random(0.5, 1));

    positions[index++] = r * Math.sin(phi) * Math.cos(theta);
    positions[index++] = r * Math.cos(phi) + 0.65; // Head position
    positions[index++] = r * Math.sin(phi) * Math.sin(theta);
  }

  // Ushnisha (top knot)
  const ushnishaCount = Math.floor(headCount * 0.2);
  for (let i = 0; i < ushnishaCount && index < count * 3; i++) {
    const theta = random(0, Math.PI * 2);
    const r = random(0, 0.08);
    const h = random(0, 0.1);

    positions[index++] = r * Math.cos(theta);
    positions[index++] = 0.85 + h;
    positions[index++] = r * Math.sin(theta);
  }

  // Body (torso - ellipsoid)
  for (let i = 0; i < bodyCount && index < count * 3; i++) {
    const theta = random(0, Math.PI * 2);
    const phi = Math.acos(random(-1, 1));
    const r = Math.cbrt(random(0.3, 1));

    const width = 0.3 * r;
    const height = 0.35 * r;
    const depth = 0.2 * r;

    positions[index++] = width * Math.sin(phi) * Math.cos(theta);
    positions[index++] = height * Math.cos(phi) + 0.25; // Body center
    positions[index++] = depth * Math.sin(phi) * Math.sin(theta);
  }

  // Crossed legs (torus-like shape)
  for (let i = 0; i < legsCount && index < count * 3; i++) {
    const theta = random(0, Math.PI * 2);

    // Create a flattened oval for crossed legs
    const legWidth = 0.45;
    const legDepth = 0.25;
    const legHeight = 0.08;

    const r = random(0.2, 1);
    const x = legWidth * r * Math.cos(theta);
    const z = legDepth * r * Math.sin(theta);
    const y = -0.25 + randomGaussian(0, legHeight);

    positions[index++] = x;
    positions[index++] = y;
    positions[index++] = z;
  }

  // Halo/Aura (ring behind)
  for (let i = 0; i < haloCount && index < count * 3; i++) {
    const theta = random(0, Math.PI * 2);
    const r = random(0.6, 0.9);
    const spread = randomGaussian(0, 0.02);

    positions[index++] = r * Math.cos(theta);
    positions[index++] = r * Math.sin(theta) + 0.3; // Center of figure
    positions[index++] = -0.3 + spread; // Behind the figure
  }

  // Fill remaining positions
  while (index < count * 3) {
    const theta = random(0, Math.PI * 2);
    const r = random(0.7, 0.85);
    positions[index++] = r * Math.cos(theta);
    positions[index++] = r * Math.sin(theta) + 0.3;
    positions[index++] = -0.3;
  }

  return positions;
}

export const buddhaTemplate: TemplateGenerator = {
  name: 'buddha',
  displayName: '佛像',
  icon: '🧘',
  generate: generateBuddhaPositions,
  defaultCount: 7000,
};
