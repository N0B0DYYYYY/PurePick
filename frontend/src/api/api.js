import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// this part is for when your login expires
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          // okay this is the fix right here
          // we use the main url to get a new token so we dont get that double /api/ bug
          const { data } = await axios.post(`${API_URL}/api/token/refresh/`, {
            refresh: refreshToken,
          });

          localStorage.setItem('access_token', data.access);
          originalRequest.headers.Authorization = `Bearer ${data.access}`;
          return api(originalRequest);

        } catch (refreshError) {
          console.error("session expired pls log in again");
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login'; 
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);







export default api;