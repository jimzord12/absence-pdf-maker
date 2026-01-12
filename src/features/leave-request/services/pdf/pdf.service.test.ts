import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LeaveRequest } from '../../model/leaveRequest.types';

vi.mock('@react-pdf/renderer', () => ({
  pdf: vi.fn().mockReturnValue({
    toBlob: vi.fn().mockResolvedValue(new Blob(['PDF content'], { type: 'application/pdf' })),
  }),
  Document: ({ children }: any) => children,
  Page: ({ children }: any) => children,
  Text: ({ children }: any) => children,
  View: ({ children }: any) => children,
  StyleSheet: {
    create: (styles: any) => styles,
  },
  Image: () => null,
  Font: {
    register: vi.fn(),
  },
}));

const mockUrl = 'blob:test-url';
const mockRevokeObjectURL = vi.fn();
const mockClick = vi.fn();

const mockLink = {
  href: '',
  download: '',
  click: mockClick,
};

let generateLeaveRequestPdf: typeof import('./pdf.service').generateLeaveRequestPdf;
let downloadLeaveRequestPdf: typeof import('./pdf.service').downloadLeaveRequestPdf;

const mockT = vi.fn((key: string, options?: Record<string, unknown>) => {
  if (options?.message) {
    return `${key}: ${options.message}`;
  }
  return key;
});

describe('PDF Service', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();

    const serviceModule = await import('./pdf.service');
    generateLeaveRequestPdf = serviceModule.generateLeaveRequestPdf;
    downloadLeaveRequestPdf = serviceModule.downloadLeaveRequestPdf;

    global.URL.createObjectURL = vi.fn(() => mockUrl);
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    Object.defineProperty(document, 'createElement', {
      value: vi.fn().mockReturnValue(mockLink),
      writable: true,
    });
    Object.defineProperty(document, 'body', {
      value: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockLeaveRequest: LeaveRequest = {
    profile: {
      fullName: 'John Doe',
      fathersName: 'Father Doe',
      email: 'john@example.com',
      phone: '1234567890',
      identityNumber: 'AB123456',
      employeeId: 'EMP123',
      department: 'Engineering',
      position: 'Developer',
      companyName: 'Acme Corp',
    },
    leaveType: 'annual',
    leaveAllowance: 15,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-05'),
    reason: 'Vacation',
    createdAt: new Date('2024-12-30'),
    signatureDataUrl: 'data:image/png;base64,test',
  };

  const mockHolidays = new Set(['2025-01-01']);

  describe('generateLeaveRequestPdf', () => {
    it('should generate a PDF blob', async () => {
      const blob = await generateLeaveRequestPdf(mockLeaveRequest, mockHolidays, mockT);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/pdf');
    });
  });

  describe('downloadLeaveRequestPdf', () => {
    it('should generate and download PDF with new filename format', async () => {
      await downloadLeaveRequestPdf(mockLeaveRequest, mockHolidays, mockT);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe(
        'LeaveRequest_John-Doe_01-01-2025_05-01-2025_Acme-Corp.pdf'
      );
      expect(mockLink.click).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should sanitize special characters from name and company', async () => {
      const requestWithSpecialChars: LeaveRequest = {
        ...mockLeaveRequest,
        profile: {
          ...mockLeaveRequest.profile,
          fullName: 'John "The Rock" Doe!',
          companyName: 'Acme Corp, Inc.',
        },
      };

      await downloadLeaveRequestPdf(requestWithSpecialChars, mockHolidays, mockT);

      expect(mockLink.download).toBe(
        'LeaveRequest_John-The-Rock-Doe_01-01-2025_05-01-2025_Acme-Corp-Inc.pdf'
      );
    });

    it('should preserve Greek characters in name and company', async () => {
      const requestWithGreek: LeaveRequest = {
        ...mockLeaveRequest,
        profile: {
          ...mockLeaveRequest.profile,
          fullName: 'Γιάννης Παπαδόπουλος',
          companyName: 'Ελληνική Εταιρεία ΑΕ',
        },
      };

      await downloadLeaveRequestPdf(requestWithGreek, mockHolidays, mockT);

      expect(mockLink.download).toBe(
        'LeaveRequest_Γιάννης-Παπαδόπουλος_01-01-2025_05-01-2025_Ελληνική-Εταιρεία-ΑΕ.pdf'
      );
    });

    it('should handle missing fullName and companyName', async () => {
      const requestWithMissingFields: LeaveRequest = {
        ...mockLeaveRequest,
        profile: {
          ...mockLeaveRequest.profile,
          fullName: '',
          companyName: '',
        },
      };

      await downloadLeaveRequestPdf(requestWithMissingFields, mockHolidays, mockT);

      expect(mockLink.download).toBe(
        'LeaveRequest_unknown_01-01-2025_05-01-2025_unknown.pdf'
      );
    });

    it('should handle dates in different months and years', async () => {
      const requestWithDifferentDates: LeaveRequest = {
        ...mockLeaveRequest,
        startDate: new Date('2024-12-31'),
        endDate: new Date('2025-01-15'),
      };

      await downloadLeaveRequestPdf(requestWithDifferentDates, mockHolidays, mockT);

      expect(mockLink.download).toBe(
        'LeaveRequest_John-Doe_31-12-2024_15-01-2025_Acme-Corp.pdf'
      );
    });

    it('should handle single and double digit days and months', async () => {
      const requestWithEdgeDates: LeaveRequest = {
        ...mockLeaveRequest,
        startDate: new Date('2025-01-09'),
        endDate: new Date('2025-12-31'),
      };

      await downloadLeaveRequestPdf(requestWithEdgeDates, mockHolidays, mockT);

      expect(mockLink.download).toBe(
        'LeaveRequest_John-Doe_09-01-2025_31-12-2025_Acme-Corp.pdf'
      );
    });

    it('should handle errors gracefully', async () => {
      const { pdf } = await import('@react-pdf/renderer');
      vi.mocked(pdf).mockImplementationOnce(() => {
        throw new Error('Generation failed');
      });

      await expect(downloadLeaveRequestPdf(mockLeaveRequest, mockHolidays, mockT)).rejects.toThrow(
        'messages.pdf.generationFailed: Generation failed'
      );
    });
  });
});
