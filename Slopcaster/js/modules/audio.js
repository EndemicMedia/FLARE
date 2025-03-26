/**
 * Slopcaster - Audio Module
 * Handles TTS generation and audio playback
 */

// Initialize namespace
window.slopcaster = window.slopcaster || {};

// Audio generation and playback functions
window.slopcaster.audio = {
    // DOM elements - will be set during initialization
    loadingIndicator: null,
    
    /**
     * Initialize audio module
     */
    init() {
        this.loadingIndicator = document.getElementById('loadingIndicator');
    },
    
    /**
     * Get appropriate voice for a speaker
     * @param {string} speaker - The speaker identifier
     * @returns {string} Voice ID to use
     */
    getVoiceForSpeaker(speaker) {
        const userVoiceSelect = document.getElementById('userVoiceSelect');
        const bot1VoiceSelect = document.getElementById('bot1VoiceSelect');
        const bot2VoiceSelect = document.getElementById('bot2VoiceSelect');
        
        if (speaker.toLowerCase().includes('user')) return userVoiceSelect.value;
        if (speaker.toLowerCase().includes('bot 1')) return bot1VoiceSelect.value;
        if (speaker.toLowerCase().includes('bot 2')) return bot2VoiceSelect.value;
        return 'echo'; // Fallback
    },
    
    /**
     * Queue audio generation for a message
     * @param {number} index - Index of message in conversation history
     */
    queueAudioGeneration(index) {
        const state = window.slopcaster.state;
        const ui = window.slopcaster.ui;
        const conversationDisplay = window.slopcaster.conversationDisplay;
        
        if (index < 0 || index >= state.conversationHistory.length) return;
        const entry = state.conversationHistory[index];
        
        // Only queue for bots, and if not already generated or generating/loading
        if (entry.sender !== 'User' && !entry.audioUrl && !entry.isGenerating && !entry.isLoading) {
            console.log(`Queueing audio generation for index ${index}: "${entry.message.substring(0,30)}..."`);
            entry.isGenerating = true; // Mark as actively being processed
            entry.isLoading = true; // Mark as loading (used by playLine)
            conversationDisplay.updateAudioStatus(index);
            state.audioGenerationQueue.push(index);
            this.processAudioQueue(); // Start processing if not already running
        }
    },
    
    /**
     * Process the audio generation queue
     */
    async processAudioQueue() {
        const state = window.slopcaster.state;
        const ui = window.slopcaster.ui;
        const conversationDisplay = window.slopcaster.conversationDisplay;
        
        if (state.isProcessingQueue || state.audioGenerationQueue.length === 0) {
            return;
        }
        
        state.isProcessingQueue = true;
        ui.showLoadingIndicator(); // Show global indicator while processing queue
        
        while (state.audioGenerationQueue.length > 0) {
            const index = state.audioGenerationQueue.shift(); // Get next index
            const entry = state.conversationHistory[index];
            
            // Double check entry validity and status before fetching
            if (!entry || entry.audioUrl || entry.sender === 'User') {
                console.log(`Skipping fetch for index ${index} in queue processor.`);
                if(entry) {
                    entry.isLoading = false; // Ensure loading is false if skipped
                    entry.isGenerating = false;
                    conversationDisplay.updateAudioStatus(index);
                }
                continue;
            }
            
            console.log(`Processing audio fetch for index ${index}`);
            const voice = this.getVoiceForSpeaker(entry.sender);
            
            try {
                // Add a prefix to encourage conversational tone
                const textToSpeak = `Say this naturally: ${entry.message}`;
                const url = `https://text.pollinations.ai/${encodeURIComponent(textToSpeak)}?model=openai-audio&voice=${voice}`;
                
                const response = await fetch(url);
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`TTS API error (${response.status}): ${errorText}`);
                }
                
                const blob = await response.blob();
                entry.audioUrl = URL.createObjectURL(blob);
                entry.error = null; // Clear previous error if any
                console.log(`Audio generated successfully for index ${index}`);
                
            } catch (error) {
                console.error(`Error generating audio for index ${index}:`, error);
                entry.audioUrl = null;
                entry.error = error.message; // Store error message
            } finally {
                entry.isLoading = false; // Mark loading as complete
                entry.isGenerating = false; // Mark processing as complete
                conversationDisplay.updateAudioStatus(index); // Update icon
                // Small delay before next request to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 250));
            }
        }
        
        state.isProcessingQueue = false;
        ui.hideLoadingIndicator(); // Hide global indicator when queue is empty
        console.log("Audio generation queue processed.");
    },
    
    /**
     * Play audio for a conversation line
     * @param {number} index - Index of the line to play
     */
    async playLine(index) {
        const state = window.slopcaster.state;
        const playerControls = window.slopcaster.playerControls;
        const conversationDisplay = window.slopcaster.conversationDisplay;
        
        if (state.isConversationActive) {
            console.log("Cannot play audio while conversation is generating.");
            return;
        }
        
        if (index < 0 || index >= state.conversationHistory.length) {
            console.warn(`playLine called with invalid index: ${index}`);
            return;
        }
        
        // Stop current audio if playing
        if (state.currentAudio) {
            state.currentAudio.pause();
            state.currentAudio.removeEventListener('ended', this.handleAudioEnd); // Clean up listener
            state.currentAudio = null; // Important to nullify
            console.log("Stopped previous audio.");
        }
        
        state.currentPlaybackIndex = index;
        playerControls.updatePlaybackControls();
        playerControls.highlightCurrentLine();
        
        const entry = state.conversationHistory[index];
        
        // --- Handle User Messages ---
        if (entry.sender === 'User') {
            console.log(`Skipping audio playback for User message at index ${index}.`);
            // If was playing, stop playback state and update controls
            if (state.isPlaying) {
                state.isPlaying = false;
                playerControls.updatePlaybackControls();
            }
            return;
        }
        
        // --- Handle Audio Generation & Errors ---
        if (!entry.audioUrl) {
            if (entry.error) {
                console.error(`Cannot play line ${index + 1}, audio generation failed previously: ${entry.error}`);
                state.isPlaying = false; // Stop playback attempt
                playerControls.updatePlaybackControls();
                return;
            }
            
            // If audio not ready and no error, trigger generation if not already happening
            if (!entry.isLoading && !entry.isGenerating) {
                console.log(`Audio for line ${index + 1} not generated, queueing now.`);
                this.queueAudioGeneration(index);
            } else {
                console.log(`Audio for line ${index + 1} is currently loading/generating.`);
            }
            
            // Indicate loading and return, user needs to press play again or wait
            state.isPlaying = false; // Ensure state is paused
            playerControls.updatePlaybackControls();
            conversationDisplay.updateAudioStatus(index); // Ensure status shows loading/queued
            
            // Maybe flash the loading indicator briefly
            window.slopcaster.ui.showLoadingIndicator(`Waiting for audio ${index + 1}...`);
            setTimeout(window.slopcaster.ui.hideLoadingIndicator, 1500);
            return; // Exit play function for now
        }
        
        // --- Play Audio ---
        console.log(`Playing audio for index ${index}`);
        state.currentAudio = new Audio(entry.audioUrl);
        
        // Bind handleAudioEnd to this module to maintain context
        this.handleAudioEnd = this.handleAudioEnd.bind(this);
        state.currentAudio.addEventListener('ended', this.handleAudioEnd);
        
        state.currentAudio.addEventListener('error', (e) => {
            console.error(`Audio playback error for index ${index}:`, e);
            state.isPlaying = false;
            playerControls.updatePlaybackControls();
        });
        
        
        try {
            await state.currentAudio.play();
            state.isPlaying = true;
            playerControls.updatePlaybackControls(); // Update controls *after* successful play start
            
            // --- JIT Trigger for NEXT line ---
            const nextIndex = index + 1;
            if (nextIndex < state.conversationHistory.length) {
                const nextEntry = state.conversationHistory[nextIndex];
                // Trigger generation for the *next* line if it's a bot and audio isn't ready/generating/loading
                if (nextEntry.sender !== 'User' && !nextEntry.audioUrl && !nextEntry.isGenerating && !nextEntry.isLoading) {
                    console.log(`Playback started for ${index}, triggering JIT audio generation for next line (index ${nextIndex})`);
                    this.queueAudioGeneration(nextIndex);
                }
            }
            
        } catch (error) {
            console.error('Error starting audio playback:', error);
            state.isPlaying = false;
            playerControls.updatePlaybackControls();
            state.currentAudio = null; // Clean up failed audio object
        }
    },
    
    /**
     * Handle audio end event
     */
    handleAudioEnd() {
        const state = window.slopcaster.state;
        const playerControls = window.slopcaster.playerControls;
        
        console.log(`Audio ended for index ${state.currentPlaybackIndex}`);
        state.currentAudio = null; // Clear finished audio object
        
        // Automatically play next line ONLY if isPlaying is still true
        if (state.isPlaying) {
            playerControls.playNext();
        } else {
            // If paused manually just before ending, ensure UI reflects paused state
            playerControls.updatePlaybackControls();
            playerControls.highlightCurrentLine(); // Keep highlight on the finished line if paused
        }
    }
};
