import React from 'react';
import { UserCircle, ShieldAlert, Users, User, Building2, Trash2 } from 'lucide-react';
import clsx from 'clsx';

interface ProfileCardProps {
  profile: any;
  onRoleChange: (profileId: string, newRole: string) => void;
  onDelete: (profileId: string) => void;
}

export function ProfileCard({ profile, onRoleChange, onDelete }: ProfileCardProps) {
  // Only show business badge for Professional or Surf Shop types
  const isBusinessCustomer = profile.type === 'Professional' || profile.type === 'Surf Shop';

  return (
    <div className="bg-gray-800 p-6 flex items-center justify-between border border-gray-700">
      <div className="flex items-center space-x-4">
        <div className="bg-gray-700 p-3 rounded-full">
          <UserCircle className="h-8 w-8 text-gray-300" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-100">
            {profile.firstName && profile.lastName 
              ? `${profile.firstName} ${profile.lastName}`
              : profile.name}
          </h3>
          <p className="text-sm text-gray-400">{profile.email}</p>
          <div className="flex items-center gap-2 mt-2">
            {profile.role === 'super_admin' && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-900 text-purple-100">
                <ShieldAlert className="h-3 w-3 mr-1" />
                Super Admin
              </span>
            )}
            {profile.role === 'staff' && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-900 text-blue-100">
                <Users className="h-3 w-3 mr-1" />
                Staff
              </span>
            )}
            {profile.role === 'customer' && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-900 text-green-100">
                <User className="h-3 w-3 mr-1" />
                Customer
              </span>
            )}
            {isBusinessCustomer && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-900 text-yellow-100">
                <Building2 className="h-3 w-3 mr-1" />
                Business
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {profile.email !== 'thomas@shapersclub.com' && (
          <>
            <select
              value={profile.role}
              onChange={(e) => onRoleChange(profile.id, e.target.value)}
              className="input-primary py-1 text-sm"
            >
              <option value="customer">Customer</option>
              <option value="staff">Staff</option>
              <option value="super_admin">Super Admin</option>
            </select>

            <button
              onClick={() => onDelete(profile.id)}
              className="p-2 text-red-400 hover:text-red-300 transition-colors"
              title="Delete Profile"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}