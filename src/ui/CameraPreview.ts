import type { GestureState } from '@/types';

export class CameraPreview {
  private container: HTMLElement;
  private videoElement: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private isVisible: boolean = true;
  private animationId: number | null = null;
  private _gestureState: GestureState | null = null;
  private _handsDetectedCount: number = 0;
  private hasStartedStreaming: boolean = false;

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
          <div class="camera-canvas-wrapper">
            <canvas class="camera-canvas"></canvas>
            <div class="hand-detection-overlay">
              <span class="hands-count">0</span>
              <span class="hands-label">hands</span>
            </div>
          </div>
          <div class="camera-status">
            <span class="status-indicator"></span>
            <span class="status-text">Initializing...</span>
          </div>
          <div class="detection-feedback">
            <div class="detection-item">
              <span class="detection-label">Detection:</span>
              <span class="detection-value" id="detection-status">Waiting...</span>
            </div>
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
    this.hasStartedStreaming = false;
    this.updateStatus('inactive', 'Connecting...');
    this.startRendering();
  }

  private startRendering(): void {
    if (this.animationId !== null) return;

    const render = () => {
      if (this.videoElement && this.ctx && this.canvas && this.isVisible) {
        // Check if video is ready to be drawn
        // readyState >= 2 means HAVE_CURRENT_DATA (enough data for current frame)
        // Also check videoWidth/videoHeight for mobile compatibility
        const isVideoReady =
          this.videoElement.readyState >= 2 &&
          this.videoElement.videoWidth > 0 &&
          this.videoElement.videoHeight > 0;

        if (isVideoReady) {
          // Update status to active when video actually starts streaming
          if (!this.hasStartedStreaming) {
            this.hasStartedStreaming = true;
            this.updateStatus('active', 'Camera active');
          }

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

  updateGestureState(state: GestureState): void {
    this._gestureState = state;

    // Count detected hands
    let count = 0;
    if (state.leftHand) count++;
    if (state.rightHand) count++;
    this._handsDetectedCount = count;

    // Update hands count display
    const handsCount = this.container.querySelector('.hands-count');
    const handsLabel = this.container.querySelector('.hands-label');
    if (handsCount) {
      handsCount.textContent = String(count);
      handsCount.className = `hands-count ${count > 0 ? 'detected' : ''}`;
    }
    if (handsLabel) {
      handsLabel.textContent = count === 1 ? 'hand' : 'hands';
    }

    // Update detection status text
    const detectionStatus = this.container.querySelector('#detection-status');
    if (detectionStatus) {
      if (count === 0) {
        detectionStatus.textContent = 'No hands';
        detectionStatus.className = 'detection-value no-detection';
      } else if (count === 1) {
        const hand = state.leftHand || state.rightHand;
        const handStatus = hand?.isOpen ? 'Open' : hand?.isClosed ? 'Closed' : 'Partial';
        detectionStatus.textContent = `1 hand (${handStatus})`;
        detectionStatus.className = 'detection-value detecting';
      } else {
        detectionStatus.textContent = '2 hands detected!';
        detectionStatus.className = 'detection-value full-detection';
      }
    }

    // Update canvas wrapper border for visual feedback
    const wrapper = this.container.querySelector('.camera-canvas-wrapper');
    if (wrapper) {
      wrapper.className = `camera-canvas-wrapper ${count > 0 ? 'hands-detected' : ''} ${count === 2 ? 'both-hands' : ''}`;
    }
  }

  dispose(): void {
    this.stopRendering();
  }

  getGestureState(): GestureState | null {
    return this._gestureState;
  }

  getHandsDetectedCount(): number {
    return this._handsDetectedCount;
  }
}
