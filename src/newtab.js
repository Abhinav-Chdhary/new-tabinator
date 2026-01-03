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
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundColor = bgColor;
      
      // Hide preview
      elements.imagePreviewContainer.hidden = true;
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
