import React from 'react';
import { useDrag } from 'react-dnd';
import { useRepairTypesStore } from '../../stores/repairTypesStore';

export function RepairTypes() {
  const { repairTypes } = useRepairTypesStore();

  const RepairTypeItem = ({ type }: { type: any }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'repairType',
      item: {
        id: type.id,
        name: type.name,
        color: type.color
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging()
      })
    }));

    return (
      <div
        ref={drag}
        className={`p-3 rounded-lg mb-2 cursor-move transition-opacity ${
          isDragging ? 'opacity-50' : 'opacity-100'
        }`}
        style={{ backgroundColor: type.color }}
      >
        <div className="text-white font-medium">{type.name}</div>
        <div className="text-white text-sm opacity-80">Drag to place</div>
      </div>
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Repair Types</h3>
      <div className="space-y-2">
        {repairTypes.map((type) => (
          <RepairTypeItem key={type.id} type={type} />
        ))}
      </div>
    </div>
  );
}