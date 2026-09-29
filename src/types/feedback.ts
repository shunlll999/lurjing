export type FeedbackModerationStatus = "pending" | "approved" | "rejected";

export interface FeedbackItem {
  id: string;
  userId: string;
  displayName: string;
  storeName: string;
  rating: number;
  message: string;
  allowPublic: boolean;
  moderationStatus: FeedbackModerationStatus;
  featured: boolean;
  createdAt: string;
}
