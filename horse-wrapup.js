import { Desktop } from '@wxcc-desktop/sdk';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    .container {
      padding: 24px;
      background: #f4f4f4;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  </style>
  <div class="container">
    <audio id="audio-horse" src="https://www.w3schools.com/html/horse.mp3" controls></audio>
  </div>
`;

//Creating a custom logger
const logger = Desktop.logger.createLogger('horse-wrapup-logger');

class MomentumAudioWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.audioEl = this.shadowRoot.getElementById('audio-horse');
    Desktop.agentContact.addEventListener('eAgentWrapup', (msg) => {
      logger.info('myAgentWrapup', JSON.stringify(msg));
      this.audioEl.play();
      //if (this.audioEl) {
      //  this.audioEl.play();
      //}
    });
  }

  disconnectedCallback() {
    Desktop.agentContact.removeAllEventListeners();
  }
}
customElements.define('horse-wrapup', MomentumAudioWidget);