/**
 * Slopcaster - UI Utilities Module
 * Contains common UI helper functions used across components
 */

// Initialize namespace
window.slopcaster = window.slopcaster || {};

// UI utility functions
window.slopcaster.ui = {
    /**
     * Get formatted timestamp for messages
     * @returns {string} Formatted time string (HH:MM)
     */
    getTimestamp() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },
    
    /**
     * Initialize dark mode based on localStorage and system preference
     */
    initDarkMode() {
        // Checks localStorage first, then system preference
        if (localStorage.getItem('darkMode') === 'true' ||
            (!('darkMode' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            const moonIcon = document.getElementById('moonIcon');
            const sunIcon = document.getElementById('sunIcon');
            if (moonIcon) moonIcon.classList.add('hidden');
            if (sunIcon) sunIcon.classList.remove('hidden');
        } else {
            document.documentElement.classList.remove('dark');
            const moonIcon = document.getElementById('moonIcon');
            const sunIcon = document.getElementById('sunIcon');
            if (moonIcon) moonIcon.classList.remove('hidden');
            if (sunIcon) sunIcon.classList.add('hidden');
        }
    },
    
    /**
     * Toggle dark/light mode
     */
    toggleDarkMode() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', isDark);
        const moonIcon = document.getElementById('moonIcon');
        const sunIcon = document.getElementById('sunIcon');
        if (isDark) {
            if (moonIcon) moonIcon.classList.add('hidden');
            if (sunIcon) sunIcon.classList.remove('hidden');
        } else {
            if (moonIcon) moonIcon.classList.remove('hidden');
            if (sunIcon) sunIcon.classList.add('hidden');
        }
    },
    
    /**
     * Shuffle array in place
     * @param {Array} array - Array to shuffle
     * @returns {Array} The shuffled array
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    },
    
    /**
     * Show loading indicator with custom text
     * @param {string} text - Text to display in loading indicator
     */
    showLoadingIndicator(text = "Generating audio...") {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (!loadingIndicator) return;
        
        const p = loadingIndicator.querySelector('p');
        const div = loadingIndicator.querySelector('div');
        if (p) p.textContent = text;
        // Reset spinner class just in case
        if (div) div.className = 'inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 dark:border-blue-400';
        loadingIndicator.classList.remove('hidden');
    },
    
    /**
     * Hide loading indicator
     */
    hideLoadingIndicator() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
    },
    
    /**
     * Set up global keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            const state = window.slopcaster.state;
            const playerControls = window.slopcaster.playerControls;
            const activeTag = document.activeElement.tagName;
            const isInputFocused = activeTag === 'INPUT' || activeTag === 'TEXTAREA';
            
            // Spacebar for Play/Pause (if not focused on input/textarea)
            if (e.key === ' ' && !isInputFocused && !playerControls.playPauseBtn.disabled) {
                e.preventDefault();
                playerControls.togglePlayPause();
            }
            
            // Left Arrow for Previous
            if (e.key === 'ArrowLeft' && !isInputFocused && !playerControls.prevBtn.disabled) {
                e.preventDefault();
                playerControls.playPrevious();
            }
            
            // Right Arrow for Next
            if (e.key === 'ArrowRight' && !isInputFocused && !playerControls.nextBtn.disabled) {
                e.preventDefault();
                playerControls.playNext();
            }
            
            // Cmd/Ctrl+C to copy
            if ((e.metaKey || e.ctrlKey) && e.key === 'c' && !window.slopcaster.exportImport.copyBtn.disabled && window.getSelection().toString() === '') {
                e.preventDefault();
                window.slopcaster.exportImport.copyToClipboard();
            }
            
            // Cmd/Ctrl+S to save
            if ((e.metaKey || e.ctrlKey) && e.key === 's' && !window.slopcaster.exportImport.saveBtn.disabled) {
                e.preventDefault();
                window.slopcaster.exportImport.saveBtn.click();
            }
            
            // Escape to close dialogs or settings
            if (e.key === 'Escape') {
                const dialogManager = window.slopcaster.dialogManager;
                const settingsPanel = window.slopcaster.settingsPanel;
                
                if (!dialogManager.saveDialog.classList.contains('hidden')) {
                    dialogManager.saveDialog.classList.add('hidden');
                } else if (!dialogManager.interruptionForm.classList.contains('hidden')) {
                    dialogManager.cancelInterruption.click(); // Use cancel logic
                } else if (!settingsPanel.panel.classList.contains('hidden')) {
                    settingsPanel.panel.classList.add('hidden');
                }
            }
        });
    }
};
