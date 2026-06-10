"use client";

import React, { useState } from "react";
import {
  Modal,
  Button,
  Tag,
  Descriptions,
  Table,
  Image,
  Space,
  Select,
  Popconfirm,
  message,
  Divider,
} from "antd";
import {
  ShoppingCartOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CarOutlined,
} from "@ant-design/icons";
import {
  Order,
  OrderStatusEnum,
  PaymentStatusEnum,
} from "@/types/order.types";
import { OrderService } from "@/services/order.service";
import dayjs from "dayjs";
import type { ColumnsType } from "antd/es/table";

interface OrderDetailModalProps {
  open: boolean;
  order: Order;
  onClose: () => void;
  onSuccess: () => void;
}

export default function OrderDetailModal({
  open,
  order,
  onClose,
  onSuccess,
}: OrderDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusEnum>(
    order.paymentStatus
  );

  const handleUpdateStatus = async (status: OrderStatusEnum) => {
    try {
      setLoading(true);
      await OrderService.updateStatus(order.id, {
        status,
        paymentStatus: paymentStatus, // Send along current payment status (or updated one)
      });
      message.success("Cập nhật trạng thái thành công!");
      onSuccess();
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
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

  const productColumns: ColumnsType<any> = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (_: any, record: any) => (
        <Space size="middle">
          <div className="tw:relative tw:w-16 tw:h-16 tw:rounded-lg tw:overflow-hidden tw:border tw:border-slate-100">
            <Image
              src={record.productDetail?.productThumbnail || "https://placehold.co/200x200?text=No+Image"}
              alt="product"
              width={64}
              height={64}
              className="tw:object-cover"
              preview={false}
            />
          </div>
          <div className="tw:flex tw:flex-col">
            <span className="tw:font-semibold tw:text-slate-800">
              {record.productDetail?.productName || "Sản phẩm không xác định"}
            </span>
            <span className="tw:text-xs tw:text-slate-500">
              Màu: <span className="tw:font-medium">{record.productDetail?.color}</span> | 
              Size: <span className="tw:font-medium">{record.productDetail?.size}</span>
            </span>
          </div>
        </Space>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "priceAtPurchase",
      key: "priceAtPurchase",
      render: (price: number) => (
        <span className="tw:text-slate-700">
          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price)}
        </span>
      ),
      align: "right",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
      render: (qty: number) => <span className="tw:font-medium">{qty}</span>,
    },
    {
      title: "Thành tiền",
      key: "total",
      align: "right",
      render: (_: any, record: any) => (
        <span className="tw:font-bold tw:text-blue-600">
          {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
            record.priceAtPurchase * record.quantity
          )}
        </span>
      ),
    },
  ];

  const renderFooterButtons = () => {
    switch (order.status) {
      case OrderStatusEnum.PENDING:
        return (
          <>
            <Popconfirm
              title="Hủy đơn hàng này?"
              description="Sản phẩm sẽ được cộng lại vào kho. Thao tác không thể hoàn tác."
              onConfirm={() => handleUpdateStatus(OrderStatusEnum.CANCELLED)}
              okText="Đồng ý hủy"
              cancelText="Không"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<CloseCircleOutlined />} size="large">Hủy đơn</Button>
            </Popconfirm>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleUpdateStatus(OrderStatusEnum.CONFIRMED)}
              loading={loading}
              size="large"
              className="tw:bg-blue-600"
            >
              Xác nhận đơn
            </Button>
          </>
        );
      case OrderStatusEnum.CONFIRMED:
        return (
          <>
            <Button size="large" onClick={onClose}>Đóng</Button>
            <Button
              type="primary"
              icon={<CarOutlined />}
              onClick={() => handleUpdateStatus(OrderStatusEnum.SHIPPING)}
              loading={loading}
              size="large"
              className="tw:bg-purple-600 hover:tw:bg-purple-500"
            >
              Giao cho ĐVVC
            </Button>
          </>
        );
      case OrderStatusEnum.SHIPPING:
        return (
          <>
            <Button size="large" onClick={onClose}>Đóng</Button>
            <Popconfirm
              title="Khách hàng đã nhận được hàng?"
              onConfirm={() => handleUpdateStatus(OrderStatusEnum.COMPLETED)}
              okText="Xác nhận"
              cancelText="Không"
            >
              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={loading}
                size="large"
                className="tw:bg-green-600 hover:tw:bg-green-500"
              >
                Hoàn thành đơn
              </Button>
            </Popconfirm>
          </>
        );
      default:
        // CANCELED or COMPLETED -> Readonly
        return <Button size="large" onClick={onClose} type="primary">Đóng</Button>;
    }
  };

  return (
    <Modal
      title={
        <div className="tw:flex tw:items-center tw:gap-3 tw:text-lg tw:font-bold">
          <ShoppingCartOutlined className="tw:text-blue-600" />
          <span>Chi tiết Đơn hàng #{order.id.substring(0, 8).toUpperCase()}</span>
          <Tag color={getStatusColor(order.status)} className="tw:ml-2 tw:text-sm">
            {getStatusText(order.status)}
          </Tag>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={900}
      footer={<Space className="tw:pt-4">{renderFooterButtons()}</Space>}
      styles={{ body: { padding: "20px 0" } }}
      centered
    >
      <div className="tw:max-h-[65vh] tw:overflow-y-auto tw:px-6">
        <div className="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:gap-6 tw:mb-6">
          {/* Thông tin khách hàng & Giao hàng */}
          <div className="tw:bg-slate-50 tw:p-4 tw:rounded-xl tw:border tw:border-slate-100">
            <div className="tw:flex tw:items-center tw:gap-2 tw:font-semibold tw:text-slate-800 tw:mb-3 tw:text-base">
              <EnvironmentOutlined className="tw:text-blue-500" />
              Thông tin nhận hàng
            </div>
            <Descriptions column={1} size="small" colon={false} labelStyle={{ color: '#64748b', width: '90px' }}>
              <Descriptions.Item label="Người nhận">
                <span className="tw:font-medium tw:text-slate-900">{order.shippingAddress?.name}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Điện thoại">
                <span className="tw:font-medium tw:text-slate-900">{order.shippingAddress?.phone}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                <span className="tw:text-slate-900">{order.shippingAddress?.address}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Tài khoản">
                <span className="tw:text-slate-500">{order.user?.email || "Khách vãng lai"}</span>
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* Thông tin thanh toán */}
          <div className="tw:bg-slate-50 tw:p-4 tw:rounded-xl tw:border tw:border-slate-100">
            <div className="tw:flex tw:items-center tw:gap-2 tw:font-semibold tw:text-slate-800 tw:mb-3 tw:text-base">
              <CreditCardOutlined className="tw:text-blue-500" />
              Thanh toán & Đơn hàng
            </div>
            <Descriptions column={1} size="small" colon={false} labelStyle={{ color: '#64748b', width: '110px' }}>
              <Descriptions.Item label="Ngày đặt">
                <span className="tw:text-slate-900">{dayjs(order.createdAt).format("DD/MM/YYYY HH:mm")}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức">
                <span className="tw:font-medium tw:text-slate-900">{order.paymentMethod}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái TT">
                {order.status === OrderStatusEnum.CANCELLED || order.status === OrderStatusEnum.COMPLETED ? (
                  <Tag color={order.paymentStatus === PaymentStatusEnum.PAID ? "success" : "default"}>
                    {order.paymentStatus}
                  </Tag>
                ) : (
                  <Select
                    size="small"
                    value={paymentStatus}
                    onChange={(val) => setPaymentStatus(val)}
                    options={[
                      { value: PaymentStatusEnum.UNPAID, label: "Chưa thanh toán" },
                      { value: PaymentStatusEnum.PAID, label: "Đã thanh toán" },
                      { value: PaymentStatusEnum.FAILED, label: "Thất bại" },
                    ]}
                    className="tw:w-36"
                  />
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <span className="tw:font-bold tw:text-lg tw:text-blue-600">
                  {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(order.totalAmount)}
                </span>
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div>
          <div className="tw:font-semibold tw:text-slate-800 tw:mb-3 tw:text-base">
            Sản phẩm đã đặt ({order.orderDetails?.length || 0})
          </div>
          <Table
            columns={productColumns}
            dataSource={order.orderDetails}
            rowKey="id"
            pagination={false}
            size="middle"
            className="tw:border tw:border-slate-100 tw:rounded-xl tw:overflow-hidden"
          />
        </div>
      </div>
    </Modal>
  );
}
