import { test, expect } from '@playwright/test';

/**
 * FLARE Visual UI - Initial Load & Rendering Tests
 * 
 * Tests that the application loads correctly and initial nodes are displayed
 */

test.describe('Initial Page Load', () => {
  test('should load the page with correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FLARE Visual Workflow Builder/);
  });

  test('should display the header with correct text', async ({ page }) => {
    await page.goto('/');
    
    const header = page.locator('h1');
    await expect(header).toContainText('FLARE Visual Workflow Builder');
    
    const subtitle = page.locator('p:has-text("Build AI orchestration")');
    await expect(subtitle).toBeVisible();
  });

  test('should display the toolbar with all buttons', async ({ page }) => {
    await page.goto('/');
    
    // Check for add node buttons
    await expect(page.locator('button:has-text("+ Text Input")')).toBeVisible();
    await expect(page.locator('button:has-text("+ Model Query")')).toBeVisible();
    await expect(page.locator('button:has-text("+ Output")')).toBeVisible();
    await expect(page.locator('button:has-text("Run Workflow")')).toBeVisible();
  });

  test('should display ReactFlow canvas controls', async ({ page }) => {
    await page.goto('/');
    
    // Wait for ReactFlow to initialize
    await page.waitForSelector('.react-flow');
    
    // Check for controls (zoom, fit view, etc.)
    const controls = page.locator('.react-flow__controls');
    await expect(controls).toBeVisible();
    
    // Check for minimap
    const minimap = page.locator('.react-flow__minimap');
    await expect(minimap).toBeVisible();
    
    // Check for background
    const background = page.locator('.react-flow__background');
    await expect(background).toBeVisible();
  });
});

test.describe('Initial Nodes Rendering', () => {
  test('should load with 3 initial nodes', async ({ page }) => {
    await page.goto('/');
    
    // Wait for nodes to render
    await page.waitForSelector('.flare-node', { timeout: 5000 });
    
    // Count the nodes
    const nodes = page.locator('.flare-node');
    await expect(nodes).toHaveCount(3);
  });

  test('should render TextInput node correctly', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('.flare-node');
    
    // Check for TextInput node
    const textInputNode = page.locator('.text-input-node').first();
    await expect(textInputNode).toBeVisible();
    
    // Check for node header
    await expect(textInputNode.locator('.node-title')).toContainText('Text Input');
    
    // Check for textarea
    await expect(textInputNode.locator('textarea')).toBeVisible();
  });

  test('should render ModelQuery node correctly', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('.flare-node');
    
    // Check for ModelQuery node
    const modelNode = page.locator('.model-query-node').first();
    await expect(modelNode).toBeVisible();
    
    // Check for node header
    await expect(modelNode.locator('.node-title')).toContainText('Model Query');
    
    // Check for model selector
    await expect(modelNode.locator('.model-selector')).toBeVisible();
  });

  test('should render Output node correctly', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('.flare-node');
    
    // Check for Output node
    const outputNode = page.locator('.output-node').first();
    await expect(outputNode).toBeVisible();
    
    // Check for node header
    await expect(outputNode.locator('.node-title')).toContainText('Output');
    
    // Check for output display
    await expect(outputNode.locator('.output-display')).toBeVisible();
  });

  test('should display initial edges connecting nodes', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('.react-flow__edge', { timeout: 5000 });
    
    // Check for edges
    const edges = page.locator('.react-flow__edge');
    await expect(edges).toHaveCount(2);
  });
});

test.describe('Console Logging', () => {
  test('should log app mounted message', async ({ page }) => {
    const logs: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        logs.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check for mount logs
    const hasMountLog = logs.some(log => log.includes('App mounted with nodes'));
    expect(hasMountLog).toBeTruthy();
  });

  test('should log node rendering', async ({ page }) => {
    const logs: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'log') {
        logs.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check for node rendering logs
    const hasTextInputLog = logs.some(log => log.includes('TextInputNode rendering'));
    const hasModelQueryLog = logs.some(log => log.includes('ModelQueryNode rendering'));
    const hasOutputLog = logs.some(log => log.includes('OutputNode rendering'));
    
    expect(hasTextInputLog).toBeTruthy();
    expect(hasModelQueryLog).toBeTruthy();
    expect(hasOutputLog).toBeTruthy();
  });

  test('should not have console errors on load', async ({ page }) => {
    const errors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Should have no errors
    expect(errors).toHaveLength(0);
  });
});
