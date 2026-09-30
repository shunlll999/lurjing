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

  emailVerified?: boolean;
  providerId?: string;

  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  termsAcceptedAt?: string;

  isDemo?: boolean;
}

/**
 * Local mirror used only by the existing POC Admin UI.
 * Passwords are never stored here.
 */
export interface StoredAccount extends UserProfile {
  passwordHash?: never;
}
