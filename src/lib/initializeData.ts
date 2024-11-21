import { auth, db } from './firebase';
import { collection, doc, setDoc, getDocs, writeBatch } from 'firebase/firestore';

const initialRepairTypes = [
  {
    name: 'Small Ding',
    category: 'dings',
    pricePolyester: 45,
    priceEpoxy: 55,
    color: '#E3F2FD'
  },
  {
    name: 'Medium Ding',
    category: 'dings',
    pricePolyester: 65,
    priceEpoxy: 75,
    color: '#90CAF9'
  },
  {
    name: 'Large Ding',
    category: 'dings',
    pricePolyester: 85,
    priceEpoxy: 95,
    color: '#2196F3'
  },
  {
    name: 'Fin Box Repair',
    category: 'fins',
    pricePolyester: 95,
    priceEpoxy: 105,
    color: '#4CAF50'
  },
  {
    name: 'Full Paint Job',
    category: 'options',
    pricePolyester: 150,
    priceEpoxy: 180,
    color: '#9C27B0'
  }
];

export async function initializeFirebase() {
  try {
    // Initialize repair types using batch write
    const repairTypesRef = collection(db, 'repairTypes');
    const repairTypesSnapshot = await getDocs(repairTypesRef);

    if (repairTypesSnapshot.empty) {
      console.log('Initializing repair types...');
      const batch = writeBatch(db);

      initialRepairTypes.forEach((repairType) => {
        const docRef = doc(repairTypesRef);
        batch.set(docRef, {
          ...repairType,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });

      await batch.commit();
      console.log('Repair types initialized');
    }

    // Initialize collections
    const collections = ['customers', 'repairs'];
    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      if (snapshot.empty) {
        console.log(`Initializing ${collectionName} collection...`);
        await setDoc(doc(collectionRef, '_initialized'), {
          createdAt: new Date().toISOString()
        });
      }
    }

    console.log('Firebase initialization completed successfully');
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
}