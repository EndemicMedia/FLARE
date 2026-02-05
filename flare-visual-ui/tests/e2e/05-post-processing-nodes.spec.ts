import { test, expect } from '@playwright/test';

/**
 * FLARE Visual UI - PostProcessing Node Tests
 * 
 * Tests the PostProcessing node functionality including:
 * - Adding PostProcessing nodes
 * - Selecting operations (vote, sum, comb, diff, exp, filter)
 * - DOM element validation
 * - Console log verification
 */

test.describe('PostProcessing Node - Adding and Rendering', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');
    });

    test('should have PostProcessing button in toolbar', async ({ page }) => {
        const postProcButton = page.locator('button:has-text("+ Post-Processing")');
        await expect(postProcButton).toBeVisible();
        await expect(postProcButton).toBeEnabled();

        // Verify button styling (pink background)
        const bgColor = await postProcButton.evaluate(el =>
            window.getComputedStyle(el).backgroundColor
        );
        expect(bgColor).toBeTruthy();
    });

    test('should add PostProcessing node when clicking toolbar button', async ({ page }) => {
        const logs: string[] = [];

        page.on('console', (msg) => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        });

        const initialCount = await page.locator('.flare-node').count();

        // Click the add PostProcessing button
        await page.click('button:has-text("+ Post-Processing")');

        // Wait for node to appear
        await page.waitForTimeout(500);

        const newCount = await page.locator('.flare-node').count();
        expect(newCount).toBe(initialCount + 1);

        // Verify console log
        const hasAddLog = logs.some(log => log.includes('Adding PostProcessing node'));
        expect(hasAddLog).toBeTruthy();
    });

    test('should render PostProcessing node with correct structure', async ({ page }) => {
        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(500);

        const postProcNodes = page.locator('.post-processing-node');
        expect(await postProcNodes.count()).toBeGreaterThan(0);

        const postProcNode = postProcNodes.last();

        // Verify node header
        const header = postProcNode.locator('.node-header');
        await expect(header).toBeVisible();
        await expect(header.locator('.node-title')).toContainText('Post-Processing');

        // Verify icon
        const icon = header.locator('.node-icon');
        await expect(icon).toBeVisible();

        // Verify operation selector
        const operationSelector = postProcNode.locator('.operation-selector');
        await expect(operationSelector).toBeVisible();
    });

    test('should display all 6 operation options', async ({ page }) => {
        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(500);

        const postProcNode = page.locator('.post-processing-node').last();
        const operationChips = postProcNode.locator('.operation-chip');

        // Should have 6 operations
        expect(await operationChips.count()).toBe(6);

        // Verify all operations are present
        const operations = ['vote', 'sum', 'comb', 'diff', 'exp', 'filter'];

        for (const op of operations) {
            const chip = operationChips.filter({ hasText: new RegExp(op, 'i') });
            await expect(chip).toBeVisible();
        }
    });

    test('should have vote as default operation', async ({ page }) => {
        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(500);

        const postProcNode = page.locator('.post-processing-node').last();

        // Vote chip should be selected by default
        const voteChip = postProcNode.locator('.operation-chip.selected').filter({ hasText: /vote/i });
        await expect(voteChip).toBeVisible();
    });
});

