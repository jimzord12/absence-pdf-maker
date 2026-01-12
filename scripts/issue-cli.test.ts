import { describe, it, expect, vi } from 'vitest';

import {
  formatDate,
  parseArgs,
  parseIssueFile,
  showHelp,
} from './issue-cli';

describe('Utility Functions', () => {
  describe('formatDate', () => {
    it('should format ISO date string', () => {
      const result = formatDate('2024-01-15');
      expect(result).toBe('Jan 15, 2024');
    });

    it('should handle different dates', () => {
      expect(formatDate('2024-12-31')).toBe('Dec 31, 2024');
      expect(formatDate('2023-06-15')).toBe('Jun 15, 2023');
    });
  });

  describe('parseArgs', () => {
    it('should parse positional arguments only', () => {
      const result = parseArgs(['state', '021', 'In Progress']);
      expect(result.positional).toEqual(['state', '021', 'In Progress']);
      expect(result.options).toEqual({});
    });

    it('should parse --flag=value options', () => {
      const result = parseArgs(['list', '--state=Open', '--limit=10']);
      expect(result.positional).toEqual(['list']);
      expect(result.options).toEqual({ state: 'Open', limit: '10' });
    });

    it('should parse --flag options without values', () => {
      const result = parseArgs(['create', '026', '--verbose']);
      expect(result.options).toEqual({ verbose: 'true' });
    });

    it('should parse -s value options', () => {
      const result = parseArgs(['list', '-s', 'Open', '-l', '10']);
      expect(result.options).toEqual({ s: 'Open', l: '10' });
    });

    it('should parse mixed positional and options', () => {
      const result = parseArgs(['create', '027', '--priority=High', 'extra']);
      expect(result.positional).toEqual(['create', '027', 'extra']);
      expect(result.options).toEqual({ priority: 'High' });
    });

    it('should handle empty args', () => {
      const result = parseArgs([]);
      expect(result.positional).toEqual([]);
      expect(result.options).toEqual({});
    });
  });

  describe('parseIssueFile', () => {
    it('should parse complete issue file', () => {
      const content = `# 021 - PDF generation fails

**Issue ID:** 021
**Component:** PDF
**Date Discovered:** 2024-01-15
**Status:** In Progress
**Priority:** High
**Task ID:** 045

## Summary
PDF generation fails when signature is too large

## Problem Description
When user uploads a large signature image, PDF generation fails with error.

## Steps to Reproduce
1. Navigate to leave request form
2. Fill in all fields
3. Upload large signature
4. Click generate PDF

## Technical Details
@react-pdf/renderer has a limit on image sizes.

## Potential Causes
### 1. Image exceeds renderer limits
### 2. Memory issues

## Suggested Solutions
### Resize image before generation
### Add validation

## Additional Notes
None

## Related Issues
- #020 - Image upload issues
`;

      const result = parseIssueFile(content);

      expect(result.id).toBe('021');
      expect(result.component).toBe('PDF');
      expect(result.dateDiscovered).toBe('2024-01-15');
      expect(result.status).toBe('In Progress');
      expect(result.priority).toBe('High');
      expect(result.taskId).toBe('045');
      expect(result.summary).toBe('PDF generation fails when signature is too large');
      expect(result.problemDescription).toContain('large signature image');
      expect(result.stepsToReproduce).toHaveLength(4);
      expect(result.stepsToReproduce[0]).toBe('Navigate to leave request form');
      expect(result.technicalDetails).toContain('@react-pdf/renderer');
      expect(result.potentialCauses).toHaveLength(2);
      expect(result.suggestedSolutions).toHaveLength(2);
      expect(result.relatedIssues).toHaveLength(1);
    });

    it('should parse minimal issue file', () => {
      const content = `# 022

**Issue ID:** 022

## Summary
Test issue

## Problem Description
No description
`;

      const result = parseIssueFile(content);

      expect(result.id).toBe('022');
      expect(result.summary).toBe('Test issue');
      expect(result.problemDescription).toBe('No description');
      expect(result.component).toBe('N/A');
      expect(result.priority).toBe('Medium');
      expect(result.status).toBe('Open');
    });

    it('should handle empty steps list', () => {
      const content = `# 023

**Issue ID:** 023

## Summary
Issue with no steps

## Steps to Reproduce
No steps documented

## Problem Description
Test
`;

      const result = parseIssueFile(content);

      expect(result.stepsToReproduce).toHaveLength(0);
    });

    it('should handle multiline problem description', () => {
      const content = `# 024

**Issue ID:** 024

## Summary
Test

## Problem Description
Line 1
Line 2
Line 3
`;

      const result = parseIssueFile(content);

      expect(result.problemDescription).toContain('Line 1');
      expect(result.problemDescription).toContain('Line 2');
      expect(result.problemDescription).toContain('Line 3');
    });
  });
});

describe('Command Handlers', () => {
  describe('showHelp', () => {
    it('should display help message', () => {
      const mockLog = vi.fn();
      global.console = { log: mockLog } as any;

      showHelp();

      expect(mockLog).toHaveBeenCalled();
      const helpOutput = mockLog.mock.calls[0][0];
      expect(helpOutput).toContain('Issue Management CLI');
      expect(helpOutput).toContain('state <id> <state>');
      expect(helpOutput).toContain('show <id>');
      expect(helpOutput).toContain('list [options]');
    });
  });
});
