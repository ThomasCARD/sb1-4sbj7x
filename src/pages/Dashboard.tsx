import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wrench, 
  Users, 
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  PieChart,
  DollarSign,
  ShieldAlert,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRepairStore } from '../stores/repairStore';
import { useCustomerStore } from '../stores/customerStore';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { PieChart as CustomPieChart } from '../components/Dashboard/PieChart';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../stores/authStore';
import clsx from 'clsx';

// Helper function to format name
const formatName = (email: string): string => {
  const [name] = email.split('@');
  const parts = name.split('.');
  if (parts.length >= 2) {
    return `${parts[0].charAt(0).toUpperCase() + parts[0].slice(1)} ${parts[1].charAt(0).toUpperCase()}.`;
  }
  return name;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { repairs = [] } = useRepairStore();
  const { customers = [] } = useCustomerStore();
  const { user } = useAuthStore();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [staffProfiles, setStaffProfiles] = useState<Map<string, string>>(new Map());

  // Calculate total turnover
  const totalTurnover = useMemo(() => {
    if (!repairs || !repairs.length) return 0;
    return repairs
      .filter(repair => repair.status === 'finished')
      .reduce((total, repair) => total + (repair.totalPrice || 0), 0);
  }, [repairs]);

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

  useEffect(() => {
    const checkSuperAdmin = async () => {
      if (user?.uid) {
        const profileDoc = await getDoc(doc(db, 'admin_profiles', user.uid));
        if (profileDoc.exists()) {
          setIsSuperAdmin(profileDoc.data().role === 'super_admin');
        }
      }
    };
    checkSuperAdmin();
  }, [user]);

  // Calculate seller and operator statistics
  const { sellerData, operatorData } = useMemo(() => {
    if (!repairs || !repairs.length) {
      return { sellerData: { labels: [], values: [] }, operatorData: { labels: [], values: [] } };
    }

    const sellerStats = new Map();
    const operatorStats = new Map();

    repairs
      .filter(repair => repair.status === 'finished')
      .forEach(repair => {
        if (repair.seller) {
          sellerStats.set(repair.seller, (sellerStats.get(repair.seller) || 0) + 1);
        }
        if (repair.operator) {
          operatorStats.set(repair.operator, (operatorStats.get(repair.operator) || 0) + 1);
        }
      });

    // Sort and get top 5
    const sortedSellers = Array.from(sellerStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const sortedOperators = Array.from(operatorStats.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      sellerData: {
        labels: sortedSellers.map(([email]) => staffProfiles.get(email) || formatName(email)),
        values: sortedSellers.map(([, count]) => count)
      },
      operatorData: {
        labels: sortedOperators.map(([email]) => staffProfiles.get(email) || formatName(email)),
        values: sortedOperators.map(([, count]) => count)
      }
    };
  }, [repairs, staffProfiles]);

  // Calculate monthly turnover by operator
  const monthlyTurnoverByOperator = useMemo(() => {
    if (!repairs || !repairs.length) {
      return { months: [], operators: [] };
    }

    const months = [];
    const currentDate = new Date();
    const operatorTotals = new Map<string, number>();

    // Get all unique operators and their names
    const operatorDetails = new Map<string, { email: string; name: string }>();
    repairs
      .filter(repair => repair.status === 'finished' && repair.operator)
      .forEach(repair => {
        if (repair.operator && !operatorDetails.has(repair.operator)) {
          operatorDetails.set(repair.operator, {
            email: repair.operator,
            name: staffProfiles.get(repair.operator) || formatName(repair.operator)
          });
          operatorTotals.set(repair.operator, 0);
        }
      });

    const operators = Array.from(operatorDetails.values());

    for (let i = 0; i < 12; i++) {
      const monthStart = startOfMonth(subMonths(currentDate, i));
      const monthEnd = endOfMonth(monthStart);

      // Reset operator totals for this month
      const monthlyOperatorTotals = new Map(
        Array.from(operatorDetails.keys()).map(op => [op, 0])
      );

      const monthlyRepairs = repairs.filter(repair => {
        const repairDate = new Date(repair.createdAt);
        return repairDate >= monthStart && 
               repairDate <= monthEnd && 
               repair.status === 'finished';
      });

      // Calculate total and operator-specific totals
      const monthlyTotal = monthlyRepairs.reduce((total, repair) => {
        if (repair.operator && repair.totalPrice) {
          monthlyOperatorTotals.set(
            repair.operator,
            (monthlyOperatorTotals.get(repair.operator) || 0) + repair.totalPrice
          );
        }
        return total + (repair.totalPrice || 0);
      }, 0);

      months.unshift({
        month: format(monthStart, 'MMMM yyyy'),
        total: monthlyTotal,
        operatorTotals: Object.fromEntries(monthlyOperatorTotals)
      });
    }

    return {
      months,
      operators
    };
  }, [repairs, staffProfiles]);

  const dashboardStats = useMemo(() => {
    if (!repairs || !repairs.length || !customers) {
      return [];
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const activeRepairs = repairs.filter(repair => 
      repair.status === 'in_progress' &&
      new Date(repair.createdAt).getMonth() === currentMonth &&
      new Date(repair.createdAt).getFullYear() === currentYear
    ).length;

    const totalCustomers = customers.length;
    const totalRepairs = repairs.filter(repair => repair.status === 'finished').length;

    const completedRepairs = repairs.filter(repair => repair.status === 'finished');
    const totalDays = completedRepairs.reduce((acc, repair) => {
      const startDate = new Date(repair.createdAt);
      const endDate = new Date(repair.updatedAt);
      return acc + Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    }, 0);
    const avgRepairTime = completedRepairs.length > 0 
      ? (totalDays / completedRepairs.length).toFixed(1)
      : 0;

    return [
      {
        name: 'Active Repairs',
        value: activeRepairs,
        icon: Wrench,
        change: '+2.5%',
        changeType: 'increase'
      },
      {
        name: 'Total Customers',
        value: totalCustomers,
        icon: Users,
        change: '+3.7%',
        changeType: 'increase'
      },
      {
        name: 'Repairs Completed',
        value: totalRepairs,
        icon: Calendar,
        change: '+4.1%',
        changeType: 'increase'
      },
      {
        name: 'Avg. Repair Time',
        value: `${avgRepairTime} days`,
        icon: Clock,
        change: '-0.3%',
        changeType: 'decrease'
      }
    ];
  }, [repairs, customers]);

  if (!repairs || !customers) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#45b7d1]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-100">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dings', { state: { showNewRepair: true } })}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Repair
          </button>
          <button
            onClick={() => navigate('/customers', { state: { showNewCustomer: true } })}
            className="btn-secondary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Customer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((item) => (
          <div
            key={item.name}
            className="bg-gray-800 border border-gray-700"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-400 truncate">
                      {item.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-100">
                        {item.value}
                      </div>
                      <div className={clsx(
                        'ml-2 flex items-baseline text-sm font-semibold',
                        item.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
                      )}>
                        {item.changeType === 'increase' ? (
                          <TrendingUp className="self-center flex-shrink-0 h-4 w-4" />
                        ) : (
                          <TrendingDown className="self-center flex-shrink-0 h-4 w-4" />
                        )}
                        <span className="ml-1">{item.change}</span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isSuperAdmin && (
        <>
          <h2 className="text-xl font-semibold text-gray-100 mt-8">Performance Analytics</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CustomPieChart 
              data={sellerData}
              title="SELLERS"
            />
            
            <CustomPieChart 
              data={operatorData}
              title="OPERATORS REPAIRS"
            />
          </div>

          <div className="bg-gray-800 border border-gray-700 p-6">
            <div className="flex items-center gap-3 text-2xl font-bold text-gray-100 mb-6">
              <DollarSign className="h-8 w-8" />
              <span>Total Turnover: €{totalTurnover.toFixed(2)}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    {monthlyTurnoverByOperator.operators.map(operator => (
                      <th 
                        key={operator.email}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                        title={operator.email}
                      >
                        {operator.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {monthlyTurnoverByOperator.months.map((month, index) => (
                    <tr key={index} className="hover:bg-gray-750">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                        {month.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        €{month.total.toFixed(2)}
                      </td>
                      {monthlyTurnoverByOperator.operators.map(operator => (
                        <td 
                          key={operator.email}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-300"
                        >
                          €{(month.operatorTotals[operator.email] || 0).toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {/* Totals row */}
                  <tr className="bg-gray-750">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      Total
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                      €{totalTurnover.toFixed(2)}
                    </td>
                    {monthlyTurnoverByOperator.operators.map(operator => {
                      const operatorTotal = monthlyTurnoverByOperator.months.reduce(
                        (total, month) => total + (month.operatorTotals[operator.email] || 0),
                        0
                      );
                      return (
                        <td 
                          key={operator.email}
                          className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100"
                        >
                          €{operatorTotal.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}