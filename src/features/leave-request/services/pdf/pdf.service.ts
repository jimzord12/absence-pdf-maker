import { format } from 'date-fns';
import { pdf, type DocumentProps } from '@react-pdf/renderer';
import React from 'react';
import type { LeaveRequest } from '../../model/leaveRequest.types';
import { calculateAbsenceDays } from '../absenceDays';
import { LeaveRequestPdf } from './LeaveRequestPdf';

/**
 * Sanitize a string for use in filenames.
 *
 * - Replaces spaces with hyphens
 * - Removes special characters (keeps letters, numbers, hyphens)
 * - Preserves Greek characters
 *
 * @param str - The string to sanitize
 * @returns Sanitized string
 */
const sanitizeForFilename = (str: string): string => {
  return str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9α-ωΑ-Ωά-ώΆ-Ώ-]/g, '');
};

/**
 * Generate a leave request PDF blob.
 *
 * @param data - The leave request data
 * @param holidays - Set of holiday dates
 * @param t - Translation function for error messages
 * @returns Promise<Blob>
 */
export const generateLeaveRequestPdf = async (
  data: LeaveRequest,
  holidays: Set<string>,
  t: (key: string, options?: Record<string, unknown>) => string
): Promise<Blob> => {
  // Validate dates before generating PDF
  if (!data.startDate || !data.endDate) {
    throw new Error(t('validation.datesRequired'));
  }

  const absenceBreakdown = calculateAbsenceDays(data.startDate, data.endDate, holidays);

  // Create PDF document
  const pdfElement = React.createElement(
    LeaveRequestPdf,
    {
      data,
      absenceDays: absenceBreakdown.absenceDays,
    }
  );
  const blob = await pdf(pdfElement as React.ReactElement<DocumentProps>).toBlob();

  return blob;
};

/**
 * Generate and download a leave request PDF.
 *
 * @param data - The leave request data
 * @param holidays - Set of holiday dates
 * @param t - Translation function for error messages
 * @returns Promise<void>
 * @throws Error if PDF generation or download fails
 */
export const downloadLeaveRequestPdf = async (
  data: LeaveRequest,
  holidays: Set<string>,
  t: (key: string, options?: Record<string, unknown>) => string
): Promise<void> => {
  try {
    const blob = await generateLeaveRequestPdf(data, holidays, t);

    // Extract and sanitize employee full name
    const sanitizedName = sanitizeForFilename(data.profile.fullName || 'unknown');

    // Format start and end dates as dd-MM-yyyy
    const formattedStartDate = data.startDate
      ? format(data.startDate, 'dd-MM-yyyy')
      : 'unknown';
    const formattedEndDate = data.endDate
      ? format(data.endDate, 'dd-MM-yyyy')
      : 'unknown';

    // Extract and sanitize company name
    const sanitizedCompany = sanitizeForFilename(data.profile.companyName || 'unknown');

    // Construct filename: LeaveRequest_<Name>_<StartDate>_<EndDate>_<Company>.pdf
    const filename = `LeaveRequest_${sanitizedName}_${formattedStartDate}_${formattedEndDate}_${sanitizedCompany}.pdf`;

    // Create download link and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(t('messages.pdf.generationFailed', { message: error.message }));
    }
    throw new Error(t('messages.pdf.generationFailed', { message: 'Unknown error' }));
  }
};
