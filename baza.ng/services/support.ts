import api from "./api";
import type { SupportThread, SendMessageResponse } from "../types";

export async function getThread(): Promise<SupportThread> {
  const { data } = await api.get("/support/thread");
  return data;
}

export async function sendMessage(text: string): Promise<SendMessageResponse> {
  const { data } = await api.post("/support/message", { text });
  return data;
}
