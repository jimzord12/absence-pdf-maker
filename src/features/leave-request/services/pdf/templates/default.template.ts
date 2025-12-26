import type { TemplateDefinition } from './template.types';

/**
 * Default PDF template for leave request documents.
 * Uses A4 portrait format with professional spacing and typography.
 */
export const defaultTemplate: TemplateDefinition = {
  pageSettings: {
    format: 'a4',
    orientation: 'portrait',
    margins: { top: 20, right: 20, bottom: 20, left: 20 },
  },
  fonts: {
    header: 'helvetica',
    body: 'helvetica',
    label: 'helvetica',
    sizes: { small: 8, normal: 10, large: 12, title: 16 },
  },
  logo: {
    path: '',
    position: {
      x: 20,
      y: 20,
      width: 50,
      height: 50,
    },
  },
  sections: [
    {
      title: 'Leave Request',
      fields: [],
      layout: {
        x: 80,
        y: 20,
        width: 100,
      },
    },
    {
      title: 'Employee Information',
      fields: [
        {
          label: 'Full Name',
          valuePath: 'profile.fullName',
          position: { x: 0, y: 0 },
        },
        {
          label: 'Employee ID',
          valuePath: 'profile.employeeId',
          position: { x: 0, y: 8 },
        },
        {
          label: 'Email',
          valuePath: 'profile.email',
          position: { x: 0, y: 16 },
        },
        {
          label: 'Phone',
          valuePath: 'profile.phone',
          position: { x: 0, y: 24 },
        },
        {
          label: 'Department',
          valuePath: 'profile.department',
          position: { x: 80, y: 0 },
        },
        {
          label: 'Position',
          valuePath: 'profile.position',
          position: { x: 80, y: 8 },
        },
      ],
      layout: {
        x: 20,
        y: 75,
        width: 160,
      },
    },
    {
      title: 'Leave Details',
      fields: [
        {
          label: 'Leave Type',
          valuePath: 'leaveType',
          position: { x: 0, y: 0 },
        },
        {
          label: 'Start Date',
          valuePath: 'startDate',
          position: { x: 0, y: 8 },
        },
        {
          label: 'End Date',
          valuePath: 'endDate',
          position: { x: 0, y: 16 },
        },
        {
          label: 'Reason',
          valuePath: 'reason',
          position: { x: 0, y: 24 },
        },
      ],
      layout: {
        x: 20,
        y: 120,
        width: 160,
      },
    },
    {
      title: 'Signature',
      fields: [
        {
          label: 'Employee Signature',
          valuePath: 'signatureDataUrl',
          position: { x: 0, y: 0 },
        },
        {
          label: 'Date',
          valuePath: 'createdAt',
          position: { x: 80, y: 0 },
        },
      ],
      layout: {
        x: 20,
        y: 180,
        width: 160,
      },
    },
  ],
};
