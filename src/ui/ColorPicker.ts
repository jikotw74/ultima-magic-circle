import type { ColorChangeCallback } from '@/types';

const PRESET_COLORS = [
  '#ff6b9d', // Pink
  '#ff4757', // Red
  '#ff7f50', // Coral
  '#ffa502', // Orange
  '#ffdd59', // Yellow
  '#7bed9f', // Green
  '#70a1ff', // Blue
  '#5352ed', // Indigo
  '#a55eea', // Purple
  '#ffffff', // White
];

export class ColorPicker {
  private container: HTMLElement;
  private selectedColor: string = '#ff6b9d';
  private isCollapsed: boolean = true; // 預設摺疊
  public onChange: ColorChangeCallback | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="color-picker ${this.isCollapsed ? 'collapsed' : ''}">
        <div class="panel-header" role="button" tabindex="0">
          <h3 class="panel-title">顏色</h3>
          <div class="panel-header-right">
            <span class="current-color-preview" style="background-color: ${this.selectedColor}"></span>
            <span class="collapse-icon">${this.isCollapsed ? '▶' : '▼'}</span>
          </div>
        </div>
        <div class="panel-content">
          <div class="color-presets">
            ${PRESET_COLORS.map(
              (color) => `
              <button
                class="color-preset ${color === this.selectedColor ? 'active' : ''}"
                data-color="${color}"
                style="background-color: ${color}"
                title="${color}"
              ></button>
            `
            ).join('')}
          </div>
          <div class="color-custom">
            <label for="custom-color">自訂：</label>
            <input
              type="color"
              id="custom-color"
              value="${this.selectedColor}"
              class="color-input"
            />
          </div>
        </div>
      </div>
    `;

    // Add event listeners for presets
    const presets = this.container.querySelectorAll('.color-preset');
    presets.forEach((preset) => {
      preset.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const color = target.dataset.color!;
        this.setColor(color);
      });
    });

    // Add event listener for custom color input
    const customInput = this.container.querySelector('#custom-color') as HTMLInputElement;
    if (customInput) {
      customInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.setColor(target.value, false);
      });
    }

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

    const picker = this.container.querySelector('.color-picker');
    if (picker) {
      picker.classList.toggle('collapsed', this.isCollapsed);
    }

    const icon = this.container.querySelector('.collapse-icon');
    if (icon) {
      icon.textContent = this.isCollapsed ? '▶' : '▼';
    }
  }

  setColor(color: string, updateInput: boolean = true): void {
    this.selectedColor = color;

    // Update preset active state
    const presets = this.container.querySelectorAll('.color-preset');
    presets.forEach((preset) => {
      const presetEl = preset as HTMLElement;
      presetEl.classList.toggle(
        'active',
        presetEl.dataset.color === color
      );
    });

    // Update custom input if needed
    if (updateInput) {
      const customInput = this.container.querySelector('#custom-color') as HTMLInputElement;
      if (customInput) {
        customInput.value = color;
      }
    }

    // Update header color preview
    const colorPreview = this.container.querySelector('.current-color-preview') as HTMLElement;
    if (colorPreview) {
      colorPreview.style.backgroundColor = color;
    }

    // Notify callback
    if (this.onChange) {
      this.onChange(color);
    }
  }

  getSelectedColor(): string {
    return this.selectedColor;
  }
}
