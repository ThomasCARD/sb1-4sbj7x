import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Plus, User, Mail, Phone, Waves, Pencil, Trash2, FileDown } from 'lucide-react';
import { useCustomerStore } from '../stores/customerStore';
import { useAuthStore } from '../stores/authStore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CustomerForm } from '../components/CustomerForm';
import clsx from 'clsx';

const customerTypeColors = {
  Customer: 'bg-gray-700 text-gray-100',
  'Team Rider': 'bg-blue-900 text-blue-100',
  'Surf Shop': 'bg-purple-900 text-purple-100',
  Professional: 'bg-green-900 text-green-100',
  VIP: 'bg-yellow-900 text-yellow-100',
};

export default function Customers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { customers, deleteCustomer } = useCustomerStore();
  const { user } = useAuthStore();
  const location = useLocation();

  // Check if user is super admin
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

  // Handle new customer from dashboard
  useEffect(() => {
    const state = location.state as { showNewCustomer?: boolean };
    if (state?.showNewCustomer) {
      setShowForm(true);
    }
    // Clear the state to prevent reopening on navigation
    window.history.replaceState({}, document.title);
  }, [location.state]);

  const handleSubmit = async (data: any, password: string) => {
    try {
      if (editingCustomer) {
        await useCustomerStore.getState().updateCustomer(editingCustomer.id, data);
      } else {
        await useCustomerStore.getState().addCustomer(data, password);
      }
      handleCloseForm();
    } catch (error) {
      console.error('Error saving customer:', error);
      alert('Failed to save customer. Please try again.');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await deleteCustomer(id);
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete customer. Please try again.');
      }
    }
  };

  const exportToCSV = () => {
    const csvData = customers.map(customer => {
      const surfboardsInfo = (customer.surfboards || [])
        .map(board => `${board.type} - ${board.brand} ${board.model} (${board.construction})`)
        .join('; ');

      return {
        'First Name': customer.firstName || '',
        'Last Name': customer.lastName || '',
        'Email': customer.email || '',
        'Phone': customer.phone || '',
        'Type': customer.type || '',
        'Street': customer.address?.street || '',
        'City': customer.address?.city || '',
        'Postal Code': customer.address?.postalCode || '',
        'Country': customer.address?.country || '',
        'Company Name': customer.companyDetails?.name || '',
        'VAT Number': customer.companyDetails?.vatNumber || '',
        'Surfboards': surfboardsInfo
      };
    });

    if (csvData.length === 0) {
      alert('No customers to export');
      return;
    }

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => 
        JSON.stringify(row[header as keyof typeof row] || '')).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCustomers = customers
    .filter(customer => 
      customer.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-100">
            Customers 
            <span className="ml-2 text-sm text-gray-400">
              ({customers.length} total)
            </span>
          </h1>
        </div>
        <div className="flex gap-2">
          {isSuperAdmin && (
            <button 
              onClick={exportToCSV}
              className="btn-secondary flex items-center gap-2"
              title="Export to CSV"
            >
              <FileDown className="h-5 w-5" />
              Export
            </button>
          )}
          <button 
            onClick={() => setShowForm(true)} 
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            New Customer
          </button>
        </div>
      </div>

      {/* Rest of the component remains the same */}
      {showForm ? (
        <CustomerForm 
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
          initialData={editingCustomer}
        />
      ) : (
        <>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="input-primary pl-10 w-full"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="bg-gray-800 shadow hover:shadow-lg transition-shadow border border-gray-700">
                <Link to={`/customers/${customer.id}`} className="block p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-700 p-2">
                        <User className="h-6 w-6 text-gray-300" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-100">{customer.fullName}</h3>
                        <span className={clsx(
                          'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full',
                          customerTypeColors[customer.type as keyof typeof customerTypeColors]
                        )}>
                          {customer.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-300">
                      <Mail className="h-4 w-4 mr-2" />
                      {customer.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Phone className="h-4 w-4 mr-2" />
                      {customer.phone}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-100 mb-2 flex items-center">
                      <Waves className="h-4 w-4 mr-2" />
                      Surfboards
                    </h4>
                    <div className="space-y-2">
                      {(customer.surfboards || []).map((board, index) => (
                        <div
                          key={index}
                          className="bg-gray-700 p-2 text-sm"
                        >
                          <div className="font-medium text-gray-100">
                            {board.type}
                          </div>
                          <div className="text-gray-300">
                            {board.brand} {board.model} ({board.construction})
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>

                <div className="flex justify-end space-x-2 p-4 border-t border-gray-700">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setEditingCustomer(customer);
                      setShowForm(true);
                    }}
                    className="btn-secondary p-2"
                    title="Edit Customer"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(customer.id);
                    }}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 transition-colors"
                    title="Delete Customer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {customers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">No customers found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}