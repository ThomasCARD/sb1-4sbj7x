import React, { useState } from 'react';
import { 
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import clsx from 'clsx';

interface Repair {
  id: string;
  customerName: string;
  boardType: string;
  description: string;
  status: 'waiting' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dateCreated: string;
  estimatedCompletion: string;
  cost: number;
}

const mockRepairs: Repair[] = [
  {
    id: '1',
    customerName: 'Thomas Laurent',
    boardType: 'Shortboard 6\'2"',
    description: 'Deep ding repair on nose, minor rail damage',
    status: 'waiting',
    priority: 'high',
    dateCreated: '2024-03-15',
    estimatedCompletion: '2024-03-18',
    cost: 180,
  },
  {
    id: '2',
    customerName: 'Marie Dubois',
    boardType: 'Longboard 9\'0"',
    description: 'Full restoration, multiple dings, new glass job',
    status: 'in_progress',
    priority: 'medium',
    dateCreated: '2024-03-14',
    estimatedCompletion: '2024-03-20',
    cost: 450,
  },
  {
    id: '3',
    customerName: 'Pierre Martin',
    boardType: 'Fish 5\'10"',
    description: 'Fin box replacement',
    status: 'completed',
    priority: 'low',
    dateCreated: '2024-03-12',
    estimatedCompletion: '2024-03-15',
    cost: 120,
  },
];

const statusColors = {
  waiting: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-orange-100 text-orange-800',
  high: 'bg-red-100 text-red-800',
};

function Repairs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dateCreated');

  const filteredRepairs = mockRepairs
    .filter((repair) => {
      const matchesSearch = repair.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || repair.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'dateCreated') {
        return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Repairs Management</h1>
        <button className="btn-primary">
          <Plus className="h-5 w-5 mr-2" />
          New Repair
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="input-primary pl-10"
                  placeholder="Search repairs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <select
                  className="input-primary appearance-none pr-10"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="waiting">Waiting</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="relative">
                <select
                  className="input-primary appearance-none pr-10"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="dateCreated">Sort by Date</option>
                  <option value="priority">Sort by Priority</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer & Board
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRepairs.map((repair) => (
                <tr key={repair.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">{repair.customerName}</div>
                      <div className="text-sm text-gray-500">{repair.boardType}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{repair.description}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                        statusColors[repair.status]
                      )}
                    >
                      {repair.status.replace('_', ' ').charAt(0).toUpperCase() + 
                        repair.status.slice(1).replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                        priorityColors[repair.priority]
                      )}
                    >
                      {repair.priority.charAt(0).toUpperCase() + repair.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-sm text-gray-900">
                      <span>Created: {repair.dateCreated}</span>
                      <span className="text-gray-500">Due: {repair.estimatedCompletion}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    €{repair.cost.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <button className="text-gray-400 hover:text-gray-500">
                      <MoreHorizontal className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRepairs.length === 0 && (
          <div className="text-center py-12">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No repairs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Repairs;