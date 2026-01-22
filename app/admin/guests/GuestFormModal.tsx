'use client';

import { useState, useEffect } from 'react';
import { titleOptions } from '@/lib/validations/guest-profile';

interface BillingInfo {
  billing_first_name: string;
  billing_last_name: string;
  billingName: string; // Computed full name
  company_name: string | null;
  tax_number: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postal_code: string;
  country: string;
}

interface GuestFormData {
  email: string;
  first_name: string;
  last_name: string;
  title: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  guest_type: 'vip' | 'invited' | 'paying_single' | 'paying_paired';
  status: 'pending' | 'invited' | 'registered' | 'approved' | 'declined';
  dietary_requirements: string | null;
  seating_preferences: string | null;
  is_vip_reception: boolean;
}

interface PartnerGuestInfo {
  id: number;
  firstName: string;
  lastName: string;
  name: string; // Computed full name
  email: string;
  title?: string | null;
  dietaryRequirements?: string | null;
  seatingPreferences?: string | null;
}

interface GuestFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<GuestFormData>) => Promise<void>;
  initialData?: Partial<GuestFormData> & {
    id?: number;
    partner_first_name?: string | null;
    partner_last_name?: string | null;
    partner_name?: string | null; // Computed full name
    partner_email?: string | null;
    billing_info?: BillingInfo | null;
    // New partner guest relation
    isPartner?: boolean;
    pairedWith?: { id: number; firstName: string; lastName: string; name: string; email: string } | null;
    partnerGuest?: PartnerGuestInfo | null;
  };
  mode: 'add' | 'edit';
}

