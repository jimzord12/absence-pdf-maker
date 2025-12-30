import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LeaveRequest } from '../../model/leaveRequest.types';

// Mock @react-pdf/renderer
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

// Mock URL and document for download tests
const mockUrl = 'blob:test-url';
const mockRevokeObjectURL = vi.fn();
const mockClick = vi.fn();

const mockLink = {
  href: '',
  download: '',
  click: mockClick,
};

// Dynamic import of service functions after mocks are set up
let generateLeaveRequestPdf: typeof import('./pdf.service').generateLeaveRequestPdf;
let downloadLeaveRequestPdf: typeof import('./pdf.service').downloadLeaveRequestPdf;

describe('PDF Service', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();

    // Re-import to apply fresh mocks
    const serviceModule = await import('./pdf.service');
    generateLeaveRequestPdf = serviceModule.generateLeaveRequestPdf;
    downloadLeaveRequestPdf = serviceModule.downloadLeaveRequestPdf;

    // Mock URL.createObjectURL
    global.URL.createObjectURL = vi.fn(() => mockUrl);
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Mock document.createElement and body methods
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
      employerName: 'Jane Boss',
    },
    leaveType: 'annual',
    leaveAllowance: true,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-05'),
    reason: 'Vacation',
    createdAt: new Date('2024-12-30'),
    signatureDataUrl: 'data:image/png;base64,test',
  };

  const mockHolidays = new Set(['2025-01-01']);

  describe('generateLeaveRequestPdf', () => {
    it('should generate a PDF blob', async () => {
      const blob = await generateLeaveRequestPdf(mockLeaveRequest, mockHolidays);
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('application/pdf');
    });
  });

  describe('downloadLeaveRequestPdf', () => {
    it('should generate and download the PDF', async () => {
      await downloadLeaveRequestPdf(mockLeaveRequest, mockHolidays);

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockLink.download).toMatch(/LeaveRequest_EMP123_.*\.pdf/);
      expect(mockLink.click).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      // Mock failure
      const { pdf } = await import('@react-pdf/renderer');
      vi.mocked(pdf).mockImplementationOnce(() => {
        throw new Error('Generation failed');
      });

      await expect(downloadLeaveRequestPdf(mockLeaveRequest, mockHolidays)).rejects.toThrow(
        'Failed to download PDF: Generation failed'
      );
    });
  });
});

