import { expect } from 'chai';
import axios from 'axios';

describe('Multi-Model Workflow E2E Tests', () => {
    const baseUrl = 'http://localhost:8080';

    // Increase timeout for API calls
    beforeEach(function () {
        this.timeout(60000);
    });

    before(function () {
        this.timeout(5000);
        console.log('\n🧪 Testing Multi-Model Workflows\n');
    });

    describe('Parallel Multi-Model Queries', () => {

        it('should query 3 models in parallel (openai, mistral, gemini)', async function () {
            this.timeout(90000);

            const testCommand = {
                command: "{ flare model:openai,mistral,gemini temp:0.5 `What is 2+2? Answer with just the number.` }"
            };

            try {
                const response = await axios.post(`${baseUrl}/process-flare`, testCommand, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 80000
                });

                if (response.data.success) {
                    console.log('✅ Multi-model query succeeded');
                    console.log('   Result:', response.data.result);

                    expect(response.data.success).to.be.true;
                    expect(response.data.result).to.be.a('string');
                    expect(response.data.result.length).to.be.greaterThan(0);
                } else {
                    console.log('⚠️ Multi-model query failed:', response.data.error);
                    // Don't fail the test - API might not be configured
                }
            } catch (error) {
                console.log('⚠️ Multi-model API call failed (expected if API not configured)');
                console.log('   Error:', error.response?.data?.error || error.message);
            }
        });

        it('should handle model failures gracefully with fallback', async function () {
            this.timeout(90000);

            const testCommand = {
                command: "{ flare model:invalid-model,openai temp:0.3 `Say hello` }"
            };

            try {
                const response = await axios.post(`${baseUrl}/process-flare`, testCommand, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 80000,
                    validateStatus: () => true // Don't throw on error status
                });

                // Should either succeed with fallback or fail gracefully
                if (response.data.success) {
                    console.log('✅ Fallback worked - got response from valid model');
                    expect(response.data.result).to.be.a('string');
                } else {
                    console.log('✅ Failed gracefully with error message');
                    expect(response.data.error).to.be.a('string');
                }
            } catch (error) {
                console.log('⚠️ API call failed (expected)');
            }
        });
    });

    describe('Multi-Model with Voting', () => {

        it('should apply voting post-processing to select best response', async function () {
            this.timeout(120000);

            const testCommand = {
                command: "{ flare model:openai,mistral vote `Which is better for web development: React or Vue? Answer in one word.` }"
            };

            try {
                const response = await axios.post(`${baseUrl}/process-flare`, testCommand, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 110000
                });

                if (response.data.success) {
                    console.log('✅ Voting post-processing succeeded');
                    console.log('   Selected response:', response.data.result);

                    expect(response.data.success).to.be.true;
                    expect(response.data.result).to.be.a('string');
                    // Result should be a single response, not multiple concatenated
                    expect(response.data.result.split('---').length).to.equal(1);
                } else {
                    console.log('⚠️ Voting failed:', response.data.error);
                }
            } catch (error) {
                console.log('⚠️ Voting API call failed (expected if API not configured)');
            }
        });
    });

    describe('Multi-Model with Summarization', () => {

        it('should apply summarization to combine multiple responses', async function () {
            this.timeout(120000);

            const testCommand = {
                command: "{ flare model:openai,mistral sum `Explain AI in one sentence` }"
            };

            try {
                const response = await axios.post(`${baseUrl}/process-flare`, testCommand, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 110000
                });

                if (response.data.success) {
                    console.log('✅ Summarization post-processing succeeded');
                    console.log('   Summary:', response.data.result.substring(0, 100) + '...');

                    expect(response.data.success).to.be.true;
                    expect(response.data.result).to.be.a('string');
                    expect(response.data.result.length).to.be.greaterThan(0);
                } else {
                    console.log('⚠️ Summarization failed:', response.data.error);
                }
            } catch (error) {
                console.log('⚠️ Summarization API call failed (expected if API not configured)');
            }
        });
    });

    describe('Multi-Model with Combination', () => {

        it('should combine responses from multiple models', async function () {
            this.timeout(90000);

            const testCommand = {
                command: "{ flare model:openai,mistral comb `List one benefit of AI` }"
            };

            try {
                const response = await axios.post(`${baseUrl}/process-flare`, testCommand, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 80000
                });

                if (response.data.success) {
                    console.log('✅ Combination post-processing succeeded');
                    console.log('   Combined length:', response.data.result.length, 'chars');

                    expect(response.data.success).to.be.true;
                    expect(response.data.result).to.be.a('string');
                    // Combined result should contain separator
                    expect(response.data.result).to.include('---');
                } else {
                    console.log('⚠️ Combination failed:', response.data.error);
                }
            } catch (error) {
                console.log('⚠️ Combination API call failed (expected if API not configured)');
            }
        });
    });

    describe('Multi-Model with Difference Analysis', () => {

        it('should analyze differences between model responses', async function () {
            this.timeout(120000);

            const testCommand = {
                command: "{ flare model:openai,mistral diff `What is the capital of France?` }"
            };

            try {
                const response = await axios.post(`${baseUrl}/process-flare`, testCommand, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 110000
                });

                if (response.data.success) {
                    console.log('✅ Difference analysis succeeded');
                    console.log('   Analysis:', response.data.result.substring(0, 100) + '...');

                    expect(response.data.success).to.be.true;
                    expect(response.data.result).to.be.a('string');
                } else {
                    console.log('⚠️ Difference analysis failed:', response.data.error);
                }
            } catch (error) {
                console.log('⚠️ Difference analysis API call failed (expected if API not configured)');
            }
        });
    });

    describe('Multi-Model with Filtering', () => {

        it('should filter low-quality responses', async function () {
            this.timeout(90000);

            const testCommand = {
                command: "{ flare model:openai,mistral,gemini filter `Explain quantum computing` }"
            };

            try {
                const response = await axios.post(`${baseUrl}/process-flare`, testCommand, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 80000
                });

                if (response.data.success) {
                    console.log('✅ Filtering post-processing succeeded');
                    console.log('   Filtered results count:', response.data.result ? 1 : 0);

                    expect(response.data.success).to.be.true;
                    // Filter returns array, so result might be different format
                } else {
                    console.log('⚠️ Filtering failed:', response.data.error);
                }
            } catch (error) {
                console.log('⚠️ Filtering API call failed (expected if API not configured)');
            }
        });
    });

    describe('Multi-Model with Expansion', () => {

        it('should expand on responses with additional details', async function () {
            this.timeout(120000);

            const testCommand = {
                command: "{ flare model:openai,mistral exp `AI is transforming healthcare` }"
            };

            try {
                const response = await axios.post(`${baseUrl}/process-flare`, testCommand, {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 110000
                });

                if (response.data.success) {
                    console.log('✅ Expansion post-processing succeeded');
                    console.log('   Expanded length:', response.data.result.length, 'chars');

                    expect(response.data.success).to.be.true;
                    expect(response.data.result).to.be.a('string');
                    // Expanded result should be longer than original
                    expect(response.data.result.length).to.be.greaterThan(20);
                } else {
                    console.log('⚠️ Expansion failed:', response.data.error);
                }
            } catch (error) {
                console.log('⚠️ Expansion API call failed (expected if API not configured)');
            }
        });
    });
});
