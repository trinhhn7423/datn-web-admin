# Hướng Dẫn Tích Hợp API Dashboard Thống Kê (Admin)

Tài liệu này cung cấp toàn bộ thông tin về các API của module `Statistics` để Agent Front-End xây dựng trang **Dashboard Tổng Quan** cho hệ thống Admin.

> **Lưu ý:** Tất cả API đều yêu cầu quyền ADMIN (`Authorization: Bearer <Admin_Token>`). Response đều được bọc trong cấu trúc chuẩn: `{ statusCode, message, data }`.

---

## 1. Lấy dữ liệu KPI Tổng Quan
Hiển thị các chỉ số quan trọng (Doanh thu, Đơn hàng, Khách hàng) và so sánh phần trăm tăng/giảm so với kỳ trước.

- **URL:** `GET /api/v1/statistics/kpi`
- **Query Params:**
  - `period`: Khoảng thời gian thống kê. Các giá trị: `DAY` (Hôm nay), `WEEK` (Tuần này), `MONTH` (Tháng này).
- **Response `data`:**
```json
{
  "revenue": { "value": 15000000, "previousValue": 12000000, "percentageChange": 25, "trend": "UP" },
  "orders": { "value": 150, "previousValue": 160, "percentageChange": -6.25, "trend": "DOWN" },
  "customers": { "value": 45, "previousValue": 45, "percentageChange": 0, "trend": "NEUTRAL" }
}
```

## 2. Biểu đồ Doanh thu (Revenue Chart)
Dùng để vẽ biểu đồ đường (Line Chart) hoặc biểu đồ cột (Bar Chart) thể hiện doanh thu theo thời gian.

- **URL:** `GET /api/v1/statistics/revenue-chart`
- **Query Params:**
  - `type`: Loại biểu đồ. Giá trị: `MONTH` (Doanh thu các ngày trong tháng này), `YEAR` (Doanh thu các tháng trong năm nay).
- **Response `data`:**
```json
[
  { "label": "01/05", "value": 5000000 },
  { "label": "02/05", "value": 7500000 }
]
```

## 3. Biểu đồ Trạng thái Đơn hàng (Order Status Chart)
Dùng để vẽ biểu đồ tròn (Pie Chart/Doughnut Chart) hiển thị tỷ lệ các trạng thái đơn hàng trong 30 ngày gần nhất.

- **URL:** `GET /api/v1/statistics/order-status-chart`
- **Response `data`:**
```json
[
  { "status": "PENDING", "count": 20 },
  { "status": "COMPLETED", "count": 150 },
  { "status": "CANCELLED", "count": 5 }
]
```

## 4. Top Sản Phẩm Bán Chạy
Hiển thị danh sách/bảng các sản phẩm mang lại doanh thu cao nhất hoặc bán được số lượng nhiều nhất.

- **URL:** `GET /api/v1/statistics/top-products`
- **Query Params:**
  - `limit` (number, optional, default = 5): Số lượng sản phẩm muốn lấy.
- **Response `data`:**
```json
[
  {
    "productId": "uuid-...",
    "productName": "Áo Sơ Mi Nam",
    "totalSold": 345,
    "revenue": 56000000
  }
]
```

## 5. Cảnh báo Sản phẩm Sắp hết hàng (Low Stock)
Hiển thị danh sách các phân loại (variant) của sản phẩm có số lượng tồn kho chạm mức báo động.

- **URL:** `GET /api/v1/statistics/low-stock`
- **Query Params:**
  - `threshold` (number, optional, default = 10): Mức tồn kho tối đa để bị coi là sắp hết.
  - `limit` (number, optional, default = 10): Số lượng hiển thị.
- **Response `data`:**
```json
[
  {
    "productId": "uuid-...",
    "productDetailId": 12,
    "productName": "Áo Phông Thể Thao",
    "color": "Trắng",
    "size": "L",
    "stock": 3
  }
]
```

## 6. Top Khách Hàng Chi Tiêu Nhiều Nhất
Hiển thị bảng xếp hạng các khách hàng VIP của hệ thống.

- **URL:** `GET /api/v1/statistics/top-customers`
- **Query Params:**
  - `limit` (number, optional, default = 5).
- **Response `data`:**
```json
[
  {
    "userId": "uuid-...",
    "fullName": "Nguyễn Văn A",
    "email": "nva@gmail.com",
    "avatarUrl": "https://...",
    "totalSpent": 120000000,
    "totalOrders": 15
  }
]
```

---

## 🎨 Gợi ý Thiết Kế Giao Diện (UI/UX cho FE Agent)

Trang **Dashboard** nên được thiết kế theo dạng Grid (lưới) hiện đại, khoảng cách rộng rãi, sử dụng các components của Ant Design hoặc Tailwind:

1. **Header Control:** 
   - Có một dropdown/select box góc trên cùng để chọn `Period` (Hôm nay, Tuần này, Tháng này). Box này sẽ trigger việc gọi lại API `1. KPI`.

2. **Hàng 1: KPI Cards (Grid 3 cột)**
   - Sử dụng Card UI. Mỗi Card hiển thị: Icon (Ví tiền, Giỏ hàng, User), Giá trị lớn (format VNĐ cho revenue), và Badge thể hiện `% Trend` (Màu xanh lá có mũi tên đi lên nếu `UP`, màu đỏ mũi tên đi xuống nếu `DOWN`).

3. **Hàng 2: Biểu đồ (Grid 2 cột: 8 - 4 hoặc 7 - 5)**
   - **Cột trái (Lớn):** `Revenue Chart`. Có một Radio Button Group (Tháng / Năm) góc trên biểu đồ để switch `type`. Dùng thư viện Chart.js hoặc Recharts (Line hoặc Bar).
   - **Cột phải (Nhỏ):** `Order Status Chart`. Dùng Doughnut Chart, chú thích rõ ràng các màu sắc tương ứng với trạng thái (Ví dụ: Xanh lá = Completed, Đỏ = Cancelled, Vàng = Pending).

4. **Hàng 3: Các bảng dữ liệu Top (Grid 3 cột bằng nhau hoặc 1 hàng 2 cột, 1 hàng full width)**
   - Chứa 3 khối Card, bên trong là các Table thu gọn hoặc List:
     - **Top Products:** Bảng hiển thị Tên SP, Đã bán, Doanh thu.
     - **Low Stock Alerts:** Cần làm nổi bật (Ví dụ text màu đỏ hoặc badge đỏ) ở cột `stock`. Hiển thị Tên SP, Phân loại (Màu, Size) và Tồn kho.
     - **Top Customers:** Hiển thị Avatar (hình tròn nhỏ), Tên, Số đơn và Tổng chi tiêu.
