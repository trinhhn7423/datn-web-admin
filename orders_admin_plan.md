# Hướng Dẫn Tích Hợp API Quản Lý Đơn Hàng (Admin)

Tài liệu này cung cấp các thông tin chi tiết về API để Agent Front-End xây dựng chức năng Quản lý Đơn hàng cho role `ADMIN`.

> **Lưu ý Quan trọng:** Tất cả các request bên dưới yêu cầu gắn token JWT của Admin trong Header: `Authorization: Bearer <Admin_Token>`.

---

## 1. Lấy danh sách đơn hàng (Có phân trang và lọc)

Admin sử dụng API này để lấy danh sách tất cả các đơn hàng trong hệ thống. Frontend cần truyền các tham số phân trang (`page`, `size`) và có thể truyền bộ lọc trạng thái (`status`).

- **URL:** `GET /api/v1/orders`
- **Query Parameters (Request):**
  - `page` (number, optional): Số trang hiện tại (Mặc định: 1)
  - `size` (number, optional): Số lượng item trên 1 trang (Mặc định: 10)
  - `status` (string, optional): Trạng thái đơn hàng. Các giá trị hợp lệ:
    - `PENDING` (Chờ xác nhận)
    - `CONFIRMED` (Đã xác nhận)
    - `SHIPPING` (Đang giao hàng)
    - `COMPLETED` (Đã hoàn thành)
    - `CANCELLED` (Đã hủy)
  - `userId` (string, optional): Nếu Admin muốn xem đơn hàng của 1 user cụ thể, có thể truyền ID user vào đây.
  - `search` (string, optional): Từ khóa tìm kiếm (Có thể là ID đơn hàng hoặc Tên người đặt/khách hàng).
  - `startDate` (string, optional): Lọc từ ngày (Định dạng ISO, ví dụ: `2026-05-01T00:00:00Z`).
  - `endDate` (string, optional): Lọc đến ngày (Định dạng ISO, ví dụ: `2026-05-31T23:59:59Z`).

### Request Example
```http
GET /api/v1/orders?page=1&size=10&status=PENDING&search=Nguyễn&startDate=2026-05-01T00:00:00Z
```

### Response Trả Về (Success 200)
Response được bọc trong `BaseResponse`, data là một mảng danh sách `OrderResponseDto` và tổng số record (`totalElement`).

```json
{
  "statusCode": 200,
  "message": "Lấy danh sách đơn hàng thành công",
  "data": [
    {
      "id": "e9b5e82a-3b1a-4d2b-8a8b-1b1234567890",
      "userId": "c30f187b-...",
      "user": {
        "id": "c30f187b-...",
        "fullName": "Nguyễn Văn A",
        "email": "nva@gmail.com"
      },
      "totalAmount": 1200000,
      "paymentMethod": "COD", // Hoặc "VNPAY"
      "paymentStatus": "UNPAID", // Hoặc "PAID", "FAILED"
      "status": "PENDING",
      "shippingAddress": {
        "name": "Nguyễn Văn A",
        "phone": "0987654321",
        "address": "Số 1, Phố abc, Quận xyz"
      },
      "createdAt": "2026-05-13T15:00:00.000Z",
      "orderDetails": [
        {
          "id": 1,
          "productDetailId": 5,
          "quantity": 2,
          "priceAtPurchase": 600000,
          "productDetail": {
            "color": "Đen",
            "size": "L",
            "price": "600000.00",
            "stock": 10,
            "productName": "Áo sơ mi nam cao cấp",
            "productThumbnail": "https://res.cloudinary.com/.../image.jpg"
          }
        }
      ]
    }
  ],
  "totalElement": 45
}
```
*Lưu ý: API đã được backend cấu hình sẵn để populate ra `productName` và `productThumbnail` ở bên trong `orderDetails` -> `productDetail` để Frontend tiện render.*

---

