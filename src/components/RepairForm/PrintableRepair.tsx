import React from 'react';
import { Logo } from '../Logo';

interface PrintableRepairProps {
  repairs: Array<{
    typeId: string;
    quantity: number;
    location: string;
    side: 'top' | 'bottom';
  }>;
  topRepairs: typeof repairs;
  bottomRepairs: typeof repairs;
  repairTypes: Array<{
    id: string;
    name: string;
    pricePolyester: number;
    priceEpoxy: number;
  }>;
  boardConstruction: 'polyester' | 'epoxy';
  subtotal: number;
  discount: {
    type: 'percentage' | 'amount';
    value: number;
  };
  total: number;
}

export const PrintableRepair: React.FC<PrintableRepairProps> = ({
  repairs,
  topRepairs,
  bottomRepairs,
  repairTypes,
  boardConstruction,
  subtotal,
  discount,
  total
}) => {
  const calculateSubtotal = (sideRepairs: typeof repairs) => {
    return sideRepairs.reduce((total, repair) => {
      const repairType = repairTypes.find(t => t.id === repair.typeId);
      if (!repairType) return total;
      
      const price = boardConstruction === 'epoxy' 
        ? repairType.priceEpoxy 
        : repairType.pricePolyester;
      
      return total + (price * repair.quantity);
    }, 0);
  };

  const RepairList = ({ title, sideRepairs }: { title: string, sideRepairs: typeof repairs }) => (
    <div className="space-y-2">
      <h4 className="font-medium border-b border-black pb-2">{title}</h4>
      {sideRepairs.map((repair, index) => {
        const repairType = repairTypes.find(t => t.id === repair.typeId);
        if (!repairType) return null;

        const price = boardConstruction === 'epoxy' 
          ? repairType.priceEpoxy 
          : repairType.pricePolyester;
        
        return (
          <div key={index} className="flex justify-between text-sm">
            <div>
              <span className="font-medium">{repairType.name}</span>
              <span> × {repair.quantity}</span>
              <div className="text-xs">{repair.location}</div>
            </div>
            <div className="font-medium">
              €{(price * repair.quantity).toFixed(2)}
            </div>
          </div>
        );
      })}
      {sideRepairs.length > 0 && (
        <div className="flex justify-between text-sm font-medium pt-1">
          <span>Subtotal {title}</span>
          <span>€{calculateSubtotal(sideRepairs).toFixed(2)}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <style type="text/css" media="print">
        {`
          @page {
            size: A4;
            margin: 20mm;
          }
          @media print {
            body {
              print-color-adjust: exact;
              -webkit-print-color-adjust: exact;
              color: black !important;
              background: white !important;
            }
            * {
              color: black !important;
              border-color: black !important;
            }
          }
        `}
      </style>

      <div className="text-center mb-8">
        <Logo className="h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">Repair Quote</h1>
      </div>

      <div className="space-y-6">
        {topRepairs.length > 0 && <RepairList title="Top View" sideRepairs={topRepairs} />}
        {bottomRepairs.length > 0 && <RepairList title="Bottom View" sideRepairs={bottomRepairs} />}

        <div className="pt-3 border-t border-black">
          <div className="flex justify-between text-sm font-medium">
            <span>Subtotal</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>

          {discount.value > 0 && (
            <div className="flex justify-between text-sm">
              <span>Discount ({discount.type === 'percentage' ? `${discount.value}%` : '€' + discount.value})</span>
              <span>-€{(discount.type === 'percentage' ? (subtotal * discount.value / 100) : discount.value).toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-black">
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>€{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-black text-sm">
          <p className="font-medium mb-2">Terms & Conditions:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Payment is required upon completion of repairs</li>
            <li>Estimated completion time may vary based on repair complexity</li>
            <li>All repairs include a 30-day warranty</li>
          </ul>
        </div>
      </div>
    </div>
  );
};