// START: replaceFlareCommandsInText function
/**
 * Replace FLARE commands in text with their results
 * Returns text with commands replaced by results
 */
import { extractFlareCommands } from './extractFlareCommands.js';

export function replaceFlareCommandsInText(originalText, commandResults) {
  if (!originalText || typeof originalText !== 'string') {
    return originalText;
  }
  
  if (!Array.isArray(commandResults) || commandResults.length === 0) {
    return originalText;
  }
  
  let processedText = originalText;
  const commandStrings = extractFlareCommands(originalText);
  
  // Replace commands in reverse order to maintain indices
  for (let i = commandStrings.length - 1; i >= 0; i--) {
    if (commandResults[i] !== undefined) {
      const result = typeof commandResults[i] === 'string' 
        ? commandResults[i] 
        : String(commandResults[i] || '');
      
      // Find and replace the specific command occurrence
      const commandText = commandStrings[i];
      const escapedCommand = commandText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedCommand, 'g');
      
      let replacementCount = 0;
      processedText = processedText.replace(regex, (match) => {
        replacementCount++;
        // Only replace the occurrence that matches our index
        return replacementCount === 1 ? result : match;
      });
    }
  }
  
  return processedText;
}
// END: replaceFlareCommandsInText function