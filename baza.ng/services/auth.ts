import type { AuthResponse, RefreshResponse } from "../types";
import api from "./api";

/**
 * Matches backend contract from firebase-auth-react-native.md
 * POST /v1/auth/firebase-verify
 * Request: { idToken: string, name?: string, phone?: string }
 */
export interface FirebaseVerifyPayload {
  idToken: string;
  name?: string;
  phone?: string;
  referralCode?: string;
}

export type OtpIntent = "signup" | "login";
export type OtpChannel = "sms" | "whatsapp";

export interface OtpRequestPayload {
  phone: string;
  intent?: OtpIntent;
  channel?: OtpChannel;
}

export interface OtpVerifyPayload {
  phone: string;
  otp: string;
  intent?: OtpIntent;
  channel?: OtpChannel;
  name?: string;
  referralCode?: string;
}

export interface OtpRequestResponse {
  message: string;
  channel?: OtpChannel;
  expiresIn: number;
}

export async function requestOtp(
  payload: OtpRequestPayload,
): Promise<OtpRequestResponse> {
  const { data } = await api.post("/auth/otp-request", payload);
  return data;
}

export async function verifyOtp(
  payload: OtpVerifyPayload,
): Promise<AuthResponse> {
  const { data } = await api.post("/auth/otp-verify", payload);
  return data;
}

export async function refreshToken(): Promise<RefreshResponse> {
  const { data } = await api.post(
    "/auth/refresh",
    {},
    { withCredentials: true },
  );
  return data;
}

export async function verifyFirebaseToken(
  payload: FirebaseVerifyPayload,
): Promise<AuthResponse> {
  const { data } = await api.post("/auth/firebase-verify", payload, {
    withCredentials: true,
  });
  return data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
