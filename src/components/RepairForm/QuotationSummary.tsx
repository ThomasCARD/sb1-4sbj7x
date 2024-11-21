import React, { useState, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import { useCustomerStore } from '../../stores/customerStore';
import { getDefaultDeliveryDate } from '../../utils/dateUtils';
import { sendNewRepairEmail } from '../../utils/notifications';
import clsx from 'clsx';

interface RepairType {
  id: string;
  name: string;
  category: string;
  pricePolyester: number;
  priceEpoxy: number;
  color: string;
}

interface Repair {
  id: string;
  typeId: string;
  quantity: number;
  location: string;
  side: 'top' | 'bottom';
  x: number;
  y: number;
}

interface QuotationSummaryProps {
  repairs: Repair[];
  boardConstruction: 'polyester' | 'epoxy';
  customerId: string;
  boardId: string;
  onSave: (data: any) => Promise<void>;
  initialDeliveryDate?: string;
  initialStatus?: string;
  initialData?: {
    pricing?: {
      discountType: 'percentage' | 'amount';
      discountValue: number;
    };
    isDirect?: boolean;
  };
}

export function QuotationSummary({
  repairs,
  boardConstruction,
  customerId,
  boardId,
  onSave,
  initialDeliveryDate,
  initialStatus,
  initialData
}: QuotationSummaryProps) {
  const { repairTypes } = useSettingsStore();
  const { customers } = useCustomerStore();
  const [discountType, setDiscountType] = useState<'percentage' | 'amount'>(
    initialData?.pricing?.discountType || 'percentage'
  );
  const [discountValue, setDiscountValue] = useState<string>(
    initialData?.pricing?.discountValue?.toString() || ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [status, setStatus] = useState<string>(initialStatus || 'pending');
  const [isDirect, setIsDirect] = useState(initialData?.isDirect || false);

  useEffect(() => {
    setDeliveryDate(initialDeliveryDate || getDefaultDeliveryDate());
  }, [initialDeliveryDate]);

  const calculateSubtotal = (sideRepairs: Repair[]) => {
    return sideRepairs.reduce((total, repair) => {
      const repairType = repairTypes.find(t => t.id === repair.typeId);
      if (!repairType) return total;
      
      const price = boardConstruction === 'epoxy' 
        ? repairType.priceEpoxy 
        : repairType.pricePolyester;
      
      return total + (price * repair.quantity);
    }, 0);
  };

  const topRepairs = repairs.filter(r => r.side === 'top');
  const bottomRepairs = repairs.filter(r => r.side === 'bottom');
  
  const topSubtotal = calculateSubtotal(topRepairs);
  const bottomSubtotal = calculateSubtotal(bottomRepairs);
  const subtotal = topSubtotal + bottomSubtotal;

  const calculateDiscount = () => {
    if (!discountValue) return 0;
    const value = parseFloat(discountValue);
    if (isNaN(value)) return 0;
    
    return discountType === 'percentage' 
      ? (subtotal * value) / 100 
      : value;
  };

  const total = subtotal - calculateDiscount();

  const handleSave = async () => {
    if (!customerId || !boardId) {
      alert('Please select a customer and board first');
      return;
    }

    if (repairs.length === 0) {
      alert('Please add at least one repair');
      return;
    }

    if (!deliveryDate) {
      alert('Please set an estimated delivery date');
      return;
    }

    setIsSaving(true);
    try {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      const selectedBoard = customer.surfboards[parseInt(boardId)];
      if (!selectedBoard) {
        throw new Error('Selected board not found');
      }

      const repairsWithDetails = repairs.map(repair => {
        const repairType = repairTypes.find(t => t.id === repair.typeId);
        if (!repairType) {
          throw new Error('Invalid repair type');
        }

        return {
          typeId: repair.typeId,
          quantity: repair.quantity,
          location: repair.location,
          side: repair.side,
          x: repair.x,
          y: repair.y,
          repairType: {
            id: repairType.id,
            name: repairType.name,
            category: repairType.category,
            color: repairType.color,
            pricePolyester: repairType.pricePolyester,
            priceEpoxy: repairType.priceEpoxy
          }
        };
      });

      const now = new Date().toISOString();
      const repairId = Math.floor(Math.random() * 90000) + 10000; // Generate 5-digit repair ID

      const repairData = {
        repairId,
        customerId,
        customerName: customer.fullName,
        boardModel: `${selectedBoard.brand} ${selectedBoard.model} (${selectedBoard.size})`,
        repairs: repairsWithDetails,
        status,
        deliveryDate,
        isDirect,
        pricing: {
          subtotal,
          discountType,
          discountValue: parseFloat(discountValue) || 0,
          discountAmount: calculateDiscount(),
          total
        },
        totalPrice: total,
        createdAt: now,
        updatedAt: now
      };

      await onSave(repairData);

      if (!initialStatus) {
        try {
          await sendNewRepairEmail(repairData, customer);
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      }
    } catch (error) {
      console.error('Error saving repair:', error);
      alert(error instanceof Error ? error.message : 'Failed to save repair');
    } finally {
      setIsSaving(false);
    }
  };

  const RepairList = ({ title, sideRepairs }: { title: string, sideRepairs: Repair[] }) => (
    <div className="space-y-2">
      <h4 className="font-medium text-gray-100">{title}</h4>
      {sideRepairs.map((repair, index) => {
        const repairType = repairTypes.find(t => t.id === repair.typeId);
        if (!repairType) return null;

        const price = boardConstruction === 'epoxy' 
          ? repairType.priceEpoxy 
          : repairType.pricePolyester;
        
        return (
          <div key={index} className="flex justify-between text-sm">
            <div>
              <span className="font-medium text-gray-100">{repairType.name}</span>
              <span className="text-gray-400"> × {repair.quantity}</span>
            </div>
            <div className="font-medium text-gray-100">
              €{(price * repair.quantity).toFixed(2)}
            </div>
          </div>
        );
      })}
      {sideRepairs.length > 0 && (
        <div className="flex justify-between text-sm font-medium text-gray-400 pt-1">
          <span>Subtotal {title}</span>
          <span>€{calculateSubtotal(sideRepairs).toFixed(2)}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-800 p-4 border border-gray-700">
      <h3 className="text-lg font-medium text-gray-100 mb-4">Quotation Summary</h3>
      
      <div className="space-y-6">
        {topRepairs.length > 0 && <RepairList title="Top View" sideRepairs={topRepairs} />}
        {bottomRepairs.length > 0 && <RepairList title="Bottom View" sideRepairs={bottomRepairs} />}

        <div className="pt-3 border-t border-gray-700">
          <div className="flex justify-between text-sm font-medium text-gray-100">
            <span>Total Subtotal</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center space-x-2">
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'amount')}
                className="input-primary text-sm py-1"
              >
                <option value="percentage">Discount (%)</option>
                <option value="amount">Discount (€)</option>
              </select>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={discountType === 'percentage' ? '0%' : '0€'}
                className="input-primary text-sm py-1"
                min="0"
                step={discountType === 'percentage' ? '1' : '0.01'}
              />
            </div>
            {calculateDiscount() > 0 && (
              <div className="flex justify-between text-sm text-red-400">
                <span>Discount</span>
                <span>-€{calculateDiscount().toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-primary w-full"
          >
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="finished">Finished</option>
            <option value="aborted">Aborted</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">
            Estimated Delivery Date
          </label>
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="input-primary w-full"
            required
          />
        </div>

        <div className="mt-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isDirect}
              onChange={(e) => setIsDirect(e.target.checked)}
              className="form-checkbox h-4 w-4 text-[#45b7d1] border-gray-600 bg-gray-700 focus:ring-[#45b7d1] rounded"
            />
            <span className="text-sm text-gray-300">Direct Cost Repair</span>
          </label>
        </div>

        <div className="pt-3 border-t border-gray-700">
          <div className="flex justify-between font-medium text-lg text-gray-100">
            <span>Total</span>
            <span>€{total.toFixed(2)}</span>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || repairs.length === 0 || !deliveryDate}
          className={clsx(
            'w-full btn-primary flex items-center justify-center gap-2',
            (isSaving || repairs.length === 0 || !deliveryDate) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <CheckCircle className="h-4 w-4" />
          VALIDATE
        </button>
      </div>
    </div>
  );
}