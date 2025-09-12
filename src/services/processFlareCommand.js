// START: processFlareCommand function
/**
 * Process single FLARE command
 * Main orchestration function for parsing, querying, and post-processing
 */
import { parseFlareCommand } from '../parser/parseFlareCommand.js';
import { queryMultipleModels } from './queryMultipleModels.js';
import { validateModelQuery } from './validateModelQuery.js';
import { applyPostProcessing } from './applyPostProcessing.js';

export async function processFlareCommand(commandString) {
  console.log('🚀 Processing FLARE command:', commandString);
  
  try {
    // Parse the FLARE command
    const parsedCommand = parseFlareCommand(commandString);
    console.log('✅ Parsed command:', {
      models: parsedCommand.model,
      temperature: parsedCommand.temp,
      postProcessing: parsedCommand.postProcessing,
      promptLength: parsedCommand.command.length
    });

    // Validate the parsed command
    validateModelQuery({
      modelName: parsedCommand.model[0],
      temp: parsedCommand.temp,
      prompt: parsedCommand.command
    });

    // Query all specified models
    console.log(`🔄 Querying ${parsedCommand.model.length} model(s)...`);
    const modelResults = await queryMultipleModels(
      parsedCommand.model,
      parsedCommand.command,
      parsedCommand.temp
    );

    // Apply post-processing if specified
    let finalResult;
    if (parsedCommand.postProcessing.length > 0) {
      console.log('🔧 Applying post-processing...');
      finalResult = await applyPostProcessing(
        modelResults,
        parsedCommand.postProcessing,
        parsedCommand
      );
    } else {
      // No post-processing, return the first successful result
      finalResult = modelResults[0].response;
    }

    console.log('✅ FLARE command completed successfully');
    return finalResult;

  } catch (error) {
    console.error('❌ FLARE command failed:', error.message);
    throw error;
  }
}
// END: processFlareCommand function