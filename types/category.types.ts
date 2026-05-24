// ==========================================
// CATEGORY TYPES - Quản lý Danh mục
// ==========================================

/** Danh mục sản phẩm */
export interface Category {
  id: number;
  name: string;
  description: string;
}

/** Payload tạo danh mục */
export interface CreateCategoryPayload {
  name: string;
  description?: string;
}

/** Payload cập nhật danh mục (Partial Update) */
export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
}
