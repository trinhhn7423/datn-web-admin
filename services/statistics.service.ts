import { API_ENDPOINTS } from "@/configs/api.config";
import axiosClient from "@/utils/axiosClient";
import {
  KpiResponse,
  ChartDataDto,
  OrderStatusChartDto,
  TopProductResponseDto,
  LowStockResponseDto,
  TopCustomerResponseDto,
} from "@/types/statistics.types";

export const StatisticsService = {
  async getKpi(period: "DAY" | "WEEK" | "MONTH"): Promise<KpiResponse> {
    return await axiosClient.get(API_ENDPOINTS.STATISTICS.KPI, {
      params: { period },
    });
  },

  async getRevenueChart(type: "MONTH" | "YEAR"): Promise<ChartDataDto[]> {
    return await axiosClient.get(API_ENDPOINTS.STATISTICS.REVENUE_CHART, {
      params: { type },
    });
  },

  async getOrderStatusChart(): Promise<OrderStatusChartDto[]> {
    return await axiosClient.get(API_ENDPOINTS.STATISTICS.ORDER_STATUS_CHART);
  },

  async getTopProducts(limit = 5): Promise<TopProductResponseDto[]> {
    return await axiosClient.get(API_ENDPOINTS.STATISTICS.TOP_PRODUCTS, {
      params: { limit },
    });
  },

  async getLowStock(threshold = 10, limit = 10): Promise<LowStockResponseDto[]> {
    return await axiosClient.get(API_ENDPOINTS.STATISTICS.LOW_STOCK, {
      params: { threshold, limit },
    });
  },

  async getTopCustomers(limit = 5): Promise<TopCustomerResponseDto[]> {
    return await axiosClient.get(API_ENDPOINTS.STATISTICS.TOP_CUSTOMERS, {
      params: { limit },
    });
  },
};
