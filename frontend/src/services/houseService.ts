import api from './api';
import { House } from '../types';

/**
 * Get all houses
 */
export const getHouses = async () => {
  try {
    const response = await api.get('/houses');
    console.log('Raw houses response:', response);
    
    // Check if response.data exists and has a data property
    if (response.data && response.data.data) {
      console.log('Houses data from API:', response.data.data);
      return response.data;
    } else if (Array.isArray(response.data)) {
      console.log('Houses array from API:', response.data);
      return { data: response.data };
    } else {
      console.log('No houses data found in response:', response);
      return { data: [] };
    }
  } catch (error) {
    console.error('Error fetching houses:', error);
    return { data: [] };
  }
};

/**
 * Get a house by ID
 */
export const getHouse = async (id: string) => {
  const response = await api.get(`/houses/${id}`);
  return response.data.data;
};

/**
 * Create a new house
 */
export const createHouse = async (houseData: Partial<House>) => {
  const response = await api.post('/houses', houseData);
  return response.data;
};

/**
 * Update a house
 */
export const updateHouse = async (id: string, houseData: Partial<House>) => {
  const response = await api.put(`/houses/${id}`, houseData);
  return response.data;
};

/**
 * Delete a house
 */
export const deleteHouse = async (id: string) => {
  const response = await api.delete(`/houses/${id}`);
  return response.data;
};

export default {
  getHouses,
  getHouse,
  createHouse,
  updateHouse,
  deleteHouse
};
