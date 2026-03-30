import type {
  ApplyReferralRequest,
  ApplyReferralResponse,
  ReferralStats,
} from "../types";
import api from "./api";

export async function getStats(): Promise<ReferralStats> {
  const { data } = await api.get("/referral/stats");
  return data;
}

export async function applyCode(
  payload: ApplyReferralRequest,
): Promise<ApplyReferralResponse> {
  const { data } = await api.post("/referral/apply-code", payload);
  return data;
}
