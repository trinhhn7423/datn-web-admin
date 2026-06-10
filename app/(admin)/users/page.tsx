"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Tooltip,
  Popconfirm,
  Avatar,
  Card,
  Statistic,
  Drawer,
  Descriptions,
  message,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  HomeOutlined,
  WomanOutlined,
  ManOutlined,
  ClearOutlined,
  ExclamationCircleFilled,
  SafetyCertificateOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { User } from "@/types/user.types";
import { UserService } from "@/services/user.service";
import { debounce } from "lodash";

// Helper formats for VND
const formatVND = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

export default function UsersPage() {
  // --- States ---
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputSearchText, setInputSearchText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<number | undefined>(undefined);
  const [counters, setCounters] = useState({ total: 0, admins: 0, customers: 0 });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [total, setTotal] = useState(0);

  const [form] = Form.useForm();
  const isEditing = !!editingUser;

  // --- Fetch Data ---
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage,
        size: pageSize,
      };

      if (searchQuery) {
        if (searchQuery.trim().includes("@")) {
          params.email = searchQuery.trim();
        } else {
          params.fullName = searchQuery.trim();
        }
      }

      if (roleFilter !== undefined) {
        params.roleId = roleFilter;
      }

      const res = await UserService.getList(params);
      setUsers(res.items);
      setTotal(res.total);
    } catch (err: any) {
      message.error(err.message || "Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchQuery, roleFilter]);

  const fetchCounters = useCallback(async () => {
    try {
      const data = await UserService.getCounters();
      setCounters(data);
    } catch (err: any) {
      console.error("Lỗi tải thống kê người dùng:", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchCounters();
  }, [fetchUsers, fetchCounters]);

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
      }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // --- Handlers ---
  const handleResetFilters = () => {
    setInputSearchText("");
    setSearchQuery("");
    setRoleFilter(undefined);
    setCurrentPage(1);
    message.info("Đã đặt lại bộ lọc!");
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({
      roleId: 2, // Customer by default
      gender: "MALE",
      address: "",
    });
    setFormModalOpen(true);
  };

  const handleOpenEdit = (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingUser(user);
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      phone: user.addresses?.[0]?.receiverPhone || "",
      roleId: user.roleId,
      gender: "MALE",
      address: user.addresses?.[0]?.detailAddress || "",
    });
    setFormModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormModalOpen(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);

      if (isEditing && editingUser) {
        const payload: any = {
          fullName: values.fullName,
          email: values.email,
          roleId: values.roleId,
          phone: values.phone,
          address: values.address,
        };
        if (values.password) {
          payload.password = values.password;
        }
        await UserService.update(editingUser.id, payload);
        message.success("Cập nhật thông tin người dùng thành công!");
      } else {
        const payload = {
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          roleId: values.roleId,
          phone: values.phone,
          address: values.address,
          avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
            values.fullName
          )}`,
        };
        await UserService.create(payload);
        message.success("Thêm người dùng mới thành công!");
      }

      handleCloseModal();
      fetchUsers();
      fetchCounters();
    } catch (err: any) {
      message.error(err.message || "Có lỗi xảy ra khi xử lý dữ liệu");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await UserService.delete(id);
      message.success("Đã xóa người dùng thành công!");
      fetchUsers();
      fetchCounters();
      if (selectedUser?.id === id) {
        setDetailDrawerOpen(false);
      }
    } catch (err: any) {
      message.error(err.message || "Không thể xóa người dùng");
    }
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailDrawerOpen(true);
  };

  // --- Role Badge & Helper ---
  const getRoleTag = (roleId: number) => {
    switch (roleId) {
      case 1:
        return (
          <Tag color="volcano" className="tw:font-medium">
            Quản trị viên
          </Tag>
        );
      default:
        return (
          <Tag color="blue" className="tw:font-medium">
            Khách hàng
          </Tag>
        );
    }
  };

  // --- CLV Tier Helper ---
  const getClvTier = (spent: number) => {
    if (spent >= 25000000) return { name: "Platinum VIP", color: "gold" };
    if (spent >= 10000000) return { name: "Gold VIP", color: "purple" };
    if (spent >= 3000000) return { name: "Silver Member", color: "blue" };
    return { name: "Bronze Member", color: "default" };
  };

  // --- Table Columns Definition ---
  const columns: ColumnsType<User> = [
    {
      title: "Mã ND",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id: string) => (
        <span className="tw:font-mono tw:text-slate-500 tw:text-xs">
          {id ? id.slice(0, 8).toUpperCase() : "—"}
        </span>
      ),
    },
    {
      title: "Họ và tên / Email",
      key: "name_email",
      render: (_, record) => (
        <div className="tw:flex tw:items-center tw:gap-3">
          <Avatar
            src={record.avatarUrl || undefined}
            icon={<UserOutlined />}
            size="large"
            className="tw:bg-blue-50 tw:border tw:border-blue-100"
          />
          <div className="tw:flex tw:flex-col">
            <span className="tw:font-semibold tw:text-slate-800 tw:hover:text-blue-600 tw:cursor-pointer" onClick={() => handleViewDetails(record)}>
              {record.fullName}
            </span>
            <span className="tw:text-xs tw:text-slate-500">{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Số điện thoại",
      key: "phone",
      width: 130,
      render: (_, record) => (
        <span className="tw:text-slate-600 tw:font-medium">
          {record.addresses?.[0]?.receiverPhone || "—"}
        </span>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "roleId",
      key: "roleId",
      width: 130,
      filters: [
        { text: "Quản trị viên", value: 1 },
        { text: "Khách hàng", value: 2 },
      ],
      onFilter: (value, record) => record.roleId === value,
      render: (roleId: number) => getRoleTag(roleId),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date: string) => (
        <span className="tw:text-slate-500 tw:text-xs">
          {dayjs(date).format("HH:mm DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
              className="tw:text-slate-500 hover:tw:bg-slate-100 hover:tw:text-slate-800"
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(e) => handleOpenEdit(record, e)}
              className="tw:text-blue-500 hover:tw:bg-blue-50 hover:tw:text-blue-600"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xóa người dùng"
              description="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?"
              icon={<ExclamationCircleFilled className="tw:text-red-500" />}
              onConfirm={(e) => handleDelete(record.id, e as any)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                className="hover:tw:bg-red-50"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="tw:flex tw:flex-col tw:gap-6">
      {/* Header section */}
      <div>
        <h1 className="tw:text-3xl tw:font-extrabold tw:text-slate-900 tw:m-0">
          Quản lý Người dùng
        </h1>
        <p className="tw:text-slate-500 tw:mt-1 tw:mb-0 tw:text-sm">
          Danh sách tài khoản hệ thống, phân quyền và giám sát hoạt động.
        </p>
      </div>

      {/* Row 1: Quick Stats KPIs */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="tw:rounded-2xl tw:shadow-sm tw:border-slate-100 hover:tw:shadow-md tw:transition-all">
            <Statistic
              title={<span className="tw:text-slate-400 tw:text-xs tw:font-semibold">Tổng tài khoản</span>}
              value={counters.total}
              prefix={<UserOutlined className="tw:text-blue-500 tw:mr-2" />}
              styles={{ content: { fontSize: "24px", fontWeight: "800", color: "#1e293b" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="tw:rounded-2xl tw:shadow-sm tw:border-slate-100 hover:tw:shadow-md tw:transition-all">
            <Statistic
              title={<span className="tw:text-slate-400 tw:text-xs tw:font-semibold">Quản trị viên</span>}
              value={counters.admins}
              prefix={<SafetyCertificateOutlined className="tw:text-purple-500 tw:mr-2" />}
              styles={{ content: { fontSize: "24px", fontWeight: "800", color: "#8b5cf6" } }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="tw:rounded-2xl tw:shadow-sm tw:border-slate-100 hover:tw:shadow-md tw:transition-all">
            <Statistic
              title={<span className="tw:text-slate-400 tw:text-xs tw:font-semibold">Khách hàng</span>}
              value={counters.customers}
              prefix={<ShoppingCartOutlined className="tw:text-amber-500 tw:mr-2" />}
              styles={{ content: { fontSize: "24px", fontWeight: "800", color: "#f59e0b" } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 2: Search & Filter Panel */}
      <Card className="tw:rounded-2xl tw:shadow-sm tw:border-slate-100 tw:bg-slate-50/50" styles={{ body: { padding: "16px 24px" } }}>
        <div className="tw:flex tw:flex-col tw:lg:flex-row tw:lg:items-center tw:justify-between tw:gap-4">
          {/* Filters on Left */}
          <Space wrap size="middle" className="tw:w-full tw:lg:w-auto">
            <Input
              placeholder="Tìm theo tên hoặc email..."
              prefix={<SearchOutlined className="tw:text-slate-400" />}
              value={inputSearchText}
              onChange={(e) => {
                const val = e.target.value;
                setInputSearchText(val);
                debouncedSearch(val);
              }}
              style={{ width: 280 }}
              className="tw:h-10 tw:rounded-xl"
              allowClear
            />
            <Select
              placeholder="Lọc vai trò"
              value={roleFilter}
              onChange={(val) => {
                setRoleFilter(val);
                setCurrentPage(1);
              }}
              style={{ width: 180 }}
              className="tw:h-10"
              allowClear
              options={[
                { value: 1, label: "Quản trị viên" },
                { value: 2, label: "Khách hàng" },
              ]}
            />
            {(inputSearchText || roleFilter !== undefined) && (
              <Button
                type="text"
                danger
                icon={<ClearOutlined />}
                onClick={handleResetFilters}
                className="tw:font-medium tw:h-10 tw:flex tw:items-center"
              >
                Đặt lại
              </Button>
            )}
          </Space>

          {/* Action and Count on Right */}
          <Space size="large" className="tw:w-full tw:lg:w-auto tw:justify-between tw:lg:justify-end">
            <div className="tw:text-xs tw:text-slate-400 tw:font-medium">
              Hiển thị {users.length} trên tổng số {total} người dùng
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              size="large"
              className="tw:bg-blue-600 hover:tw:bg-blue-700 tw:h-10 tw:font-medium tw:rounded-xl tw:flex tw:items-center"
            >
              Thêm người dùng mới
            </Button>
          </Space>
        </div>
      </Card>

      {/* Row 3: Users Table */}
      <div className="tw:bg-white tw:rounded-2xl tw:shadow-sm tw:border tw:border-slate-100 tw:overflow-hidden">
        <Table<User>
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
            onChange: (page, size) => {
              setCurrentPage(page);
              if (size) setPageSize(size);
            },
            className: "tw:px-6 tw:py-4",
          }}
          className="tw:w-full"
          rowClassName="tw:hover:bg-slate-50/50 tw:transition-colors"
        />
      </div>

      {/* Modal: Create or Edit User */}
      <Modal
        title={
          <span className="tw:text-lg tw:font-bold tw:text-slate-800">
            {isEditing ? `Chỉnh sửa: ${editingUser?.fullName}` : "Thêm người dùng mới"}
          </span>
        }
        open={formModalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal} className="tw:rounded-lg">
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={handleSubmit}
            className="tw:bg-blue-600 hover:tw:bg-blue-700 tw:rounded-lg tw:font-medium"
          >
            {isEditing ? "Lưu thay đổi" : "Thêm mới"}
          </Button>,
        ]}
        forceRender
        destroyOnHidden
        width={640}
      >
        <Form form={form} layout="vertical" className="tw:mt-4">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[
                  { required: true, message: "Vui lòng nhập họ tên người dùng!" },
                  { min: 3, message: "Họ và tên tối thiểu 3 ký tự!" },
                ]}
              >
                <Input placeholder="VD: Nguyễn Văn A" className="tw:h-10 tw:rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Địa chỉ Email"
                rules={[
                  { required: true, message: "Vui lòng nhập địa chỉ email!" },
                  { type: "email", message: "Email không đúng định dạng!" },
                ]}
              >
                <Input placeholder="VD: email@example.com" className="tw:h-10 tw:rounded-lg" disabled={isEditing} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="password"
                label={isEditing ? "Mật khẩu mới (Bỏ trống nếu không đổi)" : "Mật khẩu ban đầu"}
                rules={[
                  { required: !isEditing, message: "Vui lòng nhập mật khẩu!" },
                  { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
                ]}
              >
                <Input.Password placeholder="Mật khẩu tối thiểu 6 ký tự" className="tw:h-10 tw:rounded-lg" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  { pattern: /^[0-9]{10}$/, message: "Số điện thoại phải gồm 10 chữ số!" },
                ]}
              >
                <Input placeholder="VD: 0987654321" className="tw:h-10 tw:rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
                <Select className="tw:h-10">
                  <Select.Option value="MALE">Nam</Select.Option>
                  <Select.Option value="FEMALE">Nữ</Select.Option>
                  <Select.Option value="OTHER">Khác</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="roleId" label="Vai trò hệ thống" rules={[{ required: true }]}>
                <Select className="tw:h-10">
                  <Select.Option value={1}>Quản trị viên (Admin)</Select.Option>
                  <Select.Option value={2}>Khách hàng (Customer)</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Địa chỉ thường trú"
            rules={[{ required: true, message: "Vui lòng điền địa chỉ!" }]}
          >
            <Input placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố" className="tw:h-10 tw:rounded-lg" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Drawer: Detailed User Profile Viewer */}
      <Drawer
        title={
          <div className="tw:flex tw:items-center tw:gap-3">
            <Avatar src={selectedUser?.avatarUrl || undefined} icon={<UserOutlined />} size="large" />
            <div className="tw:flex tw:flex-col">
              <span className="tw:font-bold tw:text-slate-800">{selectedUser?.fullName}</span>
              <span className="tw:text-xs tw:text-slate-500 tw:font-mono">
                {selectedUser?.id ? selectedUser.id.slice(0, 8).toUpperCase() : ""}
              </span>
            </div>
          </div>
        }
        placement="right"
        size={500}
        onClose={() => setDetailDrawerOpen(false)}
        open={detailDrawerOpen}
        extra={
          <Button
            type="primary"
            onClick={(e) => {
              if (selectedUser) {
                setDetailDrawerOpen(false);
                handleOpenEdit(selectedUser, e);
              }
            }}
            icon={<EditOutlined />}
            className="tw:bg-blue-600 hover:tw:bg-blue-700"
          >
            Chỉnh sửa
          </Button>
        }
      >
        {selectedUser && (
          <div className="tw:flex tw:flex-col tw:gap-6">
            <div>
              <h3 className="tw:text-sm tw:font-bold tw:text-slate-800 tw:mb-3 tw:uppercase tw:tracking-wider">
                Thông tin cơ bản
              </h3>
              <Descriptions column={1} bordered size="small" labelStyle={{ width: "140px", fontWeight: "600", color: "#475569" }}>
                <Descriptions.Item label="Họ và tên">{selectedUser.fullName}</Descriptions.Item>
                <Descriptions.Item label="Email">
                  <div className="tw:flex tw:items-center tw:gap-2">
                    <MailOutlined className="tw:text-slate-400" />
                    <span>{selectedUser.email}</span>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  <div className="tw:flex tw:items-center tw:gap-2">
                    <PhoneOutlined className="tw:text-slate-400" />
                    <span>{selectedUser.addresses?.[0]?.receiverPhone || "—"}</span>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                  <div className="tw:flex tw:items-center tw:gap-2">
                    <ManOutlined className="tw:text-blue-500" />
                    <span>Nam</span>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">
                  <div className="tw:flex tw:items-start tw:gap-2">
                    <HomeOutlined className="tw:text-slate-400 tw:mt-1" />
                    <span>{selectedUser.addresses?.[0]?.detailAddress || "—"}</span>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày gia nhập">
                  <div className="tw:flex tw:items-center tw:gap-2">
                    <CalendarOutlined className="tw:text-slate-400" />
                    <span>{dayjs(selectedUser.createdAt).format("HH:mm - DD/MM/YYYY")}</span>
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div>
              <h3 className="tw:text-sm tw:font-bold tw:text-slate-800 tw:mb-3 tw:uppercase tw:tracking-wider">
                Phân quyền tài khoản
              </h3>
              <Descriptions column={1} bordered size="small" labelStyle={{ width: "140px", fontWeight: "600", color: "#475569" }}>
                <Descriptions.Item label="Vai trò">{getRoleTag(selectedUser.roleId)}</Descriptions.Item>
              </Descriptions>
            </div>

            {selectedUser.roleId === 2 && (
              <div>
                <h3 className="tw:text-sm tw:font-bold tw:text-slate-800 tw:mb-3 tw:uppercase tw:tracking-wider">
                  Thống kê mua hàng (Khách hàng)
                </h3>
                <Descriptions column={1} bordered size="small" labelStyle={{ width: "140px", fontWeight: "600", color: "#475569" }}>
                  <Descriptions.Item label="Hạng thành viên">
                    {getClvTier(0).name === "Bronze Member" ? (
                      <Tag>{getClvTier(0).name}</Tag>
                    ) : (
                      <Tag color={getClvTier(0).color}>
                        {getClvTier(0).name}
                      </Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng số đơn mua">
                    <span className="tw:font-bold tw:text-slate-800">{selectedUser.viewsCount ?? 0} đơn hàng</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng chi tiêu">
                    <span className="tw:font-bold tw:text-green-600">
                      {formatVND(0)}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Giá trị đơn trung bình">
                    <span className="tw:text-slate-600 tw:font-medium">
                      0 đ
                    </span>
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}

            <div className="tw:mt-4 tw:flex tw:justify-end">
              <Popconfirm
                title="Xóa vĩnh viễn tài khoản?"
                description="Hành động này sẽ xóa hoàn toàn thông tin người dùng khỏi hệ thống."
                onConfirm={() => handleDelete(selectedUser.id)}
                okText="Xóa tài khoản"
                cancelText="Hủy"
                okButtonProps={{ danger: true }}
              >
                <Button type="primary" danger icon={<DeleteOutlined />}>
                  Xóa tài khoản này
                </Button>
              </Popconfirm>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}




