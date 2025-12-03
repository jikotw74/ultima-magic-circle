import './styles/main.css';
import { AppController } from './core/AppController';
import { TemplateSelector, ColorPicker, CameraPreview, GestureIndicator } from './ui';
import type { TemplateType } from './types';

class App {
  private appController: AppController | null = null;
  private templateSelector: TemplateSelector | null = null;
  private colorPicker: ColorPicker | null = null;
  private cameraPreview: CameraPreview | null = null;
  private gestureIndicator: GestureIndicator | null = null;

  async init(): Promise<void> {
    // Create UI structure
    this.createUI();

    // Get canvas container
    const canvasContainer = document.getElementById('canvas-container');
    if (!canvasContainer) {
      throw new Error('Canvas container not found');
    }

    // Initialize app controller
    this.appController = new AppController(canvasContainer, {
      particleConfig: {
        count: 5000,
        template: 'heart',
      },
      gestureConfig: {
        smoothing: 0.7,
        sensitivity: 1.0,
      },
    });

    // Initialize UI components
    this.initializeUI();

    // Set up camera start callback (triggered by user click)
    if (this.cameraPreview) {
      this.cameraPreview.onRequestCameraStart = async () => {
        await this.initializeCamera();
      };
    }

    // Start animation (without camera - camera will be started by user interaction)
    this.appController.start();

    // Start gesture polling (will show no hands until camera is started)
    this.startGesturePolling();

    // Hide loading screen
    this.hideLoading();
  }

  private createUI(): void {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <div id="canvas-container"></div>

      <div class="ui-overlay">
        <header class="header">
          <h1>Ultima Magic Circle</h1>
          <p>Control particles with your hands</p>
        </header>

        <div class="control-panel">
          <div class="panel-section" id="template-selector"></div>
          <div class="panel-section" id="color-picker"></div>
        </div>

        <div class="camera-preview-container" id="camera-preview"></div>

        <div class="gesture-indicator-container" id="gesture-indicator"></div>

        <div class="instructions">
          <div class="instructions-panel">
            <h3>How to use</h3>
            <ul>
              <li>Show your hands to the camera</li>
              <li>Close fists to increase tension/scale</li>
              <li>Move hands apart to expand particles</li>
              <li>Select different templates above</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="loading-screen" id="loading">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading...</p>
      </div>
    `;
  }

  private initializeUI(): void {
    // Template selector
    const templateContainer = document.getElementById('template-selector');
    if (templateContainer) {
      this.templateSelector = new TemplateSelector(templateContainer);
      this.templateSelector.onChange = (template: TemplateType) => {
        this.appController?.setTemplate(template);
      };
    }

    // Color picker
    const colorContainer = document.getElementById('color-picker');
    if (colorContainer) {
      this.colorPicker = new ColorPicker(colorContainer);
      this.colorPicker.onChange = (color: string) => {
        this.appController?.setColor(color);
      };
    }

    // Camera preview
    const cameraContainer = document.getElementById('camera-preview');
    if (cameraContainer) {
      this.cameraPreview = new CameraPreview(cameraContainer);
    }

    // Gesture indicator
    const gestureContainer = document.getElementById('gesture-indicator');
    if (gestureContainer) {
      this.gestureIndicator = new GestureIndicator(gestureContainer);
    }
  }

  private startGesturePolling(): void {
    const poll = () => {
      const state = this.appController?.getGestureState();
      if (state) {
        if (this.gestureIndicator) {
          this.gestureIndicator.update(state);
        }
        // Also update camera preview with gesture state for iOS debugging
        if (this.cameraPreview) {
          this.cameraPreview.updateGestureState(state);
        }
      }
      requestAnimationFrame(poll);
    };
    poll();
  }

  private async initializeCamera(): Promise<void> {
    if (!this.appController) {
      throw new Error('App controller not initialized');
    }

    try {
      await this.appController.initialize();

      // Connect camera preview to video element
      const videoElement = this.appController.getVideoElement();
      if (videoElement && this.cameraPreview) {
        this.cameraPreview.setVideoSource(videoElement);
      }

      // Update gesture indicator with initial state
      const gestureState = this.appController.getGestureState();
      if (gestureState && this.gestureIndicator) {
        this.gestureIndicator.update(gestureState);
      }
    } catch (error) {
      console.error('Failed to initialize camera:', error);
      throw error;
    }
  }

  private hideLoading(): void {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.classList.add('hidden');
      setTimeout(() => {
        loading.remove();
      }, 500);
    }
  }
}

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init().catch(console.error);
});
