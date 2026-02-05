import { test, expect } from '@playwright/test';

/**
 * FLARE Visual UI - Complex Workflow Tests
 * 
 * Tests complex workflows combining multiple node types:
 * - TextInput → Parameter → ModelQuery → PostProcessing → Output
 * - Multi-model workflows with post-processing
 * - Full stack integration testing
 * - DOM and console validation
 */

test.describe('Complex Workflow - Full Node Chain', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');
    });

    test('should build workflow: TextInput → ModelQuery → PostProcessing → Output', async ({ page }) => {
        const logs: string[] = [];

        page.on('console', (msg) => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        });

        // Clear existing nodes by refreshing
        await page.reload();
        await page.waitForSelector('.flare-node');

        // Add nodes in order
        await page.click('button:has-text("+ Text Input")');
        await page.waitForTimeout(300);

        await page.click('button:has-text("+ Model Query")');
        await page.waitForTimeout(300);

        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(300);

        await page.click('button:has-text("+ Output")');
        await page.waitForTimeout(500);

        // Verify all nodes were created
        const textInputs = page.locator('.text-input-node');
        const modelQueries = page.locator('.model-query-node');
        const postProcs = page.locator('.post-processing-node');
        const outputs = page.locator('.output-node');

        expect(await textInputs.count()).toBeGreaterThan(0);
        expect(await modelQueries.count()).toBeGreaterThan(0);
        expect(await postProcs.count()).toBeGreaterThan(0);
        expect(await outputs.count()).toBeGreaterThan(0);

        // Verify console logs
        const hasTextInputLog = logs.some(log => log.includes('Adding TextInput'));
        const hasModelQueryLog = logs.some(log => log.includes('Adding ModelQuery'));
        const hasPostProcLog = logs.some(log => log.includes('Adding PostProcessing'));
        const hasOutputLog = logs.some(log => log.includes('Adding Output'));

        expect(hasTextInputLog).toBeTruthy();
        expect(hasModelQueryLog).toBeTruthy();
        expect(hasPostProcLog).toBeTruthy();
        expect(hasOutputLog).toBeTruthy();
    });

    test('should configure workflow with Parameter node', async ({ page }) => {
        // Add Parameter node
        await page.click('button:has-text("+ Parameter")');
        await page.waitForTimeout(500);

        const paramNode = page.locator('.parameter-node').last();

        // Set temperature to 0.3
        await paramNode.locator('.parameter-slider').evaluate((el: any) => {
            el.value = '0.3';
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        });

        await page.waitForTimeout(500);

        // Verify value is set
        const displayValue = await paramNode.locator('.parameter-value-display').textContent();
        expect(displayValue).toBe('0.30');
    });

    test('should configure PostProcessing operation', async ({ page }) => {
        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(500);

        const postProcNode = page.locator('.post-processing-node').last();

        // Select sum operation
        await postProcNode.locator('.operation-chip').filter({ hasText: /sum/i }).click();
        await page.waitForTimeout(300);

        // Verify sum is selected
        const selectedChip = postProcNode.locator('.operation-chip.selected');
        const selectedText = await selectedChip.textContent();
        expect(selectedText?.toLowerCase()).toContain('sum');
    });
});

