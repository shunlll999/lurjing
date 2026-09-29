export type UserRole = "user" | "admin";
export type UserStatus = "active" | "disabled";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  storeName: string;
  phone?: string;
  plan: "Demo" | "Free" | "Admin";
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  isDemo?: boolean;
}

export interface StoredAccount extends UserProfile {
  passwordHash: string;
}
