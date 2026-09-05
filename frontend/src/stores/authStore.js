import { create } from "zustand";
import {
  registerRequest,
  loginRequest,
  logoutRequest,
  getCurrentUserRequest,
  googleAuthRequest,
  getErrorMessage,
} from "../services/authService.js";

/**
 * Authentication state. The JWT itself lives only in an httpOnly cookie —
 * this store never sees or persists it, only the non-sensitive user object
 * the backend returns. Nothing here is written to localStorage.
 */
export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  error: null,

  /** Checks for an existing session on app start. Always resolves. */
  initialize: async () => {
    try {
      const { data } = await getCurrentUserRequest();
      set({ user: data.user, isAuthenticated: true });
    } catch {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isInitialized: true });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await loginRequest(credentials);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return { success: true, user: data.user };
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const { message } = await registerRequest(payload);
      set({ isLoading: false });
      return { success: true, message };
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  loginWithGoogle: async (idToken) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await googleAuthRequest(idToken);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return { success: true, user: data.user };
    } catch (error) {
      const message = getErrorMessage(error);
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  logout: async () => {
    try {
      await logoutRequest();
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));
