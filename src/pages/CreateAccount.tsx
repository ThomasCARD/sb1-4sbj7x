import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuthStore } from '../stores/authStore';

export default function CreateAccount() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register, error: storeError, checkEmailExists } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    if (formData.password !== formData.confirmPassword) {
      useAuthStore.setState({ error: 'Passwords do not match' });
      return;
    }

    if (formData.password.length < 6) {
      useAuthStore.setState({ error: 'Password must be at least 6 characters' });
      return;
    }

    try {
      setIsLoading(true);
      // Check if email exists before attempting registration
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        useAuthStore.setState({ error: 'This email is already registered. Please use a different email address.' });
        setIsLoading(false);
        return;
      }

      await register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password
      );
      navigate('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      // Error is handled by the store
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#323b44] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-center">
          <Logo className="h-32 w-auto" />
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-100">Create Account</h2>
          <p className="mt-2 text-sm text-gray-400">
            Join Shapers Club Repair to manage your surfboard repairs
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {storeError && (
            <div className="rounded-none bg-red-900 bg-opacity-50 p-4">
              <div className="text-sm text-red-200">{storeError}</div>
            </div>
          )}

          <div className="space-y-4">
            {/* Form fields remain the same */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="sr-only">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="appearance-none relative block w-full px-3 py-3 pl-10 bg-[#3b4450] border border-[#454d59] placeholder-gray-400 text-gray-100 rounded-none focus:outline-none focus:ring-1 focus:ring-[#45b7d1] focus:border-[#45b7d1] sm:text-sm"
                    placeholder="First Name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="sr-only">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="appearance-none relative block w-full px-3 py-3 pl-10 bg-[#3b4450] border border-[#454d59] placeholder-gray-400 text-gray-100 rounded-none focus:outline-none focus:ring-1 focus:ring-[#45b7d1] focus:border-[#45b7d1] sm:text-sm"
                    placeholder="Last Name"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 bg-[#3b4450] border border-[#454d59] placeholder-gray-400 text-gray-100 rounded-none focus:outline-none focus:ring-1 focus:ring-[#45b7d1] focus:border-[#45b7d1] sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 bg-[#3b4450] border border-[#454d59] placeholder-gray-400 text-gray-100 rounded-none focus:outline-none focus:ring-1 focus:ring-[#45b7d1] focus:border-[#45b7d1] sm:text-sm"
                  placeholder="Password (min. 6 characters)"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 bg-[#3b4450] border border-[#454d59] placeholder-gray-400 text-gray-100 rounded-none focus:outline-none focus:ring-1 focus:ring-[#45b7d1] focus:border-[#45b7d1] sm:text-sm"
                  placeholder="Confirm Password"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium text-white bg-[#45b7d1] hover:bg-[#3da1b9] focus:outline-none focus:ring-1 focus:ring-[#45b7d1] transition-colors duration-200 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="flex justify-center space-x-4 text-sm">
          <Link
            to="/login"
            className="flex items-center text-gray-400 hover:text-[#45b7d1] transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}