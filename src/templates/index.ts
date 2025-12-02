import type { TemplateGenerator, TemplateType } from '@/types';
import { heartTemplate } from './heart';
import { flowerTemplate } from './flower';
import { saturnTemplate } from './saturn';
import { buddhaTemplate } from './buddha';
import { fireworksTemplate } from './fireworks';

export const templates: Record<TemplateType, TemplateGenerator> = {
  heart: heartTemplate,
  flower: flowerTemplate,
  saturn: saturnTemplate,
  buddha: buddhaTemplate,
  fireworks: fireworksTemplate,
};

export function getTemplate(type: TemplateType): TemplateGenerator {
  return templates[type];
}

export function generatePositions(type: TemplateType, count?: number): Float32Array {
  const template = templates[type];
  return template.generate(count ?? template.defaultCount);
}

export function getAllTemplates(): TemplateGenerator[] {
  return Object.values(templates);
}

export { heartTemplate, flowerTemplate, saturnTemplate, buddhaTemplate, fireworksTemplate };
