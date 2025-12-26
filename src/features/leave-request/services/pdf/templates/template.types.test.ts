import { describe, it, expect } from 'vitest';
import type { TemplateField, TemplateSection, TemplateDefinition } from './template.types';

describe('Template Types', () => {
  describe('TemplateField', () => {
    it('should have required properties: label, valuePath, position', () => {
      const field: TemplateField = {
        label: 'Employee Name',
        valuePath: 'profile.fullName',
        position: { x: 20, y: 50 }
      };

      expect(field.label).toBe('Employee Name');
      expect(field.valuePath).toBe('profile.fullName');
      expect(field.position.x).toBe(20);
      expect(field.position.y).toBe(50);
    });

    it('should support coordinate-based positioning', () => {
      const field: TemplateField = {
        label: 'Label',
        valuePath: 'value',
        position: { x: 100, y: 200 }
      };

      expect(typeof field.position.x).toBe('number');
      expect(typeof field.position.y).toBe('number');
    });
  });

  describe('TemplateSection', () => {
    it('should have required properties: title, fields', () => {
      const section: TemplateSection = {
        title: 'Personal Details',
        fields: [
          { label: 'Name', valuePath: 'profile.fullName', position: { x: 20, y: 50 } }
        ]
      };

      expect(section.title).toBe('Personal Details');
      expect(section.fields).toHaveLength(1);
      expect(section.fields[0].label).toBe('Name');
    });

    it('should support optional layout metadata', () => {
      const sectionWithoutLayout: TemplateSection = {
        title: 'Section',
        fields: []
      };

      const sectionWithLayout: TemplateSection = {
        title: 'Section',
        fields: [],
        layout: { x: 10, y: 10, width: 100 }
      };

      expect(sectionWithoutLayout.layout).toBeUndefined();
      expect(sectionWithLayout.layout?.x).toBe(10);
      expect(sectionWithLayout.layout?.y).toBe(10);
      expect(sectionWithLayout.layout?.width).toBe(100);
    });
  });

  describe('TemplateDefinition', () => {
    it('should have required properties: pageSettings, fonts, sections', () => {
      const definition: TemplateDefinition = {
        pageSettings: {
          format: 'a4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        },
        fonts: {
          header: 'Helvetica',
          body: 'Helvetica',
          label: 'Helvetica',
          sizes: { small: 10, normal: 12, large: 14, title: 16 }
        },
        sections: []
      };

      expect(definition.pageSettings.format).toBe('a4');
      expect(definition.pageSettings.orientation).toBe('portrait');
      expect(definition.fonts.sizes.normal).toBe(12);
      expect(Array.isArray(definition.sections)).toBe(true);
    });

    it('should support A4 and portrait/landscape orientations', () => {
      const portraitA4: TemplateDefinition = {
        pageSettings: {
          format: 'a4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        },
        fonts: {
          header: 'Helvetica',
          body: 'Helvetica',
          label: 'Helvetica',
          sizes: { small: 10, normal: 12, large: 14, title: 16 }
        },
        sections: []
      };

      const landscapeA4: TemplateDefinition = {
        pageSettings: {
          format: 'a4',
          orientation: 'landscape',
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        },
        fonts: {
          header: 'Helvetica',
          body: 'Helvetica',
          label: 'Helvetica',
          sizes: { small: 10, normal: 12, large: 14, title: 16 }
        },
        sections: []
      };

      const letterFormat: TemplateDefinition = {
        pageSettings: {
          format: 'letter',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        },
        fonts: {
          header: 'Helvetica',
          body: 'Helvetica',
          label: 'Helvetica',
          sizes: { small: 10, normal: 12, large: 14, title: 16 }
        },
        sections: []
      };

      expect(portraitA4.pageSettings.orientation).toBe('portrait');
      expect(landscapeA4.pageSettings.orientation).toBe('landscape');
      expect(letterFormat.pageSettings.format).toBe('letter');
    });

    it('should support custom fonts and sizes', () => {
      const customFonts: TemplateDefinition = {
        pageSettings: {
          format: 'a4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        },
        fonts: {
          header: 'Arial',
          body: 'Courier New',
          label: 'Times New Roman',
          sizes: { small: 8, normal: 10, large: 12, title: 18 }
        },
        sections: []
      };

      expect(customFonts.fonts.header).toBe('Arial');
      expect(customFonts.fonts.body).toBe('Courier New');
      expect(customFonts.fonts.sizes.title).toBe(18);
    });

    it('should support coordinate-based positioning in fields', () => {
      const definition: TemplateDefinition = {
        pageSettings: {
          format: 'a4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        },
        fonts: {
          header: 'Helvetica',
          body: 'Helvetica',
          label: 'Helvetica',
          sizes: { small: 10, normal: 12, large: 14, title: 16 }
        },
        sections: [
          {
            title: 'Test Section',
            fields: [
              { label: 'Field 1', valuePath: 'value1', position: { x: 50, y: 100 } },
              { label: 'Field 2', valuePath: 'value2', position: { x: 50, y: 120 } }
            ]
          }
        ]
      };

      expect(definition.sections[0].fields[0].position.x).toBe(50);
      expect(definition.sections[0].fields[0].position.y).toBe(100);
      expect(definition.sections[0].fields[1].position.y).toBe(120);
    });

    it('should support optional logo configuration', () => {
      const withoutLogo: TemplateDefinition = {
        pageSettings: {
          format: 'a4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        },
        fonts: {
          header: 'Helvetica',
          body: 'Helvetica',
          label: 'Helvetica',
          sizes: { small: 10, normal: 12, large: 14, title: 16 }
        },
        sections: []
      };

      const withLogo: TemplateDefinition = {
        pageSettings: {
          format: 'a4',
          orientation: 'portrait',
          margins: { top: 20, right: 20, bottom: 20, left: 20 }
        },
        fonts: {
          header: 'Helvetica',
          body: 'Helvetica',
          label: 'Helvetica',
          sizes: { small: 10, normal: 12, large: 14, title: 16 }
        },
        sections: [],
        logo: {
          path: '/logo.png',
          position: { x: 20, y: 20, width: 50, height: 50 }
        }
      };

      expect(withoutLogo.logo).toBeUndefined();
      expect(withLogo.logo?.path).toBe('/logo.png');
      expect(withLogo.logo?.position.width).toBe(50);
    });
  });
});
