export type KpiTrend = "UP" | "DOWN" | "NEUTRAL";

export interface KpiMetric {
  value: number;
  previousValue: number;
  percentageChange: number;
  trend: KpiTrend;
}

export interface KpiResponse {
  revenue: KpiMetric;
  orders: KpiMetric;
  customers: KpiMetric;
}

export interface ChartDataDto {
  label: string;
  value: number;
}

export interface OrderStatusChartDto {
  status: string;
  count: number;
}

export interface TopProductResponseDto {
  productId: string;
  productName: string;
  totalSold: number;
  revenue: number;
}

export interface LowStockResponseDto {
  productId: string;
  productDetailId: number;
  productName: string;
  color: string;
  size: string;
  stock: number;
}

export interface TopCustomerResponseDto {
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  totalSpent: number;
  totalOrders: number;
}
