// ==========================================
// USER TYPES - Quản lý Người dùng
// ==========================================

/** Địa chỉ người dùng */
export interface UserAddress {
  id: number;
  receiverName: string;
  receiverPhone: string;
  detailAddress: string;
  isDefault: boolean;
}

/** Thông tin người dùng từ Backend */
export interface User {
  id: string;
  fullName: string;
  email: string;
  roleId: number;
  avatarUrl?: string;
  createdAt: string;
  viewsCount?: number;
  addresses?: UserAddress[];
}

/** Query params khi gọi API lấy danh sách người dùng */
export interface UserListParams {
  page?: number;
  size?: number;
  email?: string;
  fullName?: string;
  roleId?: number;
}

/** Payload tạo tài khoản mới */
export interface CreateUserPayload {
  email: string;
  password?: string;
  fullName: string;
  roleId: number;
  avatarUrl?: string;
  gender?: string;
  address?: string;
}

/** Payload cập nhật tài khoản */
export interface UpdateUserPayload {
  email?: string;
  password?: string;
  fullName?: string;
  roleId?: number;
  avatarUrl?: string;
  gender?: string;
  address?: string;
}
