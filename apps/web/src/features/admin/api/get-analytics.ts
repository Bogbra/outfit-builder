import { adminFetchJson } from "./admin-fetch";

export interface AdminAnalytics {
  totalProducts: number;
  totalSavedOutfits: number;
  mostUsedCategory: string | null;
  averageOutfitPrice: number | null;
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  return adminFetchJson<AdminAnalytics>("/api/admin/analytics");
}
