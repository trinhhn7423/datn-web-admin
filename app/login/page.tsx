
"use client";

import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AuthService } from "@/services/auth.service";
import { useAuthStore } from "@/store/useAuthStore";
import { setCookie } from "cookies-next";
import { LoginPayload } from "@/types/auth.types";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const onFinish = async (values: LoginPayload) => {
    try {
      setLoading(true);
      // Gọi tầng Service, chỉ nhận lại data sạch (hoặc sẽ bị ném xuống catch nếu lỗi)
      const data = await AuthService.adminLogin({
        email: values.email,
        password: values.password,
      });

      const { accessToken, refreshToken, user } = data;
      setAuth(user, accessToken, refreshToken);

      // Lưu token vào cookie để middleware có thể đọc được
      setCookie("auth-token", accessToken, { maxAge: 86400, path: "/" }); // 1 ngày
      message.success("Đăng nhập thành công!");

      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get("callbackUrl") || "/dashboard";
      router.push(callbackUrl);
    } catch (error: unknown) {
      // Nhận message tiếng Việt đã được chuẩn hóa từ Service
      if (error instanceof Error) {
        message.error(error.message);
      } else {
        message.error("Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tw:min-h-screen tw:flex tw:items-center tw:justify-center tw:bg-slate-100 tw:p-4">
      <div className="tw:max-w-md tw:w-full tw:bg-white tw:rounded-3xl tw:shadow-2xl tw:overflow-hidden tw:border tw:border-slate-100">
        {/* Header / Logo section */}
        <div className="tw:bg-slate-900 tw:px-10 tw:py-12 tw:text-center tw:relative tw:overflow-hidden">
          {/* Decorative background elements */}
          <div
            className="tw:absolute tw:top-0 tw:left-0 tw:w-full tw:h-full tw:opacity-10 tw:pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at center, #ffffff 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          ></div>

          <div className="tw:flex tw:justify-center tw:mb-6 tw:relative tw:z-10">
            <div className="tw:relative tw:w-28 tw:h-28 tw:rounded-full tw:bg-white tw:p-1 tw:shadow-2xl tw:border-4 tw:border-slate-700">
              <div className="tw:relative tw:w-full tw:h-full tw:rounded-full tw:overflow-hidden tw:bg-white tw:flex tw:items-center tw:justify-center">
                <Image
                  src="/logo.png"
                  alt="TH-STORE Logo"
                  fill
                  className="tw:object-contain tw:object-center tw:p-2"
                  priority
                  unoptimized={true}
                />
              </div>
            </div>
          </div>
          <h1 className="tw:text-3xl tw:font-bold tw:text-white tw:mb-3 tw:relative tw:z-10 tw:tracking-tight">
            TH-STORE
          </h1>
          <p className="tw:text-slate-300 tw:text-sm tw:font-medium tw:relative tw:z-10">
            Hệ thống Quản trị Viên mock
          </p>
        </div>

        {/* Login Form */}
        <div className="tw:px-10 tw:py-10">
          <Form
            name="admin_login"
            onFinish={onFinish}
            onFinishFailed={(errorInfo) => {
              console.log("Validation Failed:", errorInfo);
            }}
            layout="vertical"
            requiredMark={false}
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập Email!" },
                { type: "email", message: "Email không đúng định dạng!" },
              ]}
              className="tw:mb-5"
            >
              <Input
                prefix={<UserOutlined className="tw:text-slate-400 tw:mr-2" />}
                placeholder="admin@th-store.com"
                className="tw:rounded-xl tw:px-4 tw:py-3 tw:text-base tw:bg-slate-50 hover:tw:bg-white focus:tw:bg-white tw:border-slate-200"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập Mật khẩu!" },
                { min: 6, message: "Mật khẩu phải dài ít nhất 6 ký tự!" },
              ]}
              className="tw:mb-8"
            >
              <Input.Password
                prefix={<LockOutlined className="tw:text-slate-400 tw:mr-2" />}
                placeholder="Mật khẩu"
                className="tw:rounded-xl tw:px-4 tw:py-3 tw:text-base tw:bg-slate-50 hover:tw:bg-white focus:tw:bg-white tw:border-slate-200"
              />
            </Form.Item>

            <Form.Item className="tw:mb-0">
              <Button
                htmlType="submit"
                loading={loading}
                rootClassName="tw:w-full tw:rounded-xl tw:h-14 tw:text-base tw:font-semibold tw:shadow-lg tw:border-0"
                style={{
                  backgroundColor: "#0f172a", // Màu chuẩn của slate-900
                  color: "#ffffff", // Chữ màu trắng
                }}
              >
                Đăng Nhập Quản Trị
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}
