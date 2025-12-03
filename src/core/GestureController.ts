import type {
  GestureState,
  HandState,
  HandLandmark,
  GestureUpdateCallback,
  HandsDetectedCallback,
  MediaPipeHandsResults,
} from '@/types';
import { distance2D, calculateCenter, smoothValue, clamp } from '@/utils/math';

// MediaPipe landmark indices
const WRIST = 0;
const THUMB_TIP = 4;
const INDEX_TIP = 8;
const MIDDLE_TIP = 12;
const RING_TIP = 16;
const PINKY_TIP = 20;
const INDEX_MCP = 5;
const MIDDLE_MCP = 9;
const RING_MCP = 13;
const PINKY_MCP = 17;

export class GestureController {
  private videoElement: HTMLVideoElement;
  private hands: unknown = null;
  private camera: unknown = null;
  private isRunning: boolean = false;
  private currentState: GestureState;
  private previousState: GestureState;
  private smoothing: number;
  private sensitivity: number;

  // Callbacks
  public onGestureUpdate: GestureUpdateCallback | null = null;
  public onHandsDetected: HandsDetectedCallback | null = null;

  constructor(
    videoElement: HTMLVideoElement,
    options: { smoothing?: number; sensitivity?: number } = {}
  ) {
    this.videoElement = videoElement;
    this.smoothing = options.smoothing ?? 0.7;
    this.sensitivity = options.sensitivity ?? 1.0;

    // Initialize states
    const emptyState: GestureState = {
      leftHand: null,
      rightHand: null,
      handsDistance: 0,
      tension: 0,
      expansion: 0,
      isActive: false,
      hasOkSign: false,
    };

    this.currentState = { ...emptyState };
    this.previousState = { ...emptyState };
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    try {
      // Dynamically import MediaPipe
      // These packages are IIFE/UMD modules that set window.Hands and window.Camera
      // when executed, rather than using ESM named exports
      await import('@mediapipe/hands');
      await import('@mediapipe/camera_utils');

      // MediaPipe IIFE modules set their exports as global window properties
      const windowWithMediaPipe = window as unknown as {
        Hands?: new (config: { locateFile: (file: string) => string }) => unknown;
        Camera?: new (
          video: HTMLVideoElement,
          config: { onFrame: () => Promise<void>; width: number; height: number }
        ) => unknown;
      };

      const Hands = windowWithMediaPipe.Hands;
      const Camera = windowWithMediaPipe.Camera;

      if (!Hands) {
        throw new Error(
          'Failed to load MediaPipe Hands. The module did not set window.Hands.'
        );
      }
      if (!Camera) {
        throw new Error(
          'Failed to load MediaPipe Camera. The module did not set window.Camera.'
        );
      }

      // Initialize MediaPipe Hands
      this.hands = new Hands({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      (this.hands as { setOptions: (options: unknown) => void }).setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
      });

      (this.hands as { onResults: (callback: (results: MediaPipeHandsResults) => void) => void }).onResults(
        this.processResults.bind(this)
      );

      // Initialize camera
      this.camera = new Camera(this.videoElement, {
        onFrame: async () => {
          if (this.hands && this.isRunning) {
            await (this.hands as { send: (options: { image: HTMLVideoElement }) => Promise<void> }).send({
              image: this.videoElement,
            });
          }
        },
        width: 640,
        height: 480,
      });

      await (this.camera as { start: () => Promise<void> }).start();
      this.isRunning = true;
    } catch (error) {
      console.error('Failed to start gesture controller:', error);
      throw error;
    }
  }

  stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.camera) {
      (this.camera as { stop: () => void }).stop();
    }

    // Reset state
    this.currentState = {
      leftHand: null,
      rightHand: null,
      handsDistance: 0,
      tension: 0,
      expansion: 0,
      isActive: false,
      hasOkSign: false,
    };
  }

  private processResults(results: MediaPipeHandsResults): void {
    this.previousState = { ...this.currentState };

    const landmarks = results.multiHandLandmarks;
    const handedness = results.multiHandedness;

    if (!landmarks || landmarks.length === 0) {
      // No hands detected
      this.currentState = {
        leftHand: null,
        rightHand: null,
        handsDistance: smoothValue(
          this.previousState.handsDistance,
          0,
          this.smoothing
        ),
        tension: smoothValue(this.previousState.tension, 0, this.smoothing),
        expansion: smoothValue(
          this.previousState.expansion,
          0,
          this.smoothing
        ),
        isActive: false,
        hasOkSign: false,
      };
    } else {
      // Process detected hands
      let leftHand: HandState | null = null;
      let rightHand: HandState | null = null;

      for (let i = 0; i < landmarks.length; i++) {
        const handLandmarks = landmarks[i];
        const label = handedness?.[i]?.label ?? 'Unknown';

        const handState = this.processHandLandmarks(handLandmarks);

        // MediaPipe returns mirrored labels, so we swap them
        if (label === 'Right') {
          leftHand = handState;
        } else {
          rightHand = handState;
        }
      }

      // Calculate combined metrics
      const handsDistance = this.calculateHandsDistance(leftHand, rightHand);
      const tension = this.calculateTension(leftHand, rightHand);
      const expansion = this.calculateExpansion(handsDistance);
      const hasOkSign = (leftHand?.isOkSign ?? false) || (rightHand?.isOkSign ?? false);

      this.currentState = {
        leftHand,
        rightHand,
        handsDistance: smoothValue(
          this.previousState.handsDistance,
          handsDistance,
          this.smoothing
        ),
        tension: smoothValue(
          this.previousState.tension,
          tension,
          this.smoothing
        ),
        expansion: smoothValue(
          this.previousState.expansion,
          expansion,
          this.smoothing
        ),
        isActive: leftHand !== null || rightHand !== null,
        hasOkSign,
      };
    }

    // Notify callbacks
    if (this.onGestureUpdate) {
      this.onGestureUpdate(this.currentState);
    }

    if (this.onHandsDetected) {
      const count =
        (this.currentState.leftHand ? 1 : 0) +
        (this.currentState.rightHand ? 1 : 0);
      this.onHandsDetected(count);
    }
  }

  private processHandLandmarks(landmarks: HandLandmark[]): HandState {
    const openness = this.calculateOpenness(landmarks);
    const isOpen = openness > 0.6;
    const isClosed = openness < 0.3;
    const isOkSign = this.detectOkSign(landmarks);
    const center = calculateCenter(landmarks);

    return {
      isDetected: true,
      landmarks,
      isOpen,
      isClosed,
      isOkSign,
      openness,
      center,
    };
  }

  /**
   * 偵測 OK 手勢
   * OK 手勢的特徵：大拇指和食指尖端接觸形成圓圈，其他手指伸展
   */
  private detectOkSign(landmarks: HandLandmark[]): boolean {
    const thumbTip = landmarks[THUMB_TIP];
    const indexTip = landmarks[INDEX_TIP];
    const middleTip = landmarks[MIDDLE_TIP];
    const ringTip = landmarks[RING_TIP];
    const pinkyTip = landmarks[PINKY_TIP];
    const wrist = landmarks[WRIST];

    // 1. 大拇指和食指尖端必須非常接近
    const thumbIndexDistance = distance2D(
      thumbTip.x, thumbTip.y,
      indexTip.x, indexTip.y
    );

    // 閾值：當大拇指和食指接觸時，距離約 0.05 以內
    if (thumbIndexDistance > 0.08) {
      return false;
    }

    // 2. 其他三指（中指、無名指、小指）必須相對伸展
    // 計算這些手指尖端到手腕的距離
    const middleToWrist = distance2D(middleTip.x, middleTip.y, wrist.x, wrist.y);
    const ringToWrist = distance2D(ringTip.x, ringTip.y, wrist.x, wrist.y);
    const pinkyToWrist = distance2D(pinkyTip.x, pinkyTip.y, wrist.x, wrist.y);

    // 伸展的手指到手腕的距離應該較大（約 0.2 以上）
    const extendedThreshold = 0.15;
    const isMiddleExtended = middleToWrist > extendedThreshold;
    const isRingExtended = ringToWrist > extendedThreshold;
    const isPinkyExtended = pinkyToWrist > extendedThreshold;

    // 至少兩根手指需要伸展（允許一些自然變化）
    const extendedCount = [isMiddleExtended, isRingExtended, isPinkyExtended]
      .filter(Boolean).length;

    return extendedCount >= 2;
  }

  private calculateOpenness(landmarks: HandLandmark[]): number {
    // Calculate average distance from fingertips to palm center
    const palmCenter = calculateCenter([
      landmarks[WRIST],
      landmarks[INDEX_MCP],
      landmarks[MIDDLE_MCP],
      landmarks[RING_MCP],
      landmarks[PINKY_MCP],
    ]);

    const fingertips = [
      landmarks[THUMB_TIP],
      landmarks[INDEX_TIP],
      landmarks[MIDDLE_TIP],
      landmarks[RING_TIP],
      landmarks[PINKY_TIP],
    ];

    const distances = fingertips.map((tip) =>
      distance2D(tip.x, tip.y, palmCenter.x, palmCenter.y)
    );

    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;

    // Normalize to 0-1 range (typical open hand ~0.3, closed ~0.1)
    const normalized = clamp((avgDistance - 0.08) / 0.2, 0, 1);

    return normalized;
  }

  private calculateHandsDistance(
    leftHand: HandState | null,
    rightHand: HandState | null
  ): number {
    if (!leftHand || !rightHand) {
      return 0;
    }

    return distance2D(
      leftHand.center.x,
      leftHand.center.y,
      rightHand.center.x,
      rightHand.center.y
    );
  }

  private calculateTension(
    leftHand: HandState | null,
    rightHand: HandState | null
  ): number {
    const hands = [leftHand, rightHand].filter(
      (h): h is HandState => h !== null
    );

    if (hands.length === 0) return 0;

    // Average tension (inverse of openness)
    const avgOpenness =
      hands.reduce((sum, h) => sum + h.openness, 0) / hands.length;

    return clamp((1 - avgOpenness) * this.sensitivity, 0, 1);
  }

  private calculateExpansion(handsDistance: number): number {
    // Map hand distance to expansion value
    // Typical range: 0.1 (close together) to 0.7 (far apart)
    const normalized = clamp((handsDistance - 0.1) / 0.5, 0, 1);
    return normalized * this.sensitivity;
  }

  getCurrentState(): GestureState {
    return { ...this.currentState };
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }

  setSmoothing(value: number): void {
    this.smoothing = clamp(value, 0, 0.99);
  }

  setSensitivity(value: number): void {
    this.sensitivity = clamp(value, 0.1, 2);
  }
}
