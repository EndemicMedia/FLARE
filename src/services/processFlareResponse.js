// START: processFlareResponse function
/**
 * Process text containing embedded FLARE commands.
 * Delegates to @flare/core for parsing, execution, and text replacement.
 */
import {
  extractAndParseFlareCommands,
  replaceFlareCommandsInText,
  createContext,
  queryMultipleModels,
  applyPostProcessing,
} from '../../packages/core/dist/index.js';

const context = createContext();

export async function processFlareResponse(responseText) {
  console.log('🔍 Processing text with embedded FLARE commands...');
  
  if (!responseText || typeof responseText !== 'string') {
    throw new Error('Invalid response text provided');
  }

  try {
    const flareCommands = extractAndParseFlareCommands(responseText);
    
    if (flareCommands.length === 0) {
      console.log('ℹ️ No FLARE commands found in text');
      return responseText;
    }

    console.log(`📋 Found ${flareCommands.length} FLARE command(s) in text`);

    const commandResults = [];
    for (let i = 0; i < flareCommands.length; i++) {
      try {
        console.log(`🔄 Processing embedded command ${i + 1}/${flareCommands.length}`);
        
        const modelResults = await queryMultipleModels(
          flareCommands[i].model,
          flareCommands[i].command,
          flareCommands[i].temp,
          context
        );

        let result;
        if (flareCommands[i].postProcessing.length > 0) {
          result = await applyPostProcessing(
            modelResults,
            flareCommands[i].postProcessing,
            flareCommands[i],
            context
          );
        } else {
          const successful = modelResults.find(r => r.success);
          result = successful ? successful.response : '[No successful model response]';
        }

        commandResults.push(result);
        console.log(`✅ Embedded command ${i + 1} completed`);

      } catch (error) {
        console.error(`❌ Embedded command ${i + 1} failed:`, error.message);
        commandResults.push(`[Error processing FLARE command: ${error.message}]`);
      }
    }

    const processedText = replaceFlareCommandsInText(responseText, commandResults);
    
    console.log('✅ Text processing completed');
    return processedText;

  } catch (error) {
    console.error('❌ Text processing failed:', error.message);
    throw error;
  }
}
// END: processFlareResponse function