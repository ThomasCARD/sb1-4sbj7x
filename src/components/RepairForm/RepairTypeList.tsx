import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { useSettingsStore } from '../../stores/settingsStore';
import { ChevronDown, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface RepairTypeListProps {
  selectedBoard: any;
}

interface CategoryProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const Category: React.FC<CategoryProps> = ({ title, isOpen, onToggle, children }) => (
  <div className="mb-1">
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onToggle();
      }}
      className="w-full flex items-center justify-between p-2 bg-gray-750 hover:bg-gray-700 transition-colors"
    >
      <span className="text-sm font-semibold uppercase tracking-wide text-gray-100">{title}</span>
      {isOpen ? (
        <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
      ) : (
        <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
      )}
    </button>
    {isOpen && (
      <div className="mt-1 space-y-1">
        {children}
      </div>
    )}
  </div>
);

export function RepairTypeList({ selectedBoard }: RepairTypeListProps) {
  const { repairTypes, fetchRepairTypes } = useSettingsStore();
  const [activeCategory, setActiveCategory] = useState<string>('dings');

  const toggleCategory = (category: string) => {
    setActiveCategory(category);
  };

  const RepairTypeItem = ({ type }: { type: any }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
      type: 'repairType',
      item: { 
        id: type.id,
        name: type.name,
        color: type.color,
      },
      collect: (monitor) => ({
        isDragging: !!monitor.isDragging(),
      }),
    }));

    const price = selectedBoard?.construction === 'epoxy' 
      ? type.priceEpoxy 
      : type.pricePolyester;

    return (
      <div
        ref={drag}
        className={clsx(
          'group relative p-1.5 cursor-move transition-all hover:opacity-90',
          isDragging ? 'opacity-50' : 'hover:translate-x-1'
        )}
        style={{
          backgroundColor: type.color,
          color: '#fff',
        }}
      >
        <div className="flex items-center justify-between text-xs font-light">
          <span className="truncate" title={type.name}>{type.name}</span>
          <span className="ml-2 whitespace-nowrap">€{Math.round(price)}</span>
        </div>
        
        {/* Static tooltip to prevent scrollbar on hover */}
        <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block z-10 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs py-1 px-2 rounded shadow-lg">
            {type.name}
          </div>
        </div>
      </div>
    );
  };

  const categories = [
    { id: 'dings', label: 'Dings' },
    { id: 'fins', label: 'Fins' },
    { id: 'options', label: 'Options' }
  ];

  return (
    <div className="space-y-1 h-[calc(100vh-400px)] no-scrollbar">
      {categories.map(category => {
        const categoryRepairTypes = repairTypes.filter(type => type.category === category.id);
        
        if (categoryRepairTypes.length === 0) {
          return null;
        }

        return (
          <Category
            key={category.id}
            title={category.label}
            isOpen={activeCategory === category.id}
            onToggle={() => toggleCategory(category.id)}
          >
            {categoryRepairTypes.map(type => (
              <RepairTypeItem key={type.id} type={type} />
            ))}
          </Category>
        );
      })}

      {repairTypes.length === 0 && (
        <div className="text-xs text-gray-400">
          No repair types available
        </div>
      )}
    </div>
  );
}