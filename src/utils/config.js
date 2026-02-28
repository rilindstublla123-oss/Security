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

export const saveData = (data) => {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error("Failed to save data:", e);
    return false;
  }
};
