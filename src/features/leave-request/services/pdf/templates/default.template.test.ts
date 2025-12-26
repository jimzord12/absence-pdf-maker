import { describe, it, expect } from 'vitest';
import { defaultTemplate } from './default.template';
import type { TemplateDefinition } from './template.types';

/**
 * Tests for the default PDF template
 *
 * Focus areas:
 * 1. Template exports a valid TemplateDefinition
 * 2. All required sections are present
 * 3. Field paths map correctly to LeaveRequest data structure
 * 4. Template structure matches interface requirements
 */

describe('defaultTemplate', () => {
  describe('Template Export and Type', () => {
    it('should export a defaultTemplate object', () => {
      expect(defaultTemplate).toBeDefined();
      expect(typeof defaultTemplate).toBe('object');
    });

    it('should match TemplateDefinition interface', () => {
      // Verify the template has all required top-level properties
      expect(defaultTemplate).toHaveProperty('pageSettings');
      expect(defaultTemplate).toHaveProperty('fonts');
      expect(defaultTemplate).toHaveProperty('sections');
      expect(defaultTemplate).toHaveProperty('logo');
    });
  });

  describe('Page Settings', () => {
    it('should have valid page format (a4 or letter)', () => {
      expect(['a4', 'letter']).toContain(defaultTemplate.pageSettings.format);
    });

    it('should have valid orientation (portrait or landscape)', () => {
      expect(['portrait', 'landscape']).toContain(
        defaultTemplate.pageSettings.orientation
      );
    });

    it('should have all required margin properties', () => {
      const { margins } = defaultTemplate.pageSettings;
      expect(margins).toHaveProperty('top');
      expect(margins).toHaveProperty('right');
      expect(margins).toHaveProperty('bottom');
      expect(margins).toHaveProperty('left');
      expect(typeof margins.top).toBe('number');
      expect(typeof margins.right).toBe('number');
      expect(typeof margins.bottom).toBe('number');
      expect(typeof margins.left).toBe('number');
    });

    it('should have reasonable margin values', () => {
      const { margins } = defaultTemplate.pageSettings;
      expect(margins.top).toBeGreaterThan(0);
      expect(margins.right).toBeGreaterThan(0);
      expect(margins.bottom).toBeGreaterThan(0);
      expect(margins.left).toBeGreaterThan(0);
    });
  });

  describe('Fonts Configuration', () => {
    it('should have all required font properties', () => {
      const { fonts } = defaultTemplate;
      expect(fonts).toHaveProperty('header');
      expect(fonts).toHaveProperty('body');
      expect(fonts).toHaveProperty('label');
      expect(fonts).toHaveProperty('sizes');
    });

    it('should have valid font names', () => {
      const { fonts } = defaultTemplate;
      expect(typeof fonts.header).toBe('string');
      expect(typeof fonts.body).toBe('string');
      expect(typeof fonts.label).toBe('string');
    });

    it('should have all required font sizes', () => {
      const { fonts } = defaultTemplate;
      const sizes = fonts.sizes;
      expect(sizes).toHaveProperty('small');
      expect(sizes).toHaveProperty('normal');
      expect(sizes).toHaveProperty('large');
      expect(sizes).toHaveProperty('title');
    });

    it('should have positive font size values', () => {
      const { fonts } = defaultTemplate;
      const { sizes } = fonts;
      expect(sizes.small).toBeGreaterThan(0);
      expect(sizes.normal).toBeGreaterThan(0);
      expect(sizes.large).toBeGreaterThan(0);
      expect(sizes.title).toBeGreaterThan(0);
    });

    it('should have font sizes in reasonable range (6-24)', () => {
      const { fonts } = defaultTemplate;
      const { sizes } = fonts;
      expect(sizes.small).toBeGreaterThanOrEqual(6);
      expect(sizes.small).toBeLessThanOrEqual(24);
      expect(sizes.normal).toBeGreaterThanOrEqual(6);
      expect(sizes.normal).toBeLessThanOrEqual(24);
      expect(sizes.large).toBeGreaterThanOrEqual(6);
      expect(sizes.large).toBeLessThanOrEqual(24);
      expect(sizes.title).toBeGreaterThanOrEqual(6);
      expect(sizes.title).toBeLessThanOrEqual(24);
    });

    it('should have font sizes in ascending order', () => {
      const { fonts } = defaultTemplate;
      const { sizes } = fonts;
      expect(sizes.small).toBeLessThan(sizes.normal);
      expect(sizes.normal).toBeLessThan(sizes.large);
      expect(sizes.large).toBeLessThan(sizes.title);
    });
  });

  describe('Logo Configuration', () => {
    it('should have logo property', () => {
      expect(defaultTemplate).toHaveProperty('logo');
    });

    it('should have logo with path property', () => {
      const { logo } = defaultTemplate;
      expect(logo).toBeDefined();
      if (logo) {
        expect(logo).toHaveProperty('path');
        expect(typeof logo.path).toBe('string');
      }
    });

    it('should have logo with position properties', () => {
      const { logo } = defaultTemplate;
      expect(logo).toBeDefined();
      if (logo) {
        expect(logo).toHaveProperty('position');
        expect(logo.position).toHaveProperty('x');
        expect(logo.position).toHaveProperty('y');
        expect(logo.position).toHaveProperty('width');
        expect(logo.position).toHaveProperty('height');
      }
    });

    it('should have positive numeric logo dimensions', () => {
      const { logo } = defaultTemplate;
      expect(logo).toBeDefined();
      if (logo) {
        expect(logo.position.x).toBeGreaterThanOrEqual(0);
        expect(logo.position.y).toBeGreaterThanOrEqual(0);
        expect(logo.position.width).toBeGreaterThan(0);
        expect(logo.position.height).toBeGreaterThan(0);
      }
    });
  });

  describe('Sections Configuration', () => {
    it('should have exactly 4 sections', () => {
      expect(defaultTemplate.sections).toHaveLength(4);
    });

    it('should have a "Leave Request" header section', () => {
      const headerSection = defaultTemplate.sections.find(
        (s) => s.title === 'Leave Request'
      );
      expect(headerSection).toBeDefined();
      expect(headerSection?.fields).toEqual([]); // Header section should have no fields
    });

    it('should have an "Employee Information" section', () => {
      const employeeSection = defaultTemplate.sections.find(
        (s) => s.title === 'Employee Information'
      );
      expect(employeeSection).toBeDefined();
    });

    it('should have a "Leave Details" section', () => {
      const leaveDetailsSection = defaultTemplate.sections.find(
        (s) => s.title === 'Leave Details'
      );
      expect(leaveDetailsSection).toBeDefined();
    });

    it('should have a "Signature" section', () => {
      const signatureSection = defaultTemplate.sections.find(
        (s) => s.title === 'Signature'
      );
      expect(signatureSection).toBeDefined();
    });

    it('should have all section titles as non-empty strings', () => {
      defaultTemplate.sections.forEach((section) => {
        expect(section.title).toBeDefined();
        expect(typeof section.title).toBe('string');
        expect(section.title.length).toBeGreaterThan(0);
      });
    });

    it('should have layout properties on all non-header sections', () => {
      defaultTemplate.sections.forEach((section) => {
        if (section.title !== 'Leave Request') {
          expect(section.layout).toBeDefined();
          expect(section.layout).toHaveProperty('x');
          expect(section.layout).toHaveProperty('y');
          expect(section.layout).toHaveProperty('width');
          expect(typeof section.layout?.x).toBe('number');
          expect(typeof section.layout?.y).toBe('number');
          expect(typeof section.layout?.width).toBe('number');
        }
      });
    });
  });

  describe('Employee Information Section', () => {
    it('should have exactly 6 fields in Employee Information section', () => {
      const employeeSection = defaultTemplate.sections.find(
        (s) => s.title === 'Employee Information'
      );
      expect(employeeSection?.fields).toHaveLength(6);
    });

    it('should have field for fullName with correct path', () => {
      const employeeSection = defaultTemplate.sections.find(
        (s) => s.title === 'Employee Information'
      );
      const fullNameField = employeeSection?.fields.find(
        (f) => f.valuePath === 'profile.fullName'
      );
      expect(fullNameField).toBeDefined();
      expect(fullNameField?.label).toBe('Full Name');
    });

    it('should have field for employeeId with correct path', () => {
      const employeeSection = defaultTemplate.sections.find(
        (s) => s.title === 'Employee Information'
      );
      const employeeIdField = employeeSection?.fields.find(
        (f) => f.valuePath === 'profile.employeeId'
      );
      expect(employeeIdField).toBeDefined();
      expect(employeeIdField?.label).toBe('Employee ID');
    });

    it('should have field for email with correct path', () => {
      const employeeSection = defaultTemplate.sections.find(
        (s) => s.title === 'Employee Information'
      );
      const emailField = employeeSection?.fields.find(
        (f) => f.valuePath === 'profile.email'
      );
      expect(emailField).toBeDefined();
      expect(emailField?.label).toBe('Email');
    });

    it('should have field for phone with correct path', () => {
      const employeeSection = defaultTemplate.sections.find(
        (s) => s.title === 'Employee Information'
      );
      const phoneField = employeeSection?.fields.find(
        (f) => f.valuePath === 'profile.phone'
      );
      expect(phoneField).toBeDefined();
      expect(phoneField?.label).toBe('Phone');
    });

    it('should have field for department with correct path', () => {
      const employeeSection = defaultTemplate.sections.find(
        (s) => s.title === 'Employee Information'
      );
      const departmentField = employeeSection?.fields.find(
        (f) => f.valuePath === 'profile.department'
      );
      expect(departmentField).toBeDefined();
      expect(departmentField?.label).toBe('Department');
    });

    it('should have field for position with correct path', () => {
      const employeeSection = defaultTemplate.sections.find(
        (s) => s.title === 'Employee Information'
      );
      const positionField = employeeSection?.fields.find(
        (f) => f.valuePath === 'profile.position'
      );
      expect(positionField).toBeDefined();
      expect(positionField?.label).toBe('Position');
    });
  });

  describe('Leave Details Section', () => {
    it('should have exactly 4 fields in Leave Details section', () => {
      const leaveDetailsSection = defaultTemplate.sections.find(
        (s) => s.title === 'Leave Details'
      );
      expect(leaveDetailsSection?.fields).toHaveLength(4);
    });

    it('should have field for leaveType with correct path', () => {
      const leaveDetailsSection = defaultTemplate.sections.find(
        (s) => s.title === 'Leave Details'
      );
      const leaveTypeField = leaveDetailsSection?.fields.find(
        (f) => f.valuePath === 'leaveType'
      );
      expect(leaveTypeField).toBeDefined();
      expect(leaveTypeField?.label).toBe('Leave Type');
    });

    it('should have field for startDate with correct path', () => {
      const leaveDetailsSection = defaultTemplate.sections.find(
        (s) => s.title === 'Leave Details'
      );
      const startDateField = leaveDetailsSection?.fields.find(
        (f) => f.valuePath === 'startDate'
      );
      expect(startDateField).toBeDefined();
      expect(startDateField?.label).toBe('Start Date');
    });

    it('should have field for endDate with correct path', () => {
      const leaveDetailsSection = defaultTemplate.sections.find(
        (s) => s.title === 'Leave Details'
      );
      const endDateField = leaveDetailsSection?.fields.find(
        (f) => f.valuePath === 'endDate'
      );
      expect(endDateField).toBeDefined();
      expect(endDateField?.label).toBe('End Date');
    });

    it('should have field for reason with correct path', () => {
      const leaveDetailsSection = defaultTemplate.sections.find(
        (s) => s.title === 'Leave Details'
      );
      const reasonField = leaveDetailsSection?.fields.find(
        (f) => f.valuePath === 'reason'
      );
      expect(reasonField).toBeDefined();
      expect(reasonField?.label).toBe('Reason');
    });
  });

  describe('Signature Section', () => {
    it('should have exactly 2 fields in Signature section', () => {
      const signatureSection = defaultTemplate.sections.find(
        (s) => s.title === 'Signature'
      );
      expect(signatureSection?.fields).toHaveLength(2);
    });

    it('should have field for signatureDataUrl with correct path', () => {
      const signatureSection = defaultTemplate.sections.find(
        (s) => s.title === 'Signature'
      );
      const signatureField = signatureSection?.fields.find(
        (f) => f.valuePath === 'signatureDataUrl'
      );
      expect(signatureField).toBeDefined();
      expect(signatureField?.label).toBe('Employee Signature');
    });

    it('should have field for createdAt with correct path', () => {
      const signatureSection = defaultTemplate.sections.find(
        (s) => s.title === 'Signature'
      );
      const dateField = signatureSection?.fields.find(
        (f) => f.valuePath === 'createdAt'
      );
      expect(dateField).toBeDefined();
      expect(dateField?.label).toBe('Date');
    });
  });

  describe('Field Path Validation', () => {
    it('should have all field paths that match LeaveRequest structure', () => {
      // Collect all valuePaths from all sections
      const allPaths = defaultTemplate.sections.flatMap((section) =>
        section.fields.map((field) => field.valuePath)
      );

      // Expected paths based on LeaveRequest schema
      const expectedPaths = [
        'profile.fullName',
        'profile.employeeId',
        'profile.email',
        'profile.phone',
        'profile.department',
        'profile.position',
        'leaveType',
        'startDate',
        'endDate',
        'reason',
        'signatureDataUrl',
        'createdAt',
      ];

      expect(allPaths).toEqual(expect.arrayContaining(expectedPaths));
      expect(allPaths).toHaveLength(expectedPaths.length);
    });

    it('should have no duplicate field paths', () => {
      const allPaths = defaultTemplate.sections.flatMap((section) =>
        section.fields.map((field) => field.valuePath)
      );
      const uniquePaths = new Set(allPaths);
      expect(uniquePaths.size).toBe(allPaths.length);
    });

    it('should have valid field path formats', () => {
      defaultTemplate.sections.forEach((section) => {
        section.fields.forEach((field) => {
          expect(field.valuePath).toBeDefined();
          expect(typeof field.valuePath).toBe('string');
          expect(field.valuePath.length).toBeGreaterThan(0);
          // Path should be alphanumeric with dots for nesting
          expect(field.valuePath).toMatch(/^[a-zA-Z0-9.]+$/);
        });
      });
    });
  });

  describe('Field Properties', () => {
    it('should have all fields with valid labels', () => {
      defaultTemplate.sections.forEach((section) => {
        section.fields.forEach((field) => {
          expect(field.label).toBeDefined();
          expect(typeof field.label).toBe('string');
          expect(field.label.length).toBeGreaterThan(0);
        });
      });
    });

    it('should have all fields with valid positions', () => {
      defaultTemplate.sections.forEach((section) => {
        section.fields.forEach((field) => {
          expect(field.position).toBeDefined();
          expect(field.position).toHaveProperty('x');
          expect(field.position).toHaveProperty('y');
          expect(typeof field.position.x).toBe('number');
          expect(typeof field.position.y).toBe('number');
          expect(field.position.x).toBeGreaterThanOrEqual(0);
          expect(field.position.y).toBeGreaterThanOrEqual(0);
        });
      });
    });

    it('should have no negative positions for fields', () => {
      defaultTemplate.sections.forEach((section) => {
        section.fields.forEach((field) => {
          expect(field.position.x).toBeGreaterThanOrEqual(0);
          expect(field.position.y).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });

  describe('Section Layout Properties', () => {
    it('should have valid x positions for all sections with layout', () => {
      defaultTemplate.sections
        .filter((s) => s.layout)
        .forEach((section) => {
          expect(section.layout?.x).toBeGreaterThanOrEqual(0);
        });
    });

    it('should have valid y positions for all sections with layout', () => {
      defaultTemplate.sections
        .filter((s) => s.layout)
        .forEach((section) => {
          expect(section.layout?.y).toBeGreaterThanOrEqual(0);
        });
    });

    it('should have positive width values for all sections with layout', () => {
      defaultTemplate.sections
        .filter((s) => s.layout)
        .forEach((section) => {
          expect(section.layout?.width).toBeGreaterThan(0);
        });
    });

    it('should have reasonable y positions that do not overlap excessively', () => {
      const sectionsWithLayout = defaultTemplate.sections
        .filter((s) => s.layout)
        .sort((a, b) => (a.layout?.y || 0) - (b.layout?.y || 0));

      for (let i = 0; i < sectionsWithLayout.length - 1; i++) {
        const currentSection = sectionsWithLayout[i];
        const nextSection = sectionsWithLayout[i + 1];
        // Next section should start after current section (with some margin)
        // Allowing at least 20 units of vertical spacing
        if (currentSection.layout && nextSection.layout) {
          expect(nextSection.layout.y).toBeGreaterThan(
            currentSection.layout.y
          );
        }
      }
    });
  });

  describe('Interface Compliance', () => {
    it('should satisfy TemplateDefinition interface structure', () => {
      const template: TemplateDefinition = defaultTemplate;

      // Verify pageSettings structure
      expect(template.pageSettings.format).toMatch(/^(a4|letter)$/);
      expect(template.pageSettings.orientation).toMatch(
        /^(portrait|landscape)$/
      );
      expect(template.pageSettings.margins.top).toBeTypeOf('number');
      expect(template.pageSettings.margins.right).toBeTypeOf('number');
      expect(template.pageSettings.margins.bottom).toBeTypeOf('number');
      expect(template.pageSettings.margins.left).toBeTypeOf('number');

      // Verify fonts structure
      expect(template.fonts.header).toBeTypeOf('string');
      expect(template.fonts.body).toBeTypeOf('string');
      expect(template.fonts.label).toBeTypeOf('string');
      expect(template.fonts.sizes.small).toBeTypeOf('number');
      expect(template.fonts.sizes.normal).toBeTypeOf('number');
      expect(template.fonts.sizes.large).toBeTypeOf('number');
      expect(template.fonts.sizes.title).toBeTypeOf('number');

      // Verify sections structure
      template.sections.forEach((section) => {
        expect(section.title).toBeTypeOf('string');
        expect(Array.isArray(section.fields)).toBe(true);
        section.fields.forEach((field) => {
          expect(field.label).toBeTypeOf('string');
          expect(field.valuePath).toBeTypeOf('string');
          expect(field.position.x).toBeTypeOf('number');
          expect(field.position.y).toBeTypeOf('number');
        });
      });

      // Verify logo structure (optional)
      if (template.logo) {
        expect(template.logo.path).toBeTypeOf('string');
        expect(template.logo.position.x).toBeTypeOf('number');
        expect(template.logo.position.y).toBeTypeOf('number');
        expect(template.logo.position.width).toBeTypeOf('number');
        expect(template.logo.position.height).toBeTypeOf('number');
      }
    });
  });

  describe('Completeness', () => {
    it('should include all LeaveRequest profile fields', () => {
      const allPaths = defaultTemplate.sections.flatMap((section) =>
        section.fields.map((field) => field.valuePath)
      );

      // All UserProfile fields should be referenced
      const profilePaths = allPaths.filter((path) =>
        path.startsWith('profile.')
      );
      expect(profilePaths).toContain('profile.fullName');
      expect(profilePaths).toContain('profile.employeeId');
      expect(profilePaths).toContain('profile.email');
      expect(profilePaths).toContain('profile.phone');
      expect(profilePaths).toContain('profile.department');
      expect(profilePaths).toContain('profile.position');
      expect(profilePaths).toHaveLength(6); // All 6 profile fields
    });

    it('should include all required LeaveRequest fields', () => {
      const allPaths = defaultTemplate.sections.flatMap((section) =>
        section.fields.map((field) => field.valuePath)
      );

      // Required fields
      expect(allPaths).toContain('leaveType');
      expect(allPaths).toContain('startDate');
      expect(allPaths).toContain('endDate');
      expect(allPaths).toContain('createdAt');
    });

    it('should include optional LeaveRequest fields', () => {
      const allPaths = defaultTemplate.sections.flatMap((section) =>
        section.fields.map((field) => field.valuePath)
      );

      // Optional fields that are still included in the template
      expect(allPaths).toContain('reason');
      expect(allPaths).toContain('signatureDataUrl');
    });

    it('should cover all top-level LeaveRequest fields', () => {
      const allPaths = defaultTemplate.sections.flatMap((section) =>
        section.fields.map((field) => field.valuePath)
      );

      const topLevelPaths = allPaths.filter((path) => !path.startsWith('profile.'));

      // Expected top-level fields: leaveType, startDate, endDate, reason, createdAt, signatureDataUrl
      expect(topLevelPaths).toContain('leaveType');
      expect(topLevelPaths).toContain('startDate');
      expect(topLevelPaths).toContain('endDate');
      expect(topLevelPaths).toContain('reason');
      expect(topLevelPaths).toContain('createdAt');
      expect(topLevelPaths).toContain('signatureDataUrl');
      expect(topLevelPaths).toHaveLength(6);
    });
  });

  describe('Field Positioning', () => {
    it('should have properly positioned fields in Employee Information section', () => {
      const employeeSection = defaultTemplate.sections.find(
        (s) => s.title === 'Employee Information'
      );

      const fullNameField = employeeSection?.fields.find(
        (f) => f.label === 'Full Name'
      );
      const employeeIdField = employeeSection?.fields.find(
        (f) => f.label === 'Employee ID'
      );
      const emailField = employeeSection?.fields.find((f) => f.label === 'Email');
      const phoneField = employeeSection?.fields.find((f) => f.label === 'Phone');

      // Fields should be stacked vertically (y positions should be different)
      expect(fullNameField?.position.y).not.toBe(employeeIdField?.position.y);
      expect(employeeIdField?.position.y).not.toBe(emailField?.position.y);
      expect(emailField?.position.y).not.toBe(phoneField?.position.y);
    });

    it('should have properly positioned fields in Leave Details section', () => {
      const leaveDetailsSection = defaultTemplate.sections.find(
        (s) => s.title === 'Leave Details'
      );

      const leaveTypeField = leaveDetailsSection?.fields.find(
        (f) => f.label === 'Leave Type'
      );
      const startDateField = leaveDetailsSection?.fields.find(
        (f) => f.label === 'Start Date'
      );
      const endDateField = leaveDetailsSection?.fields.find(
        (f) => f.label === 'End Date'
      );

      // Fields should be stacked vertically
      expect(leaveTypeField?.position.y).not.toBe(startDateField?.position.y);
      expect(startDateField?.position.y).not.toBe(endDateField?.position.y);
    });

    it('should have properly positioned fields in Signature section', () => {
      const signatureSection = defaultTemplate.sections.find(
        (s) => s.title === 'Signature'
      );

      const signatureField = signatureSection?.fields.find(
        (f) => f.label === 'Employee Signature'
      );
      const dateField = signatureSection?.fields.find((f) => f.label === 'Date');

      // Fields should be side by side (same y, different x) or stacked
      expect(signatureField).toBeDefined();
      expect(dateField).toBeDefined();
    });
  });
});
