import React, { useState, useEffect, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { useRepairStore } from '../stores/repairStore';
import { useCustomerStore } from '../stores/customerStore';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Filters } from '../components/Calendar/Filters';
import { CalendarView } from '../components/Calendar/CalendarView';
import { PlanningView } from '../components/Calendar/PlanningView';
import clsx from 'clsx';

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'planning'>('calendar');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOperator, setSelectedOperator] = useState('all');
  const [selectedSeller, setSelectedSeller] = useState('all');
  const [staffProfiles, setStaffProfiles] = useState<Map<string, string>>(new Map());
  
  const { repairs, updateRepair } = useRepairStore();
  const { customers } = useCustomerStore();
  const navigate = useNavigate();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Fetch staff profiles
  useEffect(() => {
    const fetchStaffProfiles = async () => {
      const profilesSnapshot = await getDocs(collection(db, 'admin_profiles'));
      const profiles = new Map<string, string>();
      profilesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.email) {
          profiles.set(data.email, data.name || formatName(data.email));
        }
      });
      setStaffProfiles(profiles);
    };
    fetchStaffProfiles();
  }, []);

  const formatName = (email: string): string => {
    const [name] = email.split('@');
    const parts = name.split('.');
    if (parts.length >= 2) {
      return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${parts[1].charAt(0).toUpperCase()}.`;
    }
    return name;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const filteredRepairs = useMemo(() => {
    return repairs.filter(repair => {
      const matchesStatus = selectedStatus === 'all' || repair.status === selectedStatus;
      const matchesOperator = selectedOperator === 'all' || repair.operator === selectedOperator;
      const matchesSeller = selectedSeller === 'all' || repair.seller === selectedSeller;
      return matchesStatus && matchesOperator && matchesSeller;
    });
  }, [repairs, selectedStatus, selectedOperator, selectedSeller]);

  // Group repairs by delivery date
  const repairsByDate = useMemo(() => {
    return filteredRepairs.reduce((acc: { [key: string]: typeof repairs }, repair) => {
      if (!repair.deliveryDate) return acc;
      const date = format(parseISO(repair.deliveryDate), 'yyyy-MM-dd');
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(repair);
      return acc;
    }, {});
  }, [filteredRepairs]);

  const handleRepairClick = (repairId: string) => {
    navigate('/dings', { state: { editRepairId: repairId } });
  };

  const handleRepairMove = async (repairId: string, newDate: string) => {
    const repair = repairs.find(r => r.id === repairId);
    if (!repair) return;

    try {
      await updateRepair(repairId, {
        ...repair,
        deliveryDate: newDate
      });
    } catch (error) {
      console.error('Error updating repair date:', error);
      alert('Failed to update repair date');
    }
  };

  const sortedRepairs = useMemo(() => {
    return [...filteredRepairs].sort((a, b) => {
      if (!a.deliveryDate || !b.deliveryDate) return 0;
      return new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime();
    });
  }, [filteredRepairs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-100">Repair Calendar</h1>
      </div>

      <div className="bg-gray-800 border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-100">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={previousMonth}
                  className="btn-secondary p-2"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextMonth}
                  className="btn-secondary p-2"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('calendar')}
                className={clsx(
                  'p-2 rounded transition-colors',
                  viewMode === 'calendar'
                    ? 'bg-[#45b7d1] text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                )}
                title="Calendar View"
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('planning')}
                className={clsx(
                  'p-2 rounded transition-colors',
                  viewMode === 'planning'
                    ? 'bg-[#45b7d1] text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                )}
                title="Planning View"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <Filters
          selectedStatus={selectedStatus}
          selectedOperator={selectedOperator}
          selectedSeller={selectedSeller}
          onStatusChange={setSelectedStatus}
          onOperatorChange={setSelectedOperator}
          onSellerChange={setSelectedSeller}
          staffProfiles={staffProfiles}
        />

        {viewMode === 'calendar' ? (
          <CalendarView
            days={days}
            currentDate={currentDate}
            repairsByDate={repairsByDate}
            onRepairClick={handleRepairClick}
            onRepairMove={handleRepairMove}
            customers={customers}
          />
        ) : (
          <PlanningView
            repairs={sortedRepairs}
            onRepairClick={handleRepairClick}
            customers={customers}
          />
        )}
      </div>
    </div>
  );
}

export default Calendar;