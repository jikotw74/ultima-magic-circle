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
  public onChange: ColorChangeCallback | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="color-picker">
        <h3 class="panel-title">Color</h3>
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
          <label for="custom-color">Custom:</label>
          <input
            type="color"
            id="custom-color"
            value="${this.selectedColor}"
            class="color-input"
          />
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

    // Notify callback
    if (this.onChange) {
      this.onChange(color);
    }
  }

  getSelectedColor(): string {
    return this.selectedColor;
  }
}
