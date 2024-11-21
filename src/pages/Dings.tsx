import React, { useState, useEffect } from 'react';
import { Plus, History } from 'lucide-react';
import { RepairForm } from '../components/RepairForm';
import { RepairList } from '../components/RepairList';
import { useRepairStore } from '../stores/repairStore';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';

export default function Dings() {
  const [showNewRepairForm, setShowNewRepairForm] = useState(false);
  const [editingRepair, setEditingRepair] = useState(null);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const { repairs, fetchRepairs } = useRepairStore();
  const location = useLocation();

  useEffect(() => {
    fetchRepairs();
  }, [fetchRepairs]);

  useEffect(() => {
    const state = location.state as { editRepairId?: string; showNewRepair?: boolean };
    if (state?.editRepairId) {
      const repairToEdit = repairs.find(r => r.id === state.editRepairId);
      if (repairToEdit) {
        setEditingRepair(repairToEdit);
      }
    } else if (state?.showNewRepair) {
      setShowNewRepairForm(true);
    }
    // Clear the state to prevent reopening on navigation
    window.history.replaceState({}, document.title);
  }, [location.state, repairs]);

  const handleCloseForm = () => {
    setShowNewRepairForm(false);
    setEditingRepair(null);
  };

  const activeRepairs = repairs.filter(repair => 
    repair.status === 'pending' || repair.status === 'in_progress'
  );

  const completedRepairs = repairs.filter(repair => 
    repair.status === 'finished' || repair.status === 'aborted'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-100">Dings Management</h1>
        <button
          onClick={() => setShowNewRepairForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          New Repair
        </button>
      </div>

      {(showNewRepairForm || editingRepair) ? (
        <RepairForm 
          onClose={handleCloseForm} 
          initialData={editingRepair}
        />
      ) : (
        <>
          <div className="flex space-x-4 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('active')}
              className={clsx(
                'py-2 px-4 font-medium text-sm relative',
                activeTab === 'active'
                  ? 'text-[#45b7d1] border-b-2 border-[#45b7d1]'
                  : 'text-gray-400 hover:text-gray-300'
              )}
            >
              Active Repairs
              {activeRepairs.length > 0 && (
                <span className="ml-2 bg-[#45b7d1] text-white px-2 py-0.5 text-xs rounded-full">
                  {activeRepairs.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={clsx(
                'py-2 px-4 font-medium text-sm flex items-center',
                activeTab === 'history'
                  ? 'text-[#45b7d1] border-b-2 border-[#45b7d1]'
                  : 'text-gray-400 hover:text-gray-300'
              )}
            >
              <History className="h-4 w-4 mr-1" />
              Repair History
              {completedRepairs.length > 0 && (
                <span className="ml-2 bg-gray-700 text-gray-300 px-2 py-0.5 text-xs rounded-full">
                  {completedRepairs.length}
                </span>
              )}
            </button>
          </div>

          <RepairList 
            onEdit={setEditingRepair}
            repairs={activeTab === 'active' ? activeRepairs : completedRepairs}
          />
        </>
      )}
    </div>
  );
}