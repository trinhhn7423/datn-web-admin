import React, { useEffect, useState } from "react";
import { Badge, Popover, Button } from "antd";
import { Bell, CheckCheck, Package, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/store/useNotificationStore";
import { useAuthStore } from "@/store/useAuthStore";
import { NotificationDto } from "@/types/notification.types";
import dayjs from "dayjs";

export default function NotificationBell() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const totalElement = useNotificationStore((state) => state.totalElement);
  const isLoading = useNotificationStore((state) => state.isLoading);
  const fetchNotifications = useNotificationStore(
    (state) => state.fetchNotifications,
  );
  const fetchUnreadCount = useNotificationStore(
    (state) => state.fetchUnreadCount,
  );
  const connectSSE = useNotificationStore((state) => state.connectSSE);
  const disconnectSSE = useNotificationStore((state) => state.disconnectSSE);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const unlockAudio = useNotificationStore((state) => state.unlockAudio);

  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 20) {
      if (!isLoading && notifications.length < totalElement) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchNotifications(nextPage, 10);
      }
    }
  };

  useEffect(() => {
    const handleFirstClick = () => {
      unlockAudio();
      document.removeEventListener("click", handleFirstClick);
    };
    document.addEventListener("click", handleFirstClick);
    return () => {
      document.removeEventListener("click", handleFirstClick);
    };
  }, [unlockAudio]);

  useEffect(() => {
    console.log(
      "NotificationBell useEffect run. accessToken:",
      accessToken ? `${accessToken.slice(0, 15)}...` : "null",
    );
    if (accessToken) {
      setPage(1);
      fetchUnreadCount();
      fetchNotifications(1, 10);
      connectSSE(accessToken);
    }
    return () => {
      console.log("NotificationBell useEffect cleanup called");
      disconnectSSE();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  const handleNotificationClick = (item: NotificationDto) => {
    if (!item.isRead) {
      markAsRead(item.id);
    }
    setOpen(false);
    if (item.type === "ORDER_CREATED" && item.referenceId) {
      router.push(`/orders`); // Sẽ xử lý mở order chi tiết sau (ví dụ qua store hoặc params)
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "ORDER_CREATED":
        return (
          <div className="tw:w-10 tw:h-10 tw:rounded-full tw:flex tw:items-center tw:justify-center tw:shrink-0 tw:bg-blue-50 tw:text-blue-600">
            <Package size={18} strokeWidth={2.5} />
          </div>
        );
      case "LOW_STOCK_WARNING":
        return (
          <div className="tw:w-10 tw:h-10 tw:rounded-full tw:flex tw:items-center tw:justify-center tw:shrink-0 tw:bg-amber-50 tw:text-amber-600">
            <AlertTriangle size={18} strokeWidth={2.5} />
          </div>
        );
      default:
        return (
          <div className="tw:w-10 tw:h-10 tw:rounded-full tw:flex tw:items-center tw:justify-center tw:shrink-0 tw:bg-slate-100 tw:text-slate-600">
            <Bell size={18} strokeWidth={2.5} />
          </div>
        );
    }
  };

  const content = (
    <div className="tw:w-[380px] tw:max-h-[500px] tw:flex tw:flex-col tw:overflow-hidden">
      {/* Header tĩnh không bị cuộn */}
      <div className="tw:flex tw:items-center tw:justify-between tw:px-5 tw:py-3.5 tw:bg-white tw:shrink-0 tw:border-b tw:border-slate-100 tw:z-10 tw:shadow-[0_4px_12px_-8px_rgba(0,0,0,0.1)]">
        <span className="tw:font-bold tw:text-slate-800 tw:text-base">
          Thông báo
        </span>
        {unreadCount > 0 && (
          <Button
            type="text"
            size="small"
            icon={<CheckCheck size={14} />}
            onClick={() => markAllAsRead()}
            className="tw:text-xs tw:font-medium tw:text-blue-600 hover:tw:text-blue-700 tw:flex tw:items-center tw:gap-1"
          >
            Đã đọc hết
          </Button>
        )}
      </div>

      {/* Danh sách cuộn */}
      <div 
        className="tw:flex-1 tw:overflow-y-auto tw:bg-slate-50/80 tw:scroll-smooth"
        onScroll={handleScroll}
      >
        {isLoading && page === 1 ? (
          <div className="tw:p-5 tw:text-center tw:text-slate-400 tw:text-xs tw:font-medium">
            Đang tải thông báo...
          </div>
        ) : notifications.length === 0 ? (
          <div className="tw:p-5 tw:text-center tw:text-slate-400 tw:text-xs tw:font-medium">
            Không có thông báo nào
          </div>
        ) : (
          <div className="tw:p-3.5 tw:mt-3 tw:flex tw:flex-col">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`tw:cursor-pointer tw:p-3.5 tw:rounded-[14px] tw:transition-all tw:duration-300 tw:mx-3 tw:mb-3 last:tw:mb-0 tw:border hover:-tw:translate-y-0.5 hover:tw:shadow-[0_8px_24px_-6px_rgba(0,0,0,0.08)] ${
                  !item.isRead
                    ? "tw:bg-white tw:border-blue-100 tw:shadow-[0_2px_12px_-4px_rgba(59,130,246,0.12)]"
                    : "tw:bg-white tw:border-transparent tw:shadow-[0_2px_8px_-4px_rgba(0,0,0,0.04)] hover:tw:border-slate-200"
                }`}
                onClick={() => handleNotificationClick(item)}
              >
                <div className="tw:flex tw:items-start tw:gap-3.5 tw:w-full">
                  {getNotificationIcon(item.type)}

                  <div className="tw:flex tw:flex-col tw:flex-1 tw:gap-1">
                    <div className="tw:flex tw:items-start tw:justify-between tw:gap-2">
                      <span
                        className={`tw:text-sm tw:leading-tight ${
                          !item.isRead
                            ? "tw:font-bold tw:text-slate-900"
                            : "tw:font-semibold tw:text-slate-700"
                        }`}
                      >
                        {item.title}
                      </span>
                      {!item.isRead && (
                        <span className="tw:w-2 tw:h-2 tw:rounded-full tw:bg-blue-500 tw:mt-1 tw:shrink-0 tw:shadow-sm" />
                      )}
                    </div>
                    <span
                      className={`tw:text-[13px] tw:line-clamp-2 tw:leading-relaxed ${!item.isRead ? "tw:text-slate-600" : "tw:text-slate-500"}`}
                    >
                      {item.content}
                    </span>
                    <span className="tw:text-[11px] tw:font-medium tw:text-slate-400 tw:mt-1">
                      {dayjs(item.createdAt).format("DD/MM/YYYY HH:mm")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {isLoading && page > 1 && (
          <div className="tw:py-3.5 tw:text-center tw:text-slate-500 tw:text-xs tw:font-medium tw:flex tw:items-center tw:justify-center tw:gap-2">
            <span className="tw:w-4 tw:h-4 tw:border-2 tw:border-blue-600 tw:border-t-transparent tw:rounded-full tw:animate-spin" />
            Đang tải thêm...
          </div>
        )}
      </div>
    </div>
  );

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setPage(1);
      if (accessToken) {
        fetchNotifications(1, 10);
      }
    }
  };

  return (
    <Popover
      content={content}
      trigger="click"
      placement="bottomRight"
      open={open}
      onOpenChange={handleOpenChange}
      arrow={false}
      styles={{
        container: {
          padding: 0,
          borderRadius: "12px",
          overflow: "hidden",
        },
      }}
    >
      <div className="tw:cursor-pointer tw:flex tw:items-center tw:justify-center tw:w-10 tw:h-10 tw:bg-slate-100 hover:tw:bg-slate-200 tw:rounded-full tw:transition-all">
        <Badge count={unreadCount} size="small" offset={[-2, 2]}>
          <Bell size={20} className="tw:text-slate-600" />
        </Badge>
      </div>
    </Popover>
  );
}
