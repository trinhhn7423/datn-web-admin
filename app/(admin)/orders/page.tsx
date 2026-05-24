"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  DatePicker,
  message,
  Tabs,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { debounce } from "lodash";
import {
  Order,
  OrderListParams,
  OrderStatusEnum,
  PaymentStatusEnum,
} from "@/types/order.types";
import { OrderService } from "@/services/order.service";
import dayjs from "dayjs";
import OrderDetailModal from "./components/OrderDetailModal";

const { RangePicker } = DatePicker;

const STATUS_TABS = [
  { key: "ALL", label: "Tất cả" },
  { key: OrderStatusEnum.PENDING, label: "Chờ xác nhận" },
  { key: OrderStatusEnum.CONFIRMED, label: "Đã xác nhận" },
  { key: OrderStatusEnum.SHIPPING, label: "Đang giao" },
  { key: OrderStatusEnum.COMPLETED, label: "Hoàn thành" },
  { key: OrderStatusEnum.CANCELLED, label: "Đã hủy" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [params, setParams] = useState<OrderListParams>({
    page: 1,
    size: 10,
    status: undefined,
  });
  
  const [searchName, setSearchName] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const result = await OrderService.getList(params);
      setOrders(result.items);
      setTotal(result.total);
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setParams((prev) => ({ ...prev, page: 1, search: value || undefined }));
      }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = (value: string) => {
    setSearchName(value);
    debouncedSearch(value);
  };

  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    if (dates && dates[0] && dates[1]) {
      setParams((prev) => ({
        ...prev,
        page: 1,
        startDate: dates[0].startOf("day").toISOString(),
        endDate: dates[1].endOf("day").toISOString(),
      }));
    } else {
      setParams((prev) => ({
        ...prev,
        page: 1,
        startDate: undefined,
        endDate: undefined,
      }));
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setParams((prev) => ({
      ...prev,
      page: 1,
      status: key === "ALL" ? undefined : key,
    }));
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setParams((prev) => ({
      ...prev,
      page: pagination.current ?? 1,
      size: pagination.pageSize ?? 10,
    }));
  };

  const handleReset = () => {
    setSearchName("");
    setActiveTab("ALL");
    debouncedSearch.cancel();
    setParams({ page: 1, size: 10, status: undefined });
  };

  const openDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const getStatusColor = (status: OrderStatusEnum) => {
    switch (status) {
      case OrderStatusEnum.PENDING: return "orange";
      case OrderStatusEnum.CONFIRMED: return "blue";
      case OrderStatusEnum.SHIPPING: return "purple";
      case OrderStatusEnum.COMPLETED: return "success";
      case OrderStatusEnum.CANCELLED: return "error";
      default: return "default";
    }
  };

  const getPaymentStatusColor = (status: PaymentStatusEnum) => {
    switch (status) {
      case PaymentStatusEnum.UNPAID: return "default";
      case PaymentStatusEnum.PAID: return "success";
      case PaymentStatusEnum.FAILED: return "error";
      default: return "default";
    }
  };

  const getStatusText = (status: OrderStatusEnum) => {
    switch (status) {
      case OrderStatusEnum.PENDING: return "Chờ xác nhận";
      case OrderStatusEnum.CONFIRMED: return "Đã xác nhận";
      case OrderStatusEnum.SHIPPING: return "Đang giao";
      case OrderStatusEnum.COMPLETED: return "Hoàn thành";
      case OrderStatusEnum.CANCELLED: return "Đã hủy";
      default: return status;
    }
  };

  const getPaymentStatusText = (status: PaymentStatusEnum) => {
    switch (status) {
      case PaymentStatusEnum.UNPAID: return "Chưa thanh toán";
      case PaymentStatusEnum.PAID: return "Đã thanh toán";
      case PaymentStatusEnum.FAILED: return "Thất bại";
      default: return status;
    }
  };

  const columns: ColumnsType<Order> = [
    {
      title: "Mã đơn",
      dataIndex: "id",
      key: "id",
      render: (id: string) => (
        <span className="tw:font-medium tw:text-slate-600">
          #{id.substring(0, 8).toUpperCase()}
        </span>
      ),
      width: 120,
    },
    {
      title: "Người đặt",
      key: "user",
      render: (_: any, record: Order) => (
        <div className="tw:flex tw:flex-col">
          <span className="tw:font-semibold tw:text-slate-800">
            {record.user?.fullName || record.shippingAddress?.name || "Khách"}
          </span>
          <span className="tw:text-xs tw:text-slate-500">
            {record.user?.email || "Không có email"}
          </span>
        </div>
      ),
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <span className="tw:text-slate-600">
          {dayjs(date).format("DD/MM/YYYY HH:mm")}
        </span>
      ),
      width: 160,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount: number) => (
        <span className="tw:font-bold tw:text-blue-600">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(amount)}
        </span>
      ),
      width: 140,
    },
    {
      title: "Thanh toán",
      key: "paymentStatus",
      render: (_: any, record: Order) => (
        <div className="tw:flex tw:flex-col tw:gap-1">
          <Tag color={getPaymentStatusColor(record.paymentStatus)} className="tw:w-fit tw:m-0">
            {getPaymentStatusText(record.paymentStatus)}
          </Tag>
          <span className="tw:text-[10px] tw:text-slate-400 tw:font-medium">
            {record.paymentMethod}
          </span>
        </div>
      ),
      width: 140,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: OrderStatusEnum) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      width: 140,
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_: any, record: Order) => (
        <Button
          type="text"
          icon={<EyeOutlined className="tw:text-blue-500" />}
          onClick={() => openDetailModal(record)}
          className="tw:bg-blue-50 hover:tw:bg-blue-100 tw:rounded-lg"
        >
          Chi tiết
        </Button>
      ),
      width: 100,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="tw:mb-6">
        <h1 className="tw:text-3xl tw:font-extrabold tw:text-slate-900 tw:m-0 tw:tracking-tight">
          Quản lý Đơn hàng
        </h1>
        <p className="tw:text-slate-500 tw:mt-1 tw:mb-0 tw:text-base">
          Theo dõi và xử lý các đơn đặt hàng từ khách hàng.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="tw:bg-white tw:p-5 tw:rounded-2xl tw:border tw:border-slate-100 tw:shadow-sm tw:mb-6">
        <div className="tw:flex tw:flex-wrap tw:gap-4 tw:items-center">
          <Input
            placeholder="Tìm theo mã đơn, tên, email..."
            prefix={<SearchOutlined className="tw:text-slate-400" />}
            value={searchName}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="tw:max-w-xs tw:h-11 tw:rounded-xl"
            allowClear
          />
          <RangePicker
            onChange={handleDateRangeChange}
            className="tw:h-11 tw:rounded-xl"
            format="DD/MM/YYYY"
            placeholder={["Từ ngày", "Đến ngày"]}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            className="tw:h-11 tw:px-5 tw:rounded-xl tw:bg-slate-50 tw:text-slate-600 tw:border-slate-200 hover:tw:bg-slate-100"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="tw:bg-white tw:rounded-2xl tw:border tw:border-slate-100 tw:shadow-sm tw:overflow-hidden tw:mb-6">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={STATUS_TABS}
          className="tw:px-4 tw:pt-2 admin-order-tabs"
        />
        <Table<Order>
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          pagination={{
            current: params.page,
            pageSize: params.size,
            total: total,
            showSizeChanger: true,
            className: "tw:px-6 tw:py-4",
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          open={modalOpen}
          order={selectedOrder}
          onClose={() => {
            setModalOpen(false);
            setTimeout(() => setSelectedOrder(null), 300);
          }}
          onSuccess={fetchOrders}
        />
      )}
    </div>
  );
}
