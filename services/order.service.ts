import { API_ENDPOINTS } from "@/configs/api.config";
import axiosClient from "@/utils/axiosClient";
import {
  Order,
  OrderListParams,
  UpdateOrderStatusPayload,
} from "@/types/order.types";
import { PaginatedResult } from "@/utils/errorHandler";

export const OrderService = {
  /**
   * Lấy danh sách đơn hàng (Có phân trang, lọc)
   */
  async getList(params: OrderListParams): Promise<PaginatedResult<Order>> {
    // axiosClient + unwrapResponse đã tự động trả về { items, total }
    return await axiosClient.get(API_ENDPOINTS.ORDERS.GET_LIST, {
      params,
    });
  },

  /**
   * Lấy chi tiết đơn hàng
   */
  async getDetail(id: string | number): Promise<Order> {
    return await axiosClient.get(API_ENDPOINTS.ORDERS.GET_DETAIL(id));
  },

  /**
   * Cập nhật trạng thái đơn hàng
   */
  async updateStatus(
    id: string | number,
    payload: UpdateOrderStatusPayload
  ): Promise<Order> {
    return await axiosClient.put(
      API_ENDPOINTS.ORDERS.UPDATE_STATUS(id),
      payload
    );
  },
};
