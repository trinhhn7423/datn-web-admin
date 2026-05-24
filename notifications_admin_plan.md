# Hướng Dẫn Tích Hợp API Notifications (Admin)

Tài liệu này cung cấp toàn bộ thông tin về các API để Front-End xây dựng chức năng Thông báo (Notification) theo thời gian thực cho hệ thống Admin.

> **Lưu ý:** Tất cả API đều yêu cầu quyền ADMIN (`Authorization: Bearer <Admin_Token>`).

---

## 1. Kết nối Nhận Thông báo Realtime (SSE Stream)

Admin cần mở một kết nối Server-Sent Events (SSE) ngay sau khi đăng nhập thành công vào Dashboard để có thể nhận thông báo đẩy tức thời (VD: Có người vừa đặt đơn hàng mới, hoặc 1 sản phẩm sắp hết hàng).

- **URL:** `GET /api/v1/notifications/admin/stream`
- **Headers yêu cầu:** `Authorization: Bearer <Admin_Token>`
- **Cách tích hợp Frontend (JavaScript/TypeScript):**
  Vì `EventSource` mặc định của trình duyệt không hỗ trợ truyền Custom Header (như `Authorization`), FE có thể dùng các thư viện như `@microsoft/fetch-event-source` hoặc `event-source-polyfill` để gửi được Bearer Token.

```typescript
import { fetchEventSource } from "@microsoft/fetch-event-source";

fetchEventSource("http://localhost:7423/api/v1/notifications/admin/stream", {
  headers: {
    Authorization: `Bearer ${adminToken}`,
  },
  onmessage(ev) {
    // ev.data là chuỗi JSON do Server trả về
    const notification = JSON.parse(ev.data);
    console.log("New Notification:", notification);

    // Thực hiện show Toast/Snackbar báo cho Admin biết
    // Gọi API update lại danh sách / badge count
  },
});
```

---

## 2. Lấy Danh sách Thông báo

Dùng để hiển thị trong Popover (biểu tượng quả chuông) hoặc trang danh sách thông báo. Có hỗ trợ phân trang.

- **URL:** `GET /api/v1/notifications/admin`
- **Query Params:**
  - `page` (number, default: 1): Trang hiện tại.
  - `size` (number, default: 10): Số lượng thông báo mỗi trang.
- **Response `data`:**

```json
{
  "statusCode": 200,
  "message": "Lấy danh sách thông báo thành công",
  "data": [
    {
      "id": "abc-123-uuid",
      "title": "Đơn hàng mới #123",
      "content": "Khách hàng Nguyễn Văn A vừa đặt một đơn hàng trị giá 1.500.000đ.",
      "type": "ORDER_CREATED", // Hoặc LOW_STOCK_WARNING
      "referenceId": "order-uuid-456", // ID dùng để điều hướng
      "isRead": false,
      "createdAt": "2026-05-13T10:00:00Z"
    }
  ],
  "totalElement": 42
}
```

---

## 3. Lấy số lượng thông báo chưa đọc

Dùng để hiển thị con số nhỏ màu đỏ (Badge) nằm trên biểu tượng quả chuông ở Header.

- **URL:** `GET /api/v1/notifications/admin/unread-count`
- **Response `data`:**

```json
{
  "statusCode": 200,
  "message": "OK",
  "data": {
    "count": 5
  }
}
```

---

## 4. Đánh dấu 1 Thông báo là Đã đọc

Khi Admin click vào một thông báo cụ thể để xem chi tiết.

- **URL:** `PUT /api/v1/notifications/admin/:id/read`
- **Path Param:** `id` (uuid của thông báo)
- **Response:**

```json
{
  "statusCode": 200,
  "message": "Đã đánh dấu đã đọc",
  "data": null
}
```

---

## 5. Đánh dấu Tất cả Thông báo là Đã đọc

Dùng khi Admin bấm nút "Đánh dấu tất cả đã đọc" (Mark all as read) trên giao diện quả chuông.

- **URL:** `PUT /api/v1/notifications/admin/read-all`
- **Response:**

```json
{
  "statusCode": 200,
  "message": "Đã đánh dấu tất cả là đã đọc",
  "data": null
}
```

---

## 💡 Gợi ý Thiết Kế Giao Diện & Logic cho FrontEnd Agent

1. **Notification Bell (Quả chuông ở góc phải Header):**
   - Bọc Icon Bell bằng component `Badge` của Ant Design, truyền prop `count` bằng giá trị lấy từ API `unread-count`.
   - Khi click vào quả chuông, mở ra một `Dropdown` hoặc `Popover` chứa danh sách thông báo (API số 2).
   - Danh sách thông báo có thể chia ra:
     - Thông báo chưa đọc (nền xanh nhạt hoặc chữ in đậm).
     - Thông báo đã đọc (nền trắng/xám chữ nhạt).
2. **Logic Click vào 1 Thông báo:**
   - Dựa vào `type` và `referenceId` để điều hướng:
     - Nếu `type == 'ORDER_CREATED'`: Đẩy Admin sang router `/admin/orders` và mở chi tiết `referenceId`.
   - Đồng thời gọi API số 4 (Đánh dấu đã đọc).
   - Trừ đi 1 ở con số `Badge` hiện tại (hoặc gọi lại API `unread-count`).
3. **SSE Connection Lifecycle:**
   - Chỉ connect SSE khi có token admin hợp lệ.
   - Nhớ xử lý ngắt kết nối (`close()`) khi Admin logout hoặc unmount Layout để tránh rò rỉ bộ nhớ (memory leak).
