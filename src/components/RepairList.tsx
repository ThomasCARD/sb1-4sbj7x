import React, { useState } from 'react';
import { Pencil, Trash2, CheckCircle2, AlertCircle, PlayCircle, ChevronUp, ChevronDown, Hash } from 'lucide-react';
import { useRepairStore } from '../stores/repairStore';
import { useCustomerStore } from '../stores/customerStore';
import { useAuthStore } from '../stores/authStore';
import { sendRepairFinishedEmail } from '../utils/notifications';
import { format } from 'date-fns';
import clsx from 'clsx';

interface RepairListProps {
  onEdit: (repair: any) => void;
  repairs: any[];
}

export function RepairList({ onEdit, repairs }: RepairListProps) {
  const { updateRepair, deleteRepair } = useRepairStore();
  const { customers } = useCustomerStore();
  const { user } = useAuthStore();
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isNotifying, setIsNotifying] = useState<string | null>(null);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
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

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-900 text-red-100';
      case 'medium':
        return 'bg-yellow-900 text-yellow-100';
      case 'low':
        return 'bg-green-900 text-green-100';
      default:
        return 'bg-gray-900 text-gray-100';
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this repair?')) {
      try {
        await deleteRepair(id);
      } catch (error) {
        console.error('Error deleting repair:', error);
        alert('Failed to delete repair');
      }
    }
  };

  const handleStatusChange = async (repair: any, newStatus: string) => {
    if (!user) {
      alert('You must be logged in to change repair status');
      return;
    }

    try {
      const updatedRepair = {
        ...repair,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      // If starting the repair, set the operator to current user
      if (newStatus === 'in_progress' && !repair.operator) {
        updatedRepair.operator = user.email;
      }

      await updateRepair(repair.id, updatedRepair);

      if (newStatus === 'finished') {
        setIsNotifying(repair.id);
        const customer = customers.find(c => c.id === repair.customerId);
        if (customer) {
          await sendRepairFinishedEmail(repair, customer);
        }
        setIsNotifying(null);
      }
    } catch (error) {
      console.error('Error updating repair status:', error);
      alert('Failed to update repair status');
    }
  };

  const sortedRepairs = [...repairs].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'repairId':
        return direction * ((a.repairId || 0) - (b.repairId || 0));
      case 'customerName':
        return direction * (a.customerName || '').localeCompare(b.customerName || '');
      case 'boardModel':
        return direction * (a.boardModel || '').localeCompare(b.boardModel || '');
      case 'priority':
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return direction * (priorityOrder[a.priority] - priorityOrder[b.priority]);
      case 'status':
        return direction * (a.status || '').localeCompare(b.status || '');
      case 'deliveryDate':
        return direction * (new Date(a.deliveryDate || 0).getTime() - new Date(b.deliveryDate || 0).getTime());
      case 'createdAt':
        return direction * (new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
      case 'totalPrice':
        return direction * ((a.totalPrice || 0) - (b.totalPrice || 0));
      default:
        return 0;
    }
  });

  return (
    <div className="bg-gray-800 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full divide-y divide-gray-700">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-16" onClick={() => handleSort('repairId')}>
                <div className="flex items-center">
                  <Hash className="h-4 w-4" />
                  {getSortIcon('repairId')}
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider" onClick={() => handleSort('customerName')}>
                <div className="flex items-center">
                  <span>Customer</span>
                  {getSortIcon('customerName')}
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell" onClick={() => handleSort('boardModel')}>
                <div className="flex items-center">
                  <span>Board</span>
                  {getSortIcon('boardModel')}
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-24" onClick={() => handleSort('priority')}>
                <div className="flex items-center">
                  <span>Priority</span>
                  {getSortIcon('priority')}
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-24" onClick={() => handleSort('status')}>
                <div className="flex items-center">
                  <span>Status</span>
                  {getSortIcon('status')}
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell w-28" onClick={() => handleSort('deliveryDate')}>
                <div className="flex items-center">
                  <span>Due</span>
                  {getSortIcon('deliveryDate')}
                </div>
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-24" onClick={() => handleSort('totalPrice')}>
                <div className="flex items-center">
                  <span>Price</span>
                  {getSortIcon('totalPrice')}
                </div>
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider w-24">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {sortedRepairs.map((repair) => (
              <tr key={repair.id} className="hover:bg-gray-750">
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                  #{repair.repairId}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                  {repair.customerName}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300 hidden sm:table-cell">
                  {repair.boardModel}
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className={clsx(
                    'px-2 py-1 text-xs font-medium rounded',
                    getPriorityColor(repair.priority || 'medium')
                  )}>
                    {(repair.priority || 'Medium').charAt(0).toUpperCase() + (repair.priority || 'medium').slice(1)}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap">
                  <span className={clsx(
                    'px-2 py-1 text-xs font-medium rounded',
                    getStatusColor(repair.status)
                  )}>
                    {repair.status.charAt(0).toUpperCase() + repair.status.slice(1)}
                  </span>
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300 hidden md:table-cell">
                  {format(new Date(repair.deliveryDate), 'MMM d')}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-300">
                  €{repair.totalPrice.toFixed(2)}
                </td>
                <td className="px-3 py-4 whitespace-nowrap text-right text-sm space-x-1">
                  <button
                    onClick={() => onEdit(repair)}
                    className="text-[#45b7d1] hover:text-[#3da1b9]"
                    title="Edit Repair"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(repair.id)}
                    className="text-red-400 hover:text-red-300"
                    title="Delete Repair"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {repair.status !== 'finished' && (
                    <button
                      onClick={() => handleStatusChange(repair, 'finished')}
                      className={clsx(
                        "text-green-400 hover:text-green-300",
                        isNotifying === repair.id && "opacity-50 cursor-wait"
                      )}
                      disabled={isNotifying === repair.id}
                      title="Mark as Finished"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}
                  {repair.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(repair, 'in_progress')}
                      className="text-blue-400 hover:text-blue-300"
                      title="Start Repair"
                    >
                      <PlayCircle className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {repairs.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No repairs found</p>
          </div>
        )}
      </div>
    </div>
  );
}