"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { mockRows } from "@/lib/mock-data";
import type { SellerRow } from "@/types/seller";

interface SellerDataContextValue {
  rows: SellerRow[];
  setRows: (rows: SellerRow[]) => void;
  reset: () => void;
}

const SellerDataContext = createContext<SellerDataContextValue | null>(null);
const storageKey = "lurjing:poc-data";

export function SellerDataProvider({ children }: { children: React.ReactNode }) {
  const [rows, setRowsState] = useState<SellerRow[]>(mockRows);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;

    try {
      setRowsState(JSON.parse(saved) as SellerRow[]);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  const setRows = (nextRows: SellerRow[]) => {
    setRowsState(nextRows);
    window.localStorage.setItem(storageKey, JSON.stringify(nextRows));
  };

  const reset = () => {
    setRowsState(mockRows);
    window.localStorage.removeItem(storageKey);
  };

  const value = useMemo(() => ({ rows, setRows, reset }), [rows]);

  return (
    <SellerDataContext.Provider value={value}>
      {children}
    </SellerDataContext.Provider>
  );
}

export function useSellerData() {
  const context = useContext(SellerDataContext);
  if (!context) throw new Error("useSellerData must be used inside SellerDataProvider");
  return context;
}
