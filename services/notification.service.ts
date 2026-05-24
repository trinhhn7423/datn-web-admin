import axiosClient from "@/utils/axiosClient";
import { NotificationDto } from "@/types/notification.types";
import { PaginatedResult } from "@/utils/errorHandler";

export const NotificationService = {
  getNotifications: async (page = 1, size = 10): Promise<PaginatedResult<NotificationDto>> => {
    return await axiosClient.get("/notifications/admin", {
      params: { page, size },
    });
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    return await axiosClient.get("/notifications/admin/unread-count");
  },

  markAsRead: async (id: string): Promise<void> => {
    await axiosClient.put(`/notifications/admin/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosClient.put("/notifications/admin/read-all");
  },
};
