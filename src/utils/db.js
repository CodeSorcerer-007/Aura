// --- IndexedDB Helper for Storage ---
const dbName = 'AuraDB';
const attachmentStoreName = 'attachments';
const prefStoreName = 'preferences';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 2);
    request.onerror = () => reject("Error opening IndexedDB");
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(attachmentStoreName)) {
        db.createObjectStore(attachmentStoreName);
      }
      if (!db.objectStoreNames.contains(prefStoreName)) {
        db.createObjectStore(prefStoreName);
      }
    };
  });
};

export const setFile = async (key, value) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(attachmentStoreName, 'readwrite');
    const store = transaction.objectStore(attachmentStoreName);
    const request = store.put(value, key);
    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getFile = async (key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(attachmentStoreName, 'readonly');
    const store = transaction.objectStore(attachmentStoreName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deleteFile = async (key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(attachmentStoreName, 'readwrite');
    const store = transaction.objectStore(attachmentStoreName);
    const request = store.delete(key);
    transaction.oncomplete = () => resolve(request.result);
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getDBItem = async (key) => {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(prefStoreName, 'readonly');
      const store = transaction.objectStore(prefStoreName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result !== undefined ? request.result : null);
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
};

export const setDBItem = async (key, value) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(prefStoreName, 'readwrite');
      const store = transaction.objectStore(prefStoreName);
      const request = store.put(value, key);
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (e) {
    console.error("IndexedDB write failed:", e);
  }
};
