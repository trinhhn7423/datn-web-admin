import { create } from "zustand";
import { NotificationDto } from "@/types/notification.types";
import { NotificationService } from "@/services/notification.service";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import { notification } from "antd";
import { API_ENDPOINTS } from "@/configs/api.config";

let globalAudioContext: AudioContext | null = null;

const playNotificationSound = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!globalAudioContext) {
      globalAudioContext = new AudioContextClass();
    }

    // Nếu trình duyệt đang tạm dừng (do chính sách Autoplay), thử kích hoạt lại
    if (globalAudioContext.state === "suspended") {
      globalAudioContext.resume();
    }

    const ctx = globalAudioContext;

    // Lần kêu "ting" thứ nhất (Nốt A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.08, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.25);

    // Lần kêu "ting" thứ hai (Nốt C6) trễ 120ms
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.4);
  } catch (error) {
    console.error("Lỗi phát âm thanh thông báo:", error);
  }
};

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
  unlockAudio: () => void;
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
      set((state) => {
        if (page === 1) {
          return {
            notifications: res.items,
            totalElement: res.total,
            isLoading: false,
          };
        } else {
          const existingIds = new Set(state.notifications.map((n) => n.id));
          const newItems = res.items.filter((item) => !existingIds.has(item.id));
          return {
            notifications: [...state.notifications, ...newItems],
            totalElement: res.total,
            isLoading: false,
          };
        }
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
          n.id === id ? { ...n, isRead: true } : n,
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

    fetchEventSource(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:7423/api/v1"}${API_ENDPOINTS.NOTIFICATIONS.STREAM}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "text/event-stream",
        },
        signal: controller.signal,
        onmessage(ev) {
          if (!ev.data || ev.event === "ping" || ev.data === "heartbeat")
            return;
          try {
            const sseEvent = JSON.parse(ev.data);
            if (!sseEvent.data) return;

            const eventData = sseEvent.data;
            const newNotif: NotificationDto = {
              id: eventData.notificationId,
              title: eventData.title,
              content: eventData.content,
              type:
                sseEvent.type === "order.created"
                  ? "ORDER_CREATED"
                  : sseEvent.type === "low_stock.warning"
                    ? "LOW_STOCK_WARNING"
                    : sseEvent.type,
              referenceId:
                eventData.orderId || eventData.productDetailId || null,
              isRead: false,
              createdAt: eventData.createdAt,
            };
            // Thêm thông báo mới lên đầu mảng và tăng số lượng
            set((state) => {
              const exists = state.notifications.some(
                (n) => n.id === newNotif.id,
              );
              if (exists) return state; // Tránh trùng lặp

              // Hiện Toast thông báo
              notification.info({
                title: newNotif.title,
                description: newNotif.content,
                placement: "bottomRight",
              });

              playNotificationSound();

              const updatedUnreadCount =
                typeof eventData.unreadCount === "number"
                  ? eventData.unreadCount
                  : state.unreadCount + 1;

              return {
                notifications: [newNotif, ...state.notifications],
                unreadCount: updatedUnreadCount,
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
      },
    );
  },

  disconnectSSE: () => {
    const { sseController } = get();
    if (sseController) {
      sseController.abort();
      set({ sseController: null });
    }
  },

  unlockAudio: () => {
    if (typeof window === "undefined") return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!globalAudioContext) {
        globalAudioContext = new AudioContextClass();
      }

      if (globalAudioContext.state === "suspended") {
        globalAudioContext.resume();
      }
      console.log("AudioContext unlocked successfully!");
    } catch (error) {
      console.error("Lỗi unlock AudioContext:", error);
    }
  },
}));
