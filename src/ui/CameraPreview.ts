export class CameraPreview {
  private container: HTMLElement;
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isVisible: boolean = true;
  private animationId: number | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="camera-preview ${this.isVisible ? '' : 'hidden'}">
        <div class="camera-header">
          <span class="camera-title">Camera</span>
          <button class="camera-toggle" title="Toggle camera preview">
            <span class="toggle-icon">${this.isVisible ? '👁️' : '👁️‍🗨️'}</span>
          </button>
        </div>
        <div class="camera-content">
          <canvas class="camera-canvas"></canvas>
          <div class="camera-status">
            <span class="status-indicator"></span>
            <span class="status-text">Initializing...</span>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('.camera-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.canvas.width = 160;
      this.canvas.height = 120;
    }

    // Toggle button
    const toggleBtn = this.container.querySelector('.camera-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggle());
    }
  }

  setVideoSource(video: HTMLVideoElement): void {
    this.videoElement = video;
    this.updateStatus('active', 'Camera active');
    this.startRendering();
  }

  private startRendering(): void {
    if (this.animationId !== null) return;

    const render = () => {
      if (this.videoElement && this.ctx && this.canvas && this.isVisible) {
        // Mirror the video
        this.ctx.save();
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(
          this.videoElement,
          -this.canvas.width,
          0,
          this.canvas.width,
          this.canvas.height
        );
        this.ctx.restore();
      }
      this.animationId = requestAnimationFrame(render);
    };

    render();
  }

  private stopRendering(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private updateStatus(status: 'inactive' | 'active' | 'error', text: string): void {
    const indicator = this.container.querySelector('.status-indicator');
    const statusText = this.container.querySelector('.status-text');

    if (indicator) {
      indicator.className = `status-indicator ${status}`;
    }
    if (statusText) {
      statusText.textContent = text;
    }
  }

  toggle(): void {
    this.isVisible = !this.isVisible;

    const preview = this.container.querySelector('.camera-preview');
    if (preview) {
      preview.classList.toggle('hidden', !this.isVisible);
    }

    const toggleIcon = this.container.querySelector('.toggle-icon');
    if (toggleIcon) {
      toggleIcon.textContent = this.isVisible ? '👁️' : '👁️‍🗨️';
    }

    if (this.isVisible) {
      this.startRendering();
    } else {
      this.stopRendering();
    }
  }

  show(): void {
    if (!this.isVisible) {
      this.toggle();
    }
  }

  hide(): void {
    if (this.isVisible) {
      this.toggle();
    }
  }

  setError(message: string): void {
    this.updateStatus('error', message);
  }

  dispose(): void {
    this.stopRendering();
  }
}
