import type { TemplateType, TemplateChangeCallback } from '@/types';
import { getAllTemplates } from '@/templates';

export class TemplateSelector {
  private container: HTMLElement;
  private selectedTemplate: TemplateType = 'heart';
  public onChange: TemplateChangeCallback | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render(): void {
    const templates = getAllTemplates();

    this.container.innerHTML = `
      <div class="template-selector">
        <h3 class="panel-title">Templates</h3>
        <div class="template-grid">
          ${templates
            .map(
              (t) => `
            <button
              class="template-btn ${t.name === this.selectedTemplate ? 'active' : ''}"
              data-template="${t.name}"
              title="${t.displayName}"
            >
              <span class="template-icon">${t.icon}</span>
              <span class="template-name">${t.displayName}</span>
            </button>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    // Add event listeners
    const buttons = this.container.querySelectorAll('.template-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const template = target.dataset.template as TemplateType;
        this.setTemplate(template);
      });
    });
  }

  setTemplate(template: TemplateType): void {
    if (template === this.selectedTemplate) return;

    this.selectedTemplate = template;

    // Update active state
    const buttons = this.container.querySelectorAll('.template-btn');
    buttons.forEach((btn) => {
      const btnEl = btn as HTMLElement;
      btnEl.classList.toggle(
        'active',
        btnEl.dataset.template === template
      );
    });

    // Notify callback
    if (this.onChange) {
      this.onChange(template);
    }
  }

  getSelectedTemplate(): TemplateType {
    return this.selectedTemplate;
  }
}
