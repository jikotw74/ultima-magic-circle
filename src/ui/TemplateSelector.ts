import type { TemplateType, TemplateChangeCallback } from '@/types';
import { getAllTemplates } from '@/templates';

export class TemplateSelector {
  private container: HTMLElement;
  private selectedTemplate: TemplateType = 'heart';
  private isCollapsed: boolean = false;
  public onChange: TemplateChangeCallback | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render(): void {
    const templates = getAllTemplates();

    this.container.innerHTML = `
      <div class="template-selector ${this.isCollapsed ? 'collapsed' : ''}">
        <div class="panel-header" role="button" tabindex="0">
          <h3 class="panel-title">模板</h3>
          <span class="collapse-icon">${this.isCollapsed ? '▶' : '▼'}</span>
        </div>
        <div class="panel-content template-grid">
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

    // Add event listeners for template buttons
    const buttons = this.container.querySelectorAll('.template-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const template = target.dataset.template as TemplateType;
        this.setTemplate(template);
      });
    });

    // Add event listener for collapse toggle
    const header = this.container.querySelector('.panel-header');
    if (header) {
      header.addEventListener('click', () => this.toggleCollapse());
      header.addEventListener('keydown', (e) => {
        if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
          e.preventDefault();
          this.toggleCollapse();
        }
      });
    }
  }

  private toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;

    const selector = this.container.querySelector('.template-selector');
    if (selector) {
      selector.classList.toggle('collapsed', this.isCollapsed);
    }

    const icon = this.container.querySelector('.collapse-icon');
    if (icon) {
      icon.textContent = this.isCollapsed ? '▶' : '▼';
    }
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
