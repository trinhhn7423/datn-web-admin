import { API_ENDPOINTS } from "@/configs/api.config";
import axiosClient from "@/utils/axiosClient";
import axios from "axios";
import {
  KpiResponse,
  ChartDataDto,
  OrderStatusChartDto,
  TopProductResponseDto,
  LowStockResponseDto,
  TopCustomerResponseDto,
  SalesReportItemDto,
  CategoryDistributionDto,
  CustomerLoyaltyDto,
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

  async getLowStock(
    threshold = 10,
    limit = 10
  ): Promise<LowStockResponseDto[]> {
    return await axiosClient.get(API_ENDPOINTS.STATISTICS.LOW_STOCK, {
      params: { threshold, limit },
    });
  },

  async getTopCustomers(limit = 5): Promise<TopCustomerResponseDto[]> {
    return await axiosClient.get(API_ENDPOINTS.STATISTICS.TOP_CUSTOMERS, {
      params: { limit },
    });
  },

  // ─── NEW ANALYTICS METHODS ──────────────────────────────────────────────────

  async getSalesReport(
    startDate: string,
    endDate: string,
    groupBy?: "DAY" | "WEEK" | "MONTH"
  ): Promise<SalesReportItemDto[]> {
    return await axiosClient.get(API_ENDPOINTS.STATISTICS.SALES_REPORT, {
      params: { startDate, endDate, ...(groupBy ? { groupBy } : {}) },
    });
  },

  async getCategoryDistribution(): Promise<CategoryDistributionDto[]> {
    return await axiosClient.get(
      API_ENDPOINTS.STATISTICS.CATEGORY_DISTRIBUTION
    );
  },

  async getCustomerLoyalty(): Promise<CustomerLoyaltyDto> {
    return await axiosClient.get(API_ENDPOINTS.STATISTICS.CUSTOMER_LOYALTY);
  },

  async exportSalesExcel(startDate: string, endDate: string): Promise<void> {
    // Must use raw axios with blob responseType (bypass axiosClient interceptor)
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
    const token =
      typeof window !== "undefined"
        ? (() => {
            // Get token from Zustand persisted store
            try {
              const storedStore = localStorage.getItem("auth-store");
              const storedStorage = localStorage.getItem("auth-storage");
              console.log("[DEBUG EXPORT] auth-store item:", storedStore);
              console.log("[DEBUG EXPORT] auth-storage item:", storedStorage);
              
              const stored = storedStore || storedStorage;
              if (stored) {
                const parsed = JSON.parse(stored);
                console.log("[DEBUG EXPORT] Parsed state:", parsed);
                console.log("[DEBUG EXPORT] Resolved token:", parsed?.state?.accessToken);
                return parsed?.state?.accessToken || "";
              }
            } catch (e) {
              console.error("[DEBUG EXPORT] Error parsing token:", e);
              return "";
            }
            return "";
          })()
        : "";

    const response = await axios.get(
      `${baseUrl}${API_ENDPOINTS.STATISTICS.EXPORT_SALES}`,
      {
        params: { startDate, endDate },
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      }
    );

    // Trigger browser download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `bao-cao-doanh-so-${startDate}-${endDate}.xlsx`
    );
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
