"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as updateFirebaseProfile,
  type User as FirebaseUser,
} from "firebase/auth";

import { DEMO_EMAIL, DEMO_PASSWORD, upsertAccount } from "@/lib/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import {
  createUserProfile,
  ensureUserProfile,
  getUserProfile,
  touchUserLogin,
  updateOwnUserProfile,
} from "@/lib/user-profile";
import type { UserProfile } from "@/types/auth";
import { trackImportantEvent } from "@/lib/product-analytics";

interface RegisterInput {
  displayName: string;
  storeName: string;
  email: string;
  password: string;
  termsAcceptedAt?: string;
}

type LoginDestination = "/dashboard" | "/admin";

interface AuthResult {
  ok: boolean;
  message?: string;
  destination?: LoginDestination;
}

interface ProfileUpdateResult {
  ok: boolean;
  message?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  ready: boolean;

  login: (email: string, password: string) => Promise<AuthResult>;

  loginDemo: () => Promise<AuthResult>;

  register: (input: RegisterInput) => Promise<AuthResult>;

  logout: () => Promise<void>;

  refreshSessionProfile: () => Promise<boolean>;

  updateProfile: (
    updates: Partial<Pick<UserProfile, "displayName" | "storeName" | "phone" | "storeAvatarUrl" | "storeAvatarPath">>,
  ) => Promise<ProfileUpdateResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getFirebaseMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    if (error instanceof Error && error.message.includes("Firebase config")) {
      return "ยังไม่ได้ตั้งค่า Firebase ในไฟล์ .env";
    }

