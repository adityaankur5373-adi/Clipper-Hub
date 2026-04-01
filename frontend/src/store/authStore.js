import { create } from "zustand";
import api from "../api/axios";

export const useAuthStore = create((set) => ({

  accessToken: null,
  user: null,
   // 🔥 add loading state

  /* ============================= */
  /* SET AUTH */
  /* ============================= */

  setAuth: (data) => {
    set({
      accessToken: data.accessToken,
      user: data.user, // ✅ includes role
    });
  },

  /* ============================= */
  /* RESTORE AUTH (ON REFRESH) */
  /* ============================= */

  restoreAuth: async () => {
    try {
      const res = await api.post("/auth/refresh");

      set({
        accessToken: res.data.accessToken,
        user: res.data.user, // ✅ includes role
       
      });

    } catch (err) {
      set({
        accessToken: null,
        user: null,
      });
    }
  },

  /* ============================= */
  /* LOGOUT */
  /* ============================= */

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {}

    set({
      accessToken: null,
      user: null,
    });
  }

}));
