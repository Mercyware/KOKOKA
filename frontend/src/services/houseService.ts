import api from './api';
import { House } from '../types';

/**
 * Get all houses
 */
export const getHouses = async () => {
  try {
    const response = await api.get('/houses');
    return response.data?.data || [];
  } catch (error) {
    console.error('Error fetching houses:', error);
    return [];
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
