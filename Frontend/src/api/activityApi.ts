import api from './axiosConfig';

const BASE_URL = '/activity';

export const fetchAllActivities = async () => {
  const res = await api.get(`${BASE_URL}/all`);
  return res.data.data; // assuming backend returns { data: [...] }
};

export const fetchActivityById = async (id: number) => {
  const res = await api.get(`${BASE_URL}/${id}`);
  return res.data.data; // assuming backend returns { data: {...} }
};
