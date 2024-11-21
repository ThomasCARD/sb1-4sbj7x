import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Logo } from '../components/Logo';
import { CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';
import clsx from 'clsx';

export default function PublicRepairStatus() {
  const { id } = useParams();
  const [repair, setRepair] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepair = async () => {
      try {
        const repairDoc = await getDoc(doc(db, 'repairs', id!));
        if (repairDoc.exists()) {
          setRepair({ id: repairDoc.id, ...repairDoc.data() });
        } else {
          setError('Repair not found');
        }
      } catch (err) {
        setError('Failed to load repair details');
      } finally {
        setLoading(false);
      }
    };

    fetchRepair();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#323b44] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#45b7d1]"></div>
      </div>
    );
  }

  if (error || !repair) {
    return (
      <div className="min-h-screen bg-[#323b44] flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto" />
          <p className="text-red-400">{error || 'Repair not found'}</p>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'finished':
        return <CheckCircle2 className="h-6 w-6 text-green-400" />;
      case 'in_progress':
        return <Clock className="h-6 w-6 text-blue-400" />;
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-400" />;
      case 'aborted':
        return <XCircle className="h-6 w-6 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'finished':
        return 'bg-green-900 text-green-100';
      case 'in_progress':
        return 'bg-blue-900 text-blue-100';
      case 'pending':
        return 'bg-yellow-900 text-yellow-100';
      case 'aborted':
        return 'bg-red-900 text-red-100';
      default:
        return 'bg-gray-900 text-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#323b44] py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <Logo className="h-24 w-auto mx-auto" />
          <h1 className="text-2xl font-bold text-gray-100">Repair Status</h1>
        </div>

        {/* Status Card */}
        <div className="bg-gray-800 border border-gray-700 p-6 space-y-6">
          {/* Board Info */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-100">
              {repair.boardModel}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Repair ID:</span>
              <span className="text-sm font-medium text-gray-100">#{repair.repairId}</span>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 py-4 border-t border-b border-gray-700">
            {getStatusIcon(repair.status)}
            <div>
              <span className={clsx(
                'px-3 py-1 text-sm font-medium',
                getStatusColor(repair.status)
              )}>
                {repair.status.charAt(0).toUpperCase() + repair.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Repairs List */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-400">Repairs Performed:</h3>
            <div className="space-y-2">
              {repair.repairs.map((r: any, index: number) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-750"
                  style={{ backgroundColor: r.repairType.color }}
                >
                  <span className="text-sm font-medium text-white">
                    {r.repairType.name}
                  </span>
                  <span className="text-sm text-white opacity-90">
                    x{r.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total</span>
              <span className="text-xl font-bold text-gray-100">
                €{repair.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Shop Info */}
        <div className="text-center text-sm text-gray-400 space-y-2">
          <p>Shapers Club Repair - Marennes</p>
          <p>Opening Hours: Mon-Fri 9:00-18:00, Sat 9:00-12:00</p>
          <p>Phone: +33 5 46 85 67 89</p>
        </div>
      </div>
    </div>
  );
}