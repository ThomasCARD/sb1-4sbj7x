import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Hash, User, Wrench } from 'lucide-react';
import clsx from 'clsx';
import { getStatusColor } from './utils';

interface DraggableRepairProps {
  repair: any;
  customer: any;
  onClick: () => void;
}

export function DraggableRepair({ repair, customer, onClick }: DraggableRepairProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: repair.id,
    data: repair
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 999 : undefined,
  } : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={clsx(
        'w-full text-left px-2 py-1 text-xs hover:opacity-80 transition-opacity',
        getStatusColor(repair.status),
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <div className="flex items-center space-x-1">
        <Hash className="h-3 w-3" />
        <span>#{repair.repairId}</span>
      </div>
      <div className="flex items-center space-x-1 font-medium">
        <User className="h-3 w-3" />
        <span className="truncate">{customer?.fullName || 'Unknown'}</span>
      </div>
      <div className="flex items-center space-x-1 text-gray-300">
        <Wrench className="h-3 w-3" />
        <span className="truncate">{repair.boardModel}</span>
      </div>
    </button>
  );
}