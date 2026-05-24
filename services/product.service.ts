import axiosClient from "@/utils/axiosClient";
import { API_ENDPOINTS } from "@/configs/api.config";
import { BaseResponse, PaginatedResponse } from "@/types/api.types";
import {
  Product,
  ProductListParams,
  ProductStatusPayload,
} from "@/types/product.types";
import { PaginatedResult, unwrapPaginatedResponse } from "@/utils/errorHandler";
import { UploadFile } from "antd";

export const ProductService = {
  /**
   * Lấy danh sách sản phẩm có phân trang và bộ lọc.
   * API trả về PaginatedResponse nên cần bóc tách thủ công để lấy totalElement.
   */
  getList: async (params: ProductListParams): Promise<PaginatedResult<Product>> => {
    return await axiosClient.get(API_ENDPOINTS.PRODUCTS.ADMIN_LIST, { params });
  },

  /** Lấy chi tiết 1 sản phẩm */
  getDetail: async (id: string): Promise<Product> => {
    return await axiosClient.get<BaseResponse<Product>, Product>(
      API_ENDPOINTS.PRODUCTS.ADMIN_DETAIL(id)
    );
  },

  /** Tạo sản phẩm mới - sử dụng FormData vì có upload ảnh */
  create: async (
    formValues: { name: string; description?: string; brand?: string; origin?: string; categoryId: number; details: string },
    files: UploadFile[]
  ): Promise<Product> => {
    const formData = new FormData();
    formData.append("name", formValues.name);
    if (formValues.description) formData.append("description", formValues.description);
    if (formValues.brand) formData.append("brand", formValues.brand);
    if (formValues.origin) formData.append("origin", formValues.origin);
    formData.append("categoryId", String(formValues.categoryId));
    formData.append("details", formValues.details);

    files.forEach((file) => {
      if (file.originFileObj) {
        formData.append("images", file.originFileObj);
      }
    });

    return await axiosClient.post<BaseResponse<Product>, Product>(
      API_ENDPOINTS.PRODUCTS.CREATE,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  },

  /** Cập nhật sản phẩm - sử dụng FormData */
  update: async (
    id: string,
    formValues: { name: string; description?: string; brand?: string; origin?: string; categoryId: number; details: string },
    retainedImageIds: number[],
    newFiles: UploadFile[]
  ): Promise<Product> => {
    const formData = new FormData();
    formData.append("name", formValues.name);
    if (formValues.description) formData.append("description", formValues.description);
    if (formValues.brand) formData.append("brand", formValues.brand);
    if (formValues.origin) formData.append("origin", formValues.origin);
    formData.append("categoryId", String(formValues.categoryId));
    formData.append("details", formValues.details);
    formData.append("retained_image_ids", JSON.stringify(retainedImageIds));

    newFiles.forEach((file) => {
      if (file.originFileObj) {
        formData.append("images", file.originFileObj);
      }
    });

    return await axiosClient.put<BaseResponse<Product>, Product>(
      API_ENDPOINTS.PRODUCTS.UPDATE(id),
      formData,
      // { headers: { "Content-Type": "multipart/form-data" } }
    );
  },

  /** Toggle trạng thái ẩn/hiện sản phẩm */
  toggleStatus: async (id: string, payload: ProductStatusPayload): Promise<Product> => {
    return await axiosClient.patch<BaseResponse<Product>, Product>(
      API_ENDPOINTS.PRODUCTS.TOGGLE_STATUS(id),
      payload
    );
  },
};
