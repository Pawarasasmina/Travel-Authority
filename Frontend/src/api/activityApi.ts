import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api/v1/activity';

export const fetchAllActivities = async () => {
  const res = await axios.get(`${BASE_URL}/all`);
  return res.data.data; // assuming backend returns { data: [...] }
};

export const fetchActivityById = async (id: number) => {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data.data; // assuming backend returns { data: {...} }
};
