import axios from 'axios';

export const api = axios.create({
  timeout: 3000,
  responseType: 'json',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(async (response) => {
  return Promise.resolve(response.data);
});

export default api
