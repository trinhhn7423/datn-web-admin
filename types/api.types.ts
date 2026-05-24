export interface BaseResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T;
}

/** Response cho các API trả về danh sách có phân trang */
export interface PaginatedResponse<T = unknown> {
  statusCode: number;
  message: string;
  data: T[];
  totalElement: number;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  roleId: number;
  avatarUrl: string;
  createdAt: string;
}

export interface LoginData {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenData {
  accessToken: string;
}
