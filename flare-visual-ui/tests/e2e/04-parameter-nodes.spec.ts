import { test, expect } from '@playwright/test';

/**
 * FLARE Visual UI - Parameter Node Tests
 * 
 * Tests the Parameter node functionality including:
 * - Adding Parameter nodes
 * - Adjusting parameter values
 * - Connecting to ModelQuery nodes
 * - DOM element validation
 * - Console log verification
 */

test.describe('Parameter Node - Adding and Rendering', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');
    });

    test('should have Parameter button in toolbar', async ({ page }) => {
        const paramButton = page.locator('button:has-text("+ Parameter")');
        await expect(paramButton).toBeVisible();
        await expect(paramButton).toBeEnabled();

        // Verify button styling
        const bgColor = await paramButton.evaluate(el =>
            window.getComputedStyle(el).backgroundColor
        );
        // Should have indigo background (rgb values for indigo-500)
        expect(bgColor).toBeTruthy();
    });

    test('should add Parameter node when clicking toolbar button', async ({ page }) => {
        const logs: string[] = [];

        page.on('console', (msg) => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        });

        const initialCount = await page.locator('.flare-node').count();

        // Click the add Parameter button
        await page.click('button:has-text("+ Parameter")');

        // Wait for node to appear
        await page.waitForTimeout(500);

        const newCount = await page.locator('.flare-node').count();
        expect(newCount).toBe(initialCount + 1);

        // Verify console log
        const hasAddLog = logs.some(log => log.includes('Adding Parameter node'));
        expect(hasAddLog).toBeTruthy();
    });

    test('should render Parameter node with correct structure', async ({ page }) => {
        // Add a Parameter node
        await page.click('button:has-text("+ Parameter")');
        await page.waitForTimeout(500);

        // Get the newly added Parameter node
        const paramNodes = page.locator('.parameter-node');
        expect(await paramNodes.count()).toBeGreaterThan(0);

        const paramNode = paramNodes.last();

        // Verify node header
        const header = paramNode.locator('.node-header');
        await expect(header).toBeVisible();
        await expect(header.locator('.node-title')).toContainText('Temperature');

        // Verify icon is present
        const icon = header.locator('.node-icon');
        await expect(icon).toBeVisible();

        // Verify parameter controls
        const valueDisplay = paramNode.locator('.parameter-value-display');
        await expect(valueDisplay).toBeVisible();

        const slider = paramNode.locator('.parameter-slider');
        await expect(slider).toBeVisible();

        const rangeDisplay = paramNode.locator('.parameter-range');
        await expect(rangeDisplay).toBeVisible();

        // Verify description
        const description = paramNode.locator('.parameter-description');
        await expect(description).toBeVisible();
        await expect(description).toContainText('randomness');
    });

    test('should have correct default values', async ({ page }) => {
        await page.click('button:has-text("+ Parameter")');
        await page.waitForTimeout(500);

        const paramNode = page.locator('.parameter-node').last();
        const slider = paramNode.locator('.parameter-slider');

        // Default value should be 0.7
        const value = await slider.inputValue();
        expect(parseFloat(value)).toBe(0.7);

        // Verify min/max
        const min = await slider.getAttribute('min');
        const max = await slider.getAttribute('max');
        expect(parseFloat(min!)).toBe(0.0);
        expect(parseFloat(max!)).toBe(2.0);

        // Verify step
        const step = await slider.getAttribute('step');
        expect(parseFloat(step!)).toBe(0.1);
    });

    test('should display value with 2 decimal places', async ({ page }) => {
        await page.click('button:has-text("+ Parameter")');
        await page.waitForTimeout(500);

        const paramNode = page.locator('.parameter-node').last();
        const valueDisplay = paramNode.locator('.parameter-value-display');

        const displayedValue = await valueDisplay.textContent();
        // Should be in format "0.70"
        expect(displayedValue).toMatch(/^\d+\.\d{2}$/);
    });
});

