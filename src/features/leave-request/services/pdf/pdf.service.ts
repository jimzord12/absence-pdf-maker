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
  const absenceBreakdown = calculateAbsenceDays(data.startDate, data.endDate, holidays);

  // Create the PDF document
  // We need to pass the component as a React element
  const blob = await pdf(
    React.createElement(LeaveRequestPdf, { data, absenceDays: absenceBreakdown.absenceDays })
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