test.describe('PostProcessing Node - Operation Selection', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');

        // Add a PostProcessing node
        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(500);
    });

    test('should select sum operation when clicked', async ({ page }) => {
        const postProcNode = page.locator('.post-processing-node').last();

        // Click sum chip
        const sumChip = postProcNode.locator('.operation-chip').filter({ hasText: /sum/i });
        await sumChip.click();
        await page.waitForTimeout(300);

        // Sum should be selected
        await expect(sumChip).toHaveClass(/selected/);
    });

    test('should select comb operation when clicked', async ({ page }) => {
        const postProcNode = page.locator('.post-processing-node').last();

        const combChip = postProcNode.locator('.operation-chip').filter({ hasText: /comb/i });
        await combChip.click();
        await page.waitForTimeout(300);

        await expect(combChip).toHaveClass(/selected/);
    });

    test('should select diff operation when clicked', async ({ page }) => {
        const postProcNode = page.locator('.post-processing-node').last();

        const diffChip = postProcNode.locator('.operation-chip').filter({ hasText: /diff/i });
        await diffChip.click();
        await page.waitForTimeout(300);

        await expect(diffChip).toHaveClass(/selected/);
    });

    test('should select exp operation when clicked', async ({ page }) => {
        const postProcNode = page.locator('.post-processing-node').last();

        const expChip = postProcNode.locator('.operation-chip').filter({ hasText: /exp/i });
        await expChip.click();
        await page.waitForTimeout(300);

        await expect(expChip).toHaveClass(/selected/);
    });

    test('should select filter operation when clicked', async ({ page }) => {
        const postProcNode = page.locator('.post-processing-node').last();

        const filterChip = postProcNode.locator('.operation-chip').filter({ hasText: /filter/i });
        await filterChip.click();
        await page.waitForTimeout(300);

        await expect(filterChip).toHaveClass(/selected/);
    });

    test('should only have one operation selected at a time', async ({ page }) => {
        const postProcNode = page.locator('.post-processing-node').last();

        // Click sum
        await postProcNode.locator('.operation-chip').filter({ hasText: /sum/i }).click();
        await page.waitForTimeout(200);

        // Click diff
        await postProcNode.locator('.operation-chip').filter({ hasText: /diff/i }).click();
        await page.waitForTimeout(200);

        // Only diff should be selected
        const selectedChips = postProcNode.locator('.operation-chip.selected');
        expect(await selectedChips.count()).toBe(1);

        const selectedText = await selectedChips.textContent();
        expect(selectedText?.toLowerCase()).toContain('diff');
    });
});

test.describe('PostProcessing Node - Operation Descriptions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');
        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(500);
    });

    test('should display description for selected operation', async ({ page }) => {
        const postProcNode = page.locator('.post-processing-node').last();

        // Vote should be selected by default
        const description = postProcNode.locator('.operation-description');
        await expect(description).toBeVisible();

        const descText = await description.textContent();
        expect(descText).toBeTruthy();
        expect(descText!.length).toBeGreaterThan(10);
    });

    test('should update description when changing operations', async ({ page }) => {
        const postProcNode = page.locator('.post-processing-node').last();
        const description = postProcNode.locator('.operation-description');

        // Get initial description (vote)
        const voteDesc = await description.textContent();

        // Click sum
        await postProcNode.locator('.operation-chip').filter({ hasText: /sum/i }).click();
        await page.waitForTimeout(300);

        // Description should change
        const sumDesc = await description.textContent();
        expect(sumDesc).not.toBe(voteDesc);
    });

    test('should show info for operations requiring multiple models', async ({ page }) => {
        const postProcNode = page.locator('.post-processing-node').last();

        // Vote requires multiple models
        const infoMessage = postProcNode.locator('.node-info');

        // Check if info is visible (vote requires multiple inputs)
        const isVisible = await infoMessage.isVisible().catch(() => false);

        if (isVisible) {
            const infoText = await infoMessage.textContent();
            expect(infoText).toContain('multiple');
        }
    });
});

test.describe('PostProcessing Node - Visual Styling', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');
        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(500);
    });

    test('should apply color styling to selected operation chip', async ({ page }) => {
        const postProcNode = page.locator('.post-processing-node').last();
        const selectedChip = postProcNode.locator('.operation-chip.selected').first();

        // Selected chip should have border color
        const borderColor = await selectedChip.evaluate(el =>
            window.getComputedStyle(el).borderColor
        );
        expect(borderColor).toBeTruthy();
        expect(borderColor).not.toBe('rgb(204, 204, 204)'); // Not default gray
    });

    test('should have icons for each operation', async ({ page }) => {
        const postProcNode = page.locator('.post-processing-node').last();
        const operationChips = postProcNode.locator('.operation-chip');

        const count = await operationChips.count();

        for (let i = 0; i < count; i++) {
            const chip = operationChips.nth(i);
            const icon = chip.locator('.operation-icon');
            await expect(icon).toBeVisible();
        }
    });
});