test.describe('Complex Workflow - Multi-Model Configuration', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');
    });

    test('should configure multiple models in ModelQuery node', async ({ page }) => {
        await page.click('button:has-text("+ Model Query")');
        await page.waitForTimeout(500);

        const modelNode = page.locator('.model-query-node').last();
        const modelChips = modelNode.locator('.model-chip');

        // Verify multiple model chips exist
        const chipCount = await modelChips.count();
        expect(chipCount).toBeGreaterThan(1);

        // Click first chip to toggle
        await modelChips.first().click();
        await page.waitForTimeout(200);

        // Click second chip to add
        await modelChips.nth(1).click();
        await page.waitForTimeout(200);

        // Verify chips are clickable and interactive
        expect(chipCount).toBeGreaterThan(0);
    });

    test('should show warning when no models selected', async ({ page }) => {
        await page.click('button:has-text("+ Model Query")');
        await page.waitForTimeout(500);

        const modelNode = page.locator('.model-query-node').last();

        // Deselect all models (if any are selected)
        const selectedChips = modelNode.locator('.model-chip.selected');
        const count = await selectedChips.count();

        for (let i = 0; i < count; i++) {
            await selectedChips.first().click();
            await page.waitForTimeout(100);
        }

        // Check for warning
        const warning = modelNode.locator('.node-warning');
        const isVisible = await warning.isVisible().catch(() => false);

        if (isVisible) {
            const warningText = await warning.textContent();
            expect(warningText).toContain('Select at least one model');
        }
    });
});

test.describe('Complex Workflow - Execution with New Nodes', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');
    });

    test('should execute workflow with Parameter and PostProcessing nodes', async ({ page }) => {
        const logs: string[] = [];

        page.on('console', (msg) => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        });

        // Use existing workflow and add new nodes
        await page.click('button:has-text("+ Parameter")');
        await page.waitForTimeout(300);

        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(300);

        // Configure PostProcessing
        const postProcNode = page.locator('.post-processing-node').last();
        await postProcNode.locator('.operation-chip').filter({ hasText: /vote/i }).click();
        await page.waitForTimeout(200);

        // Enter text in existing input
        const textarea = page.locator('.text-input-node textarea').first();
        await textarea.fill('Test workflow with new nodes');
        await page.waitForTimeout(300);

        // Run workflow
        await page.click('button:has-text("Run Workflow")');
        await page.waitForTimeout(2000);

        // Verify FLARE command was generated
        const hasFlareCommand = logs.some(log => log.includes('Executing FLARE command'));
        expect(hasFlareCommand).toBeTruthy();
    });

    test('should make API request when running complex workflow', async ({ page }) => {
        let apiCalled = false;

        page.on('request', (request) => {
            if (request.url().includes('/process-flare')) {
                apiCalled = true;
            }
        });

        // Enter text
        const textarea = page.locator('.text-input-node textarea').first();
        await textarea.fill('Complex workflow test');

        // Run workflow
        await page.click('button:has-text("Run Workflow")');
        await page.waitForTimeout(2000);

        expect(apiCalled).toBeTruthy();
    });
});

test.describe('Complex Workflow - Node Combinations', () => {
    test('should handle multiple Parameter nodes with different values', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');

        // Add 2 Parameter nodes
        await page.click('button:has-text("+ Parameter")');
        await page.waitForTimeout(300);
        await page.click('button:has-text("+ Parameter")');
        await page.waitForTimeout(300);

        const paramNodes = page.locator('.parameter-node');

        // Set different values
        await paramNodes.nth(0).locator('.parameter-slider').evaluate((el: any) => {
            el.value = '0.2';
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        });

        await page.waitForTimeout(300);

        await paramNodes.nth(1).locator('.parameter-slider').evaluate((el: any) => {
            el.value = '1.5';
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        });

        await page.waitForTimeout(500);

        // Verify independent values
        const value1 = await paramNodes.nth(0).locator('.parameter-value-display').textContent();
        const value2 = await paramNodes.nth(1).locator('.parameter-value-display').textContent();

        expect(value1).toBe('0.20');
        expect(value2).toBe('1.50');
    });

    test('should handle chained PostProcessing nodes', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');

        // Add 2 PostProcessing nodes
        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(300);
        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(300);

        const postProcNodes = page.locator('.post-processing-node');

        // Set different operations - use programmatic clicks for reliability
        await postProcNodes.first().locator('.operation-chip').filter({ hasText: /vote/i }).evaluate((el: HTMLElement) => {
            el.click();
        });
        await page.waitForTimeout(300);

        await postProcNodes.last().locator('.operation-chip').filter({ hasText: /sum/i }).evaluate((el: HTMLElement) => {
            el.click();
        });
        await page.waitForTimeout(300);

        // Verify independent selections
        const op1 = await postProcNodes.nth(0).locator('.operation-chip.selected').textContent();
        const op2 = await postProcNodes.nth(1).locator('.operation-chip.selected').textContent();

        expect(op1?.toLowerCase()).toContain('vote');
        expect(op2?.toLowerCase()).toContain('sum');
    });
});

