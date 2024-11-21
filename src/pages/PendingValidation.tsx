import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, LogOut } from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuthStore } from '../stores/authStore';

export default function PendingValidation() {
  const navigate = useNavigate();
  const { signOut } = useAuthStore();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#323b44] flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <Logo className="h-32 w-auto mx-auto" />
        
        <div className="bg-yellow-900 bg-opacity-50 p-6 space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-yellow-200" />
          </div>
          <h2 className="text-xl font-bold text-yellow-100">Account Pending Validation</h2>
          <p className="text-yellow-200">
            Your account is currently awaiting validation from an administrator. 
            You'll receive an email notification once your account has been approved.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}