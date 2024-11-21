import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { format, isSameMonth, isToday } from 'date-fns';
import clsx from 'clsx';
import { DraggableRepair } from './DraggableRepair';

interface DroppableDayProps {
  day: Date;
  currentDate: Date;
  repairs: any[];
  customers: any[];
  onRepairClick: (repairId: string) => void;
}

export function DroppableDay({
  day,
  currentDate,
  repairs,
  customers,
  onRepairClick
}: DroppableDayProps) {
  const dateKey = format(day, 'yyyy-MM-dd');
  const { setNodeRef, isOver } = useDroppable({
    id: dateKey,
    data: { date: dateKey }
  });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'min-h-[120px] p-2 transition-colors duration-200',
        !isSameMonth(day, currentDate) ? 'bg-gray-900 text-gray-500' : 'bg-gray-800 text-gray-300',
        isToday(day) && 'bg-gray-750',
        isOver && 'bg-gray-700'
      )}
    >
      <div className="flex justify-between">
        <span
          className={clsx(
            'text-sm font-medium',
            isToday(day) && 'bg-[#45b7d1] text-white w-7 h-7 flex items-center justify-center'
          )}
        >
          {format(day, 'd')}
        </span>
      </div>
      <div className="mt-1 space-y-1 max-h-[100px] overflow-y-auto">
        {repairs.map((repair) => {
          const customer = customers.find(c => c.id === repair.customerId);
          return (
            <DraggableRepair
              key={repair.id}
              repair={repair}
              customer={customer}
              onClick={() => onRepairClick(repair.id)}
            />
          );
        })}
      </div>
    </div>
  );
}