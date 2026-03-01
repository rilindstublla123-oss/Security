import { db, doc, setDoc, onSnapshot } from './firebase';

export const DEFAULT_CONFIG = {
  hourly_rate: 15.04,
  holiday_bonus: 2.0,
  sunday_bonus: 1.26,
  night_bonus: 1.23,
  night_start: 20,
  night_end: 6,
  auto_backup: true,
  backup_interval: 7,
  holidays: [] // Array of date strings "dd.MM.yyyy"
};

const CONFIG_KEY = 'work_hours_config';
const DATA_KEY = 'work_hours_data';
const USER_DOC_ID = 'rilind_main_data'; // Hardcoded user ID since this is a personal app

export const loadConfig = () => {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (!stored) return { ...DEFAULT_CONFIG };

    const parsed = JSON.parse(stored);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch (e) {
    console.error("Failed to load config:", e);
    return { ...DEFAULT_CONFIG };
  }
};

export const saveConfig = (config) => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error("Failed to save config:", e);
    return false;
  }
};

export const loadData = () => {
  try {
    const stored = localStorage.getItem(DATA_KEY);
    if (!stored) return {};
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load data:", e);
    return {};
  }
};

let isPushedFromRemote = false;

// Async function called from App.jsx to listen to cloud changes
export const startFirebaseSync = (onDataChanged) => {
  const docRef = doc(db, "users", USER_DOC_ID);

  // Real-time listener for cloud changes
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const remoteData = docSnap.data().entries || {};
      const currentLocal = localStorage.getItem(DATA_KEY);

      // Prevent infinite loops if we just pushed this ourselves
      const remoteString = JSON.stringify(remoteData);
      if (currentLocal !== remoteString) {
        console.log("Firebase sync: New data received from cloud!");
        isPushedFromRemote = true; // flag to prevent immediate re-upload
        localStorage.setItem(DATA_KEY, remoteString);
        onDataChanged(); // Tell React to re-render
      }
    }
  }, (error) => {
    console.error("Firebase sync error:", error);
  });
};

export const saveData = (data) => {
  try {
    // 1. Save locally (instant UI response)
    const jsonString = JSON.stringify(data);
    localStorage.setItem(DATA_KEY, jsonString);

    // 2. Push to Firebase in background (if not triggered by a remote sync)
    if (!isPushedFromRemote) {
      const docRef = doc(db, "users", USER_DOC_ID);
      setDoc(docRef, {
        entries: data,
        lastUpdated: new Date().toISOString()
      }, { merge: true }).catch(err => {
        console.error("Firebase backup failed (will retry on next change):", err);
      });
    }

    // Reset flag after saving
    isPushedFromRemote = false;

    return true;
  } catch (e) {
    console.error("Failed to save data:", e);
    return false;
  }
};
