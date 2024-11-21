import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ShieldAlert, Search } from 'lucide-react';
import { ProfileCard } from '../components/AdminProfiles/ProfileCard';

interface Profile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role: 'customer' | 'staff' | 'super_admin';
  type?: string;
  companyDetails?: {
    name: string;
    vatNumber: string;
  };
  validated?: boolean;
}

export default function AdminProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const { user } = useAuthStore();

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

  useEffect(() => {
    const fetchAllProfiles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Create a map to store merged profiles
        const profilesMap = new Map<string, Profile>();
        
        // Fetch customer profiles first
        const customerQuery = query(collection(db, 'customers'));
        const customerSnapshot = await getDocs(customerQuery);
        
        customerSnapshot.docs.forEach(doc => {
          const data = doc.data();
          profilesMap.set(doc.id, {
            id: doc.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: 'customer',
            type: data.type,
            companyDetails: data.companyDetails
          });
        });

        // Fetch and merge admin profiles
        const adminQuery = query(collection(db, 'admin_profiles'));
        const adminSnapshot = await getDocs(adminQuery);
        
        adminSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const existingProfile = profilesMap.get(doc.id);
          
          if (existingProfile) {
            // Merge admin data with existing customer profile
            profilesMap.set(doc.id, {
              ...existingProfile,
              role: data.role || 'staff',
              name: data.name,
              validated: data.validated
            });
          } else {
            // Add new admin profile
            profilesMap.set(doc.id, {
              id: doc.id,
              email: data.email,
              name: data.name,
              role: data.role || 'staff',
              validated: data.validated
            });
          }
        });

        // Convert map to array and sort by email
        const sortedProfiles = Array.from(profilesMap.values())
          .sort((a, b) => a.email.localeCompare(b.email));

        setProfiles(sortedProfiles);
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('Failed to load profiles');
      } finally {
        setLoading(false);
      }
    };

    fetchAllProfiles();
  }, []);

  const handleRoleChange = async (profileId: string, newRole: string) => {
    try {
      setError(null);
      const profile = profiles.find(p => p.id === profileId);
      if (!profile) return;

      // If changing from customer to staff/admin
      if (profile.role === 'customer' && newRole !== 'customer') {
        // Create new admin profile using setDoc
        await setDoc(doc(db, 'admin_profiles', profileId), {
          email: profile.email,
          name: profile.firstName && profile.lastName 
            ? `${profile.firstName} ${profile.lastName}`
            : profile.name,
          role: newRole,
          validated: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });

        // Update customer type to reflect new role
        await updateDoc(doc(db, 'customers', profileId), {
          type: newRole === 'super_admin' ? 'Admin' : 'Staff',
          updatedAt: new Date().toISOString()
        });
      }
      // If changing from staff/admin to customer
      else if (profile.role !== 'customer' && newRole === 'customer') {
        // Delete admin profile
        await deleteDoc(doc(db, 'admin_profiles', profileId));
        
        // Update customer profile
        await updateDoc(doc(db, 'customers', profileId), {
          type: 'Customer',
          updatedAt: new Date().toISOString()
        });
      }
      // If changing between staff and admin
      else {
        await updateDoc(doc(db, 'admin_profiles', profileId), {
          role: newRole,
          updatedAt: new Date().toISOString()
        });
      }

      // Update local state
      setProfiles(prev => prev.map(p => 
        p.id === profileId ? { ...p, role: newRole as Profile['role'] } : p
      ));
    } catch (err) {
      console.error('Error updating role:', err);
      setError('Failed to update role. Please try again.');
    }
  };

  const handleDelete = async (profileId: string) => {
    if (!window.confirm('Are you sure you want to delete this profile?')) {
      return;
    }

    try {
      setError(null);
      const profile = profiles.find(p => p.id === profileId);
      if (!profile) return;

      // Delete from both collections to ensure cleanup
      try {
        await deleteDoc(doc(db, 'customers', profileId));
      } catch (e) {
        console.log('No customer profile to delete');
      }

      try {
        await deleteDoc(doc(db, 'admin_profiles', profileId));
      } catch (e) {
        console.log('No admin profile to delete');
      }

      setProfiles(prev => prev.filter(p => p.id !== profileId));
    } catch (err) {
      console.error('Error deleting profile:', err);
      setError('Failed to delete profile');
    }
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (profile.firstName && profile.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (profile.lastName && profile.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (profile.name && profile.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#45b7d1]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-100">Admin Profiles Management</h1>
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <div className="flex items-center gap-2 text-sm bg-green-900 text-green-100 px-3 py-1">
              <ShieldAlert className="h-4 w-4" />
              <span>Super Admin Access</span>
            </div>
          )}
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="input-primary pl-10 w-full"
          placeholder="Search profiles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-red-900 text-red-100 p-4 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {filteredProfiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            onRoleChange={handleRoleChange}
            onDelete={handleDelete}
          />
        ))}

        {filteredProfiles.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-400">No profiles found</p>
          </div>
        )}
      </div>
    </div>
  );
}