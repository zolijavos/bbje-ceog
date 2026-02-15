'use client';

/**
 * Billing Form Component
 *
 * Structured billing information form for paying guests:
 * - Billing name (required)
 * - Company name (optional)
 * - Tax number (optional, Hungarian format validation)
 * - Address fields (required)
 * - City & postal code (required)
 * - Country (default: HU)
 */

export interface BillingFormData {
  billingName: string;
  companyName: string;
  taxNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
}

interface BillingFormProps {
  data: BillingFormData;
  onChange: (field: keyof BillingFormData, value: string) => void;
  errors?: Partial<Record<keyof BillingFormData, string>>;
}

export default function BillingForm({ data, onChange, errors }: BillingFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Billing Information
      </h3>

      {/* Billing Name */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Billing Name *
        </label>
        <input
          type="text"
          value={data.billingName}
          onChange={(e) => onChange('billingName', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
            errors?.billingName ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="John Smith or Example Ltd."
          data-testid="billing-name-input"
        />
        {errors?.billingName && (
          <p className="text-red-600 text-sm mt-1">{errors.billingName}</p>
        )}
      </div>

      {/* Company Name (optional) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Company Name (optional)
        </label>
        <input
          type="text"
          value={data.companyName}
          onChange={(e) => onChange('companyName', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
            errors?.companyName ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="Example Ltd."
          data-testid="company-name-input"
        />
        {errors?.companyName && (
          <p className="text-red-600 text-sm mt-1">{errors.companyName}</p>
        )}
      </div>

      {/* Tax Number (optional) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tax Number (optional)
        </label>
        <input
          type="text"
          value={data.taxNumber}
          onChange={(e) => onChange('taxNumber', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
            errors?.taxNumber ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="12345678-1-42"
          data-testid="tax-number-input"
        />
        {errors?.taxNumber ? (
          <p className="text-red-600 text-sm mt-1">{errors.taxNumber}</p>
        ) : (
          <p className="text-slate-500 text-xs mt-1">Format: 12345678-1-42</p>
        )}
      </div>

      {/* Address Line 1 */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Address *
        </label>
        <input
          type="text"
          value={data.addressLine1}
          onChange={(e) => onChange('addressLine1', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
            errors?.addressLine1 ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="123 Example Street, Floor 2, Apt 3"
          data-testid="address-line1-input"
        />
        {errors?.addressLine1 && (
          <p className="text-red-600 text-sm mt-1">{errors.addressLine1}</p>
        )}
      </div>

      {/* Address Line 2 (optional) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Address Line 2 (optional)
        </label>
        <input
          type="text"
          value={data.addressLine2}
          onChange={(e) => onChange('addressLine2', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
            errors?.addressLine2 ? 'border-red-500' : 'border-slate-300'
          }`}
          placeholder="Building, staircase, etc."
          data-testid="address-line2-input"
        />
        {errors?.addressLine2 && (
          <p className="text-red-600 text-sm mt-1">{errors.addressLine2}</p>
        )}
      </div>

      {/* City & Postal Code Row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            City *
          </label>
          <input
            type="text"
            value={data.city}
            onChange={(e) => onChange('city', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
              errors?.city ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="Budapest"
            data-testid="city-input"
          />
          {errors?.city && (
            <p className="text-red-600 text-sm mt-1">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Postal Code *
          </label>
          <input
            type="text"
            value={data.postalCode}
            onChange={(e) => onChange('postalCode', e.target.value)}
            maxLength={4}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${
              errors?.postalCode ? 'border-red-500' : 'border-slate-300'
            }`}
            placeholder="1234"
            data-testid="postal-code-input"
          />
          {errors?.postalCode && (
            <p className="text-red-600 text-sm mt-1">{errors.postalCode}</p>
          )}
        </div>
      </div>

      {/* Country */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Country
        </label>
        <select
          value={data.country}
          onChange={(e) => onChange('country', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white ${
            errors?.country ? 'border-red-500' : 'border-slate-300'
          }`}
          data-testid="country-select"
        >
          <option value="HU">Hungary</option>
          <option value="AT">Austria</option>
          <option value="SK">Slovakia</option>
          <option value="RO">Romania</option>
          <option value="DE">Germany</option>
        </select>
        {errors?.country && (
          <p className="text-red-600 text-sm mt-1">{errors.country}</p>
        )}
      </div>
    </div>
  );
}
