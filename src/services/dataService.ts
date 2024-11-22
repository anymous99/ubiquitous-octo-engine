import { mockData } from '../data/mockData';

const STORAGE_KEY = 'campus_life_data';

export const loadData = async () => {
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      // Initialize with mock data if no data exists
      await saveData(mockData);
      return mockData;
    }
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Error loading data:', error);
    return mockData;
  }
};

export const saveData = async (data: any) => {
  try {
    // Ensure all required data structures exist
    const updatedData = {
      users: data.users || [],
      clubs: data.clubs || [],
      events: data.events || [],
      clubMemberships: data.clubMemberships || [],
      joinRequests: data.joinRequests || [],
      customRoles: data.customRoles || [],
      pins: data.pins || {}
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    return updatedData;
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
};

export const clearData = () => {
  localStorage.removeItem(STORAGE_KEY);
};