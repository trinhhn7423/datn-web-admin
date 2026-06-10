import axiosClient from "@/utils/axiosClient";
import { API_ENDPOINTS } from "@/configs/api.config";
import { BaseResponse } from "@/types/api.types";
import {
  User,
  UserListParams,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/types/user.types";
import { PaginatedResult } from "@/utils/errorHandler";

export const UserService = {
  /** Lấy danh sách người dùng phân trang và tìm kiếm */
  getList: async (params: UserListParams): Promise<PaginatedResult<User>> => {
    return await axiosClient.get(API_ENDPOINTS.USERS.GET_LIST, { params });
  },

  /** Lấy chi tiết thông tin người dùng */
  getDetail: async (id: string): Promise<User> => {
    return await axiosClient.get<BaseResponse<User>, User>(
      API_ENDPOINTS.USERS.GET_DETAIL(id)
    );
  },

  /** Thêm tài khoản người dùng mới */
  create: async (payload: CreateUserPayload): Promise<User> => {
    return await axiosClient.post<BaseResponse<User>, User>(
      API_ENDPOINTS.USERS.CREATE,
      payload
    );
  },

  /** Cập nhật thông tin tài khoản */
  update: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    return await axiosClient.patch<BaseResponse<User>, User>(
      API_ENDPOINTS.USERS.UPDATE(id),
      payload
    );
  },

  /** Xóa tài khoản người dùng */
  delete: async (id: string): Promise<void> => {
    return await axiosClient.delete(API_ENDPOINTS.USERS.DELETE(id));
  },

  /** Lấy thống kê số lượng người dùng theo vai trò */
  getCounters: async (): Promise<{ total: number; admins: number; customers: number }> => {
    return await axiosClient.get(API_ENDPOINTS.USERS.GET_COUNTERS);
  },
};
