# Antigravity Developer Skill & Project Guidelines

This file defines the strict coding standards and architectural rules for the `datn-web-admin` project. Cần tuân thủ tuyệt đối các quy tắc này trong quá trình gen code.

## 1. Type Safety & Type Directory (TypeScript)
- **STRICT TYPING**: Bắt buộc viết code TypeScript định nghĩa kiểu dữ liệu rõ ràng.
- **NO `any`**: Tuyệt đối **KHÔNG SỬ DỤNG `any`**. Phải tự tạo `interface` hoặc `type` đầy đủ cho các parameters, function returns, request payloads và response models.
- **`types/` Folder**: TẤT CẢ các file định nghĩa kiểu dữ liệu (như `api.types.ts`, `auth.types.ts`, `user.types.ts`) PHẢI được tạo và quản lý tập trung tại thư mục `types/`. Không khai báo rải rác trong file logic.

## 2. Tầng Service (API Call Logic)
- **Logic gọi API**: Mọi logic gọi API phải được viết trong tầng Service, đặt tại thư mục `services/` (ví dụ: `services/auth.service.ts`, `services/user.service.ts`).
- **Tầng UI (Components/Pages)**: Chỉ được phép gọi các hàm từ Service, tuyệt đối không gọi trực tiếp Axios hay Fetch trong các component giao diện.

## 3. Global State (Zustand)
- Các biến trạng thái dùng chung toàn cục (Global State) phải được khai báo và quản lý bằng thư viện **Zustand**.
- Mã nguồn store được đặt tại thư mục `store/` (ví dụ: `store/useAuthStore.ts`).

## 4. API Configuration & Networking
- **API Endpoints**: Toàn bộ đường dẫn API phải được khai báo tập trung dưới dạng object/class tại file `configs/api.config.ts`. Không hardcode chuỗi URL rải rác trong code.
- **Axios Client**: Bắt buộc sử dụng `axiosClient` đã được config sẵn (`import axiosClient from "@/utils/axiosClient"`) để gọi API. Không dùng `fetch` hay khởi tạo `axios` mới để đảm bảo tính nhất quán của Interceptors (bắt lỗi, bóc tách data, gắn token).

## 5. Routing Configuration (App Router)
- **Khai báo Route**: Mọi đường dẫn (URL) của ứng dụng phải được định nghĩa tập trung tại file `configs/routes.ts`. Không sử dụng chuỗi string URL trực tiếp trong các component (như `<Link href="/dashboard">`), thay vào đó phải dùng `routes.dashboard`.
- **Cấu trúc Folder Admin**: Các trang thuộc quản trị phải nằm trong Route Group `(admin)` (đường dẫn `app/(admin)/*`). 
- **Giải thích Router**: 
  - `app/(admin)/layout.tsx`: Chứa layout chung cho Admin (Sidebar, Header).
  - Khi tạo trang mới (ví dụ Quản lý sản phẩm), phải tạo folder `app/(admin)/products/page.tsx` và cập nhật đường dẫn vào `configs/routes.ts`.

## 6. UI Components & Styling (Ant Design + Tailwind CSS v4)
- **Ant Design (antd)**: Bắt buộc ưu tiên tối đa việc sử dụng các component của thư viện `antd` (như Table, Form, Input, Button, Modal, Select...) thay vì code lại từ đầu bằng HTML thuần, nhằm đảm bảo UI đồng nhất và chuẩn mực.
- **Prefix Tailwind `tw:`**: Dự án này config Tailwind dùng prefix `tw:`. Mọi class của Tailwind **BẮT BUỘC** phải có tiền tố này để tránh xung đột CSS với Ant Design.
  - Vị dụ đúng: `<Button className="tw:bg-blue-500 tw:w-full">`
  - Ví dụ sai: `<Button className="bg-blue-500 w-full">`

## 7. UI/UX & Form Validation (Admin Role)
- **Admin-Grade Design**: Giao diện phải chuyên nghiệp, sang trọng, có tính thống nhất cao, chuẩn mực cho một Dashboard Quản trị hệ thống. Kết hợp khéo léo giữa Ant Design component và các utility của Tailwind (như spacing, shadow, border radius).
- **Validation**: Các form nhập liệu phải được Validate chặt chẽ và đầy đủ ở phía Client trước khi gửi request.
  - Sử dụng hệ thống `rules` tích hợp sẵn của Ant Design `<Form.Item>` để kiểm tra: định dạng email, độ dài mật khẩu, field bắt buộc, v.v.
  - Cung cấp message lỗi rõ ràng bằng tiếng Việt cho người dùng (ví dụ: "Vui lòng nhập Email hợp lệ!").

## 8. Workflow & Planning
- **Plan First**: Trước khi bắt đầu viết code cho bất kỳ tính năng hoặc sửa lỗi phức tạp nào, Agent **BẮT BUỘC** phải trình bày một bản kế hoạch (Implementation Plan) chi tiết.
- **Approval Required**: Bản kế hoạch phải được người dùng (USER) đồng ý trước khi Agent bắt đầu thực hiện các thay đổi trong mã nguồn. Điều này giúp đảm bảo sự thống nhất về giải pháp trước khi triển khai.
