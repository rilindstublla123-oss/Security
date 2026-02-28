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

const INITIAL_DATA = {
  "07.12.2025": [{ "start": "06:00", "end": "14:00", "location": "Rockwool", "hours": 8.0, "earnings": 156.24, "base_earnings": 124.0, "bonus_earnings": 32.24 }],
  "13.12.2025": [{ "start": "14:00", "end": "23:00", "location": "Rockwool", "hours": 9.0, "earnings": 150.195, "base_earnings": 139.5, "bonus_earnings": 10.695 }],
  "20.12.2025": [{ "start": "06:00", "end": "14:00", "location": "Rockwool", "hours": 8.0, "earnings": 124.0, "base_earnings": 124.0, "bonus_earnings": 0.0 }],
  "29.12.2025": [{ "start": "15:00", "end": "23:00", "location": "Obdachlosenheim", "hours": 8.0, "earnings": 134.695, "base_earnings": 124.0, "bonus_earnings": 10.695 }],
  "31.12.2025": [{ "start": "06:00", "end": "14:00", "location": "Rockwool", "hours": 8.0, "earnings": 124.0, "base_earnings": 124.0, "bonus_earnings": 0.0 }],
  "26.12.2025": [{ "start": "20:30", "end": "03:30", "location": "Kulthotel", "hours": 7.0, "earnings": 241.955, "base_earnings": 108.5, "bonus_earnings": 133.455 }],
  "10.01.2026": [{ "start": "06:00", "end": "14:00", "location": "Rockwool", "hours": 8.0, "earnings": 124.0, "base_earnings": 124.0, "bonus_earnings": 0.0 }],
  "24.01.2026": [{ "start": "14:00", "end": "22:00", "location": "Rockwool", "hours": 8.0, "earnings": 131.13, "base_earnings": 124.0, "bonus_earnings": 7.13 }],
  "30.01.2026": [{ "start": "20:30", "end": "07:00", "location": "Rockwool", "hours": 10.5, "earnings": 196.6175, "base_earnings": 162.75, "bonus_earnings": 33.8675 }]
};

export const loadData = () => {
  try {
    const stored = localStorage.getItem(DATA_KEY);
    if (!stored) {
      // Wenn der Speicher leer ist (z.B. neues Gerät/GitHub), lade die initialen Daten
      saveData(INITIAL_DATA);
      return INITIAL_DATA;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load data:", e);
    return INITIAL_DATA;
  }
};

export const saveData = (data) => {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Failed to save data:", e);
    return false;
  }
};
