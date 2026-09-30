"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/components/auth-provider";
import { mockRows } from "@/lib/mock-data";
import type { SellerRow } from "@/types/seller";

interface SellerDataContextValue {
  rows: SellerRow[];
  ready: boolean;
  setRows: (
    rows: SellerRow[],
  ) => void;
  reset: () => void;
}

const SellerDataContext =
  createContext<
    SellerDataContextValue | null
  >(null);

function storageKey(userId: string) {
  return `lurjing:poc-data:${userId}`;
}

export function SellerDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    user,
    ready: authReady,
  } = useAuth();

  const [rows, setRowsState] =
    useState<SellerRow[]>([]);

  const [
    dataReady,
    setDataReady,
  ] = useState(false);

  useEffect(() => {
    if (!authReady) {
      setDataReady(false);
      return;
    }

    if (!user) {
      setRowsState([]);
      setDataReady(true);
      return;
    }

    // Demo is the only account that receives mock data automatically.
    if (user.isDemo) {
      setRowsState(mockRows);
      setDataReady(true);
      return;
    }

    // Real users start empty and only see their own imported data.
    const saved =
      window.localStorage.getItem(
        storageKey(user.id),
      );

    if (!saved) {
      setRowsState([]);
      setDataReady(true);
      return;
    }

    try {
      setRowsState(
        JSON.parse(saved) as SellerRow[],
      );
    } catch {
      window.localStorage.removeItem(
        storageKey(user.id),
      );
      setRowsState([]);
    } finally {
      setDataReady(true);
    }
  }, [authReady, user]);

  const setRows = (
    nextRows: SellerRow[],
  ) => {
    setRowsState(nextRows);

    if (
      !user ||
      user.isDemo
    ) {
      return;
    }

    window.localStorage.setItem(
      storageKey(user.id),
      JSON.stringify(nextRows),
    );
  };

  const reset = () => {
    if (!user) {
      setRowsState([]);
      return;
    }

    if (user.isDemo) {
      setRowsState(mockRows);
      return;
    }

    setRowsState([]);

    window.localStorage.removeItem(
      storageKey(user.id),
    );
  };

  const value =
    useMemo(
      () => ({
        rows,
        ready: dataReady,
        setRows,
        reset,
      }),
      [rows, dataReady, user],
    );

  return (
    <SellerDataContext.Provider
      value={value}
    >
      {children}
    </SellerDataContext.Provider>
  );
}

export function useSellerData() {
  const context =
    useContext(SellerDataContext);

  if (!context) {
    throw new Error(
      "useSellerData must be used inside SellerDataProvider",
    );
  }

  return context;
}
