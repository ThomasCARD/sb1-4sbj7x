import React from 'react';
import { format, parseISO } from 'date-fns';
import clsx from 'clsx';
import { getStatusColor } from './utils';

interface PlanningViewProps {
  repairs: any[];
  onRepairClick: (repairId: string) => void;
  customers: any[];
}

export function PlanningView({ repairs, onRepairClick, customers }: PlanningViewProps) {
  return (
    <div className="bg-gray-800 border border-gray-700">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr className="bg-gray-900">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Customer</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Board</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Operator</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Seller</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {repairs.map((repair) => {
              const customer = customers.find(c => c.id === repair.customerId);
              return (
                <tr
                  key={repair.id}
                  onClick={() => onRepairClick(repair.id)}
                  className="hover:bg-gray-750 cursor-pointer"
                >
                  <td className="px-4 py-3 text-sm text-gray-300">
                    {repair.deliveryDate ? format(parseISO(repair.deliveryDate), 'MMM d, yyyy') : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">#{repair.repairId}</td>
                  <td className="px-4 py-3 text-sm text-gray-100">{customer?.fullName || 'Unknown'}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{repair.boardModel}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{repair.operator || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{repair.seller || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'px-2 py-1 text-xs font-medium rounded',
                      getStatusColor(repair.status)
                    )}>
                      {repair.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}