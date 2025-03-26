/**
 * Slopcaster - Settings Panel Component
 * Handles settings UI and provider selection
 */

// Initialize namespace
window.slopcaster = window.slopcaster || {};

// Settings panel component
window.slopcaster.settingsPanel = {
    // DOM element references
    panel: null,
    toggleButton: null,
    bot1Select: null,
    bot2Select: null,
    bot1SystemPrompt: null,
    bot2SystemPrompt: null,
    puterApiTab: null,
    pollApiTab: null,
    puterModelGroups: null,
    pollModelGroups: null,
    
    /**
     * Initialize component
     */
    init() {
        // Get settings panel elements
        this.panel = document.getElementById('settings-panel');
        this.toggleButton = document.getElementById('toggle-settings');
        this.bot1Select = document.getElementById('bot1-model');
        this.bot2Select = document.getElementById('bot2-model');
        this.bot1SystemPrompt = document.getElementById('bot1-system-prompt');
        this.bot2SystemPrompt = document.getElementById('bot2-system-prompt');
        this.puterApiTab = document.getElementById('puter-api-tab');
        this.pollApiTab = document.getElementById('pollinations-api-tab');
        this.puterModelGroups = document.querySelectorAll('.puter-models');
        this.pollModelGroups = document.querySelectorAll('.pollinations-models');
        
        // Set up event listeners
        this.toggleButton.addEventListener('click', () => this.togglePanel());
        this.puterApiTab.addEventListener('click', () => this.switchToProvider('puter'));
        this.pollApiTab.addEventListener('click', () => this.switchToProvider('pollinations'));
        
        // Voice selection
        const userVoiceSelect = document.getElementById('userVoiceSelect');
        const bot1VoiceSelect = document.getElementById('bot1VoiceSelect');
        const bot2VoiceSelect = document.getElementById('bot2VoiceSelect');
        
        // Notify about voice changes
        [userVoiceSelect, bot1VoiceSelect, bot2VoiceSelect].forEach(select => {
            select.addEventListener('change', () => {
                console.log("Voice selection changed. Future TTS will use new voices.");
                // Invalidate existing audio? Could add a button for this.
            });
        });
        
        // Check Puter availability
        this.checkPuterAvailability();
    },
    
    /**
     * Toggle settings panel visibility
     */
    togglePanel() {
        this.panel.classList.toggle('hidden');
    },
    
    /**
     * Switch to a different LLM provider
     * @param {string} provider - 'puter' or 'pollinations'
     */
    async switchToProvider(provider) {
        const state = window.slopcaster.state;
        const llm = window.slopcaster.llm;
        
        if (state.currentApiProvider === provider) return;
        
        if (provider === 'puter') {
            if (this.puterApiTab.disabled) return;
            
            state.currentApiProvider = 'puter';
            this.puterApiTab.classList.add('api-tab-active');
            this.pollApiTab.classList.remove('api-tab-active');
            this.puterModelGroups.forEach(group => group.style.display = '');
            this.pollModelGroups.forEach(group => group.style.display = 'none');
            
            // Reset selection to first Puter model
            const firstPuterOption = this.puterModelGroups[0]?.querySelector('option');
            if (firstPuterOption) {
                this.bot1Select.value = firstPuterOption.value;
                this.bot2Select.value = firstPuterOption.value;
            }
            
        } else if (provider === 'pollinations') {
            if (this.pollApiTab.disabled) return;
            
            state.currentApiProvider = 'pollinations';
            this.pollApiTab.classList.add('api-tab-active');
            this.puterApiTab.classList.remove('api-tab-active');
            this.puterModelGroups.forEach(group => group.style.display = 'none');
            this.pollModelGroups.forEach(group => group.style.display = '');
            
            // Fetch models if needed
            await llm.populatePollinationsModels();
            
            // Reset selection to first Pollinations model
            const firstPollinationOption = this.pollModelGroups[0]?.querySelector('option');
            if (firstPollinationOption) {
                this.bot1Select.value = firstPollinationOption.value;
                this.bot2Select.value = firstPollinationOption.value;
            } else {
                console.warn("No Pollinations models available to select.");
            }
        }
    },
    
    /**
     * Check if Puter library is available
     */
    checkPuterAvailability() {
        if (typeof puter === 'undefined') {
            console.warn('Puter library not loaded. Puter models will be unavailable.');
            // Disable Puter tab if library fails
            this.puterApiTab.disabled = true;
            this.puterApiTab.classList.remove('api-tab-active');
            this.puterApiTab.classList.add('opacity-50', 'cursor-not-allowed', 'text-gray-400');
            
            // Force switch to Pollinations if possible
            if (!this.pollApiTab.disabled) {
                // Use setTimeout to ensure event loop processes potential Pollinations fetch later
                setTimeout(() => this.pollApiTab.click(), 0);
            } else {
                alert('Puter library failed to load and Pollinations tab is also disabled. LLM functionality may be broken.');
            }
        }
    }
};