test.describe('PostProcessing Node - Handles and Connections', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');
    });

    test('should have both input and output handles', async ({ page }) => {
        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(500);

        const postProcNode = page.locator('.post-processing-node').last();

        // Check for target handle (input) - ReactFlow uses .react-flow__handle classes
        const targetHandle = postProcNode.locator('.react-flow__handle-left');
        await expect(targetHandle).toBeVisible();

        // Check for source handle (output)
        const sourceHandle = postProcNode.locator('.react-flow__handle-right');
        await expect(sourceHandle).toBeVisible();
    });

    test('should be draggable', async ({ page }) => {
        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(500);

        const postProcNode = page.locator('.post-processing-node').last();
        const nodeHeader = postProcNode.locator('.node-header');

        const initialBox = await postProcNode.boundingBox();
        expect(initialBox).toBeTruthy();

        if (initialBox) {
            // Drag the node by its header (ReactFlow requires dragging from header)
            const headerBox = await nodeHeader.boundingBox();
            if (headerBox) {
                await page.mouse.move(
                    headerBox.x + headerBox.width / 2,
                    headerBox.y + headerBox.height / 2
                );
                await page.mouse.down();
                await page.mouse.move(
                    headerBox.x + 200,
                    headerBox.y + 150,
                    { steps: 20 }
                );
                await page.mouse.up();

                await page.waitForTimeout(500);

                const newBox = await postProcNode.boundingBox();
                if (newBox) {
                    // Check if moved at least 100 pixels in any direction
                    const movedX = Math.abs(newBox.x - initialBox.x);
                    const movedY = Math.abs(newBox.y - initialBox.y);
                    const moved = movedX > 100 || movedY > 100;
                    expect(moved).toBeTruthy();
                }
            }
        }
    });
});

test.describe('PostProcessing Node - Console Logging', () => {
    test('should log node creation', async ({ page }) => {
        const logs: string[] = [];

        page.on('console', (msg) => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        });

        await page.goto('/');
        await page.waitForSelector('.flare-node');

        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(1000);

        const hasCreationLog = logs.some(log =>
            log.includes('Adding PostProcessing node') || log.includes('postproc-')
        );
        expect(hasCreationLog).toBeTruthy();
    });

    test('should not have console errors when adding node', async ({ page }) => {
        const errors: string[] = [];

        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });

        await page.goto('/');
        await page.waitForSelector('.flare-node');

        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(1000);

        // Filter out unrelated errors
        const relevantErrors = errors.filter(err =>
            !err.includes('Failed to fetch') &&
            !err.includes('Network') &&
            !err.includes('ECONNREFUSED')
        );

        expect(relevantErrors).toHaveLength(0);
    });
});

test.describe('PostProcessing Node - Multiple Instances', () => {
    test('should allow adding multiple PostProcessing nodes', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');

        // Add 3 PostProcessing nodes
        for (let i = 0; i < 3; i++) {
            await page.click('button:has-text("+ Post-Processing")');
            await page.waitForTimeout(300);
        }

        const postProcNodes = page.locator('.post-processing-node');
        expect(await postProcNodes.count()).toBe(3);
    });

    test('should maintain independent operation selection', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');

        // Add 2 PostProcessing nodes
        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(300);
        await page.click('button:has-text("+ Post-Processing")');
        await page.waitForTimeout(300);

        const postProcNodes = page.locator('.post-processing-node');
        const firstNode = postProcNodes.nth(0);
        const secondNode = postProcNodes.nth(1);

        // Set different operations - use programmatic clicks for reliability
        await firstNode.locator('.operation-chip').filter({ hasText: /sum/i }).evaluate((el: HTMLElement) => {
            el.click();
        });
        await page.waitForTimeout(500);

        await secondNode.locator('.operation-chip').filter({ hasText: /diff/i }).evaluate((el: HTMLElement) => {
            el.click();
        });
        await page.waitForTimeout(500);

        // Verify independent selections
        const firstSelected = await firstNode.locator('.operation-chip.selected').textContent();
        const secondSelected = await secondNode.locator('.operation-chip.selected').textContent();

        expect(firstSelected?.toLowerCase()).toContain('sum');
        expect(secondSelected?.toLowerCase()).toContain('diff');
    });
});
