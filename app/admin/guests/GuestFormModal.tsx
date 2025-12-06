'use client';

import { useState, useEffect } from 'react';

interface BillingInfo {
  billing_name: string;
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
  name: string;
  title: string | null;
  guest_type: 'vip' | 'paying_single' | 'paying_paired';
  status: 'invited' | 'registered' | 'approved' | 'declined';
  dietary_requirements: string | null;
  seating_preferences: string | null;
}

interface PartnerGuestInfo {
  id: number;
  name: string;
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
    partner_name?: string | null;
    partner_email?: string | null;
    billing_info?: BillingInfo | null;
    // New partner guest relation
    isPartner?: boolean;
    pairedWith?: { id: number; name: string; email: string } | null;
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
    name: '',
    title: null,
    guest_type: 'vip',
    status: 'invited',
    dietary_requirements: null,
    seating_preferences: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        email: initialData?.email || '',
        name: initialData?.name || '',
        title: initialData?.title || null,
        guest_type: initialData?.guest_type || 'vip',
        status: initialData?.status || 'invited',
        dietary_requirements: initialData?.dietary_requirements || null,
        seating_preferences: initialData?.seating_preferences || null,
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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

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

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  data-testid="guest-name-input"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600" data-testid="name-error">
                    {errors.name}
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
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  placeholder="e.g. Dr., Prof."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  data-testid="guest-title-input"
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
                  <option value="vip">VIP</option>
                  <option value="paying_single">Paying (Single)</option>
                  <option value="paying_paired">Paying (Paired)</option>
                </select>
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
                    <option value="invited">Invited</option>
                    <option value="registered">Registered</option>
                    <option value="approved">Approved</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
              )}
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
                    value={initialData.billing_info.billing_name}
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