    return "เกิดข้อผิดพลาดในการเชื่อมต่อ Firebase";
  }

  switch (error.code) {
    case "auth/email-already-in-use":
      return "อีเมลนี้ถูกใช้งานแล้ว";

    case "auth/invalid-email":
      return "รูปแบบอีเมลไม่ถูกต้อง";

    case "auth/weak-password":
      return "รหัสผ่านยังไม่ปลอดภัยพอ กรุณาใช้รหัสผ่านอย่างน้อย 6 ตัวอักษร";

    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "อีเมลหรือรหัสผ่านไม่ถูกต้อง";

    case "auth/user-disabled":
      return "บัญชี Firebase นี้ถูกปิดใช้งาน";

    case "auth/too-many-requests":
      return "มีการลองเข้าสู่ระบบหลายครั้งเกินไป กรุณาลองใหม่ภายหลัง";

    case "auth/network-request-failed":
      return "เชื่อมต่อ Firebase ไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต";

    case "auth/operation-not-allowed":
      return "กรุณาเปิด Email/Password provider ใน Firebase Authentication";

    case "permission-denied":
      return "Firestore Rules ไม่อนุญาตให้ทำรายการนี้";

    case "unavailable":
      return "Firestore ยังเชื่อมต่อไม่ได้ กรุณาลองใหม่อีกครั้ง";

    default:
      return error.message || "Firebase ไม่สามารถทำรายการนี้ได้";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  const [ready, setReady] = useState(false);

  // Avoid duplicate Firestore reads during initial mount or rapid navigation.
  // Normal users are checked again on route changes, at most once every 15 sec.
  const lastStatusCheckRef = useRef(0);

  useEffect(() => {
    console.info(
      "[LurJing Auth] Firestore Lite Performance Mode v1.7.1 loaded",
    );

    let unsubscribe = () => {};

    try {
      const auth = getFirebaseAuth();

      unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          if (!firebaseUser) {
            setUser(null);
            setReady(true);
            lastStatusCheckRef.current = 0;
            return;
          }

          try {
            // One-time Firestore Lite read. No realtime listener is created.
            const profile = await ensureUserProfile(firebaseUser);

            if (profile.status !== "active") {
              await firebaseSignOut(auth);

              setUser(null);
              setReady(true);
              lastStatusCheckRef.current = 0;
              return;
            }

            setUser(profile);
            lastStatusCheckRef.current = Date.now();

            if (profile.role !== "admin") {
              upsertAccount({
                ...profile,
              });
            }
          } catch (error) {
            console.error("[Auth] Firestore profile load failed", error);

            setUser(null);
          } finally {
            setReady(true);
          }
        },
        (error) => {
          console.error("[Auth] observer error", error);

          setUser(null);
          setReady(true);
        },
      );
    } catch (error) {
      console.error("[Auth] Firebase initialization failed", error);

      setUser(null);
      setReady(true);
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const login: AuthContextValue["login"] = async (email, password) => {
    try {
      const auth = getFirebaseAuth();

      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      const profile = await ensureUserProfile(credential.user);

      if (profile.status !== "active") {
        await firebaseSignOut(auth);

        return {
          ok: false,
          message: "บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ",
        };
      }

      await touchUserLogin(credential.user);

      const nextProfile = {
        ...profile,
        lastLoginAt: new Date().toISOString(),
      };

      setUser(nextProfile);
      lastStatusCheckRef.current = Date.now();

      if (nextProfile.role !== "admin") {
        upsertAccount({
          ...nextProfile,
        });
      }

      void trackImportantEvent("user_login", nextProfile, {
        provider: "password",
      });

      return {
        ok: true,
        destination: nextProfile.role === "admin" ? "/admin" : "/dashboard",
      };
    } catch (error) {
      console.error("[Auth] login failed", error);

      return {
        ok: false,
        message: getFirebaseMessage(error),
      };
    }
  };

  const loginDemo: AuthContextValue["loginDemo"] = async () => {
    return login(DEMO_EMAIL, DEMO_PASSWORD);
  };

  const register: AuthContextValue["register"] = async (input) => {
    const auth = getFirebaseAuth();

    let createdUser: FirebaseUser | null = null;

    try {
      const email = input.email.trim().toLowerCase();

      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        input.password,
      );

      createdUser = credential.user;

      await updateFirebaseProfile(credential.user, {
        displayName: input.displayName.trim(),
      });

      const profile = await createUserProfile(credential.user, {
        displayName: input.displayName,
        storeName: input.storeName,
        phone: "",
        termsAcceptedAt: input.termsAcceptedAt ?? new Date().toISOString(),
      });

      setUser(profile);
      lastStatusCheckRef.current = Date.now();

      upsertAccount({
        ...profile,
      });

      void trackImportantEvent("user_registered", profile, {
        provider: "password",
      });

      return {
        ok: true,
        destination: "/dashboard",
      };
    } catch (error) {
      console.error("[Auth] register failed", error);

      // Avoid an Authentication user without its Firestore profile.
      if (createdUser) {
        try {
          await deleteUser(createdUser);
        } catch (rollbackError) {
          console.error("[Auth] rollback failed", rollbackError);
        }
      }

      return {
        ok: false,
        message: getFirebaseMessage(error),
      };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(getFirebaseAuth());
    } finally {
      setUser(null);
      lastStatusCheckRef.current = 0;
    }
  };

  const refreshSessionProfile = useCallback(async () => {
    const auth = getFirebaseAuth();
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      setUser(null);
      lastStatusCheckRef.current = 0;
      return false;
    }

    // Throttle status checks during rapid navigation.
    if (Date.now() - lastStatusCheckRef.current < 15_000) {
      return true;
    }

    try {
      const profile = await getUserProfile(firebaseUser);

      lastStatusCheckRef.current = Date.now();

      if (profile.status !== "active") {
        await firebaseSignOut(auth);
        setUser(null);
        lastStatusCheckRef.current = 0;
        return false;
      }

      // Status checks are intentionally read-only and do not call setUser()
      // when the account is still active, avoiding unnecessary UI rerenders.
      return true;
    } catch (error) {
      // A temporary Firestore/network error should not force-log-out a valid
      // Firebase Auth session. The next navigation can retry the one-time read.
      console.warn("[Auth] one-time status check failed", error);

      return true;
    }
  }, []);

  const updateProfile: AuthContextValue["updateProfile"] = async (updates) => {
    if (!user) {
      return {
        ok: false,
        message: "ไม่พบข้อมูลผู้ใช้งาน",
      };
    }

    if (user.isDemo) {
      return {
        ok: false,
        message: "Demo Account ไม่อนุญาตให้แก้ไข Profile",
      };
    }

    try {
      const firebaseUser = getFirebaseAuth().currentUser;

      if (!firebaseUser || firebaseUser.uid !== user.id) {
        return {
          ok: false,
          message: "Firebase session ไม่ตรงกับ Profile",
        };
      }

      // Old Firebase Auth users may not have a Firestore profile yet.
      // Ensure users/{uid} exists before updating it.
      await ensureUserProfile(firebaseUser);

      await updateOwnUserProfile(user.id, updates);

      if (updates.displayName !== undefined) {
        await updateFirebaseProfile(firebaseUser, {
          displayName: updates.displayName.trim(),
        });
      }

      const nextUser: UserProfile = {
        ...user,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      setUser(nextUser);

      void trackImportantEvent("profile_updated", nextUser, {
        fields: Object.keys(updates).join(","),
      });

      upsertAccount({
        ...nextUser,
      });

      return {
        ok: true,
      };
    } catch (error) {
      console.error("[Auth] profile update failed", error);

      return {
        ok: false,
        message: getFirebaseMessage(error),
      };
    }
  };

  const value: AuthContextValue = useMemo(
    () => ({
      user,
      ready,
      login,
      loginDemo,
      register,
      logout,
      refreshSessionProfile,
      updateProfile,
    }),
    [user, ready, refreshSessionProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
