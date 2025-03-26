/**
 * Slopcaster - User Input Component
 * Handles user input area and controls
 */

// Initialize namespace
window.slopcaster = window.slopcaster || {};

// User input component
window.slopcaster.userInput = {
    // DOM element references
    inputField: null,
    startBtn: null,
    clearBtn: null,
    
    /**
     * Initialize component
     */
    init() {
        this.inputField = document.getElementById('user-input');
        this.startBtn = document.getElementById('start-btn');
        this.clearBtn = document.getElementById('clear-btn');
        
        // Event handlers are set up in the conversation module
        // This component is primarily for future extensions like input validation,
        // history, suggestions, etc.
    },
    
    /**
     * Clear the input field
     */
    clear() {
        this.inputField.value = '';
    },
    
    /**
     * Set a placeholder message in the input field
     * @param {string} message - Message to display as placeholder
     */
    setPlaceholder(message) {
        this.inputField.placeholder = message;
    },
    
    /**
     * Enable or disable the input field
     * @param {boolean} enabled - Whether the input should be enabled
     */
    setEnabled(enabled) {
        this.inputField.disabled = !enabled;
        this.startBtn.disabled = !enabled;
    },
    
    /**
     * Get the current input value
     * @returns {string} Current input text
     */
    getValue() {
        return this.inputField.value.trim();
    }
};
