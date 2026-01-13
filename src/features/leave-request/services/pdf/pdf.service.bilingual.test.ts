import { describe, expect, it, vi, beforeEach } from 'vitest';
import { generateLeaveRequestPdf } from './pdf.service';
import { usePdfLanguageStore } from '../../state/pdfLanguage.store';
import { pdf } from '@react-pdf/renderer';
import type { LeaveRequest } from '../../model/leaveRequest.types';

vi.mock('@react-pdf/renderer', () => ({
  pdf: vi.fn().mockReturnValue({
    toBlob: vi.fn().mockResolvedValue(new Blob(['PDF content'], { type: 'application/pdf' })),
  }),
  Document: () => null,
  Page: () => null,
  Text: () => null,
  View: () => null,
  StyleSheet: {
    create: (styles: any) => styles,
  },
  Image: () => null,
  Font: {
    register: vi.fn(),
  },
}));

vi.mock('../../state/pdfLanguage.store', () => ({
  usePdfLanguageStore: {
    getState: vi.fn(),
  },
}));

describe('PDF Service Bilingual Integration', () => {
  const mockLeaveRequest: Partial<LeaveRequest> = {
    profile: {
      fullName: 'John Doe',
      companyName: 'Acme Corp',
    } as any,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2025-01-05'),
  };

  const mockHolidays = new Set<string>();
  const mockT = (key: string) => key;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should pass "gr" to LeaveRequestPdf when store language is "gr"', async () => {
    vi.mocked(usePdfLanguageStore.getState).mockReturnValue({ pdfLanguage: 'gr' } as any);

    await generateLeaveRequestPdf(mockLeaveRequest as LeaveRequest, mockHolidays, mockT);

    expect(pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({
          pdfLanguage: 'gr',
        }),
      })
    );
  });

  it('should pass "en" to LeaveRequestPdf when store language is "en"', async () => {
    vi.mocked(usePdfLanguageStore.getState).mockReturnValue({ pdfLanguage: 'en' } as any);

    await generateLeaveRequestPdf(mockLeaveRequest as LeaveRequest, mockHolidays, mockT);

    expect(pdf).toHaveBeenCalledWith(
      expect.objectContaining({
        props: expect.objectContaining({
          pdfLanguage: 'en',
        }),
      })
    );
  });
});
