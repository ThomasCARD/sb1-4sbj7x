import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useRepairStore } from '../stores/repairStore';
import { Logo } from '../components/Logo';
import { User, Mail, Phone, Building2, MapPin, Waves, History, Calendar, Pencil } from 'lucide-react';
import { EditProfileForm } from '../components/EditProfileForm';
import clsx from 'clsx';
import { format } from 'date-fns';

const customerTypeColors = {
  'Customer': 'bg-gray-700 text-gray-100',
  'Team Rider': 'bg-blue-900 text-blue-100',
  'Surf Shop': 'bg-purple-900 text-purple-100',
  'Professional': 'bg-green-900 text-green-100',
  'VIP': 'bg-yellow-900 text-yellow-100',
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'finished':
      return 'bg-green-900 text-green-100';
    case 'in_progress':
      return 'bg-blue-900 text-blue-100';
    case 'pending':
      return 'bg-yellow-900 text-yellow-100';
    case 'aborted':
      return 'bg-red-900 text-red-100';
    default:
      return 'bg-gray-900 text-gray-100';
  }
};

export default function CustomerDashboard() {
  const { user, updateCustomerProfile } = useAuthStore();
  const { repairs } = useRepairStore();
  const [showEditForm, setShowEditForm] = useState(false);

  const customerRepairs = repairs.filter(repair => repair.customerId === user?.uid);
  const activeRepairs = customerRepairs.filter(repair => 
    repair.status === 'pending' || repair.status === 'in_progress'
  );
  const completedRepairs = customerRepairs.filter(repair => 
    repair.status === 'finished' || repair.status === 'aborted'
  );

  const handleUpdateProfile = async (updatedData: any) => {
    try {
      await updateCustomerProfile(updatedData);
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  if (!user?.customerData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Loading customer data...</p>
      </div>
    );
  }

  const { customerData } = user;

  if (showEditForm) {
    return (
      <EditProfileForm
        initialData={customerData}
        onSubmit={handleUpdateProfile}
        onCancel={() => setShowEditForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Customer Info */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-700 p-3 rounded-full">
              <User className="h-8 w-8 text-gray-300" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-100">
                {customerData.firstName} {customerData.lastName}
              </h2>
              <span className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1',
                customerTypeColors[customerData.type as keyof typeof customerTypeColors]
              )}>
                {customerData.type}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowEditForm(true)}
            className="text-gray-400 hover:text-gray-300 p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Edit Profile"
          >
            <Pencil className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <Mail className="h-5 w-5" />
              <span>{customerData.email}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <Phone className="h-5 w-5" />
              <span>{customerData.phone}</span>
            </div>
            {(customerData.type === 'Professional' || customerData.type === 'Surf Shop') && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-gray-300">
                  <Building2 className="h-5 w-5" />
                  <span>{customerData.companyDetails?.name}</span>
                </div>
                <div className="text-sm text-gray-400 ml-7">
                  VAT: {customerData.companyDetails?.vatNumber}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-start space-x-2 text-gray-300">
              <MapPin className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <div>{customerData.address.street}</div>
                <div>{customerData.address.postalCode} {customerData.address.city}</div>
                <div>{customerData.address.country}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Surfboard Quiver */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
        <h3 className="text-lg font-medium text-gray-100 mb-4 flex items-center">
          <Waves className="h-5 w-5 mr-2" />
          Surfboard Quiver
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(customerData.surfboards || []).map((board, index) => (
            <div key={`board-${index}`} className="bg-gray-700 p-4 rounded-lg">
              <div className="text-lg font-medium text-gray-100">
                {board.brand} {board.model}
              </div>
              <div className="text-sm text-gray-300 mt-1">
                <div>{board.type} - {board.size}</div>
                <div className="mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-gray-100">
                    {board.construction}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(!customerData.surfboards || customerData.surfboards.length === 0) && (
          <p className="text-gray-400 text-center py-4">No surfboards in your quiver yet</p>
        )}
      </div>

      {/* Active Repairs */}
      {activeRepairs.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
          <h3 className="text-lg font-medium text-gray-100 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Active Repairs
          </h3>
          <div className="space-y-4">
            {activeRepairs.map((repair) => (
              <div key={`active-repair-${repair.id}`} className="bg-gray-750 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-gray-100 font-medium">
                      #{repair.repairId} - {repair.boardModel}
                    </div>
                    <div className="text-sm text-gray-400">
                      Created: {format(new Date(repair.createdAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <span className={clsx(
                    'px-2 py-1 text-xs font-medium rounded',
                    getStatusColor(repair.status)
                  )}>
                    {repair.status}
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  {repair.repairs.map((r: any, index: number) => (
                    <div key={`active-repair-item-${repair.id}-${index}`} className="text-sm text-gray-300">
                      • {r.repairType.name}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between items-center pt-3 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    Estimated delivery: {format(new Date(repair.deliveryDate), 'MMM d, yyyy')}
                  </div>
                  <div className="font-medium text-gray-100">
                    €{repair.totalPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Repair History */}
      {completedRepairs.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-700">
          <h3 className="text-lg font-medium text-gray-100 mb-4 flex items-center">
            <History className="h-5 w-5 mr-2" />
            Repair History
          </h3>
          <div className="space-y-4">
            {completedRepairs.map((repair) => (
              <div key={`completed-repair-${repair.id}`} className="bg-gray-750 p-4 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-gray-100 font-medium">
                      #{repair.repairId} - {repair.boardModel}
                    </div>
                    <div className="text-sm text-gray-400">
                      Completed: {format(new Date(repair.updatedAt), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <span className={clsx(
                    'px-2 py-1 text-xs font-medium rounded',
                    getStatusColor(repair.status)
                  )}>
                    {repair.status}
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  {repair.repairs.map((r: any, index: number) => (
                    <div key={`completed-repair-item-${repair.id}-${index}`} className="text-sm text-gray-300">
                      • {r.repairType.name}
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between items-center pt-3 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    Total cost
                  </div>
                  <div className="font-medium text-gray-100">
                    €{repair.totalPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}