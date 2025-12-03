import type { GestureState } from '@/types';

export class GestureIndicator {
  private container: HTMLElement;
  private currentState: GestureState | null = null;

  constructor(container: HTMLElement) {
    this.container = container;
    this.render();
  }

  private render(): void {
    this.container.innerHTML = `
      <div class="gesture-indicator">
        <div class="gesture-hands">
          <div class="hand left-hand">
            <span class="hand-icon">🤚</span>
            <span class="hand-status">--</span>
          </div>
          <div class="gesture-connection">
            <div class="connection-line"></div>
            <span class="distance-value">--</span>
          </div>
          <div class="hand right-hand">
            <span class="hand-icon">🤚</span>
            <span class="hand-status">--</span>
          </div>
        </div>
        <div class="gesture-metrics">
          <div class="metric">
            <span class="metric-label">張力</span>
            <div class="metric-bar">
              <div class="metric-fill tension-fill"></div>
            </div>
            <span class="metric-value tension-value">0%</span>
          </div>
          <div class="metric">
            <span class="metric-label">擴張</span>
            <div class="metric-bar">
              <div class="metric-fill expansion-fill"></div>
            </div>
            <span class="metric-value expansion-value">0%</span>
          </div>
          <div class="metric ok-sign-indicator">
            <span class="metric-label">OK 發亮</span>
            <span class="ok-sign-status">👌 --</span>
          </div>
        </div>
      </div>
    `;
  }

  update(state: GestureState): void {
    this.currentState = state;

    // Update left hand
    const leftHand = this.container.querySelector('.left-hand');
    if (leftHand) {
      leftHand.classList.toggle('active', state.leftHand !== null);
      const status = leftHand.querySelector('.hand-status');
      if (status) {
        if (state.leftHand) {
          status.textContent = this.getHandStatusText(state.leftHand);
        } else {
          status.textContent = '--';
        }
      }
    }

    // Update right hand
    const rightHand = this.container.querySelector('.right-hand');
    if (rightHand) {
      rightHand.classList.toggle('active', state.rightHand !== null);
      const status = rightHand.querySelector('.hand-status');
      if (status) {
        if (state.rightHand) {
          status.textContent = this.getHandStatusText(state.rightHand);
        } else {
          status.textContent = '--';
        }
      }
    }

    // Update connection
    const connection = this.container.querySelector('.gesture-connection');
    if (connection) {
      connection.classList.toggle('active', state.leftHand !== null && state.rightHand !== null);
      const distanceValue = connection.querySelector('.distance-value');
      if (distanceValue) {
        distanceValue.textContent = state.isActive
          ? `${Math.round(state.handsDistance * 100)}%`
          : '--';
      }
    }

    // Update tension
    const tensionFill = this.container.querySelector('.tension-fill') as HTMLElement;
    const tensionValue = this.container.querySelector('.tension-value');
    if (tensionFill && tensionValue) {
      tensionFill.style.width = `${state.tension * 100}%`;
      tensionValue.textContent = `${Math.round(state.tension * 100)}%`;
    }

    // Update expansion
    const expansionFill = this.container.querySelector('.expansion-fill') as HTMLElement;
    const expansionValue = this.container.querySelector('.expansion-value');
    if (expansionFill && expansionValue) {
      expansionFill.style.width = `${state.expansion * 100}%`;
      expansionValue.textContent = `${Math.round(state.expansion * 100)}%`;
    }

    // Update OK sign indicator
    const okSignIndicator = this.container.querySelector('.ok-sign-indicator');
    const okSignStatus = this.container.querySelector('.ok-sign-status');
    if (okSignIndicator && okSignStatus) {
      okSignIndicator.classList.toggle('active', state.hasOkSign);
      okSignStatus.textContent = state.hasOkSign ? '👌 發亮中!' : '👌 --';
    }
  }

  /**
   * 取得手勢狀態文字
   */
  private getHandStatusText(hand: { isOpen: boolean; isClosed: boolean; isOkSign: boolean }): string {
    if (hand.isOkSign) {
      return 'OK';
    } else if (hand.isOpen) {
      return '張開';
    } else if (hand.isClosed) {
      return '握拳';
    } else {
      return '部分';
    }
  }

  getState(): GestureState | null {
    return this.currentState;
  }
}
