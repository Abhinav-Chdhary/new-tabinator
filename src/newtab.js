/**
 * New Tabinator - Search Functionality
 * 
 * Routes search queries to the user's default search engine
 * using Chrome's search API. Falls back to Google if the API
 * is unavailable (though it should always be available with
 * the "search" permission in manifest.json).
 */

(function() {
  'use strict';

  // DOM Elements
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');

  /**
   * Handles form submission and routes to search engine
   * @param {Event} event - Form submit event
   */
  function handleSearch(event) {
    event.preventDefault();
    
    const query = searchInput.value.trim();
    
    // Don't search if empty
    if (!query) {
      return;
    }

    // Use Chrome's search API to respect user's default search engine
    // This requires the "search" permission in manifest.json
    if (chrome?.search?.query) {
      chrome.search.query({
        text: query,
        disposition: 'CURRENT_TAB'
      });
    } else {
      // Fallback: If Chrome search API is unavailable,
      // use the browser's default search behavior
      // This opens the query in the omnibox-configured search engine
      window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
  }

  /**
   * Ensures the search input is focused
   * The autofocus attribute handles initial load, but this
   * ensures focus after any programmatic changes
   */
  function ensureFocus() {
    if (document.activeElement !== searchInput) {
      searchInput.focus();
    }
  }

  // Event Listeners
  searchForm.addEventListener('submit', handleSearch);
  
  // Re-focus on click anywhere (for convenience)
  document.addEventListener('click', ensureFocus);
  
  // Ensure focus when page becomes visible (tab switching)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      ensureFocus();
    }
  });
})();
