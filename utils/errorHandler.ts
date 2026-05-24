import { AxiosError } from "axios";
import { BaseResponse, PaginatedResponse } from "@/types/api.types";

/** Kết quả phân trang đã được bóc tách, dùng ở tầng UI */
export interface PaginatedResult<T> {
  items: T[];
  total: number;
}

/**
 * Xử lý lỗi từ Axios hoặc lỗi logic và ném ra một Error với message tiếng Việt chuẩn hóa.
 * Hàm này có thể tái sử dụng ở mọi Service.
 */
export const handleApiError = (error: unknown): never => {
  if (error && typeof error === "object" && "isAxiosError" in error) {
    const axiosError = error as AxiosError<BaseResponse>;
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data;

      if (status === 401) {
        throw new Error(data?.message || "Thông tin đăng nhập không chính xác hoặc không có quyền.");
      }
      if (status === 400) {
        throw new Error(data?.message || "Dữ liệu không hợp lệ, vui lòng kiểm tra lại.");
      }
      if (status === 403) {
        throw new Error(data?.message || "Bạn không có quyền thực hiện thao tác này.");
      }
      if (status === 404) {
        throw new Error(data?.message || "Không tìm thấy dữ liệu.");
      }
      throw new Error(data?.message || "Có lỗi xảy ra kết nối tới server. Vui lòng thử lại sau.");
    }
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error("Không thể kết nối đến máy chủ.");
};

/**
 * Bóc tách dữ liệu từ BaseResponse thông thường.
 */
export const unwrapResponse = (res: any): any => {
  if (res.statusCode >= 200 && res.statusCode < 300) {
    if (res.totalElement !== undefined) {
      return {
        items: res.data,
        total: res.totalElement,
      };
    }
    return res.data;
  }
  throw new Error(res.message || "Thao tác thất bại");
};

/**
 * Bóc tách dữ liệu từ PaginatedResponse (có totalElement).
 * Trả về { items, total } để dùng trực tiếp cho Ant Design Table.
 */
// Hàm unwrapPaginatedResponse không còn cần thiết vì unwrapResponse đã xử lý
export const unwrapPaginatedResponse = <T>(res: any): PaginatedResult<T> => {
  return unwrapResponse(res);
};

