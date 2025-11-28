import { describe, it, expect } from 'vitest';
import {
  topologicalSort,
  isAcyclic,
  getNodeDependencies,
  getNodeDependents
} from '../../../utils/topologicalSort';
import type { FlareNode } from '../../../types/nodes';
import type { FlareEdge } from '../../../types/edges';

describe('Topological Sort', () => {
  describe('topologicalSort', () => {
    it('should sort simple linear workflow', () => {
      const nodes: FlareNode[] = [
        { id: 'a', type: 'textInput', position: { x: 0, y: 0 }, data: { text: 'test' } },
        { id: 'b', type: 'modelQuery', position: { x: 0, y: 0 }, data: { models: ['openai'] } },
        { id: 'c', type: 'output', position: { x: 0, y: 0 }, data: { displayMode: 'text', content: null } }
      ];

      const edges: FlareEdge[] = [
        { id: 'e1', source: 'a', target: 'b', type: 'default' },
        { id: 'e2', source: 'b', target: 'c', type: 'default' }
      ];

      const result = topologicalSort(nodes, edges);

      expect(result.order).toEqual(['a', 'b', 'c']);
      expect(result.cycles).toEqual([]);
    });

    it('should handle branching workflow', () => {
      const nodes: FlareNode[] = [
        { id: 'a', type: 'textInput', position: { x: 0, y: 0 }, data: { text: 'test' } },
        { id: 'b', type: 'modelQuery', position: { x: 0, y: 0 }, data: { models: ['openai'] } },
        { id: 'c', type: 'postProcessing', position: { x: 0, y: 0 }, data: { operation: 'sum' } },
        { id: 'd', type: 'output', position: { x: 0, y: 0 }, data: { displayMode: 'text', content: null } }
      ];

      const edges: FlareEdge[] = [
        { id: 'e1', source: 'a', target: 'b', type: 'default' },
        { id: 'e2', source: 'a', target: 'c', type: 'default' },
        { id: 'e3', source: 'b', target: 'd', type: 'default' },
        { id: 'e4', source: 'c', target: 'd', type: 'default' }
      ];

      const result = topologicalSort(nodes, edges);

      expect(result.order[0]).toBe('a');
      expect(result.order[3]).toBe('d');
      expect(result.cycles).toEqual([]);
    });

    it('should detect cycles', () => {
      const nodes: FlareNode[] = [
        { id: 'a', type: 'textInput', position: { x: 0, y: 0 }, data: { text: 'test' } },
        { id: 'b', type: 'modelQuery', position: { x: 0, y: 0 }, data: { models: ['openai'] } }
      ];

      const edges: FlareEdge[] = [
        { id: 'e1', source: 'a', target: 'b', type: 'default' },
        { id: 'e2', source: 'b', target: 'a', type: 'default' }
      ];

      const result = topologicalSort(nodes, edges);

      expect(result.cycles.length).toBeGreaterThan(0);
    });

    it('should handle disconnected nodes', () => {
      const nodes: FlareNode[] = [
        { id: 'a', type: 'textInput', position: { x: 0, y: 0 }, data: { text: 'test' } },
        { id: 'b', type: 'modelQuery', position: { x: 0, y: 0 }, data: { models: ['openai'] } }
      ];

      const edges: FlareEdge[] = [];

      const result = topologicalSort(nodes, edges);

      expect(result.order.length).toBe(2);
      expect(result.cycles).toEqual([]);
    });
  });

  describe('isAcyclic', () => {
    it('should return true for acyclic graph', () => {
      const nodes: FlareNode[] = [
        { id: 'a', type: 'textInput', position: { x: 0, y: 0 }, data: { text: 'test' } },
        { id: 'b', type: 'modelQuery', position: { x: 0, y: 0 }, data: { models: ['openai'] } }
      ];

      const edges: FlareEdge[] = [
        { id: 'e1', source: 'a', target: 'b', type: 'default' }
      ];

      expect(isAcyclic(nodes, edges)).toBe(true);
    });

    it('should return false for cyclic graph', () => {
      const nodes: FlareNode[] = [
        { id: 'a', type: 'textInput', position: { x: 0, y: 0 }, data: { text: 'test' } },
        { id: 'b', type: 'modelQuery', position: { x: 0, y: 0 }, data: { models: ['openai'] } }
      ];

      const edges: FlareEdge[] = [
        { id: 'e1', source: 'a', target: 'b', type: 'default' },
        { id: 'e2', source: 'b', target: 'a', type: 'default' }
      ];

      expect(isAcyclic(nodes, edges)).toBe(false);
    });
  });

  describe('getNodeDependencies', () => {
    it('should get node dependencies', () => {
      const edges: FlareEdge[] = [
        { id: 'e1', source: 'a', target: 'b', type: 'default' },
        { id: 'e2', source: 'c', target: 'b', type: 'default' }
      ];

      const deps = getNodeDependencies('b', edges);

      expect(deps).toContain('a');
      expect(deps).toContain('c');
      expect(deps.length).toBe(2);
    });

    it('should return empty array for node with no dependencies', () => {
      const edges: FlareEdge[] = [
        { id: 'e1', source: 'a', target: 'b', type: 'default' }
      ];

      const deps = getNodeDependencies('a', edges);

      expect(deps).toEqual([]);
    });
  });

  describe('getNodeDependents', () => {
    it('should get node dependents', () => {
      const edges: FlareEdge[] = [
        { id: 'e1', source: 'a', target: 'b', type: 'default' },
        { id: 'e2', source: 'a', target: 'c', type: 'default' }
      ];

      const dependents = getNodeDependents('a', edges);

      expect(dependents).toContain('b');
      expect(dependents).toContain('c');
      expect(dependents.length).toBe(2);
    });

    it('should return empty array for node with no dependents', () => {
      const edges: FlareEdge[] = [
        { id: 'e1', source: 'a', target: 'b', type: 'default' }
      ];

      const dependents = getNodeDependents('b', edges);

      expect(dependents).toEqual([]);
    });
  });
});
