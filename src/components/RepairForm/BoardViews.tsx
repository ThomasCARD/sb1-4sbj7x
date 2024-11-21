import React from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { BoardOutline } from './BoardOutline';
import clsx from 'clsx';

interface BoardViewsProps {
  activeView: 'top' | 'bottom';
  setActiveView: (view: 'top' | 'bottom') => void;
  repairs: Array<{
    id: string;
    typeId: string;
    x: number;
    y: number;
    side: 'top' | 'bottom';
    quantity: number;
    location: string;
  }>;
  onDrop: (item: any, coordinates: { x: number; y: number }, side: 'top' | 'bottom') => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
}

export function BoardViews({
  activeView,
  setActiveView,
  repairs,
  onDrop,
  onUpdateQuantity,
  onUpdatePosition,
  onDelete
}: BoardViewsProps) {
  const toggleView = () => {
    setActiveView(activeView === 'top' ? 'bottom' : 'top');
  };

  const getViewLabel = (view: 'top' | 'bottom') => {
    return view === 'top' ? 'Deck View' : 'Bottom View';
  };

  return (
    <div className="bg-gray-800">
      {/* View Controls */}
      <div className="flex items-center justify-between bg-gray-900 p-2">
        <div className="flex items-center gap-2 px-2">
          <div className="w-6 h-6 flex items-center justify-center">
            {activeView === 'top' ? (
              <ArrowUpCircle className="h-5 w-5 text-gray-300" />
            ) : (
              <ArrowDownCircle className="h-5 w-5 text-gray-300" />
            )}
          </div>
          <span className="text-sm font-medium text-gray-300">
            {getViewLabel(activeView)}
          </span>
        </div>
        <button
          type="button"
          onClick={toggleView}
          className="px-4 py-1.5 text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        >
          Switch to {getViewLabel(activeView === 'top' ? 'bottom' : 'top')}
        </button>
      </div>

      {/* Board Views Container */}
      <div className="relative h-[625px]">
        <div
          className={clsx(
            'absolute inset-0 w-full h-full transition-all duration-300 transform',
            activeView === 'top' ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
          )}
        >
          <BoardOutline
            side="top"
            onDrop={(item, coordinates) => onDrop(item, coordinates, 'top')}
            repairs={repairs.filter(r => r.side === 'top')}
            onUpdateQuantity={onUpdateQuantity}
            onUpdatePosition={onUpdatePosition}
            onDelete={onDelete}
          />
        </div>
        <div
          className={clsx(
            'absolute inset-0 w-full h-full transition-all duration-300 transform',
            activeView === 'bottom' ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0 pointer-events-none'
          )}
        >
          <BoardOutline
            side="bottom"
            onDrop={(item, coordinates) => onDrop(item, coordinates, 'bottom')}
            repairs={repairs.filter(r => r.side === 'bottom')}
            onUpdateQuantity={onUpdateQuantity}
            onUpdatePosition={onUpdatePosition}
            onDelete={onDelete}
          />
        </div>
      </div>

      {/* View Indicator Dots */}
      <div className="flex justify-center space-x-2 py-2">
        <div
          className={clsx(
            'w-2 h-2 rounded-full transition-colors',
            activeView === 'top' ? 'bg-[#45b7d1]' : 'bg-gray-600'
          )}
        />
        <div
          className={clsx(
            'w-2 h-2 rounded-full transition-colors',
            activeView === 'bottom' ? 'bg-[#45b7d1]' : 'bg-gray-600'
          )}
        />
      </div>
    </div>
  );
}