// START: processFlareResponse function
/**
 * Process text containing embedded FLARE commands
 * Extracts, processes, and replaces FLARE commands in text
 */
import { extractAndParseFlareCommands } from '../parser/extractAndParseFlareCommands.js';
import { replaceFlareCommandsInText } from '../parser/replaceFlareCommandsInText.js';
import { queryMultipleModels } from './queryMultipleModels.js';
import { applyPostProcessing } from './applyPostProcessing.js';

export async function processFlareResponse(responseText) {
  console.log('🔍 Processing text with embedded FLARE commands...');
  
  if (!responseText || typeof responseText !== 'string') {
    throw new Error('Invalid response text provided');
  }

  try {
    // Extract and parse all FLARE commands from the text
    const flareCommands = extractAndParseFlareCommands(responseText);
    
    if (flareCommands.length === 0) {
      console.log('ℹ️ No FLARE commands found in text');
      return responseText;
    }

    console.log(`📋 Found ${flareCommands.length} FLARE command(s) in text`);

    // Process all FLARE commands
    const commandResults = [];
    for (let i = 0; i < flareCommands.length; i++) {
      try {
        console.log(`🔄 Processing embedded command ${i + 1}/${flareCommands.length}`);
        
        // Query models for this command
        const modelResults = await queryMultipleModels(
          flareCommands[i].model,
          flareCommands[i].command,
          flareCommands[i].temp
        );

        // Apply post-processing if specified
        let result;
        if (flareCommands[i].postProcessing.length > 0) {
          result = await applyPostProcessing(
            modelResults,
            flareCommands[i].postProcessing,
            flareCommands[i]
          );
        } else {
          result = modelResults[0].response;
        }

        commandResults.push(result);
        console.log(`✅ Embedded command ${i + 1} completed`);

      } catch (error) {
        console.error(`❌ Embedded command ${i + 1} failed:`, error.message);
        commandResults.push(`[Error processing FLARE command: ${error.message}]`);
      }
    }

    // Replace FLARE commands in the original text with their results
    const processedText = replaceFlareCommandsInText(responseText, commandResults);
    
    console.log('✅ Text processing completed');
    return processedText;

  } catch (error) {
    console.error('❌ Text processing failed:', error.message);
    throw error;
  }
}
// END: processFlareResponse function