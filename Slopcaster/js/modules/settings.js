/**
 * Slopcaster - Settings Module
 * Manages application settings and preferences
 */

// Initialize namespace
window.slopcaster = window.slopcaster || {};

// Settings management functions
window.slopcaster.settings = {
    // Will be set during initialization
    enableMarkdown: null,
    enableAvatar: null,
    enableTimestamps: null,
    autoScroll: null,
    
    /**
     * Initialize settings module
     */
    init() {
        // Get settings elements
        this.enableMarkdown = document.getElementById('enable-markdown');
        this.enableAvatar = document.getElementById('enable-avatar');
        this.enableTimestamps = document.getElementById('enable-timestamps');
        this.autoScroll = document.getElementById('auto-scroll');
        
        // Initialize values from localStorage if available
        this.loadSettings();
        
        // Add event listeners for settings changes
        this.setupSettingsListeners();
    },
    
    /**
     * Load settings from localStorage
     */
    loadSettings() {
        // Load markdown setting
        if (localStorage.getItem('enableMarkdown') !== null) {
            this.enableMarkdown.checked = localStorage.getItem('enableMarkdown') === 'true';
        }
        
        // Load avatar setting
        if (localStorage.getItem('enableAvatar') !== null) {
            this.enableAvatar.checked = localStorage.getItem('enableAvatar') === 'true';
        }
        
        // Load timestamps setting
        if (localStorage.getItem('enableTimestamps') !== null) {
            this.enableTimestamps.checked = localStorage.getItem('enableTimestamps') === 'true';
        }
        
        // Load auto-scroll setting
        if (localStorage.getItem('autoScroll') !== null) {
            this.autoScroll.checked = localStorage.getItem('autoScroll') === 'true';
        }
    },
    
    /**
     * Save a specific setting to localStorage
     * @param {string} name - Setting name
     * @param {any} value - Setting value
     */
    saveSetting(name, value) {
        localStorage.setItem(name, value);
    },
    
    /**
     * Set up event listeners for settings changes
     */
    setupSettingsListeners() {
        const state = window.slopcaster.state;
        const conversationDisplay = window.slopcaster.conversationDisplay;
        
        // Save settings when changed
        this.enableMarkdown.addEventListener('change', () => {
            this.saveSetting('enableMarkdown', this.enableMarkdown.checked);
            this.handleDisplaySettingChange();
        });
        
        this.enableAvatar.addEventListener('change', () => {
            this.saveSetting('enableAvatar', this.enableAvatar.checked);
            this.handleDisplaySettingChange();
        });
        
        this.enableTimestamps.addEventListener('change', () => {
            this.saveSetting('enableTimestamps', this.enableTimestamps.checked);
            this.handleDisplaySettingChange();
        });
        
        this.autoScroll.addEventListener('change', () => {
            this.saveSetting('autoScroll', this.autoScroll.checked);
        });
    },
    
    /**
     * Handle changes to display settings by redrawing the conversation
     */
    handleDisplaySettingChange() {
        const state = window.slopcaster.state;
        const conversationDisplay = window.slopcaster.conversationDisplay;
        const playerControls = window.slopcaster.playerControls;
        
        if (state.conversationHistory.length > 0) {
            console.log("Redrawing conversation due to setting change...");
            const currentScrollTop = conversationDisplay.display.scrollTop; // Preserve scroll position
            const wasPlaying = state.isPlaying; // Preserve playback state
            const currentAudioTime = state.currentAudio ? state.currentAudio.currentTime : 0;
            
            // Stop current audio before redraw
            if (state.currentAudio) {
                state.currentAudio.pause();
                state.currentAudio.removeEventListener('ended', window.slopcaster.audio.handleAudioEnd);
                state.currentAudio = null;
            }
            state.isPlaying = false;
            
            conversationDisplay.display.innerHTML = ''; // Clear display
            const oldHistory = [...state.conversationHistory]; // Copy old history
            state.conversationHistory = []; // Reset current history
            
            oldHistory.forEach((entry, index) => {
                // Re-append using the new settings
                conversationDisplay.appendMessage(entry.sender, entry.message, entry.model);
                // Restore audio state
                const newEntry = state.conversationHistory[index]; // Get the newly created entry
                if (newEntry) {
                    newEntry.audioUrl = entry.audioUrl; // Keep existing URL
                    newEntry.isLoading = entry.isLoading;
                    newEntry.isGenerating = entry.isGenerating;
                    newEntry.error = entry.error;
                    conversationDisplay.updateAudioStatus(index); // Update icon based on restored state
                } else {
                    console.error(`State mismatch during redraw at index ${index}`);
                }
            });
            
            playerControls.highlightCurrentLine(); // Re-highlight
            conversationDisplay.display.scrollTop = currentScrollTop; // Restore scroll
            playerControls.updatePlaybackControls(); // Update player buttons
        }
    },
    
    /**
     * Randomly assign voices to speakers
     */
    assignRandomVoices() {
        const ui = window.slopcaster.ui;
        const availableVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
        const shuffledVoices = ui.shuffleArray([...availableVoices]);
        
        document.getElementById('userVoiceSelect').value = shuffledVoices[0];
        document.getElementById('bot1VoiceSelect').value = shuffledVoices[1];
        document.getElementById('bot2VoiceSelect').value = shuffledVoices[2];
    }
};
