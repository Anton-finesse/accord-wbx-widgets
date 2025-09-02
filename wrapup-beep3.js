import { Desktop } from '@wxcc-desktop/sdk';

/**
 * Widget that plays a beep sound on eAgentWrapup event.
 * Uses Web Audio API to ensure sound plays even if the tab is not focused.
 * User must enable audio by toggling the switch first.
 * 
 * This is version 3, with improved audio context handling using (!) audio buffer caching.
 * Property "audioPath" is added to set the audio file path in the LAB layout json.
 */

const hornToggle = document.createElement('template');

hornToggle.innerHTML = `
  <style>
    .toggle-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px 0;
      background: transparent;
    }
    .switch {
      position: relative;
      display: inline-block;
      width: 36px;
      height: 20px;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0; left: 0; right: 0; bottom: 0;
      background-color: #ccc;
      transition: .2s;
      border-radius: 20px;
    }
    .switch input:checked + .slider {
      background-color: #31beecff;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: .2s;
      border-radius: 50%;
    }
    .switch input:checked + .slider:before {
      transform: translateX(16px);
    }
    .toggle-label {
      margin-left: 10px;
      font-size: 14px;
      color: #222;
      user-select: none;
    }
  </style>
  <div class="toggle-container">
    <label class="switch">
      <input type="checkbox" id="audio-toggle">
      <span class="slider"></span>
    </label>
    <span class="toggle-label">Beep</span>
  </div>
`;

const logger = Desktop.logger.createLogger('horn-wrapup-logger');

class HornWrapupWidget extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(hornToggle.content.cloneNode(true));
    this.audioEnabled = false;

    // Web Audio API
    this.audioCtx = null;
    this.audioBuffer = null;
  }

  connectedCallback() {
    this.init();
    this.subscribeAgentContactDataEvents();
  }

  disconnectedCallback() {
    Desktop.agentContact.removeAllEventListeners();
  }

  async init() {
    Desktop.config.init();
    this.mapToggleChange();
    logger.debug('Property autioPath:', this.audioPath);
  }

  /** 
   * map the toggle switch and its change event to enable/disable audio 
   * unlock audio context on first user interaction
   */

  mapToggleChange() {
    this.toggleEl = this.shadowRoot.getElementById('audio-toggle');
    this.toggleEl.checked = false;

    this.toggleEl.addEventListener('change', async () => {
      this.audioEnabled = this.toggleEl.checked;
      logger.info('Audio Enabled switched to:', this.audioEnabled);

      if (this.audioEnabled) {
        try {
          await this.unlockAudio();
          logger.info('Audio unlocked and loaded');
        } catch (err) {
          logger.error('Failed to unlock audio', err);
        }
      }
    });
  }  

  /**
   * Unlocks the audio context on user interaction and preloads the audio buffer.
   */
  async unlockAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  
    // if audio context is suspended, resume it
  if (this.audioCtx.state === 'suspended') {
    await this.audioCtx.resume();
  }

  if (!this.audioBuffer) {
    // this.audioPath - Widget's property set in the LAB layout json
    const response = await fetch(this.audioPath);
    const arrayBuffer = await response.arrayBuffer();
    this.audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
    logger.info('Audio buffer preloaded');
    }
    const source = this.audioCtx.createBufferSource();
    source.buffer = this.audioBuffer;
    source.connect(this.audioCtx.destination);
    source.start(0);
    //source.stop(this.audioCtx.currentTime + 0.01); // play and stop immediately
  }

  async playBeep() {
      if (!this.audioEnabled || !this.audioBuffer || !this.audioCtx) 
          return;
      // if audio context is suspended, resume it
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume(); 
      }
    // play the beep sound from the cached buffer
    const source = this.audioCtx.createBufferSource();
    source.buffer = this.audioBuffer;
    source.connect(this.audioCtx.destination);
    source.start(0);
  }
  // subscribe to eAgentWrapup event and play beep on event as PlayBeep function
  subscribeAgentContactDataEvents() {
    Desktop.agentContact.addEventListener('eAgentWrapup', async () => {
      logger.info('eAgentWrapup');
      await this.playBeep();
    });
  }
}

customElements.define('horn-wrapup', HornWrapupWidget);
