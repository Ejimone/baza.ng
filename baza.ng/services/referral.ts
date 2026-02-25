import api from "./api";
import type { ReferralStats } from "../types";

export async function getStats(): Promise<ReferralStats> {
  const { data } = await api.get("/referral/stats");
  return data;
}
