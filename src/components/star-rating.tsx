"use client";

import { useState } from "react";

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className={`star-rating ${size}`} aria-label={`${value} จาก 5 ดาว`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const selected = star <= active;

        if (readonly) {
          return (
            <span
              key={star}
              className={selected ? "star active" : "star"}
              aria-hidden="true"
            >
              ★
            </span>
          );
        }

        return (
          <button
            key={star}
            type="button"
            className={selected ? "star active" : "star"}
            aria-label={`${star} ดาว`}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onFocus={() => setHovered(star)}
            onBlur={() => setHovered(0)}
            onClick={() => onChange?.(star)}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
