/**
 * Slopcaster - Main Application
 * Entry point that initializes modules and components
 */

// Ensure namespace exists
window.slopcaster = window.slopcaster || {};

// Main initialization function
window.slopcaster.init = function() {
    console.log('Initializing Slopcaster application...');
    
    // Initialize modules
    window.slopcaster.ui.initDarkMode();
    window.slopcaster.audio.init();
    window.slopcaster.llm.init();
    window.slopcaster.settings.init();
    
    // Initialize components
    window.slopcaster.conversationDisplay.init();
    window.slopcaster.playerControls.init();
    window.slopcaster.settingsPanel.init();
    window.slopcaster.userInput.init();
    window.slopcaster.dialogManager.init();
    window.slopcaster.exportImport.init();
    window.slopcaster.conversation.init();
    
    // Set up initial appearance
    window.slopcaster.settings.assignRandomVoices();
    
    // Set up global keyboard shortcuts
    window.slopcaster.ui.setupKeyboardShortcuts();
    
    console.log('Slopcaster application initialized');
};

// Run initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.slopcaster.init();
});
