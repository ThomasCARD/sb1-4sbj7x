import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building2, MapPin, Waves, Plus } from 'lucide-react';
import { Autocomplete } from '../Autocomplete';
import { useSurfboardDataStore } from '../../stores/surfboardDataStore';
import { countries } from '../../utils/countries';
import { useCustomerStore } from '../../stores/customerStore';
import { FormInput } from './FormInput';
import { ValidationMessage } from './ValidationMessage';
import clsx from 'clsx';

interface CustomerFormProps {
  onSubmit: (data: any, password?: string) => Promise<void>;
  onClose: () => void;
  initialData?: any;
}

export function CustomerForm({ onSubmit, onClose, initialData }: CustomerFormProps) {
  const { getBrands, getModels } = useSurfboardDataStore();
  const { checkEmailExists } = useCustomerStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    type: 'Customer',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: 'France'
    },
    companyDetails: {
      name: '',
      vatNumber: ''
    },
    surfboards: [] as Array<{
      type: string;
      brand: string;
      model: string;
      size: string;
      construction: string;
    }>
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [newBoard, setNewBoard] = useState({
    type: '',
    brand: '',
    model: '',
    size: '',
    construction: 'Polyester'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        type: initialData.type || 'Customer',
        address: {
          street: initialData.address?.street || '',
          city: initialData.address?.city || '',
          postalCode: initialData.address?.postalCode || '',
          country: initialData.address?.country || 'France'
        },
        companyDetails: {
          name: initialData.companyDetails?.name || '',
          vatNumber: initialData.companyDetails?.vatNumber || ''
        },
        surfboards: initialData.surfboards || []
      });
    }
  }, [initialData]);

  const handleEmailChange = async (email: string) => {
    setFormData(prev => ({ ...prev, email }));
    setEmailError('');

    if (!email) {
      setEmailError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!initialData) {
      try {
        const exists = await checkEmailExists(email);
        if (exists) {
          setEmailError('This email is already registered');
        }
      } catch (error) {
        console.error('Email check error:', error);
      }
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddBoard = () => {
    if (!newBoard.type || !newBoard.brand || !newBoard.model || !newBoard.size) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      surfboards: [...prev.surfboards, { ...newBoard }]
    }));

    setNewBoard({
      type: '',
      brand: '',
      model: '',
      size: '',
      construction: 'Polyester'
    });
  };

  const handleRemoveBoard = (index: number) => {
    setFormData(prev => ({
      ...prev,
      surfboards: prev.surfboards.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!initialData) {
      if (!password) {
        setPasswordError('Password is required');
        return;
      }

      if (password.length < 6) {
        setPasswordError('Password must be at least 6 characters');
        return;
      }

      if (password !== confirmPassword) {
        setPasswordError('Passwords do not match');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData, password);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-gray-100">
          {initialData ? 'Edit Customer' : 'New Customer'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FormInput
            label="First Name"
            value={formData.firstName}
            onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            icon={User}
            required
          />

          <FormInput
            label="Last Name"
            value={formData.lastName}
            onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            icon={User}
            required
          />
        </div>

        <FormInput
          label="Email"
          type="email"
          value={formData.email}
          onChange={e => handleEmailChange(e.target.value)}
          icon={Mail}
          error={emailError}
          required
          disabled={!!initialData}
        />

        <FormInput
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          icon={Phone}
          required
        />

        {!initialData && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormInput
              label="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={passwordError}
              required
            />

            <FormInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              error={passwordError}
              required
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">
            Customer Type
          </label>
          <select
            value={formData.type}
            onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
            className="input-primary w-full"
            required
          >
            <option value="Customer">Customer</option>
            <option value="Team Rider">Team Rider</option>
            <option value="Surf Shop">Surf Shop</option>
            <option value="Professional">Professional</option>
            <option value="VIP">VIP</option>
          </select>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-100 flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Address
          </h3>

          <FormInput
            label="Street"
            value={formData.address.street}
            onChange={e => setFormData(prev => ({
              ...prev,
              address: { ...prev.address, street: e.target.value }
            }))}
            required
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormInput
              label="City"
              value={formData.address.city}
              onChange={e => setFormData(prev => ({
                ...prev,
                address: { ...prev.address, city: e.target.value }
              }))}
              required
            />

            <FormInput
              label="Postal Code"
              value={formData.address.postalCode}
              onChange={e => setFormData(prev => ({
                ...prev,
                address: { ...prev.address, postalCode: e.target.value }
              }))}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-100 mb-2">
                Country
              </label>
              <select
                value={formData.address.country}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  address: { ...prev.address, country: e.target.value }
                }))}
                className="input-primary w-full"
                required
              >
                {countries.map(country => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {(formData.type === 'Professional' || formData.type === 'Surf Shop') && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-100 flex items-center">
              <Building2 className="h-5 w-5 mr-2" />
              Company Details
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormInput
                label="Company Name"
                value={formData.companyDetails.name}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  companyDetails: { ...prev.companyDetails, name: e.target.value }
                }))}
                required
              />

              <FormInput
                label="VAT Number"
                value={formData.companyDetails.vatNumber}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  companyDetails: { ...prev.companyDetails, vatNumber: e.target.value }
                }))}
                required
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-100 flex items-center">
            <Waves className="h-5 w-5 mr-2" />
            Surfboards
          </h3>

          <div className="space-y-4">
            {formData.surfboards.map((board, index) => (
              <div key={index} className="flex items-center space-x-2 bg-gray-750 p-3">
                <div className="flex-1">
                  <div className="font-medium text-gray-100">
                    {board.type} - {board.brand} {board.model}
                  </div>
                  <div className="text-sm text-gray-400">
                    {board.size} ({board.construction})
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveBoard(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <FormInput
                label="Type"
                value={newBoard.type}
                onChange={e => setNewBoard(prev => ({ ...prev, type: e.target.value }))}
                placeholder="e.g., Shortboard"
              />

              <div>
                <label className="block text-sm font-medium text-gray-100 mb-2">
                  Brand
                </label>
                <Autocomplete
                  value={newBoard.brand}
                  onChange={value => setNewBoard(prev => ({ ...prev, brand: value }))}
                  suggestions={getBrands()}
                  placeholder="Select brand"
                  className="input-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-100 mb-2">
                  Model
                </label>
                <Autocomplete
                  value={newBoard.model}
                  onChange={value => setNewBoard(prev => ({ ...prev, model: value }))}
                  suggestions={getModels(newBoard.brand)}
                  placeholder="Select model"
                  className="input-primary"
                  disabled={!newBoard.brand}
                />
              </div>

              <FormInput
                label="Size"
                value={newBoard.size}
                onChange={e => setNewBoard(prev => ({ ...prev, size: e.target.value }))}
                placeholder="e.g., 6'2\""
              />

              <div>
                <label className="block text-sm font-medium text-gray-100 mb-2">
                  Construction
                </label>
                <select
                  value={newBoard.construction}
                  onChange={e => setNewBoard(prev => ({ ...prev, construction: e.target.value }))}
                  className="input-primary w-full"
                >
                  <option value="Polyester">Polyester</option>
                  <option value="Epoxy">Epoxy</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddBoard}
              disabled={!newBoard.type || !newBoard.brand || !newBoard.model || !newBoard.size}
              className={clsx(
                'flex items-center space-x-2 px-4 py-2 text-sm',
                (!newBoard.type || !newBoard.brand || !newBoard.model || !newBoard.size)
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-[#45b7d1] text-white hover:bg-[#3da1b9]'
              )}
            >
              <Plus className="h-4 w-4" />
              <span>Add Board</span>
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !!emailError}
            className={clsx(
              'btn-primary',
              (isSubmitting || !!emailError) && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Create Customer'}
          </button>
        </div>
      </div>
    </form>
  );
}