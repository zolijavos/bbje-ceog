/**
 * Email Templates Service Unit Tests
 *
 * Tests for: lib/services/email-templates.ts
 *
 * Coverage targets:
 * - interpolateTemplate() - Variable substitution
 * - getAllTemplates() - List all templates
 * - getTemplate() - Get single template
 * - getTemplateWithFallback() - Get with default fallback
 * - upsertTemplate() - Create or update template
 * - deleteTemplate() - Delete template
 * - initializeDefaultTemplates() - Initialize defaults
 * - resetTemplateToDefault() - Reset to default
 * - renderTemplate() - Render with variables
 */

import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

// Mock Prisma
vi.mock('@/lib/db/prisma', () => ({
  prisma: {
    emailTemplate: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logError: vi.fn(),
}));

import { prisma } from '@/lib/db/prisma';
import {
  interpolateTemplate,
  getAllTemplates,
  getTemplate,
  getTemplateWithFallback,
  upsertTemplate,
  deleteTemplate,
  initializeDefaultTemplates,
  resetTemplateToDefault,
  renderTemplate,
  DEFAULT_TEMPLATES,
} from '@/lib/services/email-templates';

describe('Email Templates Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // interpolateTemplate() Tests
  // ============================================
  describe('interpolateTemplate', () => {
    it('should substitute simple variables', () => {
      const template = 'Hello {{name}}, welcome to {{event}}!';
      const variables = { name: 'John', event: 'CEO Gala' };

      const result = interpolateTemplate(template, variables);

      expect(result).toBe('Hello John, welcome to CEO Gala!');
    });

    it('should handle missing variables', () => {
      const template = 'Hello {{name}}, your order {{orderId}}';
      const variables = { name: 'John' };

      const result = interpolateTemplate(template, variables);

      expect(result).toBe('Hello John, your order ');
    });

    it('should handle undefined values', () => {
      const template = 'Hello {{name}}';
      const variables = { name: undefined };

      const result = interpolateTemplate(template, variables);

      expect(result).toBe('Hello ');
    });

    it('should escape HTML by default', () => {
      const template = 'Message: {{content}}';
      const variables = { content: '<script>alert("xss")</script>' };

      const result = interpolateTemplate(template, variables);

      expect(result).toBe('Message: &lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should not escape HTML when escapeValues is false', () => {
      const template = 'Message: {{content}}';
      const variables = { content: '<b>Bold</b>' };

      const result = interpolateTemplate(template, variables, false);

      expect(result).toBe('Message: <b>Bold</b>');
    });

    it('should handle conditional blocks - show when truthy', () => {
      const template = '{{#if partnerName}}Partner: {{partnerName}}{{/if}}';
      const variables = { partnerName: 'Jane' };

      const result = interpolateTemplate(template, variables);

      expect(result).toBe('Partner: Jane');
    });

    it('should handle conditional blocks - hide when falsy', () => {
      const template = 'Guest{{#if partnerName}} + {{partnerName}}{{/if}}';
      const variables = { partnerName: undefined };

      const result = interpolateTemplate(template, variables);

      expect(result).toBe('Guest');
    });

    it('should handle conditional blocks - hide when empty string', () => {
      const template = '{{#if note}}Note: {{note}}{{/if}}';
      const variables = { note: '' };

      const result = interpolateTemplate(template, variables);

      expect(result).toBe('');
    });

    it('should handle conditional with nested variable', () => {
      // Note: True nested conditionals are not supported, but conditionals with variables inside work
      const template = '{{#if hasTable}}Table: {{tableName}}{{/if}}';
      const variables = { hasTable: 'yes', tableName: 'VIP 1' };

      const result = interpolateTemplate(template, variables);

      expect(result).toBe('Table: VIP 1');
    });

    it('should escape special characters in variables only', () => {
      // Note: Only variable values are escaped, not the template itself
      const template = '{{name}} & {{company}}';
      const variables = { name: 'John & Jane', company: "Tom's Corp" };

      const result = interpolateTemplate(template, variables);

      // The & in template stays as-is, but values are escaped
      expect(result).toBe('John &amp; Jane & Tom&#39;s Corp');
    });

    it('should handle multiline templates', () => {
      const template = `Dear {{name}},

Welcome to {{event}}.

Best regards`;
      const variables = { name: 'John', event: 'CEO Gala' };

      const result = interpolateTemplate(template, variables);

      expect(result).toContain('Dear John,');
      expect(result).toContain('Welcome to CEO Gala.');
    });
  });

  // ============================================
  // getAllTemplates() Tests
  // ============================================
  describe('getAllTemplates', () => {
    it('should return all templates sorted by name', async () => {
      const mockTemplates = [
        { id: 1, slug: 'magic_link', name: 'Magic Link' },
        { id: 2, slug: 'ticket_delivery', name: 'Ticket Delivery' },
      ];
      (prisma.emailTemplate.findMany as Mock).mockResolvedValue(mockTemplates);

      const result = await getAllTemplates();

      expect(result).toEqual(mockTemplates);
      expect(prisma.emailTemplate.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });

    it('should return empty array when no templates', async () => {
      (prisma.emailTemplate.findMany as Mock).mockResolvedValue([]);

      const result = await getAllTemplates();

      expect(result).toEqual([]);
    });
  });

  // ============================================
  // getTemplate() Tests
  // ============================================
  describe('getTemplate', () => {
    it('should return template by slug', async () => {
      const mockTemplate = {
        id: 1,
        slug: 'magic_link',
        name: 'Magic Link',
        subject: 'Test Subject',
      };
      (prisma.emailTemplate.findUnique as Mock).mockResolvedValue(mockTemplate);

      const result = await getTemplate('magic_link');

      expect(result).toEqual(mockTemplate);
      expect(prisma.emailTemplate.findUnique).toHaveBeenCalledWith({
        where: { slug: 'magic_link' },
      });
    });

    it('should return null if template not found', async () => {
      (prisma.emailTemplate.findUnique as Mock).mockResolvedValue(null);

      const result = await getTemplate('magic_link');

      expect(result).toBeNull();
    });
  });

  // ============================================
  // getTemplateWithFallback() Tests
  // ============================================
  describe('getTemplateWithFallback', () => {
    it('should return DB template when active', async () => {
      const mockTemplate = {
        id: 1,
        slug: 'magic_link',
        subject: 'Custom Subject',
        html_body: '<p>Custom HTML</p>',
        text_body: 'Custom text',
        variables: '["guestName","magicLinkUrl"]',
        is_active: true,
      };
      (prisma.emailTemplate.findUnique as Mock).mockResolvedValue(mockTemplate);

      const result = await getTemplateWithFallback('magic_link');

      expect(result.subject).toBe('Custom Subject');
      expect(result.html_body).toBe('<p>Custom HTML</p>');
      expect(result.text_body).toBe('Custom text');
      expect(result.variables).toEqual(['guestName', 'magicLinkUrl']);
    });

    it('should return default template when DB template inactive', async () => {
      const mockTemplate = {
        id: 1,
        slug: 'magic_link',
        subject: 'Custom Subject',
        is_active: false,
      };
      (prisma.emailTemplate.findUnique as Mock).mockResolvedValue(mockTemplate);

      const result = await getTemplateWithFallback('magic_link');

      expect(result.subject).toBe(DEFAULT_TEMPLATES.magic_link.subject);
    });

    it('should return default template when not in DB', async () => {
      (prisma.emailTemplate.findUnique as Mock).mockResolvedValue(null);

      const result = await getTemplateWithFallback('magic_link');

      expect(result.subject).toBe(DEFAULT_TEMPLATES.magic_link.subject);
      expect(result.variables).toEqual([...DEFAULT_TEMPLATES.magic_link.variables]);
    });

    it('should handle all template slugs', async () => {
      (prisma.emailTemplate.findUnique as Mock).mockResolvedValue(null);

      const slugs = Object.keys(DEFAULT_TEMPLATES) as Array<keyof typeof DEFAULT_TEMPLATES>;

      for (const slug of slugs) {
        const result = await getTemplateWithFallback(slug);
        expect(result.subject).toBeDefined();
        expect(result.html_body).toBeDefined();
        expect(result.text_body).toBeDefined();
      }
    });
  });

  // ============================================
  // upsertTemplate() Tests
  // ============================================
  describe('upsertTemplate', () => {
    const templateData = {
      slug: 'magic_link',
      name: 'Magic Link',
      subject: 'Test Subject',
      html_body: '<p>HTML</p>',
      text_body: 'Text',
      variables: ['var1', 'var2'],
    };

    it('should create new template', async () => {
      (prisma.emailTemplate.upsert as Mock).mockResolvedValue({ id: 1, ...templateData });

      const result = await upsertTemplate(templateData);

      expect(result.id).toBe(1);
      expect(prisma.emailTemplate.upsert).toHaveBeenCalledWith({
        where: { slug: 'magic_link' },
        create: expect.objectContaining({
          slug: 'magic_link',
          name: 'Magic Link',
          variables: '["var1","var2"]',
          is_active: true,
        }),
        update: expect.objectContaining({
          name: 'Magic Link',
          variables: '["var1","var2"]',
          is_active: true,
        }),
      });
    });

    it('should update existing template', async () => {
      (prisma.emailTemplate.upsert as Mock).mockResolvedValue({ id: 1 });

      await upsertTemplate({
        ...templateData,
        subject: 'Updated Subject',
      });

      expect(prisma.emailTemplate.upsert).toHaveBeenCalled();
    });

    it('should handle is_active flag', async () => {
      (prisma.emailTemplate.upsert as Mock).mockResolvedValue({ id: 1 });

      await upsertTemplate({
        ...templateData,
        is_active: false,
      });

      const call = (prisma.emailTemplate.upsert as Mock).mock.calls[0][0];
      expect(call.create.is_active).toBe(false);
      expect(call.update.is_active).toBe(false);
    });

    it('should stringify variables array', async () => {
      (prisma.emailTemplate.upsert as Mock).mockResolvedValue({ id: 1 });

      await upsertTemplate(templateData);

      const call = (prisma.emailTemplate.upsert as Mock).mock.calls[0][0];
      expect(call.create.variables).toBe('["var1","var2"]');
    });
  });

  // ============================================
  // deleteTemplate() Tests
  // ============================================
  describe('deleteTemplate', () => {
    it('should delete template by slug', async () => {
      (prisma.emailTemplate.delete as Mock).mockResolvedValue({ id: 1 });

      await deleteTemplate('magic_link');

      expect(prisma.emailTemplate.delete).toHaveBeenCalledWith({
        where: { slug: 'magic_link' },
      });
    });
  });

  // ============================================
  // initializeDefaultTemplates() Tests
  // ============================================
  describe('initializeDefaultTemplates', () => {
    it('should create missing templates', async () => {
      (prisma.emailTemplate.findUnique as Mock).mockResolvedValue(null);
      (prisma.emailTemplate.create as Mock).mockResolvedValue({ id: 1 });

      await initializeDefaultTemplates();

      // Should try to create all default templates
      const templateCount = Object.keys(DEFAULT_TEMPLATES).length;
      expect(prisma.emailTemplate.findUnique).toHaveBeenCalledTimes(templateCount);
      expect(prisma.emailTemplate.create).toHaveBeenCalledTimes(templateCount);
    });

    it('should not create existing templates', async () => {
      (prisma.emailTemplate.findUnique as Mock).mockResolvedValue({ id: 1 });

      await initializeDefaultTemplates();

      expect(prisma.emailTemplate.create).not.toHaveBeenCalled();
    });

    it('should handle create errors gracefully', async () => {
      (prisma.emailTemplate.findUnique as Mock).mockResolvedValue(null);
      (prisma.emailTemplate.create as Mock).mockRejectedValue(new Error('DB error'));

      // Should not throw
      await expect(initializeDefaultTemplates()).resolves.not.toThrow();
    });

    it('should create templates with correct structure', async () => {
      (prisma.emailTemplate.findUnique as Mock).mockResolvedValue(null);
      (prisma.emailTemplate.create as Mock).mockResolvedValue({ id: 1 });

      await initializeDefaultTemplates();

      // Check first call includes expected fields
      const firstCall = (prisma.emailTemplate.create as Mock).mock.calls[0][0];
      expect(firstCall.data).toHaveProperty('slug');
      expect(firstCall.data).toHaveProperty('name');
      expect(firstCall.data).toHaveProperty('subject');
      expect(firstCall.data).toHaveProperty('html_body');
      expect(firstCall.data).toHaveProperty('text_body');
      expect(firstCall.data).toHaveProperty('variables');
      expect(firstCall.data.is_active).toBe(true);
    });
  });

  // ============================================
  // resetTemplateToDefault() Tests
  // ============================================
  describe('resetTemplateToDefault', () => {
    it('should reset template to default values', async () => {
      (prisma.emailTemplate.upsert as Mock).mockResolvedValue({
        id: 1,
        slug: 'magic_link',
      });

      const result = await resetTemplateToDefault('magic_link');

      expect(result?.slug).toBe('magic_link');
      expect(prisma.emailTemplate.upsert).toHaveBeenCalledWith({
        where: { slug: 'magic_link' },
        create: expect.objectContaining({
          slug: DEFAULT_TEMPLATES.magic_link.slug,
          name: DEFAULT_TEMPLATES.magic_link.name,
          subject: DEFAULT_TEMPLATES.magic_link.subject,
        }),
        update: expect.objectContaining({
          name: DEFAULT_TEMPLATES.magic_link.name,
          subject: DEFAULT_TEMPLATES.magic_link.subject,
        }),
      });
    });

    it('should return null for invalid slug', async () => {
      // Cast to test invalid slug
      const result = await resetTemplateToDefault('invalid_slug' as 'magic_link');

      expect(result).toBeNull();
      expect(prisma.emailTemplate.upsert).not.toHaveBeenCalled();
    });

    it('should set is_active to true', async () => {
      (prisma.emailTemplate.upsert as Mock).mockResolvedValue({ id: 1 });

      await resetTemplateToDefault('magic_link');

      const call = (prisma.emailTemplate.upsert as Mock).mock.calls[0][0];
      expect(call.create.is_active).toBe(true);
      expect(call.update.is_active).toBe(true);
    });
  });

  // ============================================
  // renderTemplate() Tests
  // ============================================
  describe('renderTemplate', () => {
    beforeEach(() => {
      // Return null to use default templates
      (prisma.emailTemplate.findUnique as Mock).mockResolvedValue(null);
    });

    it('should render template with variables', async () => {
      const result = await renderTemplate('magic_link', {
        guestName: 'John Doe',
        magicLinkUrl: 'https://example.com/register?code=abc123',
      });

      expect(result.subject).toContain('CEO Gala');
      expect(result.html).toContain('John Doe');
      expect(result.html).toContain('https://example.com/register?code=abc123');
      expect(result.text).toContain('John Doe');
    });

    it('should escape HTML in rendered output', async () => {
      const result = await renderTemplate('magic_link', {
        guestName: '<script>alert("xss")</script>',
        magicLinkUrl: 'https://example.com',
      });

      expect(result.html).toContain('&lt;script&gt;');
      expect(result.html).not.toContain('<script>alert');
    });

    it('should not escape in text output', async () => {
      const result = await renderTemplate('magic_link', {
        guestName: 'John & Jane',
        magicLinkUrl: 'https://example.com',
      });

      expect(result.text).toContain('John & Jane');
    });

    it('should use DB template when available', async () => {
      (prisma.emailTemplate.findUnique as Mock).mockResolvedValue({
        slug: 'magic_link',
        subject: 'Custom: {{guestName}}',
        html_body: '<p>Custom HTML for {{guestName}}</p>',
        text_body: 'Custom text for {{guestName}}',
        variables: '["guestName"]',
        is_active: true,
      });

      const result = await renderTemplate('magic_link', {
        guestName: 'John',
        magicLinkUrl: 'https://example.com',
      });

      expect(result.subject).toBe('Custom: John');
      expect(result.html).toBe('<p>Custom HTML for John</p>');
      expect(result.text).toBe('Custom text for John');
    });

    it('should handle missing variables gracefully', async () => {
      const result = await renderTemplate('magic_link', {
        guestName: 'John',
        // magicLinkUrl is missing
      });

      expect(result.html).toContain('John');
      // Missing variable should be replaced with empty string
      expect(result.html).not.toContain('{{magicLinkUrl}}');
    });

    it('should render all template types', async () => {
      const templateSlugs = Object.keys(DEFAULT_TEMPLATES) as Array<keyof typeof DEFAULT_TEMPLATES>;

      for (const slug of templateSlugs) {
        const result = await renderTemplate(slug, {
          guestName: 'Test',
          magicLinkUrl: 'https://example.com',
          ticketType: 'VIP',
          amount: '100,000 Ft',
          tableName: 'Table 1',
          eventDate: '2026-03-27',
          eventTime: '18:00',
          eventVenue: 'Budapest',
          qrCodeDataUrl: 'data:image/png;base64,test',
        });

        expect(result.subject).toBeDefined();
        expect(result.html).toBeDefined();
        expect(result.text).toBeDefined();
      }
    });
  });

  // ============================================
  // DEFAULT_TEMPLATES constant Tests
  // ============================================
  describe('DEFAULT_TEMPLATES', () => {
    it('should have all required templates', () => {
      const requiredSlugs = [
        'magic_link',
        'applicant_approval',
        'applicant_rejection',
        'payment_reminder',
        'payment_confirmation',
        'table_assignment',
        'event_reminder',
        'ticket_delivery',
      ];

      requiredSlugs.forEach((slug) => {
        expect(DEFAULT_TEMPLATES).toHaveProperty(slug);
      });
    });

    it('should have required properties in each template', () => {
      Object.entries(DEFAULT_TEMPLATES).forEach(([slug, template]) => {
        expect(template).toHaveProperty('slug');
        expect(template.slug).toBe(slug);
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('subject');
        expect(template).toHaveProperty('html_body');
        expect(template).toHaveProperty('text_body');
        expect(template).toHaveProperty('variables');
        expect(Array.isArray(template.variables)).toBe(true);
      });
    });

    it('should have valid HTML in html_body', () => {
      Object.values(DEFAULT_TEMPLATES).forEach((template) => {
        expect(template.html_body).toContain('<!DOCTYPE html>');
        expect(template.html_body).toContain('</html>');
      });
    });

    it('should have variables referenced in templates', () => {
      Object.values(DEFAULT_TEMPLATES).forEach((template) => {
        template.variables.forEach((variable) => {
          // Each variable should be used in either HTML or text body
          const htmlContains = template.html_body.includes(`{{${variable}}}`);
          const textContains = template.text_body.includes(`{{${variable}}}`);
          const htmlContainsConditional = template.html_body.includes(`{{#if ${variable}}}`);
          const textContainsConditional = template.text_body.includes(`{{#if ${variable}}}`);

          expect(
            htmlContains || textContains || htmlContainsConditional || textContainsConditional
          ).toBe(true);
        });
      });
    });
  });
});
