import { pdf } from '@react-pdf/renderer';
import React from 'react';
import type { LeaveRequest } from '../../model/leaveRequest.types';
import { calculateAbsenceDays } from '../absenceDays';
import { LeaveRequestPdf } from './LeaveRequestPdf';

/**
 * Generate a leave request PDF blob.
 *
 * @param data - The leave request data
 * @param holidays - Set of holiday dates
 * @returns Promise<Blob>
 */
export const generateLeaveRequestPdf = async (
  data: LeaveRequest,
  holidays: Set<string>
): Promise<Blob> => {
  // Validate dates before generating PDF
  if (!data.startDate || !data.endDate) {
    throw new Error('Start date and end date are required for PDF generation');
  }

  const absenceBreakdown = calculateAbsenceDays(data.startDate, data.endDate, holidays);

  // Create PDF document
  const blob = await pdf(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    React.createElement(LeaveRequestPdf as any, {
      data,
      absenceDays: absenceBreakdown.absenceDays,
    }) as any
  ).toBlob();

  return blob;
};

/**
 * Generate and download a leave request PDF.
 *
 * @param data - The leave request data
 * @param holidays - Set of holiday dates
 * @returns Promise<void>
 * @throws Error if PDF generation or download fails
 */
export const downloadLeaveRequestPdf = async (
  data: LeaveRequest,
  holidays: Set<string>
): Promise<void> => {
  try {
    const blob = await generateLeaveRequestPdf(data, holidays);

    const employeeId = data.profile.employeeId?.replace(/[^a-zA-Z0-9]/g, '_') || 'unknown';
    const today = new Date().toISOString().split('T')[0];
    const filename = `LeaveRequest_${employeeId}_${today}.pdf`;

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
      throw new Error(`Failed to download PDF: ${error.message}`);
    }
    throw new Error('Failed to download PDF: Unknown error');
  }
};
