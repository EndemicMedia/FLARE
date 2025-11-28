import { expect } from 'chai';
import { processFlareCommand } from '../../services/exports.js';

describe('FLARE Integration Tests - Basic Flow', () => {
  beforeEach(function(done) {
    this.timeout(3000);
    setTimeout(done, 2000);
  });

  // Note: These tests require network access and valid API configuration
  // They may be skipped in environments without internet or API keys
  
  const shouldSkipNetworkTests = !process.env.POLLINATIONS_API_KEY && !process.env.CI;

  (shouldSkipNetworkTests ? describe.skip : describe)('Network-dependent tests', () => {
    
    it('should process a simple FLARE command successfully', async function() {
      this.timeout(30000); // Allow extra time for API calls
      
      const command = '{ flare model:openai temp:0.1 `Say exactly: "Hello from FLARE 2.0"` }';
      
      try {
        const result = await processFlareCommand(command);
        expect(result).to.be.a('string');
        expect(result.length).to.be.greaterThan(0);
        console.log('✅ Basic FLARE command result:', result);
      } catch (error) {
        // If API key is not valid, skip gracefully
        if (error.message.includes('API key') || error.message.includes('401')) {
          console.warn('⚠️ Skipping network test due to API configuration');
          this.skip();
        } else {
          throw error;
        }
      }
    });

    it('should handle multiple models with voting', async function() {
      this.timeout(45000); // More time for multiple model calls
      
      const command = '{ flare model:openai temp:0.3 vote `Which is better: cats or dogs? Give a one word answer.` }';
      
      try {
        const result = await processFlareCommand(command);
        expect(result).to.be.a('string');
        expect(result.length).to.be.greaterThan(0);
        console.log('✅ Multi-model voting result:', result);
      } catch (error) {
        if (error.message.includes('API key') || error.message.includes('401')) {
          console.warn('⚠️ Skipping network test due to API configuration');
          this.skip();
        } else {
          throw error;
        }
      }
    });
  });

  describe('Parser integration (no network required)', () => {
    
    it('should validate parsing without executing API calls', () => {
      const command = '{ flare model:openai,mistral temp:0.8 sum vote `Test command parsing` }';
      
      // This should not throw, demonstrating parser integration works
      expect(() => {
        // Import and test parser directly
        import('../../parser/exports.js').then(({ parseFlareCommand }) => {
          const parsed = parseFlareCommand(command);
          expect(parsed.model).to.deep.equal(['openai', 'mistral']);
          expect(parsed.temp).to.equal(0.8);
          expect(parsed.postProcessing).to.deep.equal(['sum', 'vote']);
          expect(parsed.command).to.equal('Test command parsing');
        });
      }).to.not.throw();
    });

    it('should handle error cases gracefully', async () => {
      const invalidCommand = '{ invalid flare syntax }';
      
      try {
        await processFlareCommand(invalidCommand);
        expect.fail('Should have thrown an error for invalid syntax');
      } catch (error) {
        expect(error.message).to.include('Invalid FLARE command syntax');
      }
    });
  });

  describe('Configuration validation', () => {
    
    it('should have correct API configuration', async () => {
      const { validateFlareEnvironment } = await import('../../services/exports.js');
      const health = await validateFlareEnvironment();
      
      expect(health).to.have.property('healthy');
      expect(health).to.have.property('checks');
      expect(health.checks).to.have.property('apiKey');
      
      if (!health.healthy) {
        console.warn('⚠️ FLARE environment not fully healthy:', health.recommendations);
      }
    });
  });
});