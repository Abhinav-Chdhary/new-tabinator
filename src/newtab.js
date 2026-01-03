/**
 * New Tabinator - Search & Settings Functionality
 * 
 * Features:
 * - Routes search queries to user's default search engine
 * - Customizable background (solid color or image)
 * - Customizable prompt text
 * - All settings persisted in localStorage
 */

(function() {
  'use strict';

  // ============================================
  // Configuration
  // ============================================
  const STORAGE_KEYS = {
    PROMPT: 'newtabinator_prompt',
    BG_TYPE: 'newtabinator_bg_type',
    BG_COLOR: 'newtabinator_bg_color',
    BG_IMAGE: 'newtabinator_bg_image'
  };

  const DEFAULTS = {
    PROMPT: 'What is the most important thing that needs to get done today?',
    BG_TYPE: 'color',
    BG_COLOR: '#fafafa'
  };

  // ============================================
  // DOM Elements
  // ============================================
  const elements = {
    // Main
    searchForm: document.getElementById('search-form'),
    searchInput: document.getElementById('search-input'),
    prompt: document.getElementById('prompt'),
    
    // Settings
    settingsBtn: document.getElementById('settings-btn'),
    modal: document.getElementById('settings-modal'),
    modalBackdrop: document.getElementById('modal-backdrop'),
    closeModal: document.getElementById('close-modal'),
    
    // Settings inputs
    promptInput: document.getElementById('prompt-input'),
    bgColorRadio: document.getElementById('bg-color'),
    bgImageRadio: document.getElementById('bg-image'),
    colorPicker: document.getElementById('color-picker'),
    imageUpload: document.getElementById('image-upload'),
    imagePreviewContainer: document.getElementById('image-preview-container'),
    imagePreview: document.getElementById('image-preview'),
    clearImage: document.getElementById('clear-image'),
    resetSettings: document.getElementById('reset-settings')
  };

  // ============================================
  // Storage Helpers
  // ============================================
  function getStoredValue(key, defaultValue) {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? value : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  function setStoredValue(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('Failed to save setting:', e);
    }
  }

  function removeStoredValue(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Failed to remove setting:', e);
    }
  }

  // ============================================
  // Color Utilities
  // ============================================
  /**
   * Convert hex color to RGB values
   * @param {string} hex - Hex color (e.g., '#fafafa')
   * @returns {object} RGB values {r, g, b}
   */
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Calculate relative luminance using WCAG formula
   * @param {object} rgb - RGB values {r, g, b}
   * @returns {number} Relative luminance (0-1)
   */
  function getLuminance(rgb) {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
      const normalized = val / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  /**
   * Determine if a color is light (luminance > 0.5)
   * @param {string} hexColor - Hex color
   * @returns {boolean} True if light, false if dark
   */
  function isLightColor(hexColor) {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return true; // Default to light if can't parse
    return getLuminance(rgb) > 0.5;
  }

  /**
   * Update prompt text color based on background
   * @param {boolean} isLight - Whether the background is light
   * @param {boolean} isImage - Whether the background is an image
   */
  function updatePromptContrast(isLight, isImage) {
    if (isImage) {
      // For images, use white text with strong shadow for readability
      elements.prompt.style.color = '#ffffff';
      elements.prompt.style.textShadow = '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6)';
    } else if (isLight) {
      // Light background: use dark text
      elements.prompt.style.color = '#2c2c2c';
      elements.prompt.style.textShadow = '0 1px 2px rgba(255, 255, 255, 0.5)';
    } else {
      // Dark background: use light text
      elements.prompt.style.color = '#e8e8e8';
      elements.prompt.style.textShadow = '0 1px 2px rgba(0, 0, 0, 0.5)';
    }
  }

  // ============================================
  // Apply Settings to UI
  // ============================================
  function applyPrompt() {
    const storedPrompt = getStoredValue(STORAGE_KEYS.PROMPT, DEFAULTS.PROMPT);
    elements.prompt.textContent = storedPrompt;
    elements.promptInput.value = storedPrompt;
  }

  function applyBackground() {
    const bgType = getStoredValue(STORAGE_KEYS.BG_TYPE, DEFAULTS.BG_TYPE);
    const bgColor = getStoredValue(STORAGE_KEYS.BG_COLOR, DEFAULTS.BG_COLOR);
    const bgImage = getStoredValue(STORAGE_KEYS.BG_IMAGE, null);

    // Update radio buttons
    elements.bgColorRadio.checked = bgType === 'color';
    elements.bgImageRadio.checked = bgType === 'image';
    elements.colorPicker.value = bgColor;

    // Apply background
    if (bgType === 'image' && bgImage) {
      document.body.style.backgroundColor = '';
      document.body.style.backgroundImage = `url(${bgImage})`;

      // Show preview
      elements.imagePreview.src = bgImage;
      elements.imagePreviewContainer.hidden = false;

      // Update prompt contrast for image background
      updatePromptContrast(false, true);
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundColor = bgColor;

      // Hide preview
      elements.imagePreviewContainer.hidden = true;

      // Update prompt contrast based on background color
      const isLight = isLightColor(bgColor);
      updatePromptContrast(isLight, false);
    }
  }

  function applyAllSettings() {
    applyPrompt();
    applyBackground();
  }

  // ============================================
  // Search Functionality
  // ============================================
  function handleSearch(event) {
    event.preventDefault();
    
    const query = elements.searchInput.value.trim();
    
    if (!query) return;

    // Use Chrome's search API to respect user's default search engine
    if (chrome?.search?.query) {
      chrome.search.query({
        text: query,
        disposition: 'CURRENT_TAB'
      });
    } else {
      // Fallback for non-Chrome browsers or missing API
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
  }

  function ensureFocus() {
    if (document.activeElement !== elements.searchInput && 
        !elements.modal.contains(document.activeElement)) {
      elements.searchInput.focus();
    }
  }

  // ============================================
  // Modal Controls
  // ============================================
  function openModal() {
    elements.modal.setAttribute('aria-hidden', 'false');
    elements.promptInput.focus();
  }

  function closeModal() {
    elements.modal.setAttribute('aria-hidden', 'true');
    elements.searchInput.focus();
  }

  // ============================================
  // Settings Handlers
  // ============================================
  function handlePromptChange() {
    const newPrompt = elements.promptInput.value.trim() || DEFAULTS.PROMPT;
    setStoredValue(STORAGE_KEYS.PROMPT, newPrompt);
    elements.prompt.textContent = newPrompt;
  }

  function handleBgTypeChange() {
    const bgType = elements.bgColorRadio.checked ? 'color' : 'image';
    setStoredValue(STORAGE_KEYS.BG_TYPE, bgType);
    applyBackground();
  }

  function handleColorChange() {
    const color = elements.colorPicker.value;
    setStoredValue(STORAGE_KEYS.BG_COLOR, color);
    setStoredValue(STORAGE_KEYS.BG_TYPE, 'color');
    elements.bgColorRadio.checked = true;
    applyBackground();
  }

  function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (max 5MB to avoid localStorage limits)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert('Image is too large. Please select an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const imageData = e.target.result;
      
      setStoredValue(STORAGE_KEYS.BG_IMAGE, imageData);
      setStoredValue(STORAGE_KEYS.BG_TYPE, 'image');
      elements.bgImageRadio.checked = true;
      applyBackground();
    };
    reader.readAsDataURL(file);
  }

  function handleClearImage() {
    removeStoredValue(STORAGE_KEYS.BG_IMAGE);
    setStoredValue(STORAGE_KEYS.BG_TYPE, 'color');
    elements.bgColorRadio.checked = true;
    elements.imageUpload.value = '';
    applyBackground();
  }

  function handleReset() {
    if (!confirm('Reset all settings to defaults?')) return;
    
    Object.values(STORAGE_KEYS).forEach(removeStoredValue);
    elements.imageUpload.value = '';
    applyAllSettings();
  }

  // ============================================
  // Event Listeners
  // ============================================
  function initEventListeners() {
    // Search
    elements.searchForm.addEventListener('submit', handleSearch);
    
    // Focus management
    document.addEventListener('click', (e) => {
      if (!elements.modal.contains(e.target) && 
          !elements.settingsBtn.contains(e.target)) {
        ensureFocus();
      }
    });
    
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        ensureFocus();
      }
    });

    // Modal
    elements.settingsBtn.addEventListener('click', openModal);
    elements.closeModal.addEventListener('click', closeModal);
    elements.modalBackdrop.addEventListener('click', closeModal);
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && elements.modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    });

    // Settings
    elements.promptInput.addEventListener('input', handlePromptChange);
    elements.bgColorRadio.addEventListener('change', handleBgTypeChange);
    elements.bgImageRadio.addEventListener('change', handleBgTypeChange);
    elements.colorPicker.addEventListener('input', handleColorChange);
    elements.imageUpload.addEventListener('change', handleImageUpload);
    elements.clearImage.addEventListener('click', handleClearImage);
    elements.resetSettings.addEventListener('click', handleReset);
  }

  // ============================================
  // Initialize
  // ============================================
  applyAllSettings();
  initEventListeners();
})();
