'use client';

/**
 * Guest Profile Fields Component
 *
 * Reusable component for guest profile information:
 * - Title/Salutation (optional)
 * - Phone (required)
 * - Company (required)
 * - Position (required)
 * - Dietary requirements (optional)
 * - Seating preferences (optional)
 */

import { titleOptions, type TitleOption } from '@/lib/validations/guest-profile';

interface GuestProfileFieldsProps {
  title: string;
  phone: string;
  company: string;
  position: string;
  dietaryRequirements: string;
  seatingPreferences: string;
  onTitleChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onCompanyChange: (value: string) => void;
  onPositionChange: (value: string) => void;
  onDietaryChange: (value: string) => void;
  onSeatingChange: (value: string) => void;
  errors?: {
    title?: string;
    phone?: string;
    company?: string;
    position?: string;
    dietary_requirements?: string;
    seating_preferences?: string;
  };
}

export default function GuestProfileFields({
  title,
  phone,
  company,
  position,
  dietaryRequirements,
  seatingPreferences,
  onTitleChange,
  onPhoneChange,
  onCompanyChange,
  onPositionChange,
  onDietaryChange,
  onSeatingChange,
  errors,
}: GuestProfileFieldsProps) {
  return (
    <div className="space-y-4">
      {/* Title/Salutation */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Title (optional)
        </label>
        <select
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white ${
            errors?.title ? 'border-red-500' : 'border-slate-300'
          }`}
          data-testid="title-select"
        >
          <option value="">-- Please select --</option>
          {titleOptions.filter(t => t !== '').map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors?.title && (
          <p className="text-red-600 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      {/* Phone Number - REQUIRED */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
            errors?.phone ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="+36 30 123 4567"
          data-testid="phone-input"
        />
        {errors?.phone && (
          <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
        )}
      </div>

      {/* Company - REQUIRED */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Company / Organization <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={company}
          onChange={(e) => onCompanyChange(e.target.value)}
          maxLength={255}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
            errors?.company ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="Company Ltd."
          data-testid="company-input"
        />
        {errors?.company && (
          <p className="text-red-600 text-sm mt-1">{errors.company}</p>
        )}
      </div>

      {/* Position - REQUIRED */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Position <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={position}
          onChange={(e) => onPositionChange(e.target.value)}
          maxLength={100}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
            errors?.position ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="CEO"
          data-testid="position-input"
        />
        {errors?.position && (
          <p className="text-red-600 text-sm mt-1">{errors.position}</p>
        )}
      </div>

      {/* Dietary Requirements */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Dietary Requirements / Food Allergies (optional)
        </label>
        <textarea
          value={dietaryRequirements}
          onChange={(e) => onDietaryChange(e.target.value)}
          maxLength={500}
          rows={2}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
            errors?.dietary_requirements ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="E.g., vegetarian, gluten-free, lactose-free, nut allergy..."
          data-testid="dietary-input"
        />
        <div className="flex justify-between mt-1">
          {errors?.dietary_requirements ? (
            <p className="text-red-600 text-sm">{errors.dietary_requirements}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-slate-500">{dietaryRequirements.length}/500</span>
        </div>
      </div>

      {/* Seating Preferences */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Seating Preferences (optional)
        </label>
        <textarea
          value={seatingPreferences}
          onChange={(e) => onSeatingChange(e.target.value)}
          maxLength={500}
          rows={2}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
            errors?.seating_preferences ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="Who would you like to sit with? (e.g., John Smith, the Marketing team)"
          data-testid="seating-input"
        />
        <div className="flex justify-between mt-1">
          {errors?.seating_preferences ? (
            <p className="text-red-600 text-sm">{errors.seating_preferences}</p>
          ) : (
            <span />
          )}
          <span className="text-xs text-slate-500">{seatingPreferences.length}/500</span>
        </div>
      </div>
    </div>
  );
}
