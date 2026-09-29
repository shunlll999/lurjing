import type { FeedbackItem } from "@/types/feedback";

export const feedbackStorageKey = "lurjing:feedback";

function normalizeFeedback(item: FeedbackItem): FeedbackItem {
  return {
    ...item,
    moderationStatus: item.moderationStatus ?? "pending",
    featured: item.featured ?? false,
  };
}

export function readFeedback(): FeedbackItem[] {
  if (typeof window === "undefined") return [];
  try {
    const items = JSON.parse(
      window.localStorage.getItem(feedbackStorageKey) ?? "[]",
    ) as FeedbackItem[];
    return items.map(normalizeFeedback);
  } catch {
    return [];
  }
}

export function writeFeedback(items: FeedbackItem[]) {
  window.localStorage.setItem(feedbackStorageKey, JSON.stringify(items));
}

export function addFeedback(item: FeedbackItem) {
  writeFeedback([item, ...readFeedback()]);
}

export function updateFeedback(
  id: string,
  updates: Partial<FeedbackItem>,
) {
  writeFeedback(
    readFeedback().map((item) =>
      item.id === id ? { ...item, ...updates } : item,
    ),
  );
}

export function deleteFeedback(id: string) {
  writeFeedback(readFeedback().filter((item) => item.id !== id));
}

export function getPublicFeedback() {
  return readFeedback()
    .filter(
      (item) =>
        item.allowPublic &&
        item.moderationStatus === "approved",
    )
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
}
