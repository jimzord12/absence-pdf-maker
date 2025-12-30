import { jsPDF } from 'jspdf';
import type { TemplateDefinition } from './templates/template.types';
import type { LeaveRequest } from '../../model/leaveRequest.types';

/**
 * PDF generation service for leave request documents.
 * Uses jsPDF to render PDFs based on template definitions.
 */

import { z } from 'zod';

// Rendering configuration constants
const SIGNATURE_WIDTH = 60;
const SIGNATURE_HEIGHT = 30;
const DATE_LOCALE = 'en-GB';

const PdfDataSchema = z.object({
  profile: z.object({
    fullName: z.string(),
    employeeId: z.string().optional(),
    email: z.string(),
    phone: z.string(),
    department: z.string(),
    position: z.string(),
  }),
  leaveType: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().optional(),
  createdAt: z.date(),
  signatureDataUrl: z.string().optional(),
});

type PdfData = z.infer<typeof PdfDataSchema>;

/**
 * Get value from nested object path (e.g., 'profile.fullName')
 */
const getValueByPath = (obj: unknown, path: string): string => {
  if (obj === null || obj === undefined) {
    return '';
  }

  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return '';
    }
  }

  if (current === null || current === undefined) {
    return '';
  }

  if (current instanceof Date) {
    return current.toLocaleDateString(DATE_LOCALE, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  return String(current);
};

/**
 * Render a section with its fields
 */
function renderSection(
  doc: jsPDF,
  section: TemplateDefinition['sections'][number],
  data: PdfData,
  fonts: TemplateDefinition['fonts']
): void {
  const { title, fields, layout } = section;
  const { x, y, width } = layout ?? { x: 20, y: 20, width: 160 };

  // Render section title
  doc.setFont(fonts.header, 'bold');
  doc.setFontSize(fonts.sizes.title);
  doc.text(title, x, y);

  // Render fields
  doc.setFont(fonts.label, 'normal');
  doc.setFontSize(fonts.sizes.small);

  fields.forEach((field) => {
    if (field.conditionalRender && !field.conditionalRender(data)) {
      return;
    }

    const labelY = y + fonts.sizes.title + 5 + field.position.y;
    const valueY = labelY + 5;

    doc.setFont(fonts.label, 'bold');
    doc.text(field.label, x + field.position.x, labelY);

    const value = getValueByPath(data, field.valuePath);
    doc.setFont(fonts.body, 'normal');

    if (field.valuePath === 'signatureDataUrl' && value && value.startsWith('data:image')) {
      try {
        doc.addImage(value, 'PNG', x + field.position.x, valueY, SIGNATURE_WIDTH, SIGNATURE_HEIGHT);
      } catch {
        doc.text('(Unable to render signature)', x + field.position.x, valueY);
      }
    } else {
      const maxWidth = width - field.position.x;
      const textLines = doc.splitTextToSize(value, maxWidth);
      if (Array.isArray(textLines)) {
        textLines.forEach((line: string, index: number) => {
          doc.text(line, x + field.position.x, valueY + (index * 4));
        });
      } else {
        doc.text(textLines, x + field.position.x, valueY);
      }
    }
  });
}

/**
 * Generate a leave request PDF based on template and data.
 *
 * @param data - The leave request data
 * @param template - The PDF template definition
 * @returns Promise<Blob> - The generated PDF as a Blob
 * @throws Error if PDF generation fails
 */
export const generateLeaveRequestPdf = async (
  data: LeaveRequest,
  template: TemplateDefinition
): Promise<Blob> => {
  try {
    // Validate input data
    const pdfData = PdfDataSchema.parse(data);

    // Create new PDF document with template settings
    const doc = new jsPDF({
      format: template.pageSettings.format,
      orientation: template.pageSettings.orientation,
      unit: 'mm',
    });

    // Render each section
    template.sections.forEach((section) => {
      renderSection(doc, section, pdfData, template.fonts);
    });

    // Generate PDF as Blob
    const blob = doc.output('blob');

    return blob;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
    throw new Error('Failed to generate PDF: Unknown error');
  }
};

/**
 * Generate and download a leave request PDF.
 *
 * @param data - The leave request data
 * @param template - The PDF template definition
 * @returns Promise<void>
 * @throws Error if PDF generation or download fails
 */
export const downloadLeaveRequestPdf = async (
  data: LeaveRequest,
  template: TemplateDefinition
): Promise<void> => {
  try {
    const blob = await generateLeaveRequestPdf(data, template);

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
