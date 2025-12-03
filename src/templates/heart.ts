import type { TemplateGenerator } from '@/types';

/**
 * Generate 3D heart shape using parametric equations
 * Heart surface formula adapted for particle distribution
 */
export function generateHeartPositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Use parametric equations for 3D heart
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI;

    // Heart shape parametric formula
    const scale = 0.8;

    // Modified heart surface equation
    const sinU = Math.sin(u);
    const cosU = Math.cos(u);
    const sinV = Math.sin(v);

    // Heart curve in 2D, extruded to 3D
    const heartX = 16 * Math.pow(sinU, 3);
    const heartY = 13 * cosU - 5 * Math.cos(2 * u) - 2 * Math.cos(3 * u) - Math.cos(4 * u);

    // Add depth variation
    const depth = (Math.random() - 0.5) * 4 * sinV;

    // Normalize and apply scale
    const normalizer = 20;
    positions[i * 3] = (heartX / normalizer) * scale;
    positions[i * 3 + 1] = (heartY / normalizer) * scale;
    positions[i * 3 + 2] = depth * scale * 0.3;

    // Add some randomness for organic feel
    positions[i * 3] += (Math.random() - 0.5) * 0.05;
    positions[i * 3 + 1] += (Math.random() - 0.5) * 0.05;
    positions[i * 3 + 2] += (Math.random() - 0.5) * 0.05;
  }

  return positions;
}

export const heartTemplate: TemplateGenerator = {
  name: 'heart',
  displayName: '愛心',
  icon: '❤️',
  generate: generateHeartPositions,
  defaultCount: 4000,
};
