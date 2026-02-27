/**
 * Termii OTP Service
 *
 * Handles sending and verifying OTP codes via the Termii API.
 * Docs: https://developers.termii.com/token
 *
 * NOTE: For production, move Termii API calls to your backend server
 * to avoid exposing the API key in the client bundle.
 */

import axios from "axios";

const TERMII_API_KEY = process.env.EXPO_PUBLIC_TERMII_API_KEY ?? "";
const TERMII_BASE_URL =
  process.env.EXPO_PUBLIC_TERMII_BASE_URL ?? "https://v3.api.termii.com";

const termiiClient = axios.create({
  baseURL: TERMII_BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SendOtpResponse {
  smsStatus: string;
  phone_number: string;
  to: string;
  pinId: string;
  pin_id: string;
  message_id_str: string;
  status: string;
}

export interface VerifyOtpResponse {
  pinId: string;
  verified: string; // "True" | "False"
  msisdn: string;
}

// ─── Send OTP ────────────────────────────────────────────────────────────────

/**
 * Send a 6-digit numeric OTP to the given phone number via SMS.
 * Returns the pin_id needed to verify the OTP later.
 */
export async function sendOtp(phone: string): Promise<SendOtpResponse> {
  const payload = {
    api_key: TERMII_API_KEY,
    message_type: "NUMERIC",
    to: normalizePhone(phone),
    from: "N-Alert",
    channel: "dnd",
    pin_attempts: 3,
    pin_time_to_live: 5, // 5 minutes
    pin_length: 6,
    pin_placeholder: "< 123456 >",
    message_text:
      "Your Baza verification code is < 123456 >. Valid for 5 minutes. Do not share this code.",
    pin_type: "NUMERIC",
  };

  const { data } = await termiiClient.post<SendOtpResponse>(
    "/api/sms/otp/send",
    payload,
  );

  return data;
}

// ─── Verify OTP ──────────────────────────────────────────────────────────────

/**
 * Verify a previously sent OTP using the pin_id and the user-entered PIN.
 * Returns verified status.
 */
export async function verifyOtp(
  pinId: string,
  pin: string,
): Promise<VerifyOtpResponse> {
  const payload = {
    api_key: TERMII_API_KEY,
    pin_id: pinId,
    pin,
  };

  const { data } = await termiiClient.post<VerifyOtpResponse>(
    "/api/sms/otp/verify",
    payload,
  );

  return data;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Normalize a phone number to international format (e.g. 2347065250817).
 * Handles common Nigerian formats:
 *   +234... → 234...
 *   0803... → 234803...
 *   234...  → 234... (already correct)
 */
function normalizePhone(phone: string): string {
  // Strip spaces, dashes, parentheses
  let cleaned = phone.replace(/[\s\-()]/g, "");

  // Remove leading +
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }

  // Convert local Nigerian format (0xxx) to international (234xxx)
  if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = "234" + cleaned.slice(1);
  }

  return cleaned;
}
