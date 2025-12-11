/**
 * Authentication utility for managing API keys
 */

const API_KEY_STORAGE_KEY = 'vehicle_flow_api_key';

// Initialize with a default API key if not already set
const DEFAULT_API_KEY = 'default_api_key';

export const initializeApiKey = (): void => {
  if (!localStorage.getItem(API_KEY_STORAGE_KEY)) {
    localStorage.setItem(API_KEY_STORAGE_KEY, DEFAULT_API_KEY);
  }
};

export const saveApiKey = (key: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
};

export const getApiKey = (): string => {
  const key = localStorage.getItem(API_KEY_STORAGE_KEY);
  if (!key) {
    initializeApiKey();
    return DEFAULT_API_KEY;
  }
  return key;
};

export const removeApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
};
