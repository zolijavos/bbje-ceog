/**
 * Guest Profile Validation Schemas
 * Zod schemas for guest profile extension fields
 */

import { z } from 'zod';

// Title/Salutation options (English)
export const titleOptions = ['', 'H.E. Mr.', 'H.E. Ms.', 'Dr.', 'Prof.', 'Prof. Dr.', 'Mr.', 'Mrs.', 'Ms.'] as const;
export type TitleOption = typeof titleOptions[number];

// Hungarian phone number regex (accepts various formats)
const phoneRegex = /^(\+36|06)?[ -]?(1|20|30|31|50|70|90)[ -]?[0-9]{3}[ -]?[0-9]{4}$/;

// Guest profile fields schema
export const guestProfileSchema = z.object({
  title: z.enum(titleOptions).optional().nullable(),
  phone: z.string()
    .min(1, 'Phone number is required')
    .regex(phoneRegex, 'Invalid phone format (e.g. +36 30 123 4567)')
    .or(z.string().min(9, 'Phone number must be at least 9 characters')), // Fallback for international
  company: z.string()
    .min(1, 'Company name is required')
    .max(255, 'Company name maximum 255 characters'),
  position: z.string()
    .min(1, 'Position is required')
    .max(100, 'Position maximum 100 characters'),
  dietary_requirements: z.string().max(500, 'Maximum 500 characters').optional().nullable(),
  seating_preferences: z.string().max(500, 'Maximum 500 characters').optional().nullable(),
});

export type GuestProfileInput = z.infer<typeof guestProfileSchema>;

// Billing info schema for paying guests
export const billingInfoSchema = z.object({
  billing_first_name: z.string()
    .min(1, 'First name is required')
    .max(127, 'First name maximum 127 characters'),
  billing_last_name: z.string()
    .min(1, 'Last name is required')
    .max(127, 'Last name maximum 127 characters'),
  company_name: z.string()
    .max(255, 'Company name maximum 255 characters')
    .optional()
    .nullable(),
  tax_number: z.string()
    .regex(/^[0-9]{8}-[0-9]-[0-9]{2}$/, 'Invalid tax number format (e.g. 12345678-1-42)')
    .optional()
    .nullable()
    .or(z.literal('')),
  address_line1: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(255, 'Address maximum 255 characters'),
  address_line2: z.string()
    .max(255, 'Address line 2 maximum 255 characters')
    .optional()
    .nullable(),
  city: z.string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City maximum 100 characters'),
  postal_code: z.string()
    .regex(/^[0-9]{4}$/, 'Invalid postal code (4 digits required)'),
  country: z.string()
    .length(2, 'Country code must be 2 characters')
    .default('HU'),
});

export type BillingInfoInput = z.infer<typeof billingInfoSchema>;

// Consent checkboxes schema
export const consentSchema = z.object({
  gdpr_consent: z.literal(true, {
    errorMap: () => ({ message: 'GDPR data processing consent is required' }),
  }),
  cancellation_accepted: z.literal(true, {
    errorMap: () => ({ message: 'Acceptance of cancellation terms is required' }),
  }),
});

export type ConsentInput = z.infer<typeof consentSchema>;

// Partner info schema for paired tickets
export const partnerSchema = z.object({
  partner_first_name: z.string()
    .min(1, 'Partner first name is required')
    .max(127, 'Partner first name maximum 127 characters'),
  partner_last_name: z.string()
    .min(1, 'Partner last name is required')
    .max(127, 'Partner last name maximum 127 characters'),
  partner_email: z.string()
    .email('Invalid email address')
    .max(255, 'Email maximum 255 characters'),
});

export type PartnerInput = z.infer<typeof partnerSchema>;

// Combined VIP registration schema
export const vipRegistrationSchema = z.object({
  // Guest profile fields
  ...guestProfileSchema.shape,
  // Consent fields
  ...consentSchema.shape,
});

export type VipRegistrationInput = z.infer<typeof vipRegistrationSchema>;

// Combined paid single registration schema
export const paidSingleRegistrationSchema = z.object({
  // Guest profile fields
  ...guestProfileSchema.shape,
  // Billing info
  billing_info: billingInfoSchema,
  // Consent fields
  ...consentSchema.shape,
});

export type PaidSingleRegistrationInput = z.infer<typeof paidSingleRegistrationSchema>;

// Combined paid paired registration schema
export const paidPairedRegistrationSchema = z.object({
  // Guest profile fields
  ...guestProfileSchema.shape,
  // Partner info - REQUIRED for paired tickets
  ...partnerSchema.shape,
  // Billing info
  billing_info: billingInfoSchema,
  // Consent fields
  ...consentSchema.shape,
});

export type PaidPairedRegistrationInput = z.infer<typeof paidPairedRegistrationSchema>;

// Helper function to validate billing tax number format
export function isValidHungarianTaxNumber(taxNumber: string | null | undefined): boolean {
  if (!taxNumber) return true; // Optional field
  return /^[0-9]{8}-[0-9]-[0-9]{2}$/.test(taxNumber);
}

// Helper function to validate Hungarian postal code
export function isValidHungarianPostalCode(postalCode: string): boolean {
  return /^[0-9]{4}$/.test(postalCode);
}
