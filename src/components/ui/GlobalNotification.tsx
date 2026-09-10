"use client";

import { useEffect } from "react";
import { useNotificationStore } from "@/stores/useNotificationStore";

export default function GlobalNotification() {
  const {
    open,
    message,
    type,
    hideNotification,
  } = useNotificationStore();

  useEffect(() => {
    if (!open) {
      return;
    }

    const timeout = setTimeout(() => {
      hideNotification();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [open, hideNotification]);

  if (!open) {
    return null;
  }

  const styles = {
    success: "border-green-200 bg-green-50 text-green-700",
    error: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  };

  return (
    <div className="fixed right-6 top-6 z-[100]">
      <div
        className={`min-w-80 rounded-xl border px-5 py-4 shadow-lg ${styles[type]}`}
      >
        <div className="flex items-start justify-between gap-5">
          <p className="text-sm font-medium">
            {message}
          </p>

          <button
            type="button"
            onClick={hideNotification}
            className="text-lg leading-none"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}