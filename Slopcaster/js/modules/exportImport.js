/**
 * Slopcaster - Export/Import Module
 * Handles saving and loading conversations
 */

// Initialize namespace
window.slopcaster = window.slopcaster || {};

// Export/import functions
window.slopcaster.exportImport = {
    // DOM elements - will be set during initialization
    copyBtn: null,
    saveBtn: null,
    
    /**
     * Initialize export/import module
     */
    init() {
        this.copyBtn = document.getElementById('copy-btn');
        this.saveBtn = document.getElementById('save-btn');
        
        // Set up event listeners
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.saveBtn.addEventListener('click', () => {
            const date = new Date();
            const defaultName = `slopcaster-${date.toISOString().split('T')[0]}`;
            document.getElementById('conversation-name').value = defaultName;
            window.slopcaster.dialogManager.saveDialog.classList.remove('hidden');
        });
        
        // Set up save dialog buttons
        document.getElementById('save-markdown').addEventListener('click', () => this.saveConversation('markdown'));
        document.getElementById('save-json').addEventListener('click', () => this.saveConversation('json'));
        document.getElementById('cancel-save').addEventListener('click', () => 
            window.slopcaster.dialogManager.saveDialog.classList.add('hidden')
        );
    },
    
    /**
     * Convert conversation to markdown format
     * @returns {string} Markdown representation of the conversation
     */
    convertToMarkdown() {
        const state = window.slopcaster.state;
        const settings = window.slopcaster.settings;
        
        let markdown = "# Slopcaster AI Conversation\n\n";
        markdown += `*LLM Provider: ${state.currentApiProvider}*\n`;
        
        const bot1Select = document.getElementById('bot1-model');
        const bot2Select = document.getElementById('bot2-model');
        
        markdown += `*Bot 1 Model: ${bot1Select.options[bot1Select.selectedIndex].text}*\n`;
        markdown += `*Bot 2 Model: ${bot2Select.options[bot2Select.selectedIndex].text}*\n\n`;
        markdown += "---\n\n";
        
        state.conversationHistory.forEach(entry => {
            const timestamp = entry.timestamp && settings.enableTimestamps.checked ? ` - ${entry.timestamp}` : '';
            const model = entry.model ? ` (${entry.model})` : '';
            markdown += `## ${entry.sender}${model}${timestamp}\n\n`;
            markdown += `${entry.message}\n\n`;
        });
        
        return markdown;
    },
    
    /**
     * Copy conversation to clipboard as markdown
     */
    copyToClipboard() {
        const markdown = this.convertToMarkdown();
        navigator.clipboard.writeText(markdown)
            .then(() => {
                const originalHTML = this.copyBtn.innerHTML;
                this.copyBtn.innerHTML = `
                    <span class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                        Copied!
                    </span>`;
                this.copyBtn.disabled = true;
                setTimeout(() => {
                    this.copyBtn.innerHTML = originalHTML;
                    this.copyBtn.disabled = window.slopcaster.state.conversationHistory.length === 0;
                }, 2000);
            })
            .catch(err => alert('Failed to copy: ' + err));
    },
    
    /**
     * Save conversation to a file
     * @param {string} format - 'markdown' or 'json'
     */
    saveConversation(format) {
        const state = window.slopcaster.state;
        const dialogManager = window.slopcaster.dialogManager;
        
        let filename = document.getElementById('conversation-name').value.trim() || "ai-conversation";
        let content;
        let mimeType;
        
        if (format === 'markdown') {
            content = this.convertToMarkdown();
            filename = filename.endsWith('.md') ? filename : filename + '.md';
            mimeType = 'text/markdown;charset=utf-8';
        } else { // JSON
            // Create a serializable version without DOM elements
            const serializableHistory = state.conversationHistory.map(entry => ({
                sender: entry.sender,
                message: entry.message,
                model: entry.model,
                timestamp: entry.timestamp,
                // Optionally include audio status info if desired, but not the URL itself
                audioGenerated: !!entry.audioUrl,
                audioError: entry.error || null
            }));
            
            content = JSON.stringify({
                provider: state.currentApiProvider,
                bot1Model: document.getElementById('bot1-model').value,
                bot2Model: document.getElementById('bot2-model').value,
                bot1SystemPrompt: document.getElementById('bot1-system-prompt').value,
                bot2SystemPrompt: document.getElementById('bot2-system-prompt').value,
                history: serializableHistory
            }, null, 2);
            
            filename = filename.endsWith('.json') ? filename : filename + '.json';
            mimeType = 'application/json;charset=utf-8';
        }
        
        try {
            const blob = new Blob([content], { type: mimeType });
            saveAs(blob, filename);
        } catch (e) {
            console.error("Save failed:", e);
            alert("Failed to save file. See console for details.");
        } finally {
            dialogManager.saveDialog.classList.add('hidden');
        }
    },
    
    /**
     * Load conversation from a JSON file (future implementation)
     * @param {File} file - JSON file to load
     */
    loadConversation(file) {
        // TODO: Implement loading saved conversations
        alert('Loading conversations is not yet implemented.');
    }
};
