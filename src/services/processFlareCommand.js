// START: processFlareCommand function
/**
 * Process single FLARE command — delegates to @flare/core isomorphic engine.
 */
import { executeFlareCommand, createContext } from '../../packages/core/dist/index.js';

const context = createContext();

export async function processFlareCommand(commandString) {
  console.log('🚀 Processing FLARE command:', commandString);
  
  try {
    const { result, modelResponses } = await executeFlareCommand(commandString, context);
    
    console.log('✅ FLARE command completed successfully');
    console.log(`   Models queried: ${modelResponses.map(r => r.model).join(', ')}`);
    console.log(`   Successful: ${modelResponses.filter(r => r.success).length}/${modelResponses.length}`);
    
    return result;
  } catch (error) {
    console.error('❌ FLARE command failed:', error.message);
    throw error;
  }
}
// END: processFlareCommand function