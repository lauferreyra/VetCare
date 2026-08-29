import { create } from "zustand";

type NotificationType =
  | "success"
  | "error"
  | "info";

type NotificationState = {
  open: boolean;
  message: string;
  type: NotificationType;

  showNotification: (
    message: string,
    type?: NotificationType,
  ) => void;

  hideNotification: () => void;
};

export const useNotificationStore =
  create<NotificationState>((set) => ({
    open: false,
    message: "",
    type: "success",

    showNotification: (
      message,
      type = "success",
    ) =>
      set({
        open: true,
        message,
        type,
      }),

    hideNotification: () =>
      set({
        open: false,
      }),
  }));