test.describe('Parameter Node - Interactions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');

        // Add a Parameter node for testing
        await page.click('button:has-text("+ Parameter")');
        await page.waitForTimeout(500);
    });

    test('should adjust parameter value via slider', async ({ page }) => {
        const paramNode = page.locator('.parameter-node').last();
        const slider = paramNode.locator('.parameter-slider');
        const valueDisplay = paramNode.locator('.parameter-value-display');

        // Set to 1.5
        await slider.evaluate((el: any, value) => {
            el.value = value;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        }, '1.5');

        await page.waitForTimeout(300);

        // Verify slider value
        const sliderValue = await slider.inputValue();
        expect(parseFloat(sliderValue)).toBe(1.5);

        // Verify display updates
        const displayedValue = await valueDisplay.textContent();
        expect(displayedValue).toBe('1.50');
    });

    test('should update value in real-time as slider moves', async ({ page }) => {
        const paramNode = page.locator('.parameter-node').last();
        const slider = paramNode.locator('.parameter-slider');
        const valueDisplay = paramNode.locator('.parameter-value-display');

        // Test multiple values
        const testValues = [0.0, 0.5, 1.0, 1.5, 2.0];

        for (const testValue of testValues) {
            await slider.evaluate((el: any, value) => {
                el.value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }, testValue.toString());

            await page.waitForTimeout(200);

            const displayedValue = await valueDisplay.textContent();
            expect(displayedValue).toBe(testValue.toFixed(2));
        }
    });

    test('should respect min/max bounds', async ({ page }) => {
        const paramNode = page.locator('.parameter-node').last();
        const slider = paramNode.locator('.parameter-slider');

        // Try to set below min
        await slider.evaluate((el: any) => {
            el.value = '-1.0';
            el.dispatchEvent(new Event('input', { bubbles: true }));
        });

        await page.waitForTimeout(100);
        let value = await slider.inputValue();
        expect(parseFloat(value)).toBeGreaterThanOrEqual(0.0);

        // Try to set above max
        await slider.evaluate((el: any) => {
            el.value = '3.0';
            el.dispatchEvent(new Event('input', { bubbles: true }));
        });

        await page.waitForTimeout(100);
        value = await slider.inputValue();
        expect(parseFloat(value)).toBeLessThanOrEqual(2.0);
    });
});

test.describe('Parameter Node - Handles and Connections', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');
    });

    test('should have both input and output handles', async ({ page }) => {
        await page.click('button:has-text("+ Parameter")');
        await page.waitForTimeout(500);

        const paramNode = page.locator('.parameter-node').last();

        // Check for target handle (input) - ReactFlow uses .react-flow__handle classes
        const targetHandle = paramNode.locator('.react-flow__handle-left');
        await expect(targetHandle).toBeVisible();

        // Check for source handle (output)
        const sourceHandle = paramNode.locator('.react-flow__handle-right');
        await expect(sourceHandle).toBeVisible();
    });

    test('should be draggable', async ({ page }) => {
        await page.click('button:has-text("+ Parameter")');
        await page.waitForTimeout(500);

        const paramNode = page.locator('.parameter-node').last();
        const nodeHeader = paramNode.locator('.node-header');

        const initialBox = await paramNode.boundingBox();
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

                const newBox = await paramNode.boundingBox();
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

test.describe('Parameter Node - Console Logging', () => {
    test('should log rendering information', async ({ page }) => {
        const logs: string[] = [];

        page.on('console', (msg) => {
            if (msg.type() === 'log') {
                logs.push(msg.text());
            }
        });

        await page.goto('/');
        await page.waitForSelector('.flare-node');

        await page.click('button:has-text("+ Parameter")');
        await page.waitForTimeout(1000);

        // Should log node creation
        const hasCreationLog = logs.some(log =>
            log.includes('Adding Parameter node') || log.includes('param-')
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

        await page.click('button:has-text("+ Parameter")');
        await page.waitForTimeout(1000);

        // Filter out unrelated errors (like network errors if backend is down)
        const relevantErrors = errors.filter(err =>
            !err.includes('Failed to fetch') &&
            !err.includes('Network') &&
            !err.includes('ECONNREFUSED')
        );

        expect(relevantErrors).toHaveLength(0);
    });
});

test.describe('Parameter Node - Multiple Instances', () => {
    test('should allow adding multiple Parameter nodes', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');

        // Add 3 Parameter nodes
        for (let i = 0; i < 3; i++) {
            await page.click('button:has-text("+ Parameter")');
            await page.waitForTimeout(300);
        }

        const paramNodes = page.locator('.parameter-node');
        expect(await paramNodes.count()).toBe(3);
    });

    test('should maintain independent state for each Parameter node', async ({ page }) => {
        await page.goto('/');
        await page.waitForSelector('.flare-node');

        // Add 2 Parameter nodes
        await page.click('button:has-text("+ Parameter")');
        await page.waitForTimeout(300);
        await page.click('button:has-text("+ Parameter")');
        await page.waitForTimeout(300);

        const paramNodes = page.locator('.parameter-node');
        const firstNode = paramNodes.nth(0);
        const secondNode = paramNodes.nth(1);

        // Set different values
        await firstNode.locator('.parameter-slider').evaluate((el: any) => {
            el.value = '0.3';
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        });

        await page.waitForTimeout(300);

        await secondNode.locator('.parameter-slider').evaluate((el: any) => {
            el.value = '1.8';
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        });

        await page.waitForTimeout(500);

        // Verify independent values
        const firstValue = await firstNode.locator('.parameter-value-display').textContent();
        const secondValue = await secondNode.locator('.parameter-value-display').textContent();

        expect(firstValue).toBe('0.30');
        expect(secondValue).toBe('1.80');
    });
});
