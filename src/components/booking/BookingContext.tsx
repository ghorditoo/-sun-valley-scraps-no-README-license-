"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { BookingPrefill } from "@/lib/types";

type BookingContextValue = {
  isOpen: boolean;
  prefill: BookingPrefill;
  openBooking: (prefill?: BookingPrefill) => void;
  closeBooking: () => void;
};

const BookingContext = createContext<BookingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefill, setPrefill] = useState<BookingPrefill>({});

  function openBooking(next: BookingPrefill = {}) {
    setPrefill(next);
    setIsOpen(true);
  }

  function closeBooking() {
    setIsOpen(false);
  }

  return (
    <BookingContext.Provider value={{ isOpen, prefill, openBooking, closeBooking }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return ctx;
}
