/**
 * Authentication utility for managing API keys
 */

const API_KEY_STORAGE_KEY = 'vehicle_flow_api_key';

export const saveApiKey = (key: string): void => {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
};

export const getApiKey = (): string | null => {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
};

export const removeApiKey = (): void => {
  localStorage.removeItem(API_KEY_STORAGE_KEY);
};

export const isAuthenticated = (): boolean => {
  return getApiKey() !== null;
};