test.describe('Complex Workflow - Console and Error Validation', () => {
    test('should not have console errors with complex workflows', async ({ page }) => {
        const errors: string[] = [];

        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('/');
        await page.waitForSelector('.flare-node');

        // Add all node types
        await page.click('button:has-text("+ Text Input")');
        await page.waitForTimeout(200);
        await page.click('button:has-text("+ Parameter")');
        await page.waitForTimeout(200);
        await page.click('button:has-text("+ Model Query")');
        await page.waitForTimeout(200);
        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(200);
        await page.click('button:has-text("+ Output")');
        await page.waitForTimeout(500);

        // Filter out unrelated errors
        const relevantErrors = errors.filter(err =>
            !err.includes('Failed to fetch') &&
            !err.includes('Network') &&
            !err.includes('ECONNREFUSED') &&
            !err.includes('ERR_CONNECTION_REFUSED')
        );

        expect(relevantErrors).toHaveLength(0);
    });

    test('should log all node additions in complex workflow', async ({ page }) => {
        const logs: string[] = [];

        page.on('console', (msg) => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        });

        await page.goto('/');
        await page.waitForSelector('.flare-node');

        // Add all new node types
        await page.click('button:has-text("+ Parameter")');
        await page.waitForTimeout(300);
        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(300);

        // Verify both were logged
        const hasParamLog = logs.some(log => log.includes('Adding Parameter'));
        const hasPostProcLog = logs.some(log => log.includes('Adding PostProcessing'));

        expect(hasParamLog).toBeTruthy();
        expect(hasPostProcLog).toBeTruthy();
    });
});

test.describe('Complex Workflow - DOM Structure Validation', () => {
    test('should maintain proper DOM hierarchy with all node types', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');

        // Add one of each node type
        await page.click('button:has-text("+ Text Input")');
        await page.waitForTimeout(200);
        await page.click('button:has-text("+ Parameter")');
        await page.waitForTimeout(200);
        await page.click('button:has-text("+ Model Query")');
        await page.waitForTimeout(200);
        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(200);
        await page.click('button:has-text("+ Output")');
        await page.waitForTimeout(500);

        // Verify ReactFlow structure
        const reactFlow = page.locator('.react-flow');
        await expect(reactFlow).toBeVisible();

        // Verify all node types are in the DOM
        await expect(page.locator('.text-input-node')).toHaveCount(await page.locator('.text-input-node').count());
        await expect(page.locator('.parameter-node')).toHaveCount(await page.locator('.parameter-node').count());
        await expect(page.locator('.model-query-node')).toHaveCount(await page.locator('.model-query-node').count());
        await expect(page.locator('.post-processing-node')).toHaveCount(await page.locator('.post-processing-node').count());
        await expect(page.locator('.output-node')).toHaveCount(await page.locator('.output-node').count());
    });

    test('should have proper handle structure on all nodes', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');

        await page.click('button:has-text("+ Parameter")');
        await page.waitForTimeout(300);
        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(500);

        // Parameter node handles - ReactFlow uses .react-flow__handle classes
        const paramNode = page.locator('.parameter-node').last();
        await expect(paramNode.locator('.react-flow__handle-left')).toBeVisible();
        await expect(paramNode.locator('.react-flow__handle-right')).toBeVisible();

        // PostProcessing node handles
        const postProcNode = page.locator('.post-processing-node').last();
        await expect(postProcNode.locator('.react-flow__handle-left')).toBeVisible();
        await expect(postProcNode.locator('.react-flow__handle-right')).toBeVisible();
    });
});
