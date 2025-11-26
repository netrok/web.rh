// src/api/authApi.ts
import { apiClient } from "./apiClient";
import type { LoginRequest, LoginResponse } from "../types/auth";

export const loginApi = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>("/auth/login", data);
  return response.data;
};
