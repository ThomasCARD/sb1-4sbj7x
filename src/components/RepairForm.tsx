import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useCustomerStore } from '../stores/customerStore';
import { useRepairStore } from '../stores/repairStore';
import { useAuthStore } from '../stores/authStore';
import { doc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { X, Hash } from 'lucide-react';
import { RepairTypeList } from './RepairForm/RepairTypeList';
import { BoardViews } from './RepairForm/BoardViews';
import { QuotationSummary } from './RepairForm/QuotationSummary';
import clsx from 'clsx';

interface StaffProfile {
  id: string;
  email: string;
  name: string;
  role: 'staff' | 'super_admin';
}

export function RepairForm({ onClose, initialData }: RepairFormProps) {
  const { customers } = useCustomerStore();
  const { addRepair, updateRepair } = useRepairStore();
  const { user } = useAuthStore();
  const [staffProfiles, setStaffProfiles] = useState<StaffProfile[]>([]);
  const [formData, setFormData] = useState({
    customerId: '',
    boardId: '',
    priority: 'medium',
    comments: '',
    deliveryDate: '',
    seller: user?.email || '',
    operator: ''
  });

  const [repairs, setRepairs] = useState<Array<{
    id: string;
    typeId: string;
    x: number;
    y: number;
    side: 'top' | 'bottom';
    quantity: number;
    location: string;
  }>>([]);

  const [activeView, setActiveView] = useState<'top' | 'bottom'>('top');

  // Fetch staff profiles
  useEffect(() => {
    const fetchStaffProfiles = async () => {
      try {
        const profilesSnapshot = await getDocs(collection(db, 'admin_profiles'));
        const profiles = profilesSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as StaffProfile))
          .filter(profile => profile.role === 'staff' || profile.role === 'super_admin')
          .sort((a, b) => a.name.localeCompare(b.name));
        
        setStaffProfiles(profiles);
      } catch (error) {
        console.error('Error fetching staff profiles:', error);
      }
    };

    fetchStaffProfiles();
  }, []);

  // Load initial data when editing
  useEffect(() => {
    if (initialData) {
      const customer = customers.find(c => c.id === initialData.customerId);
      const boardIndex = customer?.surfboards.findIndex(
        board => `${board.brand} ${board.model} (${board.size})` === initialData.boardModel
      );

      setFormData({
        customerId: initialData.customerId || '',
        boardId: boardIndex !== undefined && boardIndex !== -1 ? boardIndex.toString() : '',
        priority: initialData.priority || 'medium',
        comments: initialData.comments || '',
        deliveryDate: initialData.deliveryDate || '',
        seller: initialData.seller || user?.email || '',
        operator: initialData.operator || ''
      });

      if (initialData.repairs) {
        setRepairs(initialData.repairs.map((repair: any) => ({
          id: repair.id || Math.random().toString(36).substr(2, 9),
          typeId: repair.typeId || repair.repairType.id,
          x: repair.x,
          y: repair.y,
          side: repair.side,
          quantity: repair.quantity,
          location: repair.location
        })));
      }
    }
  }, [initialData, customers, user]);

  const selectedCustomer = customers.find(c => c.id === formData.customerId);
  const selectedBoard = selectedCustomer?.surfboards[parseInt(formData.boardId)];

  const handleDrop = (item: any, coordinates: { x: number; y: number }, side: 'top' | 'bottom') => {
    const newRepair = {
      id: Math.random().toString(36).substr(2, 9),
      typeId: item.id,
      x: coordinates.x,
      y: coordinates.y,
      side,
      quantity: 1,
      location: `${side} - ${Math.round(coordinates.x)}% from left, ${Math.round(coordinates.y)}% from top`,
    };
    setRepairs(prev => [...prev, newRepair]);
  };

  const handleUpdatePosition = (repairId: string, x: number, y: number) => {
    setRepairs(prev => prev.map(repair =>
      repair.id === repairId ? { ...repair, x, y } : repair
    ));
  };

  const handleDelete = (repairId: string) => {
    setRepairs(prev => prev.filter(repair => repair.id !== repairId));
  };

  const handleUpdateQuantity = (repairId: string, quantity: number) => {
    setRepairs(prev => prev.map(repair => 
      repair.id === repairId ? { ...repair, quantity } : repair
    ));
  };

  const handleSave = async (data: any) => {
    if (!selectedCustomer || !selectedBoard) return;

    try {
      const repairData = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.fullName,
        boardModel: `${selectedBoard.brand} ${selectedBoard.model} (${selectedBoard.size})`,
        priority: formData.priority as 'high' | 'medium' | 'low',
        status: data.status,
        deliveryDate: data.deliveryDate,
        repairs: data.repairs,
        totalPrice: data.pricing.total,
        pricing: data.pricing,
        comments: formData.comments,
        seller: formData.seller,
        operator: formData.operator,
        isDirect: data.isDirect
      };

      if (initialData?.id) {
        await updateRepair(initialData.id, repairData);
      } else {
        await addRepair(repairData);
      }
      onClose();
    } catch (error) {
      console.error('Error saving repair:', error);
      alert('Failed to save repair. Please try again.');
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <form className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-100">
              {initialData ? 'Edit Repair' : 'New Repair'}
            </h2>
            {initialData && (
              <div className="flex items-center gap-2 bg-gray-700 px-3 py-1 text-sm text-gray-300">
                <Hash className="h-4 w-4" />
                <span>#{initialData.repairId}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Customer
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value, boardId: '' })}
              className="input-primary"
              required
            >
              <option value="">Select Customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Board
            </label>
            <select
              value={formData.boardId}
              onChange={(e) => setFormData({ ...formData, boardId: e.target.value })}
              className="input-primary"
              required
              disabled={!formData.customerId}
            >
              <option value="">Select Board</option>
              {selectedCustomer?.surfboards.map((board, index) => (
                <option key={index} value={index}>
                  {board.type} - {board.brand} {board.model} ({board.construction})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="input-primary"
              required
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Seller
            </label>
            <input
              type="email"
              value={formData.seller}
              onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
              className="input-primary"
              placeholder="Seller email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Operator
            </label>
            <select
              value={formData.operator}
              onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
              className="input-primary"
              required
            >
              <option value="">Select Operator</option>
              {staffProfiles.map((profile) => (
                <option key={profile.id} value={profile.email}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Comments
          </label>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
            className="input-primary h-24"
            placeholder="Add any additional notes or comments..."
          />
        </div>

        {selectedBoard && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3 order-2 lg:order-1">
              <div className="sticky top-4">
                <RepairTypeList selectedBoard={selectedBoard} />
              </div>
            </div>

            <div className="lg:col-span-5 order-1 lg:order-2">
              <BoardViews
                activeView={activeView}
                setActiveView={setActiveView}
                repairs={repairs}
                onDrop={handleDrop}
                onUpdateQuantity={handleUpdateQuantity}
                onUpdatePosition={handleUpdatePosition}
                onDelete={handleDelete}
              />
            </div>

            <div className="lg:col-span-4 order-3">
              <div className="sticky top-4">
                <QuotationSummary
                  repairs={repairs}
                  boardConstruction={selectedBoard.construction.toLowerCase()}
                  customerId={formData.customerId}
                  boardId={formData.boardId}
                  onSave={handleSave}
                  initialDeliveryDate={formData.deliveryDate}
                  initialStatus={initialData?.status}
                  initialData={{
                    pricing: initialData?.pricing,
                    isDirect: initialData?.isDirect
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </form>
    </DndProvider>
  );
}