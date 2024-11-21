import React, { useState } from 'react';
import { X, User, Mail, Phone, Building2, MapPin } from 'lucide-react';
import { sendEditProfileWebhook } from '../utils/webhooks';

interface EditProfileFormProps {
  initialData: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function EditProfileForm({ initialData, onSubmit, onCancel }: EditProfileFormProps) {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName,
    lastName: initialData.lastName,
    phone: initialData.phone,
    address: {
      street: initialData.address.street,
      city: initialData.address.city,
      postalCode: initialData.address.postalCode,
      country: initialData.address.country,
    },
    companyDetails: initialData.companyDetails || { name: '', vatNumber: '' }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
      
      // Send webhook after successful update
      await sendEditProfileWebhook({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: initialData.email,
        phone: formData.phone,
        address: formData.address
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  const showCompanyDetails = initialData.type === 'Professional' || initialData.type === 'Surf Shop';

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
      <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-gray-100">Edit Profile</h2>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-100 mb-2">First Name</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className="input-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-100 mb-2">Last Name</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className="input-primary"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">Phone</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              value={formData.phone}
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="input-primary pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-100 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Address
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-100 mb-2">Street</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={e => setFormData(prev => ({
                ...prev,
                address: { ...prev.address, street: e.target.value }
              }))}
              className="input-primary"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">City</label>
              <input
                type="text"
                value={formData.address.city}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, city: e.target.value }
                }))}
                className="input-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">Postal Code</label>
              <input
                type="text"
                value={formData.address.postalCode}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, postalCode: e.target.value }
                }))}
                className="input-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">Country</label>
              <input
                type="text"
                value={formData.address.country}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, country: e.target.value }
                }))}
                className="input-primary"
                required
              />
            </div>
          </div>
        </div>

        {showCompanyDetails && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-100 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Company Details
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-100 mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.companyDetails.name}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    companyDetails: { ...prev.companyDetails, name: e.target.value }
                  }))}
                  className="input-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-100 mb-2">VAT Number</label>
                <input
                  type="text"
                  value={formData.companyDetails.vatNumber}
                  onChange={e => setFormData(prev => ({
                    ...prev,
                    companyDetails: { ...prev.companyDetails, vatNumber: e.target.value }
                  }))}
                  className="input-primary"
                  required
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
          >
            Save Changes
          </button>
        </div>
      </div>
    </form>
  );
}