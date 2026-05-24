import axiosClient from "@/utils/axiosClient";
import { API_ENDPOINTS } from "@/configs/api.config";
import { BaseResponse, LoginData, RefreshTokenData } from "@/types/api.types";
import { LoginPayload } from "@/types/auth.types";

export const AuthService = {
  adminLogin: async (payload: LoginPayload): Promise<LoginData> => {
    return await axiosClient.post<BaseResponse<LoginData>, LoginData>(
      API_ENDPOINTS.AUTH.ADMIN_LOGIN,
      payload
    );
  },

  refreshToken: async (refreshToken: string): Promise<RefreshTokenData> => {
    return await axiosClient.post<BaseResponse<RefreshTokenData>, RefreshTokenData>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refreshToken }
    );
  },
};
