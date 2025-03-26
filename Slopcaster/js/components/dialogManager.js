/**
 * Slopcaster - Dialog Manager Component
 * Manages dialogs for save and interruption
 */

// Initialize namespace
window.slopcaster = window.slopcaster || {};

// Dialog manager component
window.slopcaster.dialogManager = {
    // DOM element references
    saveDialog: null,
    conversationName: null,
    interruptionForm: null,
    interruptionInput: null,
    submitInterruption: null,
    cancelInterruption: null,
    
    /**
     * Initialize component
     */
    init() {
        // Save dialog elements
        this.saveDialog = document.getElementById('save-dialog');
        this.conversationName = document.getElementById('conversation-name');
        
        // Interruption form elements
        this.interruptionForm = document.getElementById('interruption-form');
        this.interruptionInput = document.getElementById('interruption-input');
        this.submitInterruption = document.getElementById('submit-interruption');
        this.cancelInterruption = document.getElementById('cancel-interruption');
        
        // Set up event listeners
        this.setupListeners();
    },
    
    /**
     * Set up event listeners for dialogs
     */
    setupListeners() {
        // Interruption form
        this.submitInterruption.addEventListener('click', () => {
            const interruptionMessage = this.interruptionInput.value.trim();
            window.slopcaster.conversation.submitInterruption(interruptionMessage);
        });
        
        this.cancelInterruption.addEventListener('click', () => {
            console.log('User cancelled interruption');
            const state = window.slopcaster.state;
            state.waitingForUserInterruption = false;
            this.interruptionForm.classList.add('hidden');
            // Reset controls as if conversation ended
            window.slopcaster.conversation.updateUIAfterConversationEnd();
        });
        
        // Enter key in interruption input
        this.interruptionInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.submitInterruption.click();
            }
        });
        
        // Close save dialog on backdrop click
        this.saveDialog.addEventListener('click', (e) => {
            if (e.target === this.saveDialog) {
                this.saveDialog.classList.add('hidden');
            }
        });
    },
    
    /**
     * Show the save dialog
     */
    showSaveDialog() {
        const date = new Date();
        const defaultName = `slopcaster-${date.toISOString().split('T')[0]}`;
        this.conversationName.value = defaultName;
        this.saveDialog.classList.remove('hidden');
    },
    
    /**
     * Hide the save dialog
     */
    hideSaveDialog() {
        this.saveDialog.classList.add('hidden');
    },
    
    /**
     * Show the interruption form
     */
    showInterruptionForm() {
        this.interruptionForm.classList.remove('hidden');
        this.interruptionInput.focus();
    },
    
    /**
     * Hide the interruption form
     */
    hideInterruptionForm() {
        this.interruptionForm.classList.add('hidden');
        this.interruptionInput.value = '';
    }
};
