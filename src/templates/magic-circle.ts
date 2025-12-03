import type { TemplateGenerator } from '@/types';
import { random, sphericalToCartesian } from '@/utils/math';

/**
 * 生成魔法陣粒子位置
 * 包含多層同心圓、六芒星、符文環和中央核心
 * 魔法陣面向螢幕 (X-Y 平面)
 */
export function generateMagicCirclePositions(count: number): Float32Array {
  const positions = new Float32Array(count * 3);

  // 分配比例
  const outerRingParticles = Math.floor(count * 0.15);     // 外圍光環
  const middleRingParticles = Math.floor(count * 0.15);    // 中間圓環
  const innerRingParticles = Math.floor(count * 0.12);     // 內圈圓環
  const hexagramParticles = Math.floor(count * 0.20);      // 六芒星
  const runeCircleParticles = Math.floor(count * 0.15);    // 符文環
  const radiatingLinesParticles = Math.floor(count * 0.10);// 放射線
  const coreParticles = count - outerRingParticles - middleRingParticles -
    innerRingParticles - hexagramParticles - runeCircleParticles - radiatingLinesParticles; // 中央核心

  let index = 0;

  // 1. 外圍光環 (最大的圓)
  const outerRadius = 1.2;
  for (let i = 0; i < outerRingParticles; i++) {
    const angle = (i / outerRingParticles) * Math.PI * 2;
    const radiusVariation = outerRadius + random(-0.02, 0.02);
    const depthVariation = random(-0.01, 0.01);

    positions[index++] = Math.cos(angle) * radiusVariation;  // X
    positions[index++] = Math.sin(angle) * radiusVariation;  // Y (原本是 Z)
    positions[index++] = depthVariation;                      // Z (深度)
  }

  // 2. 中間圓環
  const middleRadius = 0.9;
  for (let i = 0; i < middleRingParticles; i++) {
    const angle = (i / middleRingParticles) * Math.PI * 2;
    const radiusVariation = middleRadius + random(-0.015, 0.015);
    const depthVariation = random(-0.01, 0.01);

    positions[index++] = Math.cos(angle) * radiusVariation;
    positions[index++] = Math.sin(angle) * radiusVariation;
    positions[index++] = depthVariation;
  }

  // 3. 內圈圓環
  const innerRadius = 0.6;
  for (let i = 0; i < innerRingParticles; i++) {
    const angle = (i / innerRingParticles) * Math.PI * 2;
    const radiusVariation = innerRadius + random(-0.01, 0.01);
    const depthVariation = random(-0.008, 0.008);

    positions[index++] = Math.cos(angle) * radiusVariation;
    positions[index++] = Math.sin(angle) * radiusVariation;
    positions[index++] = depthVariation;
  }

  // 4. 六芒星 (兩個交疊的正三角形)
  const hexagramRadius = 0.75;
  const particlesPerLine = Math.floor(hexagramParticles / 6);

  for (let star = 0; star < 2; star++) {
    const startAngle = star * (Math.PI / 6); // 第二個三角形旋轉 30 度

    for (let side = 0; side < 3; side++) {
      const angle1 = startAngle + (side * 2 * Math.PI) / 3;
      const angle2 = startAngle + ((side + 1) * 2 * Math.PI) / 3;

      const x1 = Math.cos(angle1) * hexagramRadius;
      const y1 = Math.sin(angle1) * hexagramRadius;
      const x2 = Math.cos(angle2) * hexagramRadius;
      const y2 = Math.sin(angle2) * hexagramRadius;

      for (let i = 0; i < particlesPerLine; i++) {
        const t = i / particlesPerLine;
        const x = x1 + (x2 - x1) * t + random(-0.01, 0.01);
        const y = y1 + (y2 - y1) * t + random(-0.01, 0.01);
        const z = random(-0.005, 0.005);

        positions[index++] = x;
        positions[index++] = y;
        positions[index++] = z;
      }
    }
  }

  // 5. 符文環 (在中間和外圈之間的裝飾圓點)
  const runeRadius = 1.05;
  const runeCount = 12; // 12 個符文位置
  const particlesPerRune = Math.floor(runeCircleParticles / runeCount);

  for (let rune = 0; rune < runeCount; rune++) {
    const runeAngle = (rune / runeCount) * Math.PI * 2;
    const runeCenterX = Math.cos(runeAngle) * runeRadius;
    const runeCenterY = Math.sin(runeAngle) * runeRadius;

    // 每個符文是一個小圓圈
    for (let i = 0; i < particlesPerRune; i++) {
      const localAngle = random(0, Math.PI * 2);
      const localRadius = random(0, 0.04);

      positions[index++] = runeCenterX + Math.cos(localAngle) * localRadius;
      positions[index++] = runeCenterY + Math.sin(localAngle) * localRadius;
      positions[index++] = random(-0.005, 0.005);
    }
  }

  // 6. 放射線 (從中心向外)
  const rayCount = 8;
  const particlesPerRay = Math.floor(radiatingLinesParticles / rayCount);

  for (let ray = 0; ray < rayCount; ray++) {
    const rayAngle = (ray / rayCount) * Math.PI * 2;

    for (let i = 0; i < particlesPerRay; i++) {
      const t = random(0.1, 0.55); // 從中心到內圈的範圍
      const x = Math.cos(rayAngle) * t + random(-0.008, 0.008);
      const y = Math.sin(rayAngle) * t + random(-0.008, 0.008);

      positions[index++] = x;
      positions[index++] = y;
      positions[index++] = random(-0.003, 0.003);
    }
  }

  // 7. 中央核心 (發光球體)
  for (let i = 0; i < coreParticles; i++) {
    const theta = random(0, Math.PI * 2);
    const phi = Math.acos(random(-1, 1));
    const r = 0.15 * Math.cbrt(random(0, 1)); // 立方根分佈使粒子更均勻

    const pos = sphericalToCartesian(r, theta, phi);

    // 稍微壓扁成橢圓形 (Z 軸方向壓扁)
    positions[index++] = pos.x;
    positions[index++] = pos.y;
    positions[index++] = pos.z * 0.6;
  }

  // 填充剩餘位置（如果有的話）
  while (index < count * 3) {
    const angle = random(0, Math.PI * 2);
    const radius = random(0.3, 1.1);
    positions[index++] = Math.cos(angle) * radius;
    positions[index++] = Math.sin(angle) * radius;
    positions[index++] = random(-0.01, 0.01);
  }

  return positions;
}

export const magicCircleTemplate: TemplateGenerator = {
  name: 'magicCircle',
  displayName: '魔法陣',
  icon: '🔮',
  generate: generateMagicCirclePositions,
  defaultCount: 6000,
};
