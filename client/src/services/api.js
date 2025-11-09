import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  register: async (username, email, password) => {
    const response = await api.post('/api/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  login: async (username, password) => {
    const response = await api.post('/api/auth/login', {
      username,
      password,
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.delete('/api/auth/logout');
    return response.data;
  },
};

// Room API
export const roomAPI = {
  getRoomsForUser: async () => {
    const response = await api.get('/api/room/roomsforuser');
    return response.data;
  },

  createRoom: async (language, roomName) => {
    const response = await api.post('/api/room/createRoom', {
      language,
      roomName,
    });
    return response.data;
  },

  joinRoom: async (roomCode) => {
    const response = await api.post(`/api/room/joinRoom/${roomCode}`);
    return response.data;
  },

  leaveRoom: async (roomCode) => {
    const response = await api.patch(`/api/room/leaveRoom/${roomCode}`);
    return response.data;
  },

  getRoomById: async (roomId) => {
    const response = await api.get(`/api/room/inaroom/${roomId}`);
    return response.data;
  },

  executeCode: async (code, language) => {
    const response = await api.post('/api/room/execute', {
      code,
      language,
    });
    return response.data;
  },

  getAIRecommendations: async (code, language) => {
    const response = await api.post('/api/room/ai-recommendations', {
      code,
      language,
    });
    return response.data;
  },
};

export default api;

