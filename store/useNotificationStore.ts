import { create } from "zustand";
import { NotificationDto } from "@/types/notification.types";
import { NotificationService } from "@/services/notification.service";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { notification } from "antd";
import { API_ENDPOINTS } from "@/configs/api.config";

interface NotificationStore {
  notifications: NotificationDto[];
  unreadCount: number;
  totalElement: number;
  isLoading: boolean;
  sseController: AbortController | null;

  fetchNotifications: (page?: number, size?: number) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  connectSSE: (token: string) => void;
  disconnectSSE: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  totalElement: 0,
  isLoading: false,
  sseController: null,

  fetchNotifications: async (page = 1, size = 10) => {
    try {
      set({ isLoading: true });
      const res = await NotificationService.getNotifications(page, size);
      set({
        notifications: res.items,
        totalElement: res.total,
        isLoading: false,
      });
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
      set({ isLoading: false });
    }
  },

  fetchUnreadCount: async () => {
    try {
      const res = await NotificationService.getUnreadCount();
      set({ unreadCount: res.count });
    } catch (error) {
      console.error("Lỗi tải số lượng thông báo:", error);
    }
  },

  markAsRead: async (id: string) => {
    try {
      await NotificationService.markAsRead(id);
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    }
  },

  markAllAsRead: async () => {
    try {
      await NotificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error("Lỗi đánh dấu tất cả đã đọc:", error);
    }
  },

  connectSSE: (token: string) => {
    const currentState = get();
    if (currentState.sseController) {
      return; // Đã kết nối
    }

    const controller = new AbortController();
    set({ sseController: controller });

    fetchEventSource(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7423/api/v1"}${API_ENDPOINTS.NOTIFICATIONS.STREAM}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "text/event-stream",
      },
      signal: controller.signal,
      onmessage(ev) {
        if (!ev.data) return;
        try {
          const newNotif = JSON.parse(ev.data) as NotificationDto;
          
          // Thêm thông báo mới lên đầu mảng và tăng số lượng
          set((state) => {
            const exists = state.notifications.some((n) => n.id === newNotif.id);
            if (exists) return state; // Tránh trùng lặp

            // Hiện Toast thông báo
            notification.info({
              message: newNotif.title,
              description: newNotif.content,
              placement: "bottomRight",
            });

            return {
              notifications: [newNotif, ...state.notifications],
              unreadCount: state.unreadCount + 1,
              totalElement: state.totalElement + 1,
            };
          });
        } catch (error) {
          console.error("Lỗi parse dữ liệu SSE:", error);
        }
      },
      onerror(err) {
        console.error("Lỗi SSE:", err);
      },
    });
  },

  disconnectSSE: () => {
    const { sseController } = get();
    if (sseController) {
      sseController.abort();
      set({ sseController: null });
    }
  },
}));
