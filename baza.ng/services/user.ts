import api from "./api";
import type { User, Address, NotificationPreferences } from "../types";

export async function updateProfile(payload: {
  name?: string;
  email?: string;
}): Promise<User> {
  const { data } = await api.put("/user/profile", payload);
  return data;
}

export async function updateNotifications(
  prefs: NotificationPreferences,
): Promise<{ notifications: NotificationPreferences }> {
  const { data } = await api.put("/user/notifications", prefs);
  return data;
}

export async function getAddresses(): Promise<{ addresses: Address[] }> {
  const { data } = await api.get("/user/addresses/");
  return data;
}

export async function createAddress(payload: {
  label: string;
  address: string;
  landmark?: string;
}): Promise<Address> {
  const { data } = await api.post("/user/addresses/create", payload);
  return data;
}

export async function updateAddress(
  id: string,
  payload: { label?: string; address?: string; landmark?: string },
): Promise<Address> {
  const { data } = await api.put(`/user/addresses/${id}`, payload);
  return data;
}

export async function setDefaultAddress(
  id: string,
): Promise<{ message: string }> {
  const { data } = await api.patch(`/user/addresses/${id}/default`);
  return data;
}

export async function deleteAddress(
  id: string,
): Promise<{ message: string }> {
  const { data } = await api.delete(`/user/addresses/${id}/delete`);
  return data;
}
