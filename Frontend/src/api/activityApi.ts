import api from './axiosConfig';
import { Activity } from '../types';

const BASE_URL = '/activity';

export const fetchAllActivities = async () => {
  const res = await api.get(`${BASE_URL}/all`);
  return res.data.data; // assuming backend returns { data: [...] }
};

export const fetchActivityById = async (id: number) => {
  const res = await api.get(`${BASE_URL}/${id}`);
  return res.data.data; // assuming backend returns { data: {...} }
};

export const createActivity = async (activityData: Activity) => {
  const res = await api.post(`${BASE_URL}/save`, activityData);
  return res.data;
};

export const updateActivity = async (id: number, activityData: Activity) => {
  const res = await api.put(`${BASE_URL}/update/${id}`, activityData);
  return res.data;
};

export const deleteActivity = async (id: number) => {
  const res = await api.delete(`${BASE_URL}/delete/${id}`);
  return res.data;
};
