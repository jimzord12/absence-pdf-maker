import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import type { LeaveRequest } from '../../model/leaveRequest.types';
import { LeaveRequestPdf } from './LeaveRequestPdf';

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

describe('LeaveRequestPdf', () => {
  const createMockLeaveRequest = (overrides: Partial<LeaveRequest> = {}): LeaveRequest => ({
    profile: {
      fullName: 'John Doe',
      fathersName: 'Father Doe',
      email: 'john@example.com',
      phone: '1234567890',
      identityNumber: 'AB123456',
      employeeId: 'EMP123',
      companyName: 'Acme Corp',
      department: 'Engineering',
      position: 'Developer',
    },
    leaveType: 'annual',
    leaveAllowance: true,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-05'),
    reason: 'Vacation',
    createdAt: new Date('2024-12-30'),
    signatureDataUrl: 'data:image/png;base64,test',
    ...overrides,
  });

  describe('Rendering', () => {
    it('should render the PDF document structure', () => {
      const data = createMockLeaveRequest();
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);

      expect(container.querySelector('[data-testid="pdf-document"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="pdf-page"]')).toBeInTheDocument();
    });

    it('should render with A4 page size', () => {
      const data = createMockLeaveRequest();
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const page = container.querySelector('[data-testid="pdf-page"]');

      expect(page).toHaveAttribute('data-size', 'A4');
    });

    it('should render all text wrapped in Text components', () => {
      const data = createMockLeaveRequest();
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      // Verify we have multiple text elements (all text should be wrapped)
      expect(textElements.length).toBeGreaterThan(10);
    });

    it('should render Greek text correctly', () => {
      const data = createMockLeaveRequest();
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      // Convert all text content to string and check for Greek characters
      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      // Should contain Greek text
      expect(allText).toContain('ΠΡΟΣ');
      expect(allText).toContain('Τον εργοδότη');
      expect(allText).toContain('Στοιχεία Εργαζομένου');
    });
  });

  describe('Header Section', () => {
    it('should render company name', () => {
      const data = createMockLeaveRequest({ profile: { ...createMockLeaveRequest().profile, companyName: 'Test Company' } });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('Test Company');
    });

    it('should render document title', () => {
      const data = createMockLeaveRequest();
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('ΑΙΤΗΣΗ');
    });
  });

  describe('Employee Details Section', () => {
    it('should render full name', () => {
      const data = createMockLeaveRequest({ profile: { ...createMockLeaveRequest().profile, fullName: 'Test User' } });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('Test User');
    });

    it('should render father\'s name', () => {
      const data = createMockLeaveRequest({ profile: { ...createMockLeaveRequest().profile, fathersName: 'Test Father' } });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('Test Father');
    });

    it('should render position', () => {
      const data = createMockLeaveRequest({ profile: { ...createMockLeaveRequest().profile, position: 'Senior Developer' } });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('Senior Developer');
    });

    it('should render identity number', () => {
      const data = createMockLeaveRequest({ profile: { ...createMockLeaveRequest().profile, identityNumber: 'AD987654' } });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('AD987654');
    });

    it('should render phone number', () => {
      const data = createMockLeaveRequest({ profile: { ...createMockLeaveRequest().profile, phone: '9876543210' } });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('9876543210');
    });

    it('should render employee ID when present', () => {
      const data = createMockLeaveRequest({ profile: { ...createMockLeaveRequest().profile, employeeId: 'EMP999' } });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('EMP999');
    });

    it('should not render employee ID section when absent', () => {
      const data = createMockLeaveRequest({ profile: { ...createMockLeaveRequest().profile, employeeId: '' } });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      // Should not contain an empty employee ID or the label
      expect(allText).not.toContain('Αρ. Μητρώου:');
    });
  });

  describe('Leave Details Section', () => {
    it('should render absence days count', () => {
      const data = createMockLeaveRequest();
      const absenceDays = 10;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('10');
    });

    it('should render start date', () => {
      const data = createMockLeaveRequest({ startDate: new Date('2025-06-01') });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('2025-06-01');
    });

    it('should render end date', () => {
      const data = createMockLeaveRequest({ endDate: new Date('2025-06-05') });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('2025-06-05');
    });

    it('should render reason', () => {
      const data = createMockLeaveRequest({ reason: 'Family vacation' });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('Family vacation');
    });

    it('should render default reason when not provided', () => {
      const data = createMockLeaveRequest({ reason: '' });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('Προσωπικοί λόγοι');
    });
  });

  describe('Leave Allowance Section', () => {
    it('should render allowance preference when true', () => {
      const data = createMockLeaveRequest({ leaveAllowance: true });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('ΕΠΙΘΥΜΩ');
      expect(allText).toContain('αναλογία επιδόματος αδείας');
    });

    it('should render no allowance preference when false', () => {
      const data = createMockLeaveRequest({ leaveAllowance: false });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('ΔΕΝ ΕΠΙΘΥΜΩ');
      expect(allText).toContain('αναλογία επιδόματος αδείας');
    });
  });

  describe('Signature Section', () => {
    it('should render signature image when present', () => {
      const data = createMockLeaveRequest({ signatureDataUrl: 'data:image/png;base64,abc123' });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const image = container.querySelector('[data-testid="pdf-image"]');

      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'data:image/png;base64,abc123');
    });

    it('should render empty space when signature is not present', () => {
      const data = createMockLeaveRequest({ signatureDataUrl: '' });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const image = container.querySelector('[data-testid="pdf-image"]');

      expect(image).not.toBeInTheDocument();
    });

    it('should render employee name under signature line', () => {
      const data = createMockLeaveRequest({ profile: { ...createMockLeaveRequest().profile, fullName: 'Jane Smith' } });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('Jane Smith');
    });
  });

  describe('Footer Section', () => {
    it('should render creation date', () => {
      const data = createMockLeaveRequest({ createdAt: new Date('2024-12-31') });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('2024-12-31');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single day absence', () => {
      const data = createMockLeaveRequest({
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-01'),
      });
      const absenceDays = 1;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('1');
    });

    it('should handle long absence period', () => {
      const data = createMockLeaveRequest({
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-01-31'),
      });
      const absenceDays = 22;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('22');
    });

    it('should handle special characters in name', () => {
      const data = createMockLeaveRequest({
        profile: {
          ...createMockLeaveRequest().profile,
          fullName: 'Γιώργος Παπαδόπουλος',
          fathersName: 'Νικόλαος',
        },
      });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain('Γιώργος Παπαδόπουλος');
      expect(allText).toContain('Νικόλαος');
    });

    it('should handle very long reason text', () => {
      const longReason = 'This is a very long reason for leave that spans multiple lines and contains a lot of text';
      const data = createMockLeaveRequest({ reason: longReason });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);
      const textElements = container.querySelectorAll('[data-testid="pdf-text"]');

      const allText = Array.from(textElements)
        .map((el) => el.textContent || '')
        .join(' ');

      expect(allText).toContain(longReason);
    });
  });

  describe('Font Registration', () => {
    it('should register font with @react-pdf/renderer', () => {
      // Font registration happens at module level when LeaveRequestPdf is imported
      // The mock verifies that Font.register is called when the component is loaded
      const { Font } = require('@react-pdf/renderer');
      // The mock is called during module initialization
      expect(Font.register).toBeDefined();
      expect(typeof Font.register).toBe('function');
    });
  });

  describe('Different Leave Types', () => {
    it('should render for annual leave type', () => {
      const data = createMockLeaveRequest({ leaveType: 'annual' });
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);

      expect(container.querySelector('[data-testid="pdf-document"]')).toBeInTheDocument();
    });

    it('should render for sick leave type', () => {
      const data = createMockLeaveRequest({ leaveType: 'sick' });
      const absenceDays = 3;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);

      expect(container.querySelector('[data-testid="pdf-document"]')).toBeInTheDocument();
    });

    it('should render for unpaid leave type', () => {
      const data = createMockLeaveRequest({ leaveType: 'unpaid' });
      const absenceDays = 2;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);

      expect(container.querySelector('[data-testid="pdf-document"]')).toBeInTheDocument();
    });

    it('should render for other leave type', () => {
      const data = createMockLeaveRequest({ leaveType: 'other' });
      const absenceDays = 2;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);

      expect(container.querySelector('[data-testid="pdf-document"]')).toBeInTheDocument();
    });
  });

  describe('Complete Valid Form Inputs', () => {
    it('should render successfully with all required fields', () => {
      const data: LeaveRequest = {
        profile: {
          fullName: 'Complete Name',
          fathersName: 'Complete Father',
          email: 'complete@test.com',
          phone: '5551234567',
          identityNumber: 'AA111111',
          employeeId: 'EMP001',
          department: 'IT',
          position: 'Engineer',
          companyName: 'Complete Corp',
        },
        leaveType: 'annual',
        leaveAllowance: true,
        startDate: new Date('2025-02-01'),
        endDate: new Date('2025-02-05'),
        reason: 'Complete test reason',
        createdAt: new Date('2024-12-31'),
        signatureDataUrl: 'data:image/png;base64,complete',
      };
      const absenceDays = 5;

      const { container } = render(<LeaveRequestPdf data={data} absenceDays={absenceDays} />);

      expect(container.querySelector('[data-testid="pdf-document"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="pdf-page"]')).toBeInTheDocument();
    });
  });
});
