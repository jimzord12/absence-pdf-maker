import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { LeaveRequest } from '../../model/leaveRequest.types';
import { LeaveRequestPdf } from './LeaveRequestPdf';

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

vi.mock('date-fns', () => ({
  format: (date: Date, _formatStr: string, _options?: any) => {
    return date.toISOString().split('T')[0];
  },
}));


describe('LeaveRequestPdf Bilingual Generation', () => {
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
    leaveAllowance: 15,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-05'),
    reason: 'Vacation',
    createdAt: new Date('2024-12-30'),
    signatureDataUrl: 'data:image/png;base64,test',
    ...overrides,
  });

  it('should render Greek content when pdfLanguage is "gr"', () => {
    const data = createMockLeaveRequest();
    const { container } = render(<LeaveRequestPdf data={data} absenceDays={5} pdfLanguage="gr" />);
    
    const allText = Array.from(container.querySelectorAll('[data-testid="pdf-text"]'))
      .map(el => el.textContent || '')
      .join(' ');

    expect(allText).toContain('ΑΙΤΗΣΗ');
    expect(allText).toContain('Στοιχεία Εργαζομένου');
    expect(allText).toContain('ΠΡΟΣ Τον εργοδότη');
    expect(allText).not.toContain('LEAVE REQUEST');
  });

  it('should render English content when pdfLanguage is "en"', () => {
    const data = createMockLeaveRequest();
    const { container } = render(<LeaveRequestPdf data={data} absenceDays={5} pdfLanguage="en" />);
    
    const allText = Array.from(container.querySelectorAll('[data-testid="pdf-text"]'))
      .map(el => el.textContent || '')
      .join(' ');

    expect(allText).toContain('LEAVE REQUEST');
    expect(allText).toContain('Employee Details');
    expect(allText).toContain('To the employer');
    expect(allText).not.toContain('ΑΙΤΗΣΗ');
  });

  it('should default to Greek content when pdfLanguage is not provided', () => {
    const data = createMockLeaveRequest();
    const { container } = render(<LeaveRequestPdf data={data} absenceDays={5} />);
    
    const allText = Array.from(container.querySelectorAll('[data-testid="pdf-text"]'))
      .map(el => el.textContent || '')
      .join(' ');

    expect(allText).toContain('ΑΙΤΗΣΗ');
  });

  it('should handle leave allowance text in Greek', () => {
    const data = createMockLeaveRequest({ leaveAllowance: 20 });
    const { container } = render(<LeaveRequestPdf data={data} absenceDays={5} pdfLanguage="gr" />);
    
    const allText = Array.from(container.querySelectorAll('[data-testid="pdf-text"]'))
      .map(el => el.textContent || '')
      .join(' ');

    expect(allText).toContain('ΕΠΙΘΥΜΩ αναλογία επιδόματος αδείας');
  });

  it('should handle leave allowance text in English', () => {
    const data = createMockLeaveRequest({ leaveAllowance: 20 });
    const { container } = render(<LeaveRequestPdf data={data} absenceDays={5} pdfLanguage="en" />);
    
    const allText = Array.from(container.querySelectorAll('[data-testid="pdf-text"]'))
      .map(el => el.textContent || '')
      .join(' ');

    expect(allText).toContain('I wish to receive leave allowance');
  });
});
