"use client";

import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, Avatar, Dropdown } from "antd";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  User as UserIcon,
  Layers,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import NotificationBell from "./NotificationBell";

const { Header, Sider, Content } = Layout;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { disconnectSSE } = useNotificationStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    disconnectSSE();
    logout();
    router.push("/login");
  };

  const userMenuItems = [
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogOut size={16} />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  const sidebarMenuItems = [
    {
      key: "/dashboard",
      icon: <LayoutDashboard size={20} />,
      label: "Tổng quan",
    },
    {
      key: "/users",
      icon: <Users size={20} />,
      label: "Người dùng",
    },
    {
      key: "/products",
      icon: <Package size={20} />,
      label: "Sản phẩm",
    },
    {
      key: "/categories",
      icon: <Layers size={20} />,
      label: "Danh mục",
    },
    {
      key: "/orders",
      icon: <ShoppingCart size={20} />,
      label: "Đơn hàng",
    }
  ];

  const activeKey =
    sidebarMenuItems.find((item) => pathname.startsWith(item.key))?.key ||
    "/dashboard";

  if (!mounted) return null;

  return (
    <Layout hasSider className="tw:min-h-screen">
      {/* SIDEBAR */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        width={260}
        className="tw:bg-slate-900 tw:shadow-xl tw:z-20"
      >
        <div className="tw:flex tw:items-center tw:h-16 tw:px-6 tw:border-b tw:border-slate-800">
          <div
            style={{
              width: 32,
              height: 32,
              position: "relative",
              flexShrink: 0,
            }}
            className="tw:rounded-full tw:overflow-hidden tw:bg-white tw:flex tw:items-center tw:justify-center"
          >
            <Image
              src="/logo.png"
              alt="Logo"
              fill
              className="tw:object-contain tw:p-1"
              unoptimized
            />
          </div>
          {!collapsed && (
            <span className="tw:ml-3 tw:text-white tw:font-bold tw:text-lg tw:tracking-tight tw:truncate">
              TH-STORE
            </span>
          )}
        </div>

        <div className="tw:px-3 tw:py-6">
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[activeKey]}
            onClick={({ key }) => router.push(key)}
            items={sidebarMenuItems}
            className="tw:bg-transparent tw:border-none"
          />
        </div>
      </Sider>

      {/* RIGHT CONTENT */}
      <Layout className="tw:bg-slate-50 tw:transition-all tw:duration-300">
        {/* HEADER */}
        <Header
          style={{ padding: "0 16px", background: "#ffffff" }}
          className="tw:h-16 tw:flex tw:items-center tw:justify-between tw:shadow-sm tw:z-10 tw:sticky tw:top-0"
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="tw:w-10 tw:h-10 tw:flex tw:items-center tw:justify-center tw:text-slate-500 hover:tw:bg-slate-100 hover:tw:text-slate-800 tw:rounded-lg tw:transition-colors tw:border-none tw:outline-none tw:cursor-pointer tw:bg-transparent"
          >
            {collapsed ? (
              <PanelLeftOpen size={22} />
            ) : (
              <PanelLeftClose size={22} />
            )}
          </button>

          <div className="tw:flex tw:items-center tw:gap-4">
            <NotificationBell />
            <div className="tw:text-right tw:hidden sm:tw:block">
              <p className="tw:text-sm tw:font-semibold tw:text-slate-800 tw:m-0 tw:leading-tight">
                {user?.fullName || "Quản trị viên"}
              </p>
              <p className="tw:text-xs tw:text-slate-500 tw:m-0 tw:leading-tight">
                {user?.email || "admin@th-store.com"}
              </p>
            </div>
            <Dropdown
              menu={{ items: userMenuItems as any }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <div className="tw:cursor-pointer tw:flex tw:items-center tw:justify-center tw:w-10 tw:h-10 tw:bg-slate-300 tw:rounded-full hover:tw:ring-2 hover:tw:ring-blue-500 tw:transition-all">
                <Avatar
                  src={user?.avatarUrl}
                  icon={!user?.avatarUrl && <UserIcon size={20} />}
                  className="tw:bg-white tw:text-amber-500"
                />
              </div>
            </Dropdown>
          </div>
        </Header>

        {/* MAIN CONTENT AREA */}
        <Content className="tw:p-6">
          <div className="tw:bg-white tw:rounded-2xl tw:shadow-sm tw:border tw:border-slate-100 tw:min-h-[calc(100vh-7rem)] tw:p-6">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
