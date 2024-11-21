import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Waves, History, Calendar } from 'lucide-react';
import { useCustomerStore } from '../stores/customerStore';
import { useRepairStore } from '../stores/repairStore';
import clsx from 'clsx';
import { format } from 'date-fns';

const customerTypeColors = {
  customer: 'bg-gray-700 text-gray-100',
  team_rider: 'bg-blue-900 text-blue-100',
  surf_shop: 'bg-purple-900 text-purple-100',
  professional: 'bg-green-900 text-green-100',
  vip: 'bg-yellow-900 text-yellow-100',
};

export default function CustomerDetails() {
  const { id } = useParams();
  const { customers } = useCustomerStore();
  const { repairs } = useRepairStore();
  const customer = customers.find(c => c.id === id);

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Customer not found</p>
      </div>
    );
  }

  const customerRepairs = repairs.filter(repair => repair.customerId === id);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'finished':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'aborted':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/customers" className="text-gray-400 hover:text-gray-300">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-100">Customer Details</h1>
        </div>
      </div>

      {/* Customer Info Card */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-700 p-3 rounded-full">
              <User className="h-8 w-8 text-gray-300" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-100">{customer.fullName}</h2>
              <span className={clsx(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1',
                customerTypeColors[customer.type as keyof typeof customerTypeColors]
              )}>
                {customer.type.replace('_', ' ').split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-center space-x-2 text-gray-300">
            <Mail className="h-5 w-5" />
            <span>{customer.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-300">
            <Phone className="h-5 w-5" />
            <span>{customer.phone}</span>
          </div>
        </div>
      </div>

      {/* Surfboard Quiver */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Waves className="h-5 w-5 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-100">Surfboard Quiver</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customer.surfboards.map((board, index) => (
            <div key={index} className="bg-gray-700 p-4 rounded-lg">
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
      </div>

      {/* Repair History */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <History className="h-5 w-5 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-100">Repair History</h3>
        </div>

        {customerRepairs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Board
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {customerRepairs.map((repair) => (
                  <tr key={repair.id} className="hover:bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(repair.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {repair.boardModel}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {repair.repairs.map((r, index) => (
                        <div key={index} className="mb-1">
                          {r.location}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={clsx(
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                        getStatusColor(repair.status)
                      )}>
                        {repair.status.charAt(0).toUpperCase() + repair.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      €{repair.totalPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">No repair history found</p>
          </div>
        )}
      </div>
    </div>
  );
}