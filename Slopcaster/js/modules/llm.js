/**
 * Slopcaster - LLM Module
 * Handles interactions with AI providers (Puter and Pollinations)
 */

// Initialize namespace
window.slopcaster = window.slopcaster || {};

// LLM API interaction functions
window.slopcaster.llm = {
    /**
     * Initialize LLM module
     */
    init() {
        // Any initialization needed for LLM APIs
    },
    
    /**
     * Populate Pollinations models in dropdown
     */
    async populatePollinationsModels() {
        const state = window.slopcaster.state;
        const settingsPanel = window.slopcaster.settingsPanel;
        
        // Only populate if not already done
        if (state.pollutionsModelsPopulated) return;
        
        try {
            console.log('Fetching Pollinations models...');
            const response = await fetch('https://text.pollinations.ai/models');
            if (!response.ok) throw new Error(`Failed to fetch models: ${response.statusText}`);
            const models = await response.json();
            console.log('Received Pollinations models:', models);
            
            settingsPanel.pollModelGroups.forEach(group => group.innerHTML = ''); // Clear existing
            
            // Simple population without health check for speed
            models.forEach(model => {
                if (model.name && model.description) { // Basic validation
                    const optionValue = `pollinations:${model.name}`;
                    // Shorten long descriptions
                    const shortDescription = model.description.length > 50 ? model.description.substring(0, 47) + '...' : model.description;
                    const optionText = `${shortDescription} (${model.name})`;
                    const option = document.createElement('option');
                    option.value = optionValue;
                    option.textContent = optionText;
                    option.title = model.description; // Full description on hover
                    settingsPanel.pollModelGroups.forEach(group => group.appendChild(option.cloneNode(true)));
                }
            });
            
            state.pollutionsModelsPopulated = true;
            console.log('Pollinations models populated.');
            
            // Set default selection if needed (after population)
            if (state.currentApiProvider === 'pollinations') {
                const firstPollinationOption = settingsPanel.pollModelGroups[0]?.querySelector('option');
                if (firstPollinationOption) {
                    settingsPanel.bot1Select.value = firstPollinationOption.value;
                    settingsPanel.bot2Select.value = firstPollinationOption.value;
                }
            }
            
        } catch (error) {
            console.error('Error fetching or processing Pollinations models:', error);
            alert(`Failed to load Pollinations models: ${error.message}. Pollinations provider may be unavailable.`);
            // Optionally disable the tab
            settingsPanel.pollApiTab.disabled = true;
            settingsPanel.pollApiTab.classList.add('opacity-50', 'cursor-not-allowed', 'text-gray-400');
            if(state.currentApiProvider === 'pollinations') {
                // Try switching back to Puter if possible
                if(!settingsPanel.puterApiTab.disabled) {
                    setTimeout(() => settingsPanel.puterApiTab.click(), 0);
                } else {
                    alert("Both LLM providers seem unavailable.");
                }
            }
        }
    },
    
    /**
     * Send a prompt to a bot and get streaming response
     * @param {number} botNumber - Which bot to use (1 or 2)
     * @returns {string|null} - The complete response or null if error
     */
    async sendToBot(botNumber) {
        const state = window.slopcaster.state;
        const settingsPanel = window.slopcaster.settingsPanel;
        const conversationDisplay = window.slopcaster.conversationDisplay;
        const audio = window.slopcaster.audio;
        
        const model = botNumber === 1 ? settingsPanel.bot1Select.value : settingsPanel.bot2Select.value;
        const systemPrompt = botNumber === 1 ? settingsPanel.bot1SystemPrompt.value : settingsPanel.bot2SystemPrompt.value;
        const senderName = `Bot ${botNumber}`;
        let fullResponse = '';
        let thinkingMessageDiv = null; // Keep track of the thinking message element
        const finalMessageIndex = state.conversationHistory.length; // Index where the *final* message will be added
        
        try {
            console.log(`sendToBot called for ${senderName} with model ${model}. Expecting index ${finalMessageIndex}.`);
            
            // Show thinking state
            thinkingMessageDiv = conversationDisplay.appendMessage(senderName, "Thinking...", model, true);
            
            // Build message history for context
            const messages = [{ role: "system", content: systemPrompt }];
            // Include messages *before* the current thinking one
            state.conversationHistory.slice(0, finalMessageIndex).forEach(entry => {
                const role = entry.sender === 'User' ? 'user' : 'assistant';
                messages.push({ role: role, content: entry.message });
            });
            
            console.log(`Sending ${messages.length} messages to ${model} via ${state.currentApiProvider}`);
            
            let responseStream;
            if (state.currentApiProvider === 'puter') {
                if (typeof puter === 'undefined') throw new Error("Puter library not loaded.");
                responseStream = await puter.ai.chat(messages, { model: model, stream: true });
            } else if (state.currentApiProvider === 'pollinations') {
                responseStream = await this.sendToPollinations(messages, model);
            } else {
                throw new Error("Invalid API provider selected.");
            }
            
            console.log(`Stream started for ${senderName}`);
            for await (const part of responseStream) {
                if (!state.isConversationActive) { // Check for interruption during stream
                    console.log(`Stream interrupted for ${senderName}`);
                    throw new Error("Conversation interrupted by user.");
                }
                if (part?.text) {
                    fullResponse += part.text;
                    // Update the thinking message content in real-time
                    conversationDisplay.updateMessageContent(thinkingMessageDiv, fullResponse, false, senderName);
                }
            }
            console.log(`Stream finished for ${senderName}. Full response length: ${fullResponse.length}`);
            
            // --- Final Message Update & Audio Trigger ---
            // Replace the thinking message with the final content
            const finalMessageDiv = conversationDisplay.appendMessage(senderName, fullResponse, model); // Add final message
            if (thinkingMessageDiv && thinkingMessageDiv.parentNode) {
                thinkingMessageDiv.replaceWith(finalMessageDiv); // Replace placeholder
            } else {
                console.warn("Thinking message div not found for replacement.");
                // If thinking message wasn't found, the final message was already appended.
                // We still need to ensure the history index is correct.
                if (state.conversationHistory.length > finalMessageIndex && state.conversationHistory[finalMessageIndex].element === finalMessageDiv) {
                    console.log("Final message already appended, proceeding.");
                } else {
                    console.error("State mismatch after message generation.");
                    throw new Error("Failed to correctly place final message.");
                }
            }
            
            
            // --- JIT Audio Trigger ---
            // Trigger TTS generation *only* for the very first bot message (index 1) immediately.
            // Subsequent triggers happen during playback.
            if (finalMessageIndex === 1) { // Index 0 is User, Index 1 is first Bot response
                console.log(`First bot message (index ${finalMessageIndex}), queueing initial audio.`);
                audio.queueAudioGeneration(finalMessageIndex);
            }
            
            return fullResponse; // Return the complete text
            
        } catch (error) {
            console.error(`Error with ${senderName} (${model}):`, error);
            // Remove thinking message if it still exists
            if (thinkingMessageDiv && thinkingMessageDiv.parentNode === conversationDisplay.display) {
                thinkingMessageDiv.remove();
            }
            // Add error message to conversation display (but not to history for audio generation)
            conversationDisplay.appendMessage(senderName, `Error: ${error.message}`, model);
            state.isConversationActive = false; // Stop the loop on error
            window.slopcaster.conversation.updateUIAfterConversationEnd();
            return null; // Indicate failure
        }
    },
    
    /**
     * Send a request to the Pollinations API with streaming
     * @param {Array} messages - Message array to send
     * @param {string} model - Model identifier to use
     * @returns {AsyncIterator} - Stream iterator for responses
     */
    async sendToPollinations(messages, model) {
        const baseUrl = 'https://text.pollinations.ai/';
        const pollModel = model.replace('pollinations:', '');
        
        console.log('Formatted messages for Pollinations:', JSON.stringify(messages));
        
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: messages,
                model: pollModel,
                stream: true,
                private: true // Keep conversations private
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Pollinations API error (${response.status}): ${errorText}`);
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        return {
            async *[Symbol.asyncIterator]() {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) {
                            if (buffer.trim()) { // Process any remaining buffer
                                if (buffer.trim().startsWith('data:')) {
                                    try {
                                        const jsonData = JSON.parse(buffer.trim().slice(5));
                                        const text = window.slopcaster.llm.extractTextFromPollinationsChunk(jsonData);
                                        if (text) yield { text };
                                    } catch (e) { console.error('Error parsing final Pollinations chunk:', e, buffer); }
                                } else {
                                    console.warn("Final buffer part not a data chunk:", buffer);
                                }
                            }
                            break;
                        }
                        
                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split('\n');
                        buffer = lines.pop(); // Keep incomplete line
                        
                        for (const line of lines) {
                            if (line.trim().startsWith('data:')) {
                                try {
                                    const jsonData = JSON.parse(line.slice(5).trim());
                                    const text = window.slopcaster.llm.extractTextFromPollinationsChunk(jsonData);
                                    if (text) yield { text };
                                } catch (e) {
                                    console.warn('Error parsing Pollinations stream line:', e, line);
                                }
                            } else if (line.trim()) {
                                // console.log("Non-data line from Pollinations:", line); // Can be noisy
                            }
                        }
                    }
                } finally {
                    reader.releaseLock(); // Ensure reader lock is released
                }
            }
        };
    },
    
    /**
     * Extract text content from Pollinations response chunk
     * @param {Object} jsonData - The parsed JSON data chunk
     * @returns {string} - Extracted text content or empty string
     */
    extractTextFromPollinationsChunk(jsonData) {
        // Handle different possible structures based on observation/debugging
        if (jsonData?.choices?.[0]?.delta?.content) {
            return jsonData.choices[0].delta.content;
        }
        if (jsonData?.response) { // Some models might use this
            return jsonData.response;
        }
        if (typeof jsonData?.content === 'string') { // Direct content
            return jsonData.content;
        }
        // console.log("Unrecognized Pollinations chunk structure:", jsonData);
        return '';
    }
};
