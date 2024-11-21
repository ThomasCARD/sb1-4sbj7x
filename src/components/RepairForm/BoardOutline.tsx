import React from 'react';
import { useDrop } from 'react-dnd';
import { X } from 'lucide-react';
import { useSettingsStore } from '../../stores/settingsStore';
import clsx from 'clsx';

interface BoardOutlineProps {
  side: 'top' | 'bottom';
  onDrop: (item: any, coordinates: { x: number; y: number }) => void;
  repairs: Array<{
    id: string;
    typeId: string;
    x: number;
    y: number;
    quantity: number;
  }>;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
}

export const BoardOutline: React.FC<BoardOutlineProps> = ({ 
  side, 
  onDrop, 
  repairs, 
  onUpdateQuantity,
  onUpdatePosition,
  onDelete 
}) => {
  const { repairTypes } = useSettingsStore();

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'repairType',
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset) return;

      const element = document.getElementById(`board-${side}`);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const x = ((offset.x - rect.left) / rect.width) * 100;
      const y = ((offset.y - rect.top) / rect.height) * 100;

      const boundedX = Math.max(0, Math.min(100, x));
      const boundedY = Math.max(0, Math.min(100, y));

      onDrop(item, { x: boundedX, y: boundedY });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }), [onDrop, side]);

  const handleDrag = (e: React.DragEvent, repairId: string) => {
    const element = document.getElementById(`board-${side}`);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const boundedX = Math.max(0, Math.min(100, x));
    const boundedY = Math.max(0, Math.min(100, y));

    onUpdatePosition(repairId, boundedX, boundedY);
  };

  return (
    <div className="flex justify-center h-full">
      {/* Fixed dimensions container */}
      <div 
        className="relative"
        style={{ 
          width: '275px',
          height: '625px'
        }}
      >
        <div
          ref={drop}
          id={`board-${side}`}
          className={clsx(
            'absolute inset-0 border-2',
            isOver ? 'border-[#45b7d1]' : 'border-gray-700',
            'bg-gray-800 transition-colors duration-200'
          )}
          style={{
            backgroundImage: `url('/board-${side}.svg')`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {repairs.map((repair) => {
            const repairType = repairTypes.find(t => t.id === repair.typeId);
            if (!repairType) return null;

            return (
              <div
                key={repair.id}
                draggable
                onDragEnd={(e) => handleDrag(e, repair.id)}
                className="absolute -ml-6 -mt-6 cursor-move group"
                style={{ left: `${repair.x}%`, top: `${repair.y}%` }}
              >
                <div className="relative">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg transition-transform transform group-hover:scale-110"
                    style={{ backgroundColor: repairType.color }}
                  >
                    <input
                      type="number"
                      value={repair.quantity}
                      onChange={(e) => onUpdateQuantity(repair.id, parseInt(e.target.value) || 1)}
                      className="w-8 bg-transparent text-center focus:outline-none"
                      min="1"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={() => onDelete(repair.id)}
                      className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs bg-gray-800 text-gray-100 px-2 py-1 rounded shadow-sm border border-gray-700">
                      {repairType.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};