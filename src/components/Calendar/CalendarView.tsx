import React from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { format } from 'date-fns';
import { DroppableDay } from './DroppableDay';

interface CalendarViewProps {
  days: Date[];
  currentDate: Date;
  repairsByDate: { [key: string]: any[] };
  onRepairClick: (repairId: string) => void;
  onRepairMove: (repairId: string, newDate: string) => void;
  customers: any[];
}

export function CalendarView({
  days,
  currentDate,
  repairsByDate,
  onRepairClick,
  onRepairMove,
  customers
}: CalendarViewProps) {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const repairId = active.id as string;
      const newDate = over.id as string;
      onRepairMove(repairId, newDate);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="bg-gray-800 border border-gray-700">
        <div className="grid grid-cols-7 gap-px bg-gray-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="bg-gray-800 py-2 text-center text-sm font-medium text-gray-300"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-gray-700">
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayRepairs = repairsByDate[dateKey] || [];

            return (
              <DroppableDay
                key={day.toString()}
                day={day}
                currentDate={currentDate}
                repairs={dayRepairs}
                customers={customers}
                onRepairClick={onRepairClick}
              />
            );
          })}
        </div>
      </div>
    </DndContext>
  );
}