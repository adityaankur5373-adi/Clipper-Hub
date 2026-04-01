import api from "./axios";

export const authApi = {
  signup: async (data) => {
    const response = await api.post("/auth/signup", data);
    return response.data;
  },

  login: async (data) => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },
  refresh: async () => {
    const response = await api.post("/auth/refresh");
    return response.data;
  },
  google: async (data) => {
    const res = await api.post("/auth/google", data);
    return res.data;
  },
};