/**
 * Slopcaster - Player Controls Component
 * Handles audio playback controls and UI
 */

// Initialize namespace
window.slopcaster = window.slopcaster || {};

// Player controls component
window.slopcaster.playerControls = {
    // DOM element references
    playPauseBtn: null,
    playIcon: null,
    pauseIcon: null,
    prevBtn: null,
    nextBtn: null,
    currentLineDisplay: null,
    
    /**
     * Initialize component
     */
    init() {
        // Get player control elements
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.playIcon = document.getElementById('playIcon');
        this.pauseIcon = document.getElementById('pauseIcon');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.currentLineDisplay = document.getElementById('currentLine');
        
        // Set up event listeners
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.prevBtn.addEventListener('click', () => this.playPrevious());
        this.nextBtn.addEventListener('click', () => this.playNext());
        
        // Initial state
        this.updatePlaybackControls();
    },
    
    /**
     * Update playback control states
     */
    updatePlaybackControls() {
        const state = window.slopcaster.state;
        
        // Update play/pause icon
        if (state.isPlaying) {
            this.playIcon.classList.add('hidden');
            this.pauseIcon.classList.remove('hidden');
        } else {
            this.playIcon.classList.remove('hidden');
            this.pauseIcon.classList.add('hidden');
        }
        
        const totalLines = state.conversationHistory.length;
        // Disable player if conversation is active OR if there's nothing to play
        const disablePlayer = state.isConversationActive || totalLines === 0;
        
        this.playPauseBtn.disabled = disablePlayer;
        this.prevBtn.disabled = disablePlayer || state.currentPlaybackIndex <= 0;
        this.nextBtn.disabled = disablePlayer || state.currentPlaybackIndex >= totalLines - 1;
        
        // Update button styles based on disabled state
        [this.prevBtn, this.nextBtn, this.playPauseBtn].forEach(btn => {
            if (btn.disabled) btn.classList.add('opacity-50', 'cursor-not-allowed');
            else btn.classList.remove('opacity-50', 'cursor-not-allowed');
        });
        
        this.currentLineDisplay.textContent = totalLines > 0 ? 
            `${state.currentPlaybackIndex + 1}/${totalLines}` : '0/0';
    },
    
    /**
     * Highlight the current message in the conversation
     */
    highlightCurrentLine() {
        const state = window.slopcaster.state;
        
        // Remove highlight from all lines
        state.conversationHistory.forEach(entry => {
            if (entry.element) {
                entry.element.classList.remove('current-playback-line');
            }
        });
        
        // Add highlight to current playback line
        if (state.currentPlaybackIndex >= 0 && state.currentPlaybackIndex < state.conversationHistory.length) {
            const currentEntry = state.conversationHistory[state.currentPlaybackIndex];
            if (currentEntry.element) {
                currentEntry.element.classList.add('current-playback-line');
                
                // Scroll to current line only if not actively generating conversation
                // and if the element isn't already visible
                if (!state.isConversationActive) {
                    const rect = currentEntry.element.getBoundingClientRect();
                    const containerRect = window.slopcaster.conversationDisplay.display.getBoundingClientRect();
                    if (rect.top < containerRect.top || rect.bottom > containerRect.bottom) {
                        currentEntry.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }
            }
        }
    },
    
    /**
     * Toggle play/pause audio playback
     */
    togglePlayPause() {
        const state = window.slopcaster.state;
        const audio = window.slopcaster.audio;
        
        if (state.isConversationActive) return; // Don't allow during generation
        
        if (state.isPlaying) {
            // Pause
            if (state.currentAudio) {
                state.currentAudio.pause();
            }
            state.isPlaying = false;
            console.log("Playback paused.");
        } else {
            // Play or Resume
            if (state.currentAudio && state.currentAudio.paused && !state.currentAudio.ended) {
                // Resume paused audio
                state.currentAudio.play().then(() => {
                    state.isPlaying = true;
                    console.log("Playback resumed.");
                    this.updatePlaybackControls();
                    
                    // Trigger JIT for next line upon resuming as well
                    const nextIndex = state.currentPlaybackIndex + 1;
                    if (nextIndex < state.conversationHistory.length) {
                        const nextEntry = state.conversationHistory[nextIndex];
                        if (nextEntry.sender !== 'User' && !nextEntry.audioUrl && 
                            !nextEntry.isGenerating && !nextEntry.isLoading) {
                            console.log(`Playback resumed for ${state.currentPlaybackIndex}, triggering JIT for next line (${nextIndex})`);
                            audio.queueAudioGeneration(nextIndex);
                        }
                    }
                }).catch(err => {
                    console.error('Error resuming audio:', err);
                    state.isPlaying = false; // Ensure state reflects failure
                    this.updatePlaybackControls();
                });
                
            } else {
                // Start playing from the current index (or index 0 if nothing selected)
                const indexToPlay = (state.currentPlaybackIndex >= 0 && 
                                    state.currentPlaybackIndex < state.conversationHistory.length) ? 
                                    state.currentPlaybackIndex : 0;
                console.log(`Starting playback from index ${indexToPlay}`);
                audio.playLine(indexToPlay); // This will set isPlaying = true on success
            }
        }
        
        // Update controls immediately for pause, or after promise for play/resume
        if (!state.isPlaying) this.updatePlaybackControls();
    },
    
    /**
     * Play the next message in the conversation
     */
    playNext() {
        const state = window.slopcaster.state;
        const audio = window.slopcaster.audio;
        
        if (state.isConversationActive) return;
        
        if (state.currentPlaybackIndex < state.conversationHistory.length - 1) {
            audio.playLine(state.currentPlaybackIndex + 1);
        } else {
            // Reached end of conversation
            console.log("Reached end of conversation.");
            if (state.isPlaying) { // If it was playing the last message
                state.isPlaying = false; // Stop playback state
                if (state.currentAudio) {
                    state.currentAudio.pause(); // Ensure last audio is stopped
                    state.currentAudio.removeEventListener('ended', audio.handleAudioEnd);
                    state.currentAudio = null;
                }
                this.updatePlaybackControls();
                this.highlightCurrentLine(); // Keep highlight on last line
            }
        }
    },
    
    /**
     * Play the previous message in the conversation
     */
    playPrevious() {
        const state = window.slopcaster.state;
        const audio = window.slopcaster.audio;
        
        if (state.isConversationActive) return;
        
        if (state.currentPlaybackIndex > 0) {
            audio.playLine(state.currentPlaybackIndex - 1);
        }
    }
};
