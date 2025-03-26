/**
 * Slopcaster - Global State Module
 * Centralizes application state management for all modules
 */

// Initialize namespace
window.slopcaster = window.slopcaster || {};

// Define global state
window.slopcaster.state = {
    // Conversation State
    conversationHistory: [], // Stores { sender, message, model, timestamp, audioUrl, isLoading, isGenerating, error, element, statusElement }
    isConversationActive: false, // LLM generation loop active
    currentBot: 1, // Which bot speaks next
    waitingForUserInterruption: false,
    pollutionsModelsPopulated: false,
    currentApiProvider: 'puter', // 'puter' or 'pollinations'
    
    // Playback State
    isPlaying: false, // Audio playback active
    currentPlaybackIndex: 0, // Index in history for playback
    currentAudio: null, // Current Audio object
    audioGenerationQueue: [], // Queue for TTS requests
    isProcessingQueue: false,
    
    // Reset state to initial values
    reset() {
        this.conversationHistory = [];
        this.isConversationActive = false;
        this.currentBot = 1;
        this.waitingForUserInterruption = false;
        this.isPlaying = false;
        this.currentPlaybackIndex = 0;
        this.currentAudio = null;
        this.audioGenerationQueue = [];
        this.isProcessingQueue = false;
        // Keep API provider and pollinations state as they are
    }
};
