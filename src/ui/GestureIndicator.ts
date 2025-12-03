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
          status.textContent = state.leftHand.isOpen ? '張開' : state.leftHand.isClosed ? '握拳' : '部分';
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
          status.textContent = state.rightHand.isOpen ? '張開' : state.rightHand.isClosed ? '握拳' : '部分';
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
  }

  getState(): GestureState | null {
    return this.currentState;
  }
}
