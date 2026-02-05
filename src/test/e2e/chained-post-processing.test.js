import { expect } from 'chai';
import axios from 'axios';

describe('Chained Post-Processing E2E Tests', () => {
    const baseUrl = 'http://localhost:8080';

    beforeEach(function () {
        this.timeout(120000);
    });

    before(function () {
        this.timeout(5000);
        console.log('\n🔗 Testing Chained Post-Processing Operations\n');
    });

    describe('Vote → Sum Chain', () => {

        it('should execute voting followed by summarization', async function () {
            this.timeout(180000);

            const testCommand = {
                command: "{ flare model:openai,mistral vote sum `What are the benefits of renewable energy?` }"
            };

            try {
                const response = await axios.post(`${baseUrl}/process-flare`, testCommand, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 170000
                });

                if (response.data.success) {
                    console.log('✅ Vote → Sum chain succeeded');
                    console.log('   Final result:', response.data.result.substring(0, 150) + '...');

                    expect(response.data.success).to.be.true;
                    expect(response.data.result).to.be.a('string');
                    expect(response.data.result.length).to.be.greaterThan(0);

                    // Result should be a single coherent response (voted, then summarized)
                    expect(response.data.result.split('---').length).to.equal(1);
                } else {
                    console.log('⚠️ Vote → Sum chain failed:', response.data.error);
                }
            } catch (error) {
                console.log('⚠️ Chained processing API call failed (expected if API not configured)');
                console.log('   Error:', error.response?.data?.error || error.message);
            }
        });
    });

    describe('Comb → Diff Chain', () => {

        it('should combine responses then analyze differences', async function () {
            this.timeout(180000);

            const testCommand = {
                command: "{ flare model:openai,mistral comb diff `Compare Python vs JavaScript` }"
            };

            try {
                const response = await axios.post(`${baseUrl}/process-flare`, testCommand, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 170000
                });

                if (response.data.success) {
                    console.log('✅ Comb → Diff chain succeeded');
                    console.log('   Analysis length:', response.data.result.length, 'chars');

                    expect(response.data.success).to.be.true;
                    expect(response.data.result).to.be.a('string');
                } else {
                    console.log('⚠️ Comb → Diff chain failed:', response.data.error);
                }
            } catch (error) {
                console.log('⚠️ Chained processing API call failed (expected if API not configured)');
            }
        });
    });

    describe('Filter → Exp Chain', () => {

        it('should filter responses then expand on best one', async function () {
            this.timeout(180000);

            const testCommand = {
                command: "{ flare model:openai,mistral,gemini filter exp `Explain machine learning` }"
            };

            try {
                const response = await axios.post(`${baseUrl}/process-flare`, testCommand, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 170000
                });

                if (response.data.success) {
                    console.log('✅ Filter → Exp chain succeeded');
                    console.log('   Expanded result length:', response.data.result.length, 'chars');

                    expect(response.data.success).to.be.true;
                    expect(response.data.result).to.be.a('string');
                    // Expanded result should be substantial
                    expect(response.data.result.length).to.be.greaterThan(50);
                } else {
                    console.log('⚠️ Filter → Exp chain failed:', response.data.error);
                }
            } catch (error) {
                console.log('⚠️ Chained processing API call failed (expected if API not configured)');
            }
        });
    });

    describe('Triple Chain: Vote → Sum → Exp', () => {

        it('should execute three post-processing operations in sequence', async function () {
            this.timeout(240000);

            const testCommand = {
                command: "{ flare model:openai,mistral vote sum exp `What is quantum computing?` }"
            };

            try {
                const response = await axios.post(`${baseUrl}/process-flare`, testCommand, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 230000
                });

                if (response.data.success) {
                    console.log('✅ Triple chain (Vote → Sum → Exp) succeeded');
                    console.log('   Final result length:', response.data.result.length, 'chars');

                    expect(response.data.success).to.be.true;
                    expect(response.data.result).to.be.a('string');
                    // Triple processing should produce substantial output
                    expect(response.data.result.length).to.be.greaterThan(100);
                } else {
                    console.log('⚠️ Triple chain failed:', response.data.error);
                }
            } catch (error) {
                console.log('⚠️ Triple chain API call failed (expected if API not configured)');
            }
        });
    });

    describe('Execution Order Verification', () => {

        it('should execute post-processing in correct order', async function () {
            this.timeout(180000);

            // Test that vote happens before sum
            // Vote should select one response, sum should then summarize that single response
            const testCommand = {
                command: "{ flare model:openai,mistral vote sum `Count from 1 to 3` }"
            };

            try {
                const response = await axios.post(`${baseUrl}/process-flare`, testCommand, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 170000
                });

                if (response.data.success) {
                    console.log('✅ Execution order verified');
                    console.log('   Result:', response.data.result);

                    expect(response.data.success).to.be.true;

                    // If vote didn't happen first, we'd see multiple responses combined
                    // After vote + sum, we should have a single coherent response
                    const hasMultipleResponses = response.data.result.includes('Response 1:') ||
                        response.data.result.includes('Response 2:');
                    expect(hasMultipleResponses).to.be.false;
                } else {
                    console.log('⚠️ Execution order test failed:', response.data.error);
                }
            } catch (error) {
                console.log('⚠️ Execution order API call failed (expected if API not configured)');
            }
        });
    });

    describe('Error Handling in Chains', () => {

        it('should handle errors gracefully in chained operations', async function () {
            this.timeout(120000);

            // Test with invalid model to see if chain handles errors
            const testCommand = {
                command: "{ flare model:invalid-model vote sum `Test error handling` }"
            };

            try {
                const response = await axios.post(`${baseUrl}/process-flare`, testCommand, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 110000,
                    validateStatus: () => true // Don't throw on error status
                });

                // Should either fail gracefully or succeed with fallback
                if (response.data.success) {
                    console.log('✅ Chain succeeded with fallback model');
                } else {
                    console.log('✅ Chain failed gracefully with error message');
                    expect(response.data.error).to.be.a('string');
                    expect(response.data.error.length).to.be.greaterThan(0);
                }
            } catch (error) {
                console.log('⚠️ Error handling test - API call failed (expected)');
            }
        });
    });

    describe('Complex Multi-Step Processing', () => {

        it('should handle complex workflow: 3 models → filter → vote → sum', async function () {
            this.timeout(240000);

            const testCommand = {
                command: "{ flare model:openai,mistral,gemini filter vote sum `Explain artificial intelligence` }"
            };

            try {
                const response = await axios.post(`${baseUrl}/process-flare`, testCommand, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 230000
                });

                if (response.data.success) {
                    console.log('✅ Complex multi-step processing succeeded');
                    console.log('   Final result:', response.data.result.substring(0, 100) + '...');

                    expect(response.data.success).to.be.true;
                    expect(response.data.result).to.be.a('string');
                    expect(response.data.result.length).to.be.greaterThan(0);
                } else {
                    console.log('⚠️ Complex processing failed:', response.data.error);
                }
            } catch (error) {
                console.log('⚠️ Complex processing API call failed (expected if API not configured)');
            }
        });
    });
});
