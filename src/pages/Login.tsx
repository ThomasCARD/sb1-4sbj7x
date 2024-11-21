import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { User, Lock } from 'lucide-react';
import { Logo } from '../components/Logo';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticated, error } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      // Error is handled in the store
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-[#323b44] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="flex justify-center">
          <Logo className="h-32 w-auto" />
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-none bg-red-900 bg-opacity-50 p-4">
              <div className="text-sm text-red-200">{error}</div>
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
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

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-3 py-3 pl-10 bg-[#3b4450] border border-[#454d59] placeholder-gray-400 text-gray-100 rounded-none focus:outline-none focus:ring-1 focus:ring-[#45b7d1] focus:border-[#45b7d1] sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium text-white bg-[#45b7d1] hover:bg-[#3da1b9] focus:outline-none focus:ring-1 focus:ring-[#45b7d1] transition-colors duration-200"
            >
              Log In
            </button>
          </div>

          <div className="flex justify-between text-sm">
            <Link
              to="/forgot-password"
              className="text-gray-400 hover:text-[#45b7d1] transition-colors duration-200"
            >
              Forgot your password?
            </Link>
            <Link
              to="/create-account"
              className="text-gray-400 hover:text-[#45b7d1] transition-colors duration-200"
            >
              Create account
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;