export default function GuestFormModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  mode,
}: GuestFormModalProps) {
  const [formData, setFormData] = useState<GuestFormData>({
    email: '',
    first_name: '',
    last_name: '',
    title: null,
    phone: null,
    company: null,
    position: null,
    guest_type: 'invited',
    status: 'invited',
    dietary_requirements: null,
    seating_preferences: null,
    is_vip_reception: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: initialData?.email || '',
        first_name: initialData?.first_name || '',
        last_name: initialData?.last_name || '',
        title: initialData?.title || null,
        phone: (initialData as { phone?: string | null })?.phone || null,
        company: initialData?.company || null,
        position: initialData?.position || null,
        guest_type: initialData?.guest_type || 'invited',
        status: initialData?.status || 'invited',
        dietary_requirements: initialData?.dietary_requirements || null,
        seating_preferences: initialData?.seating_preferences || null,
        is_vip_reception: initialData?.is_vip_reception || false,
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value || null }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.company?.trim()) {
      newErrors.company = 'Company is required';
    }

    if (!formData.position?.trim()) {
      newErrors.position = 'Position is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      // Scroll to error summary
      const errorSummary = document.getElementById('error-summary');
      if (errorSummary) {
        errorSummary.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        // Handle specific errors
        if (error.message.includes('mar letezik') || error.message.includes('EMAIL_EXISTS')) {
          setErrors({ email: 'This email address already exists' });
        } else {
          setErrors({ general: error.message });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isPayingGuest = formData.guest_type !== 'vip';

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      data-testid="guest-form-modal"
    >
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {mode === 'add' ? 'Add New Guest' : 'Edit Guest'}
        </h2>

        {/* Error Summary */}
        {Object.keys(errors).filter(key => key !== 'general').length > 0 && (
          <div
            id="error-summary"
            className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
            data-testid="error-summary"
          >
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium text-red-800">
                {Object.keys(errors).filter(key => key !== 'general').length} error(s) found. Please fix the following:
              </span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
              {errors.email && <li><button type="button" onClick={() => document.getElementById('email')?.focus()} className="hover:underline text-left">Email: {errors.email}</button></li>}
              {errors.first_name && <li><button type="button" onClick={() => document.getElementById('first_name')?.focus()} className="hover:underline text-left">First Name: {errors.first_name}</button></li>}
              {errors.last_name && <li><button type="button" onClick={() => document.getElementById('last_name')?.focus()} className="hover:underline text-left">Last Name: {errors.last_name}</button></li>}
              {errors.company && <li><button type="button" onClick={() => document.getElementById('company')?.focus()} className="hover:underline text-left">Company: {errors.company}</button></li>}
              {errors.position && <li><button type="button" onClick={() => document.getElementById('position')?.focus()} className="hover:underline text-left">Position: {errors.position}</button></li>}
            </ul>
          </div>
        )}

        {errors.general && (
          <div
            className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm"
            data-testid="form-error"
          >
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information Section */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={mode === 'edit'}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  } ${mode === 'edit' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                  data-testid="guest-email-input"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600" data-testid="email-error">
                    {errors.email}
                  </p>
                )}
                {mode === 'edit' && (
                  <p className="mt-1 text-xs text-gray-500">
                    Email address cannot be modified
                  </p>
                )}
              </div>

              {/* First Name */}
              <div>
                <label
                  htmlFor="first_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name *
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  data-testid="guest-first-name-input"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600" data-testid="first-name-error">
                    {errors.first_name}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label
                  htmlFor="last_name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name *
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  data-testid="guest-last-name-input"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600" data-testid="last-name-error">
                    {errors.last_name}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Title
                </label>
                <select
                  id="title"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="guest-title-select"
                >
                  <option value="">-- Select --</option>
                  {titleOptions.filter(t => t !== '').map((title) => (
                    <option key={title} value={title}>{title}</option>
                  ))}
                </select>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                  placeholder="+36 30 123 4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="guest-phone-input"
                />
              </div>

              {/* Guest Type */}
              <div>
                <label
                  htmlFor="guest_type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Guest Type *
                </label>
                <select
                  id="guest_type"
                  name="guest_type"
                  value={formData.guest_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="guest-type-select"
                >
                  <option value="invited">Invited (Free)</option>
                  <option value="paying_single">Paying (Single)</option>
                  <option value="paying_paired">Paying (Paired)</option>
                </select>
              </div>

              {/* Company */}
              <div>
                <label
                  htmlFor="company"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Company *
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company || ''}
                  onChange={handleChange}
                  placeholder="e.g. Acme Corporation"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.company ? 'border-red-500' : 'border-gray-300'
                  }`}
                  data-testid="guest-company-input"
                />
                {errors.company && (
                  <p className="mt-1 text-sm text-red-600" data-testid="company-error">
                    {errors.company}
                  </p>
                )}
              </div>

              {/* Position */}
              <div>
                <label
                  htmlFor="position"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Position *
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position || ''}
                  onChange={handleChange}
                  placeholder="e.g. CEO, Director"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.position ? 'border-red-500' : 'border-gray-300'
                  }`}
                  data-testid="guest-position-input"
                />
                {errors.position && (
                  <p className="mt-1 text-sm text-red-600" data-testid="position-error">
                    {errors.position}
                  </p>
                )}
              </div>

              {/* Status */}
              {mode === 'edit' && (
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    data-testid="guest-status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="invited">Invited</option>
                    <option value="registered">Registered</option>
                    <option value="approved">Approved</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
              )}

              {/* VIP Reception Checkbox */}
              <div className="flex items-center gap-3 mt-2 md:col-span-2">
                <input
                  type="checkbox"
                  id="is_vip_reception"
                  name="is_vip_reception"
                  checked={formData.is_vip_reception}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_vip_reception: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  data-testid="vip-reception-checkbox"
                />
                <label htmlFor="is_vip_reception" className="text-sm text-gray-700">
                  VIP Reception (külön fogadásra meghívott)
                </label>
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="border-b pb-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Dietary Requirements */}
              <div>
                <label
                  htmlFor="dietary_requirements"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Dietary Requirements
                </label>
                <textarea
                  id="dietary_requirements"
                  name="dietary_requirements"
                  value={formData.dietary_requirements || ''}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. vegetarian, gluten-free, lactose intolerant..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="dietary-input"
                />
              </div>

              {/* Seating Preferences */}
              <div>
                <label
                  htmlFor="seating_preferences"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Seating Preferences
                </label>
                <textarea
                  id="seating_preferences"
                  name="seating_preferences"
                  value={formData.seating_preferences || ''}
                  onChange={handleChange}
                  rows={2}
                  placeholder="e.g. would like to sit at the same table with..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="seating-input"
                />
              </div>
            </div>
          </div>

          {/* Partner Guest Details - if linked partner Guest exists */}
          {mode === 'edit' && initialData?.partnerGuest && (
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
                <span className="inline-flex items-center gap-2">
                  👫 Partner Guest Details
                  <span className="text-xs font-normal normal-case text-purple-600">
                    (managed as separate guest)
                  </span>
                </span>
              </h3>
              <div className="bg-purple-50 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Partner Name
                    </label>
                    <div className="text-sm text-gray-900">
                      {initialData.partnerGuest.title ? `${initialData.partnerGuest.title} ` : ''}
                      {initialData.partnerGuest.name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Partner Email
                    </label>
                    <div className="text-sm text-gray-900">
                      {initialData.partnerGuest.email}
                    </div>
                  </div>
                </div>
                {(initialData.partnerGuest.dietaryRequirements || initialData.partnerGuest.seatingPreferences) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-purple-200">
                    {initialData.partnerGuest.dietaryRequirements && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Partner Dietary Requirements
                        </label>
                        <div className="text-sm text-gray-900">
                          {initialData.partnerGuest.dietaryRequirements}
                        </div>
                      </div>
                    )}
                    {initialData.partnerGuest.seatingPreferences && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Partner Seating Preferences
                        </label>
                        <div className="text-sm text-gray-900">
                          {initialData.partnerGuest.seatingPreferences}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-purple-700">
                  The partner is managed as a separate guest. To edit, find them in the guest list: <strong>{initialData.partnerGuest.name}</strong>
                </p>
              </div>
            </div>
          )}

          {/* This is a partner guest - show the main guest */}
          {mode === 'edit' && initialData?.isPartner && initialData?.pairedWith && (
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">
                <span className="inline-flex items-center gap-2">
                  🔗 Paired Relationship
                </span>
              </h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  This guest is the partner of <strong>{initialData.pairedWith.name}</strong> ({initialData.pairedWith.email}).
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  They will be automatically handled together during seating.
                </p>
              </div>
            </div>
          )}

          {/* Legacy partner data - from old registration (if no partnerGuest) */}
          {mode === 'edit' && initialData?.partner_name && !initialData?.partnerGuest && (
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Partner Data (from registration)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner Name
                  </label>
                  <input
                    type="text"
                    value={initialData.partner_name || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner Email
                  </label>
                  <input
                    type="text"
                    value={initialData.partner_email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Partner data is read-only. For modifications, the guest needs to re-register.
              </p>
            </div>
          )}

          {/* Billing Information - only in edit mode if billing_info exists */}
          {mode === 'edit' && initialData?.billing_info && (
            <div className="border-b pb-4">
              <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Billing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Billing Name
                  </label>
                  <input
                    type="text"
                    value={initialData.billing_info.billingName}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
                {initialData.billing_info.company_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={initialData.billing_info.company_name}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                )}
                {initialData.billing_info.tax_number && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax Number
                    </label>
                    <input
                      type="text"
                      value={initialData.billing_info.tax_number}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>
                )}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={`${initialData.billing_info.postal_code} ${initialData.billing_info.city}, ${initialData.billing_info.address_line1}${initialData.billing_info.address_line2 ? ', ' + initialData.billing_info.address_line2 : ''}`}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Billing information is read-only. For modifications, the guest needs to re-register.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              data-testid="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="save-button"
            >
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
