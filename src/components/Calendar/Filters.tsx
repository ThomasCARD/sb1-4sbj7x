import React from 'react';
import { Filter } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { doc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import clsx from 'clsx';

interface FiltersProps {
  selectedStatus: string;
  selectedOperator: string;
  selectedSeller: string;
  onStatusChange: (status: string) => void;
  onOperatorChange: (operator: string) => void;
  onSellerChange: (seller: string) => void;
  staffProfiles: Map<string, string>;
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'finished', label: 'Finished' },
  { value: 'aborted', label: 'Aborted' }
];

export function Filters({
  selectedStatus,
  selectedOperator,
  selectedSeller,
  onStatusChange,
  onOperatorChange,
  onSellerChange,
  staffProfiles
}: FiltersProps) {
  return (
    <div className="flex items-center gap-4 py-4 px-6 bg-gray-750 border-b border-gray-700">
      <div className="flex items-center gap-2 text-gray-400">
        <Filter className="h-4 w-4" />
        <span className="text-sm">Filters:</span>
      </div>

      <select
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        className="bg-gray-700 text-gray-300 text-sm py-1 px-3 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-[#45b7d1] focus:border-[#45b7d1]"
      >
        {statusOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={selectedOperator}
        onChange={(e) => onOperatorChange(e.target.value)}
        className="bg-gray-700 text-gray-300 text-sm py-1 px-3 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-[#45b7d1] focus:border-[#45b7d1]"
      >
        <option value="all">All Operators</option>
        {Array.from(staffProfiles.entries()).map(([email, name]) => (
          <option key={email} value={email}>
            {name}
          </option>
        ))}
      </select>

      <select
        value={selectedSeller}
        onChange={(e) => onSellerChange(e.target.value)}
        className="bg-gray-700 text-gray-300 text-sm py-1 px-3 rounded border border-gray-600 focus:outline-none focus:ring-1 focus:ring-[#45b7d1] focus:border-[#45b7d1]"
      >
        <option value="all">All Sellers</option>
        {Array.from(staffProfiles.entries()).map(([email, name]) => (
          <option key={email} value={email}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}