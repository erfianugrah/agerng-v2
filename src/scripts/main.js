import { loadHistory, setupEventListeners } from './utils.js';
import { updateAoE4Buttons } from './aoe4.js';
import { updateAoMButtons } from './aom.js';

document.addEventListener('astro:page-load', () => {
  loadHistory();
  setupEventListeners();
  updateAoE4Buttons();
  updateAoMButtons();
});
