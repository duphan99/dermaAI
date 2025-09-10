import type { AnyPatientRecord, PatientRecord, ScarPatientRecord, AcnePatientRecord, RejuvenationPatientRecord, CosmeticCheckRecord, MelasmaPatientRecord } from '../types';

const DB_NAME = 'DermatologyAI_DB';
const DB_VERSION = 6; // Incremented version to trigger upgrade
const STORE_NAME = 'patientRecords';
const SCAR_STORE_NAME = 'scarRecords';
const ACNE_STORE_NAME = 'acneRecords';
const REJUVENATION_STORE_NAME = 'rejuvenationRecords';
const COSMETIC_STORE_NAME = 'cosmeticCheckRecords'; // New store
const MELASMA_STORE_NAME = 'melasmaRecords';

let db: IDBDatabase | null = null;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("Database error:", request.error);
      reject("Error opening database");
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBOpenDBRequest).result;
      if (!dbInstance.objectStoreNames.contains(STORE_NAME)) {
        dbInstance.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(SCAR_STORE_NAME)) {
        dbInstance.createObjectStore(SCAR_STORE_NAME, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(ACNE_STORE_NAME)) {
        dbInstance.createObjectStore(ACNE_STORE_NAME, { keyPath: 'id' });
      }
      if (!dbInstance.objectStoreNames.contains(REJUVENATION_STORE_NAME)) {
        dbInstance.createObjectStore(REJUVENATION_STORE_NAME, { keyPath: 'id' });
      }
      // Create new store for cosmetic checks
      if (!dbInstance.objectStoreNames.contains(COSMETIC_STORE_NAME)) {
        dbInstance.createObjectStore(COSMETIC_STORE_NAME, { keyPath: 'id' });
      }
      // FIX: Add melasma store
      if (!dbInstance.objectStoreNames.contains(MELASMA_STORE_NAME)) {
        dbInstance.createObjectStore(MELASMA_STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const addPatientRecord = async (record: Omit<PatientRecord, 'id' | 'createdAt' | 'recordType'>): Promise<PatientRecord> => {
  const dbInstance = await initDB();
  const transaction = dbInstance.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  const newRecord: PatientRecord = {
    ...record,
    recordType: 'general',
    id: `REC-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const request = store.add(newRecord);
    request.onsuccess = () => resolve(newRecord);
    request.onerror = () => reject("Could not add record to the database.");
  });
};

export const addScarRecord = async (record: Omit<ScarPatientRecord, 'id' | 'createdAt' | 'recordType'>): Promise<ScarPatientRecord> => {
  const dbInstance = await initDB();
  const transaction = dbInstance.transaction(SCAR_STORE_NAME, 'readwrite');
  const store = transaction.objectStore(SCAR_STORE_NAME);
  // FIX: Improved unique ID generation
  const newRecord: ScarPatientRecord = { ...record, recordType: 'scar', id: `SCAR-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, createdAt: new Date().toISOString() };
  return new Promise((resolve, reject) => {
    const request = store.add(newRecord);
    request.onsuccess = () => resolve(newRecord);
    request.onerror = () => reject("Could not add scar record.");
  });
};

export const addAcneRecord = async (record: Omit<AcnePatientRecord, 'id' | 'createdAt' | 'recordType'>): Promise<AcnePatientRecord> => {
  const dbInstance = await initDB();
  const transaction = dbInstance.transaction(ACNE_STORE_NAME, 'readwrite');
  const store = transaction.objectStore(ACNE_STORE_NAME);
  // FIX: Improved unique ID generation
  const newRecord: AcnePatientRecord = { ...record, recordType: 'acne', id: `ACNE-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, createdAt: new Date().toISOString() };
   return new Promise((resolve, reject) => {
    const request = store.add(newRecord);
    request.onsuccess = () => resolve(newRecord);
    request.onerror = () => reject("Could not add acne record.");
  });
};

export const addRejuvenationRecord = async (record: Omit<RejuvenationPatientRecord, 'id' | 'createdAt' | 'recordType'>): Promise<RejuvenationPatientRecord> => {
  const dbInstance = await initDB();
  const transaction = dbInstance.transaction(REJUVENATION_STORE_NAME, 'readwrite');
  const store = transaction.objectStore(REJUVENATION_STORE_NAME);
  // FIX: Improved unique ID generation
  const newRecord: RejuvenationPatientRecord = { ...record, recordType: 'rejuvenation', id: `REJUV-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, createdAt: new Date().toISOString() };
   return new Promise((resolve, reject) => {
    const request = store.add(newRecord);
    request.onsuccess = () => resolve(newRecord);
    request.onerror = () => reject("Could not add rejuvenation record.");
  });
};

export const addCosmeticCheckRecord = async (record: Omit<CosmeticCheckRecord, 'id' | 'createdAt' | 'recordType'>): Promise<CosmeticCheckRecord> => {
  const dbInstance = await initDB();
  const transaction = dbInstance.transaction(COSMETIC_STORE_NAME, 'readwrite');
  const store = transaction.objectStore(COSMETIC_STORE_NAME);
  const newRecord: CosmeticCheckRecord = {
    ...record,
    recordType: 'cosmetic',
    id: `COSMETIC-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  return new Promise((resolve, reject) => {
    const request = store.add(newRecord);
    request.onsuccess = () => resolve(newRecord);
    request.onerror = () => reject("Could not add cosmetic check record.");
  });
};

// FIX: Added function to save melasma records
export const addMelasmaRecord = async (record: Omit<MelasmaPatientRecord, 'id' | 'createdAt' | 'recordType'>): Promise<MelasmaPatientRecord> => {
  const dbInstance = await initDB();
  const transaction = dbInstance.transaction(MELASMA_STORE_NAME, 'readwrite');
  const store = transaction.objectStore(MELASMA_STORE_NAME);
  const newRecord: MelasmaPatientRecord = { ...record, recordType: 'melasma', id: `MELASMA-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, createdAt: new Date().toISOString() };
   return new Promise((resolve, reject) => {
    const request = store.add(newRecord);
    request.onsuccess = () => resolve(newRecord);
    request.onerror = () => reject("Could not add melasma record.");
  });
};

export const getPatientHistory = async (): Promise<AnyPatientRecord[]> => {
  const dbInstance = await initDB();
  const storeNames = [
      STORE_NAME,
      SCAR_STORE_NAME,
      ACNE_STORE_NAME,
      REJUVENATION_STORE_NAME,
      COSMETIC_STORE_NAME,
      // FIX: Include melasma store in history fetch
      MELASMA_STORE_NAME,
  ];
  const transaction = dbInstance.transaction(storeNames, 'readonly');
  
  const promises = storeNames.map(storeName => {
    if (dbInstance.objectStoreNames.contains(storeName)) {
      const store = transaction.objectStore(storeName);
      return new Promise<AnyPatientRecord[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return Promise.resolve([]);
  });

  const results = await Promise.all(promises);
  const allRecords = results.flat();

  // Sort all records by creation date, descending
  allRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return allRecords;
};