## 2. Cập nhật trạng thái đơn hàng (Admin)

Admin sẽ dùng API này để chuyển đổi các trạng thái xử lý của đơn hàng (VD: Xác nhận đơn, Báo đã giao hàng, Hoặc Hủy đơn hàng). 

> **Chú ý về tồn kho:** Khi Admin cập nhật trạng thái đơn sang `CANCELLED`, hệ thống backend sẽ **tự động cộng trả lại số lượng tồn kho** (stock) cho các sản phẩm trong đơn hàng. Frontend không cần gọi thêm API nào để hoàn kho.

- **URL:** `PUT /api/v1/orders/:id/status`
- **Path Parameter:**
  - `id` (string - UUID): Mã ID của đơn hàng cần cập nhật.
- **Body Request (JSON):**
  - `status` (string, required): Trạng thái muốn chuyển đến (`PENDING`, `CONFIRMED`, `SHIPPING`, `COMPLETED`, `CANCELLED`).
  - `paymentStatus` (string, required): Trạng thái thanh toán (`UNPAID`, `PAID`, `FAILED`).

### Request Example
```http
PUT /api/v1/orders/e9b5e82a-3b1a-4d2b-8a8b-1b1234567890/status
Content-Type: application/json

{
  "status": "CONFIRMED",
  "paymentStatus": "UNPAID"
}
```

### Response Trả Về (Success 200)
Trả về thông tin đơn hàng sau khi đã được cập nhật.
```json
{
  "statusCode": 200,
  "message": "Cập nhật trạng thái đơn hàng thành công",
  "data": {
    "id": "e9b5e82a-3b1a-4d2b-8a8b-1b1234567890",
    "userId": "c30f187b-...",
    "user": {
      "id": "c30f187b-...",
      "fullName": "Nguyễn Văn A",
      "email": "nva@gmail.com"
    },
    "totalAmount": 1200000,
    "paymentMethod": "COD",
    "paymentStatus": "UNPAID",
    "status": "CONFIRMED",
    "shippingAddress": { ... },
    "createdAt": "...",
    "orderDetails": [ ... ]
  }
}
```

### Response Trả Về (Lỗi 400 hoặc 404)
- Nếu ID đơn hàng không tồn tại: `{"statusCode": 404, "message": "Đơn hàng không tồn tại", "data": null}`
- Nếu nhập sai enum format: `{"statusCode": 400, "message": "Yêu cầu không hợp lệ", "data": null}`

---

## 💡 Hướng dẫn chung cho FrontEnd:
1. **Trang danh sách đơn hàng:** Tạo một bảng (Table) hiển thị `Mã đơn`, `Người đặt (Tên & Email)`, `Ngày đặt`, `Tổng tiền`, `Trạng thái thanh toán`, `Trạng thái đơn hàng`. Sử dụng component Pagination (sử dụng query params `page`, `size`). 
   - Có thể dùng **Tabs hoặc Select** để lọc theo `status`.
   - Bố trí thanh công cụ phía trên table: 
     - 1 ô **Input Search** để tìm kiếm (truyền vào param `search`).
     - 1 bộ **DateRangePicker** (truyền vào `startDate` và `endDate`).
2. **Modal chi tiết đơn hàng:** Khi click vào một dòng, có thể hiển thị Modal show chi tiết người nhận (shippingAddress) và danh sách sản phẩm (duyệt mảng `orderDetails`). Hiển thị rõ tên sản phẩm, ảnh (`productThumbnail`), phân loại (Màu, Size) và Số lượng.
3. **Cập nhật:** Trong modal hoặc ở cột Hành động, cung cấp cho Admin dropdown hoặc các nút bấm (Xác nhận, Giao hàng, Hoàn thành, Hủy đơn) để bắn API `PUT`. Mỗi khi `PUT` thành công, nên đóng modal và fetch lại list (hoặc cập nhật state local) để phản ánh dữ liệu mới.
