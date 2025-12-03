import { describe, it, expect, beforeEach } from 'vitest';
import { GestureController } from '@/core/GestureController';

describe('GestureController', () => {
  let videoElement: HTMLVideoElement;
  let gestureController: GestureController;

  beforeEach(() => {
    videoElement = document.createElement('video');
    gestureController = new GestureController(videoElement, {
      smoothing: 0.5,
      sensitivity: 1.0,
    });
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const state = gestureController.getCurrentState();

      expect(state.leftHand).toBeNull();
      expect(state.rightHand).toBeNull();
      expect(state.handsDistance).toBe(0);
      expect(state.tension).toBe(0);
      expect(state.expansion).toBe(0);
      expect(state.isActive).toBe(false);
      expect(state.hasOkSign).toBe(false);
    });

    it('should not be running initially', () => {
      expect(gestureController.getIsRunning()).toBe(false);
    });
  });

  describe('start', () => {
    it('should set running state to true when started', async () => {
      await gestureController.start();
      expect(gestureController.getIsRunning()).toBe(true);
    });

    it('should not start twice', async () => {
      await gestureController.start();
      await gestureController.start(); // Should be idempotent
      expect(gestureController.getIsRunning()).toBe(true);
    });
  });

  describe('stop', () => {
    it('should set running state to false when stopped', async () => {
      await gestureController.start();
      gestureController.stop();
      expect(gestureController.getIsRunning()).toBe(false);
    });

    it('should reset state when stopped', async () => {
      await gestureController.start();
      gestureController.stop();

      const state = gestureController.getCurrentState();
      expect(state.isActive).toBe(false);
    });
  });

  describe('callbacks', () => {
    it('should allow setting onGestureUpdate callback', () => {
      const callback = vi.fn();
      gestureController.onGestureUpdate = callback;
      expect(gestureController.onGestureUpdate).toBe(callback);
    });

    it('should allow setting onHandsDetected callback', () => {
      const callback = vi.fn();
      gestureController.onHandsDetected = callback;
      expect(gestureController.onHandsDetected).toBe(callback);
    });
  });

  describe('settings', () => {
    it('should update smoothing value', () => {
      gestureController.setSmoothing(0.8);
      // No direct getter, but should not throw
      expect(() => gestureController.setSmoothing(0.8)).not.toThrow();
    });

    it('should clamp smoothing to valid range', () => {
      expect(() => gestureController.setSmoothing(1.5)).not.toThrow();
      expect(() => gestureController.setSmoothing(-0.5)).not.toThrow();
    });

    it('should update sensitivity value', () => {
      gestureController.setSensitivity(1.5);
      expect(() => gestureController.setSensitivity(1.5)).not.toThrow();
    });

    it('should clamp sensitivity to valid range', () => {
      expect(() => gestureController.setSensitivity(5)).not.toThrow();
      expect(() => gestureController.setSensitivity(0)).not.toThrow();
    });
  });

  describe('getCurrentState', () => {
    it('should return a copy of the current state', () => {
      const state1 = gestureController.getCurrentState();
      const state2 = gestureController.getCurrentState();

      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });
});
