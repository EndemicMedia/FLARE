/**
 * Slopcaster - Conversation Display Component
 * Handles rendering and updating the conversation messages UI
 */

// Initialize namespace
window.slopcaster = window.slopcaster || {};

// Conversation display component
window.slopcaster.conversationDisplay = {
    // DOM element references
    display: null,
    
    /**
     * Initialize component
     */
    init() {
        this.display = document.getElementById('conversation-display');
    },
    
    /**
     * Add a message to the conversation display
     * @param {string} sender - Message sender (User, Bot 1, Bot 2)
     * @param {string} message - Message content
     * @param {string} model - LLM model used (optional)
     * @param {boolean} isThinking - Whether this is a "thinking" placeholder
     * @returns {HTMLElement} The created message element
     */
    appendMessage(sender, message, model = null, isThinking = false) {
        const state = window.slopcaster.state;
        const settings = window.slopcaster.settings;
        const ui = window.slopcaster.ui;
        
        const timestamp = ui.getTimestamp();
        const messageIndex = state.conversationHistory.length; // Index before pushing
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'mb-4 message-entry'; // Add message-entry class
        messageDiv.dataset.index = messageIndex; // Store index (even for thinking)
        
        let senderClass = '';
        let avatarColor = '#9CA3AF'; // Default gray (dark: #4B5563)
        let initials = '?';
        let textColor = 'text-gray-700 dark:text-gray-300';
        let borderColor = 'border-gray-300 dark:border-gray-600'; // Default border
        
        if (sender === 'User') {
            senderClass = 'bg-gray-100 dark:bg-gray-700';
            avatarColor = '#3B82F6'; // Blue
            initials = 'U';
            textColor = 'text-blue-600 dark:text-blue-400';
        } else if (sender === 'Bot 1') {
            senderClass = 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-l-green-500';
            avatarColor = '#10B981'; // Green
            initials = 'B1';
            textColor = 'text-green-600 dark:text-green-400';
            borderColor = 'border-gray-300 dark:border-gray-600 border-t border-r border-b'; // Specific borders for bots
        } else if (sender === 'Bot 2') {
            senderClass = 'bg-purple-50 dark:bg-purple-900/30 border-l-4 border-l-purple-500';
            avatarColor = '#8B5CF6'; // Purple
            initials = 'B2';
            textColor = 'text-purple-600 dark:text-purple-400';
            borderColor = 'border-gray-300 dark:border-gray-600 border-t border-r border-b'; // Specific borders for bots
        }
        
        let processedMessage = '';
        if (isThinking) {
            processedMessage = `
                <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span class="thinking-dot mr-1">●</span>
                    <span class="thinking-dot mx-1" style="animation-delay: 0.2s">●</span>
                    <span class="thinking-dot ml-1" style="animation-delay: 0.4s">●</span>
                    <span class="ml-2">Thinking...</span>
                </div>`;
        } else if (settings.enableMarkdown && settings.enableMarkdown.checked && sender !== 'User') {
            try {
                // Ensure message is a string before parsing
                processedMessage = marked.parse(String(message || ''));
            } catch (e) {
                console.error("Error parsing markdown:", e);
                processedMessage = String(message || '').replace(/\n/g, '<br>');
            }
        } else {
            // Ensure message is a string
            processedMessage = String(message || '').replace(/\n/g, '<br>');
        }
        
        let avatarHtml = '';
        if (settings.enableAvatar && settings.enableAvatar.checked) {
            avatarHtml = `
                <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white mr-2" style="background-color: ${avatarColor}">
                    ${initials}
                </div>
            `;
        }
        
        let timestampHtml = '';
        if (settings.enableTimestamps && settings.enableTimestamps.checked) {
            timestampHtml = `<span class="text-xs text-gray-500 dark:text-gray-400 ml-2">${timestamp}</span>`;
        }
        
        // Audio Status Indicator (only for bots, not for thinking message)
        let audioStatusHtml = '';
        const statusElementId = `audio-status-${messageIndex}`;
        if (sender !== 'User' && !isThinking) {
            audioStatusHtml = `<span id="${statusElementId}" class="audio-status inline-block ml-2"><i class="fa-solid fa-circle-question text-gray-400 dark:text-gray-500" title="Audio not generated"></i></span>`;
        }
        
        messageDiv.innerHTML = `
            <div class="flex items-start mb-1">
                ${avatarHtml}
                <div class="flex-grow">
                    <div class="font-medium ${textColor} flex items-center">
                        ${sender} ${model ? `(${model})` : ''} ${timestampHtml} ${audioStatusHtml}
                    </div>
                    <div class="p-3 rounded-lg ${senderClass} ${borderColor} mt-1 overflow-x-auto message-content-wrapper">
                        <div class="prose prose-sm sm:prose dark:prose-invert max-w-none">${processedMessage}</div>
                    </div>
                </div>
            </div>
        `;
        
        // Add click listener for playback only to non-thinking messages
        if (!isThinking) {
            messageDiv.addEventListener('click', () => {
                if (state.isConversationActive) {
                    console.log("Conversation generation active, click ignored for playback.");
                    return; // Don't allow jumping during generation
                }
                const indexToPlay = parseInt(messageDiv.dataset.index, 10);
                if (!isNaN(indexToPlay)) {
                    window.slopcaster.audio.playLine(indexToPlay);
                }
            });
            messageDiv.style.cursor = 'pointer'; // Indicate clickable
        }
        
        
        // If it's a thinking message, find the previous one and replace it
        const existingThinkingMessage = this.display.querySelector('.thinking-message');
        if (isThinking && existingThinkingMessage) {
            existingThinkingMessage.replaceWith(messageDiv);
            messageDiv.classList.add('thinking-message'); // Keep track
        } else {
            // Remove placeholder if it exists
            const placeholder = this.display.querySelector('.text-center');
            if(placeholder) placeholder.remove();
            this.display.appendChild(messageDiv);
        }
        
        
        // Store history entry (only for non-thinking messages)
        if (!isThinking) {
            const historyEntry = {
                sender,
                message: String(message || ''), // Ensure message is string
                model,
                timestamp,
                audioUrl: null,
                isLoading: false, // For audio generation
                isGenerating: false, // For audio generation
                error: null, // Store audio generation errors
                element: messageDiv,
                statusElement: messageDiv.querySelector(`#${statusElementId}`) // Store reference
            };
            state.conversationHistory.push(historyEntry);
            window.slopcaster.playerControls.updatePlaybackControls(); // Update total count
        }
        
        if (settings.autoScroll && settings.autoScroll.checked && state.isConversationActive) {
            this.display.scrollTop = this.display.scrollHeight;
        }
        
        // Enable buttons if needed
        if (state.conversationHistory.length > 0) {
            window.slopcaster.exportImport.copyBtn.disabled = false;
            window.slopcaster.exportImport.saveBtn.disabled = false;
            window.slopcaster.playerControls.playPauseBtn.disabled = false;
        }
        
        return messageDiv; // Return the element for potential updates
    },
    
    /**
     * Update message content during streaming
     * @param {HTMLElement} messageDiv - Message element to update
     * @param {string} newContent - New content to display
     * @param {boolean} isFinal - Whether this is the final update
     * @param {string} sender - Message sender
     */
    updateMessageContent(messageDiv, newContent, isFinal = false, sender) {
        const state = window.slopcaster.state;
        const settings = window.slopcaster.settings;
        
        const contentWrapper = messageDiv.querySelector('.message-content-wrapper .prose');
        if (!contentWrapper) return;
        
        let processedContent = '';
        // Ensure content is a string
        const contentString = String(newContent || '');
        
        if (settings.enableMarkdown && settings.enableMarkdown.checked && sender !== 'User') {
            try {
                processedContent = marked.parse(contentString);
            } catch (e) {
                console.warn("Markdown parsing error during stream:", e);
                processedContent = contentString.replace(/\n/g, '<br>');
            }
        } else {
            processedContent = contentString.replace(/\n/g, '<br>');
        }
        
        contentWrapper.innerHTML = processedContent;
        
        if (isFinal) {
            messageDiv.classList.remove('thinking-message');
        }
        
        if (settings.autoScroll && settings.autoScroll.checked && state.isConversationActive) {
            this.display.scrollTop = this.display.scrollHeight;
        }
    },
    
    /**
     * Update audio status icon for a message
     * @param {number} index - Index of message to update
     */
    updateAudioStatus(index) {
        const state = window.slopcaster.state;
        
        if (index < 0 || index >= state.conversationHistory.length) return;
        const entry = state.conversationHistory[index];
        
        // User messages don't have status elements
        if (!entry || !entry.statusElement) return;
        
        let iconHTML;
        if (entry.isGenerating) {
            iconHTML = `<i class="fa-solid fa-spinner fa-spin text-yellow-500 dark:text-yellow-400" title="Generating audio..."></i>`;
        } else if (entry.audioUrl) {
            iconHTML = `<i class="fa-solid fa-check-circle text-green-500 dark:text-green-400" title="Audio ready"></i>`;
        } else if (entry.error) { // Add error state
            iconHTML = `<i class="fa-solid fa-circle-exclamation text-red-500 dark:text-red-400" title="Audio generation failed: ${entry.error}"></i>`;
        } else {
            iconHTML = `<i class="fa-solid fa-circle-question text-gray-400 dark:text-gray-500" title="Audio not generated"></i>`;
        }
        
        entry.statusElement.innerHTML = iconHTML;
    }
};
