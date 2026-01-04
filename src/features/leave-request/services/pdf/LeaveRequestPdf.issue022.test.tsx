import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LeaveRequestPdf } from './LeaveRequestPdf';
import type { LeaveRequest } from '../../model/leaveRequest.types';

// Mock @react-pdf/renderer for testing
vi.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: any) => <div data-testid="pdf-document">{children}</div>,
  Page: ({ children, size, style }: any) => (
    <div data-testid="pdf-page" data-size={size} style={style}>
      {children}
    </div>
  ),
  Text: ({ children, style }: any) => (
    <span data-testid="pdf-text" style={style}>
      {children}
    </span>
  ),
  View: ({ children, style }: any) => (
    <div data-testid="pdf-view" style={style}>
      {children}
    </div>
  ),
  StyleSheet: {
    create: (styles: any) => styles,
  },
  Image: ({ src, style }: any) => (
    <img data-testid="pdf-image" src={src} style={style} alt="signature" />
  ),
  Font: {
    register: vi.fn(),
  },
}));

// Mock date-fns format function
vi.mock('date-fns', () => ({
  format: (date: Date, _formatStr: string, _options?: any) => {
    // Simple mock for testing - just return ISO date format
    return date.toISOString().split('T')[0];
  },
}));

/**
 * Issue022 - Reason Field Value Mapping Tests
 *
 * These tests verify that the reason field from the form
 * correctly maps to the "Λόγος" field in the PDF.
 * Note: Employee ID field was removed from PDF in task 071,
 * so tests no longer verify its presence.
 */

const createMockLeaveRequest = (): LeaveRequest => ({
  profile: {
    fullName: 'Test User',
    fathersName: 'Test Father',
    email: 'test@example.com',
    phone: '1234567890',
    identityNumber: 'AB123456',
    employeeId: 'EMP123',
    companyName: 'Test Company',
    department: 'Engineering',
    position: 'Developer',
  },
  leaveType: 'annual',
  leaveAllowance: false,
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-05'),
  reason: 'Για οικογενειακούς λόγους',
  createdAt: new Date('2024-12-30'),
  signatureDataUrl: undefined,
});

describe('Issue 022 - Reason Field Value Mapping', () => {
  describe('Form Field Registration', () => {
    it('should map reason field correctly in form', () => {
      const data = createMockLeaveRequest();
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map(el => el.textContent || '')
        .join(' ');

      // Reason value should be present
      expect(allText).toContain('Για οικογενειακούς λόγους');

      // Reason should NOT appear in employee ID position
      const textLines1 = allText.split('\n');
      for (let idx = 0; idx < textLines1.length - 1; idx++) {
        if (textLines1[idx]?.includes('Λόγος:')) {
          if (textLines1[idx + 1]) {
            const nextLine1 = textLines1[idx + 1].trim();
            expect(nextLine1).toBe('Για οικογενειακούς λόγους');
            expect(nextLine1).not.toBe('EMP123');
          }
        }
        if (textLines1[idx]?.includes('Αρ. Μητρώου:')) {
          if (textLines1[idx + 1]) {
            const nextLine1 = textLines1[idx + 1].trim();
            expect(nextLine1).toBe('EMP123');
            expect(nextLine1).not.toBe('Για οικογενειακούς λόγους');
          }
        }
      }
    });

    it('should not render employeeId in PDF', () => {
      const data = createMockLeaveRequest();
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText2 = Array.from(textElements)
        .map(el => el.textContent || '')
        .join(' ');

      // Employee ID value should NOT be present
      expect(allText2).not.toContain('EMP123');

      // Employee ID label should NOT be present
      expect(allText2).not.toContain('Αρ. Μητρώου:');
    });

    it('should render default reason when empty', () => {
      const data = {
        ...createMockLeaveRequest(),
        reason: '',
      };
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText3 = Array.from(textElements)
        .map(el => el.textContent || '')
        .join(' ');

      expect(allText3).toContain('Προσωπικοί λόγοι');
    });
  });

  describe('Field Distinction', () => {
    it('should render reason field correctly', () => {
      const data = createMockLeaveRequest();
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText3 = Array.from(textElements)
        .map(el => el.textContent || '')
        .join(' ');

      // Reason should be present
      const reasonCount = (allText3.match(/Για οικογενειακούς λόγους/g) || []).length;

      expect(reasonCount).toBeGreaterThan(0);
    });

    it('should handle Greek characters in reason field', () => {
      const greekReason = 'Για οικογενειακούς λόγους με κεφαλαία';
      const data = {
        ...createMockLeaveRequest(),
        reason: greekReason,
      };
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText5 = Array.from(textElements)
        .map(el => el.textContent || '')
        .join(' ');

      expect(allText5).toContain('Για οικογενειακούς λόγους με κεφαλαία');
    });

    it('should not render employeeId even when present in data', () => {
      const data = {
        ...createMockLeaveRequest(),
        profile: {
          ...createMockLeaveRequest().profile,
          employeeId: 'EMP456',
        },
      };
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText6 = Array.from(textElements)
        .map(el => el.textContent || '')
        .join(' ');

      // Employee ID should NOT be present (removed in task 071)
      expect(allText6).not.toContain('EMP456');
      expect(allText6).not.toContain('Αρ. Μητρώου:');
    });

    it('should not render employeeId section when empty', () => {
      const data = {
        ...createMockLeaveRequest(),
        profile: {
          ...createMockLeaveRequest().profile,
          employeeId: '',
        },
      };
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText7 = Array.from(textElements)
        .map(el => el.textContent || '')
        .join(' ');

      // Employee ID label should not appear when employeeId is empty
      expect(allText7).not.toContain('Αρ. Μητρώου:');
    });
  });

  describe('Data Structure Validation', () => {
    it('should access reason from correct property path', () => {
      const data = createMockLeaveRequest();

      // Verify data structure
      expect(data).toHaveProperty('reason');
      expect(data.reason).toBe('Για οικογενειακούς λόγους');
      expect(data.profile).toHaveProperty('employeeId');
      expect(data.profile.employeeId).toBe('EMP123');
    });

    it('should have separate properties for reason and employeeId', () => {
      const data = createMockLeaveRequest();

      // These should be at different levels in the object hierarchy
      // reason is at top level, employeeId is inside profile
      expect('reason' in data).toBe(true);
      expect('employeeId' in data).toBe(false); // employeeId is in profile, not at top
      expect('employeeId' in data.profile).toBe(true);
      expect('reason' in data.profile).toBe(false); // reason is NOT in profile
    });
  });
});
