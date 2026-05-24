import axios from "axios";
import { API_ENDPOINTS } from "@/configs/api.config";
import { useAuthStore } from "@/store/useAuthStore";
import { handleApiError, unwrapResponse } from "@/utils/errorHandler";

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Interceptor cho Request
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ Zustand store thay vì gọi trực tiếp localStorage
    // vì Zustand persist đã tự động sync với localStorage
    const token = useAuthStore.getState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor cho Response
axiosClient.interceptors.response.use(
  (response) => {
    // Tự động bóc tách dữ liệu sạch từ BaseResponse
    return unwrapResponse(response.data);
  },
  async (error) => {
    const originalRequest = error.config;

    // Xử lý lỗi 401 (Hết hạn token)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== API_ENDPOINTS.AUTH.ADMIN_LOGIN
    ) {
      originalRequest._retry = true;

      const { refreshToken, setAccessToken, logout } = useAuthStore.getState();

      if (refreshToken) {
        try {
          // Gọi API refresh token
          const res = await axios.post(
            `${axiosClient.defaults.baseURL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
            {
              refreshToken,
            },
          );

          if (res.data?.statusCode === 200 && res.data?.data?.accessToken) {
            const newAccessToken = res.data.data.accessToken;
            setAccessToken(newAccessToken);

            // Gắn token mới vào request bị lỗi và gửi lại
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh thất bại (ví dụ refresh token hết hạn)
          logout();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          handleApiError(refreshError);
        }
      } else {
        logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    // Quăng tất cả lỗi khác vào Global Error Handler để chuẩn hóa thành tiếng Việt
    handleApiError(error);
  },
);

export default axiosClient;
