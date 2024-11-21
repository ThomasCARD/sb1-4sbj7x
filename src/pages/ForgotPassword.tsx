import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuthStore } from '../stores/authStore';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { resetPassword, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      setSubmitted(true);
    } catch (err) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen bg-[#323b44] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-center">
          <Logo className="h-32 w-auto" />
        </div>

        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-100">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {submitted ? (
          <div className="bg-green-900 bg-opacity-50 p-4 rounded-none">
            <p className="text-sm text-green-200">
              If an account exists with this email, you will receive password reset instructions.
            </p>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-none bg-red-900 bg-opacity-50 p-4">
                <div className="text-sm text-red-200">{error}</div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 bg-[#3b4450] border border-[#454d59] placeholder-gray-400 text-gray-100 rounded-none focus:outline-none focus:ring-1 focus:ring-[#45b7d1] focus:border-[#45b7d1] sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium text-white bg-[#45b7d1] hover:bg-[#3da1b9] focus:outline-none focus:ring-1 focus:ring-[#45b7d1] transition-colors duration-200"
              >
                Send Reset Instructions
              </button>
            </div>
          </form>
        )}

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