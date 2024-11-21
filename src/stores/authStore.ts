import { create } from 'zustand';
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, ADMIN_EMAIL, ADMIN_PASSWORD } from '../lib/firebase';

interface AuthState {
  user: (User & { customerData?: any }) | null;
  isAuthenticated: boolean;
  isValidated: boolean;
  isLoading: boolean;
  error: string | null;
  userRole: 'customer' | 'staff' | 'super_admin' | null;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateCustomerProfile: (updates: any) => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isValidated: false,
  isLoading: true,
  error: null,
  userRole: null,

  initialize: async () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
          if (user) {
            // First check for admin profile
            const adminDoc = await getDoc(doc(db, 'admin_profiles', user.uid));
            if (adminDoc.exists()) {
              const adminData = adminDoc.data();
              set({ 
                user,
                isAuthenticated: true,
                isValidated: adminData.validated || false,
                userRole: adminData.role === 'super_admin' ? 'super_admin' : 'staff',
                isLoading: false,
                error: null
              });
              resolve();
              return;
            }

            // If no admin profile, check for customer profile
            const customerDoc = await getDoc(doc(db, 'customers', user.uid));
            if (customerDoc.exists()) {
              set({ 
                user: { ...user, customerData: customerDoc.data() },
                isAuthenticated: true,
                isValidated: true,
                userRole: 'customer',
                isLoading: false,
                error: null
              });
              resolve();
              return;
            }

            // If neither profile exists, sign out
            await firebaseSignOut(auth);
            set({ 
              user: null,
              isAuthenticated: false,
              isValidated: false,
              userRole: null,
              isLoading: false,
              error: 'Account not properly configured'
            });
            resolve();
          } else {
            set({ 
              user: null,
              isAuthenticated: false,
              isValidated: false,
              userRole: null,
              isLoading: false,
              error: null
            });
            resolve();
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ 
            user: null,
            isAuthenticated: false,
            isValidated: false,
            userRole: null,
            isLoading: false,
            error: 'Failed to initialize authentication'
          });
          reject(error);
        }
      });

      // Cleanup subscription on unmount
      return () => unsubscribe();
    });
  },

  login: async (email: string, password: string) => {
    set({ error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // First check if user has an admin profile
      const adminDoc = await getDoc(doc(db, 'admin_profiles', userCredential.user.uid));
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        const isValidated = adminData.validated || false;
        const role = adminData.role || 'staff';

        set({ 
          user: userCredential.user,
          isAuthenticated: true,
          isValidated,
          userRole: role === 'super_admin' ? 'super_admin' : 'staff',
          error: null
        });
        return;
      }

      // If no admin profile, check for customer profile
      const customerDoc = await getDoc(doc(db, 'customers', userCredential.user.uid));
      if (customerDoc.exists()) {
        set({ 
          user: { ...userCredential.user, customerData: customerDoc.data() },
          isAuthenticated: true,
          isValidated: true,
          userRole: 'customer',
          error: null
        });
        return;
      }

      // If neither profile exists, throw error
      throw new Error('No valid profile found');
    } catch (error: any) {
      let errorMessage = 'Invalid email or password';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid password';
      } else if (error.message === 'No valid profile found') {
        errorMessage = 'Account not properly configured';
      }
      set({ error: errorMessage });
      throw error;
    }
  },

  signOut: async () => {
    try {
      await firebaseSignOut(auth);
      set({ 
        user: null, 
        isAuthenticated: false,
        isValidated: false,
        userRole: null,
        error: null
      });
    } catch (error) {
      set({ error: 'Sign out failed' });
      throw error;
    }
  },

  register: async (firstName: string, lastName: string, email: string, password: string) => {
    set({ error: null });
    try {
      // Check if email exists
      const emailExists = await get().checkEmailExists(email);
      if (emailExists) {
        throw new Error('This email is already registered');
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile with name
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`
      });

      // Create customer profile document
      const customerData = {
        firstName,
        lastName,
        fullName: `${firstName} ${lastName}`,
        email,
        type: 'Customer',
        phone: '',
        address: {
          street: '',
          city: '',
          postalCode: '',
          country: ''
        },
        companyDetails: {
          name: '',
          vatNumber: ''
        },
        surfboards: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'customers', userCredential.user.uid), customerData);

      set({ 
        user: { 
          ...userCredential.user,
          customerData
        },
        isAuthenticated: true,
        isValidated: true,
        userRole: 'customer',
        error: null
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed';
      
      if (error.code === 'auth/email-already-in-use' || error.message === 'This email is already registered') {
        errorMessage = 'This email is already registered';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      }

      set({ error: errorMessage });
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    set({ error: null });
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      let errorMessage = 'Password reset failed';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      set({ error: errorMessage });
      throw error;
    }
  },

  updateCustomerProfile: async (updates) => {
    const { user } = get();
    if (!user) throw new Error('No user logged in');

    try {
      const customerRef = doc(db, 'customers', user.uid);
      const updatedData = {
        ...updates,
        fullName: `${updates.firstName} ${updates.lastName}`,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(customerRef, updatedData);

      // Update local state
      set({
        user: {
          ...user,
          customerData: {
            ...user.customerData,
            ...updatedData
          }
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  checkEmailExists: async (email: string) => {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return methods.length > 0;
    } catch (error) {
      console.error('Email check error:', error);
      return false;
    }
  }
}));