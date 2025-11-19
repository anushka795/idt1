import { AuthResponse } from "@shared/schema";

const AUTH_TOKEN_KEY = "quizconnect_token";
const AUTH_USER_KEY = "quizconnect_user";
const AUTH_PROFILE_KEY = "quizconnect_profile";

export function saveAuth(data: AuthResponse) {
  localStorage.setItem(AUTH_TOKEN_KEY, data.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
  localStorage.setItem(AUTH_PROFILE_KEY, JSON.stringify(data.profile));
}

export function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getUser() {
  const userStr = localStorage.getItem(AUTH_USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
}

export function getProfile() {
  const profileStr = localStorage.getItem(AUTH_PROFILE_KEY);
  return profileStr ? JSON.parse(profileStr) : null;
}

export function clearAuth() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_PROFILE_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
