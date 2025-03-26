/**
 * Slopcaster - Conversation Module
 * Handles the conversation flow, LLM interactions and message generation
 */

// Initialize namespace
window.slopcaster = window.slopcaster || {};

// Conversation handling functions
window.slopcaster.conversation = {
    // Will reference DOM elements during initialization
    startBtn: null,
    interruptBtn: null,
    userInput: null,
    clearBtn: null,
    
    /**
     * Initialize the conversation module
     */
    init() {
        this.startBtn = document.getElementById('start-btn');
        this.interruptBtn = document.getElementById('interrupt-btn');
        this.userInput = document.getElementById('user-input');
        this.clearBtn = document.getElementById('clear-btn');
        
        // Set up event listeners
        this.startBtn.addEventListener('click', () => this.startConversationLoop());
        this.clearBtn.addEventListener('click', () => this.clearConversation());
        this.interruptBtn.addEventListener('click', () => this.requestInterruption());
        
        // Enter key in user input triggers start
        this.userInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && !this.startBtn.disabled) {
                e.preventDefault();
                this.startBtn.click();
            }
        });
    },
    
    /**
     * Start the conversation loop with bots
     */
    async startConversationLoop() {
        const state = window.slopcaster.state;
        const conversationDisplay = window.slopcaster.conversationDisplay;
        const playerControls = window.slopcaster.playerControls;
        const llm = window.slopcaster.llm;
        const audio = window.slopcaster.audio;
        
        const initialInput = this.userInput.value.trim();
        if (!initialInput) {
            alert('Please enter a topic or question to start.');
            return;
        }
        
        if (state.isConversationActive) return; // Prevent multiple loops
        
        console.log('Starting conversation loop');
        state.isConversationActive = true;
        this.updateUIAfterConversationStart();
        
        // Clear placeholder if first message
        if (state.conversationHistory.length === 0) {
            conversationDisplay.display.innerHTML = '';
        }
        
        // Add user input (index 0)
        conversationDisplay.appendMessage('User', initialInput);
        playerControls.updatePlaybackControls();
        // User messages don't get audio.
        
        this.userInput.value = ''; // Clear input field
        
        // Start the bot conversation loop
        while (state.isConversationActive) {
            // Check for interruption flag *before* starting next bot turn
            if (state.waitingForUserInterruption) {
                console.log('User interruption requested. Pausing loop.');
                state.isConversationActive = false; // Pause the loop
                window.slopcaster.dialogManager.interruptionForm.classList.remove('hidden');
                window.slopcaster.dialogManager.interruptionInput.focus(); // Focus interruption input
                break; // Exit loop here
            }
            
            const currentMessageEntry = state.conversationHistory[state.conversationHistory.length - 1];
            if (!currentMessageEntry) {
                console.error("Loop check: History is empty unexpectedly.");
                state.isConversationActive = false;
                break;
            }
            
            // Determine which bot speaks next
            const botToSpeak = state.currentBot;
            console.log(`Bot ${botToSpeak} turn starting.`);
            
            const response = await llm.sendToBot(botToSpeak);
            
            if (!state.isConversationActive || response === null) { // Check if loop was stopped
                console.log('Conversation loop ending due to error or interruption during sendToBot.');
                break; // Exit loop
            }
            
            // Switch to the other bot for the next turn
            state.currentBot = (state.currentBot === 1) ? 2 : 1;
            console.log(`Bot ${botToSpeak} turn completed. Next is Bot ${state.currentBot}.`);
            
            
            // Optional delay between bot turns
            if (state.isConversationActive) { // Only delay if not interrupted
                const delay = Math.random() * 1000 + 500; // 0.5 - 1.5 seconds
                console.log(`Waiting ${delay.toFixed(0)}ms before next turn...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        console.log('Conversation loop finished.');
        // Only update UI if not waiting for user interruption
        if (!state.waitingForUserInterruption) {
            this.updateUIAfterConversationEnd();
        }
    },
    
    /**
     * Submit user interruption to the conversation
     * @param {string} interruptionMessage - User's interruption message
     */
    submitInterruption(interruptionMessage) {
        const state = window.slopcaster.state;
        const conversationDisplay = window.slopcaster.conversationDisplay;
        const playerControls = window.slopcaster.playerControls;
        const dialogManager = window.slopcaster.dialogManager;
        
        if (!interruptionMessage.trim()) {
            alert('Please enter your interruption message.');
            return;
        }
        
        console.log("Submitting user interruption");
        dialogManager.interruptionForm.classList.add('hidden');
        dialogManager.interruptionInput.value = '';
        
        // Add user message
        conversationDisplay.appendMessage('User', interruptionMessage);
        playerControls.updatePlaybackControls();
        // No audio for user message
        
        // Resume conversation loop
        state.waitingForUserInterruption = false;
        state.isConversationActive = true; // Allow loop to continue
        this.updateUIAfterConversationStart(); // Re-disable input etc.
        // The loop will pick up from where it left off, considering the new user message
        this.startConversationLoop(); // Re-enter the loop logic check
    },
    
    /**
     * Request to interrupt the conversation
     */
    requestInterruption() {
        const state = window.slopcaster.state;
        
        if (!state.isConversationActive) return;
        console.log('User clicked interrupt button');
        state.waitingForUserInterruption = true; // Set flag
        this.interruptBtn.disabled = true; // Disable until resumed or cleared
        console.log("Interrupt requested, waiting for current bot to finish or next loop check...");
    },
    
    /**
     * Clear the current conversation
     */
    clearConversation() {
        const state = window.slopcaster.state;
        const conversationDisplay = window.slopcaster.conversationDisplay;
        const playerControls = window.slopcaster.playerControls;
        const dialogManager = window.slopcaster.dialogManager;
        
        console.log('User clicked clear button');
        if (state.conversationHistory.length > 0 && !confirm('Are you sure you want to clear the current conversation and stop playback?')) {
            return;
        }
        
        // Stop any active processes
        state.isConversationActive = false; // Ensure generation stops
        if (state.currentAudio) {
            state.currentAudio.pause();
            if (window.slopcaster.audio.handleAudioEnd) {
                state.currentAudio.removeEventListener('ended', window.slopcaster.audio.handleAudioEnd);
            }
        }
        state.isPlaying = false;
        state.currentAudio = null;
        state.audioGenerationQueue = []; // Clear generation queue
        state.isProcessingQueue = false; // Reset queue processing flag
        
        // Revoke old audio URLs
        state.conversationHistory.forEach(entry => {
            if (entry.audioUrl) {
                try { URL.revokeObjectURL(entry.audioUrl); } catch(e) { console.warn("Error revoking URL:", e); }
            }
        });
        
        // Reset state
        state.reset();
        
        // Reset UI
        conversationDisplay.display.innerHTML = '<div class="text-center text-gray-500 dark:text-gray-400">Start a conversation to see messages here</div>';
        dialogManager.interruptionForm.classList.add('hidden');
        this.userInput.value = '';
        dialogManager.interruptionInput.value = '';
        window.slopcaster.exportImport.copyBtn.disabled = true;
        window.slopcaster.exportImport.saveBtn.disabled = true;
        playerControls.updatePlaybackControls(); // Reset player controls
        this.updateUIAfterConversationEnd(); // Reset conversation controls
        window.slopcaster.ui.hideLoadingIndicator(); // Ensure loading indicator is hidden
    },
    
    /**
     * Update UI elements after conversation starts
     */
    updateUIAfterConversationStart() {
        const settingsPanel = window.slopcaster.settingsPanel;
        
        this.startBtn.disabled = true;
        this.interruptBtn.disabled = false;
        this.userInput.disabled = true; // Disable main input during conversation
        this.clearBtn.disabled = true; // Prevent clearing during generation
        
        // Disable settings changes during conversation
        settingsPanel.panel.querySelectorAll('select, textarea, input[type=checkbox]').forEach(el => el.disabled = true);
        settingsPanel.toggleButton.disabled = true;
        settingsPanel.puterApiTab.disabled = true; // Disable API switching
        settingsPanel.pollApiTab.disabled = true;
    },
    
    /**
     * Update UI elements after conversation ends
     */
    updateUIAfterConversationEnd() {
        const state = window.slopcaster.state;
        const settingsPanel = window.slopcaster.settingsPanel;
        const playerControls = window.slopcaster.playerControls;
        
        this.startBtn.disabled = false;
        this.interruptBtn.disabled = true;
        this.userInput.disabled = false;
        this.clearBtn.disabled = false;
        
        // Re-enable settings changes
        settingsPanel.panel.querySelectorAll('select, textarea, input[type=checkbox]').forEach(el => el.disabled = false);
        settingsPanel.toggleButton.disabled = false;
        
        // Re-enable API switching (unless one was disabled due to load failure)
        if (typeof puter !== 'undefined') settingsPanel.puterApiTab.disabled = false;
        if (state.pollutionsModelsPopulated || !settingsPanel.pollApiTab.disabled) settingsPanel.pollApiTab.disabled = false;
        
        // Ensure playback controls are enabled if there's history
        playerControls.updatePlaybackControls();
    }
};
