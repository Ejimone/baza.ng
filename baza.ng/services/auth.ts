import api from "./api";
import type { AuthResponse, RefreshResponse } from "../types";

export interface OtpRequestPayload {
  phone: string;
}

export interface OtpVerifyPayload {
  phone: string;
  otp: string;
  name?: string;
  referralCode?: string;
}

export async function requestOtp(
  phone: string,
): Promise<{ message: string; expiresIn: number }> {
  const { data } = await api.post("/auth/otp-request", { phone });
  return data;
}

export async function verifyOtp(
  payload: OtpVerifyPayload,
): Promise<AuthResponse> {
  const { data } = await api.post("/auth/otp-verify", payload);
  return data;
}

export async function refreshToken(): Promise<RefreshResponse> {
  const { data } = await api.post("/auth/refresh", {}, { withCredentials: true });
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
