export type ImportantEventName =
  | "user_registered"
  | "user_login"
  | "profile_updated"
  | "csv_imported"
  | "feedback_submitted";

export interface TrackingSettings {
  enabled: boolean;
  ga4Enabled: boolean;
  firestoreEnabled: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface AnalyticsEventItem {
  id: string;
  eventName: ImportantEventName | string;
  userId: string;
  displayName: string;
  storeName: string;
  role: string;
  isDemo: boolean;
  pagePath: string;
  metadata: Record<string, string | number | boolean | null>;
  createdAt: string;
}
