export enum OrderStatusEnum {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPING = "SHIPPING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethodEnum {
  COD = "COD",
  VNPAY = "VNPAY",
}

export enum PaymentStatusEnum {
  UNPAID = "UNPAID",
  PAID = "PAID",
  FAILED = "FAILED",
}

export interface OrderUserDto {
  id: string;
  fullName: string;
  email: string;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  address: string;
}

export interface OrderProductDetail {
  color: string;
  size: string;
  price: string;
  stock: number;
  productName: string;
  productThumbnail: string;
}

export interface OrderDetailDto {
  id: number;
  productDetailId: number;
  quantity: number;
  priceAtPurchase: number;
  productDetail: OrderProductDetail;
}

export interface Order {
  id: string;
  userId: string;
  user: OrderUserDto;
  totalAmount: number;
  paymentMethod: PaymentMethodEnum;
  paymentStatus: PaymentStatusEnum;
  status: OrderStatusEnum;
  shippingAddress: ShippingAddress;
  createdAt: string;
  orderDetails: OrderDetailDto[];
}

export interface OrderListParams {
  page?: number;
  size?: number;
  status?: OrderStatusEnum | string;
  userId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatusEnum;
  paymentStatus: PaymentStatusEnum;
}
