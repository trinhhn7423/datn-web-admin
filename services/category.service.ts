import axiosClient from "@/utils/axiosClient";
import { API_ENDPOINTS } from "@/configs/api.config";
import { BaseResponse } from "@/types/api.types";
import {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "@/types/category.types";

export const CategoryService = {
  /** Lấy toàn bộ danh mục (không phân trang) */
  getList: async (): Promise<Category[]> => {
    return await axiosClient.get<BaseResponse<Category[]>, Category[]>(
      API_ENDPOINTS.CATEGORIES.GET_LIST
    );
  },

  /** Lấy chi tiết 1 danh mục */
  getDetail: async (id: number): Promise<Category> => {
    return await axiosClient.get<BaseResponse<Category>, Category>(
      API_ENDPOINTS.CATEGORIES.GET_DETAIL(id)
    );
  },

  /** Tạo danh mục mới */
  create: async (payload: CreateCategoryPayload): Promise<Category> => {
    return await axiosClient.post<BaseResponse<Category>, Category>(
      API_ENDPOINTS.CATEGORIES.CREATE,
      payload
    );
  },

  /** Cập nhật danh mục (Partial Update) */
  update: async (id: number, payload: UpdateCategoryPayload): Promise<Category> => {
    return await axiosClient.patch<BaseResponse<Category>, Category>(
      API_ENDPOINTS.CATEGORIES.UPDATE(id),
      payload
    );
  },

  /** Xóa danh mục */
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
  },
};
