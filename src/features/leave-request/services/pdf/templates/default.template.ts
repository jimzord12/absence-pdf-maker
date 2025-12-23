import type { TemplateDefinition } from './template.types';

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
  sections: [
    {
      title: 'Profile',
      fields: [],
      layout: { x: 20, y: 50, width: 170 },
    },
    {
      title: 'Leave Details',
      fields: [],
      layout: { x: 20, y: 100, width: 170 },
    },
    {
      title: 'Signature',
      fields: [],
      layout: { x: 20, y: 150, width: 170 },
    },
  ],
};
