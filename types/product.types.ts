// ==========================================
// PRODUCT TYPES - Quản lý Sản phẩm
// ==========================================

/** Danh mục sản phẩm */
export interface ProductCategory {
  id: number;
  name: string;
}

/** Chi tiết phân loại sản phẩm (màu sắc, size, giá, tồn kho) */
export interface ProductDetail {
  id?: number;
  color: string;
  size: string;
  price: number;
  stock: number;
}

/** Hình ảnh sản phẩm */
export interface ProductImage {
  id: number;
  imageUrl: string;
  isThumbnail: boolean;
}

/** Response đầy đủ của 1 sản phẩm */
export interface Product {
  id: string;
  name: string;
  description: string;
  brand: string;
  origin: string;
  isPublished: boolean;
  category: ProductCategory;
  details: ProductDetail[];
  images: ProductImage[];
}

/** Query params cho API lấy danh sách sản phẩm */
export interface ProductListParams {
  page?: number;
  size?: number;
  name?: string;
  categoryId?: number;
  brand?: string;
  origin?: string;
  isPublished?: boolean;
}

/** Payload tạo/sửa sản phẩm (trước khi chuyển thành FormData) */
export interface ProductFormValues {
  name: string;
  description?: string;
  brand?: string;
  origin?: string;
  categoryId: number;
  details: ProductDetail[];
}

/** Payload toggle trạng thái ẩn/hiện */
export interface ProductStatusPayload {
  isPublished: boolean;
}
