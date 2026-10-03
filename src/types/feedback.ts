export type FeedbackModerationStatus =
  | "pending"
  | "approved"
  | "rejected";

export interface FeedbackItem {
  id: string;
  userId: string;
  displayName: string;
  storeName: string;
  /** Snapshot of the shop avatar for public testimonials. */
  storeAvatarUrl?: string;
  rating: number;
  message: string;
  allowPublic: boolean;
  moderationStatus: FeedbackModerationStatus;
  featured: boolean;
  createdAt: string;
  updatedAt?: string;
}
