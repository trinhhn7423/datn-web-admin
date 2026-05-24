"use client";

import React, { useState, useMemo } from "react";
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
  Badge,
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

// Helper formats for VND
const formatVND = (value: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

// Interface representing a User
interface MockUser {
  id: string;
  fullName: string;
  email: string;
  roleId: number; // 1 = Admin, 2 = Customer
  phone: string;
  status: "ACTIVE";
  createdAt: string;
  avatarUrl?: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  address: string;
  totalOrders: number;
  totalSpent: number;
}

const INITIAL_USERS: MockUser[] = [
  {
    id: "USR-001",
    fullName: "Nguyễn Văn Anh",
    email: "anh.nguyen@gmail.com",
    roleId: 1, // Admin
    phone: "0987654321",
    status: "ACTIVE",
    createdAt: "2026-01-15T08:30:00Z",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=anh",
    gender: "MALE",
    address: "123 Cầu Giấy, Hà Nội",
    totalOrders: 15,
    totalSpent: 12450000,
  },
  {
    id: "USR-002",
    fullName: "Trần Thị Bình",
    email: "binh.tran@gmail.com",
    roleId: 2, // Customer
    phone: "0912345678",
    status: "ACTIVE",
    createdAt: "2026-02-20T10:15:00Z",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=binh",
    gender: "FEMALE",
    address: "456 Lê Lợi, Quận 1, TP. Hồ Chí Minh",
    totalOrders: 8,
    totalSpent: 4200000,
  },
  {
    id: "USR-003",
    fullName: "Phạm Minh Cường",
    email: "cuong.pham@gmail.com",
    roleId: 2, // Customer
    phone: "0909090909",
    status: "ACTIVE",
    createdAt: "2026-03-05T14:45:00Z",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=cuong",
    gender: "MALE",
    address: "789 Nguyễn Văn Linh, Đà Nẵng",
    totalOrders: 23,
    totalSpent: 35600000,
  },
  {
    id: "USR-004",
    fullName: "Lê Hoàng Duy",
    email: "duy.le@gmail.com",
    roleId: 2, // Customer
    phone: "0944556677",
    status: "ACTIVE",
    createdAt: "2026-03-12T09:00:00Z",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=duy",
    gender: "MALE",
    address: "101 Trần Hưng Đạo, Cần Thơ",
    totalOrders: 3,
    totalSpent: 1550000,
  },
  {
    id: "USR-005",
    fullName: "Vũ Thị Mai",
    email: "mai.vu@gmail.com",
    roleId: 2, // Customer
    phone: "0966778899",
    status: "ACTIVE",
    createdAt: "2026-04-18T16:20:00Z",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=mai",
    gender: "FEMALE",
    address: "202 Quang Trung, Hải Phòng",
    totalOrders: 12,
    totalSpent: 8900000,
  },
  {
    id: "USR-006",
    fullName: "Đỗ Anh Tuấn",
    email: "tuan.do@gmail.com",
    roleId: 2, // Customer
    phone: "0977889900",
    status: "ACTIVE",
    createdAt: "2026-05-02T11:10:00Z",
    avatarUrl: "https://api.dicebear.com/7.x/adventurer/svg?seed=tuan",
    gender: "MALE",
    address: "303 Hùng Vương, Nha Trang",
    totalOrders: 0,
    totalSpent: 0,
  },
];

export default function UsersPage() {
  // --- States ---
  const [users, setUsers] = useState<MockUser[]>(INITIAL_USERS);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState<number | undefined>(undefined);

  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<MockUser | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm();

  const isEditing = !!editingUser;

  // --- KPI Calculation ---
  const kpis = useMemo(() => {
    const total = users.length;
    const admins = users.filter((u) => u.roleId === 1).length;
    const customers = users.filter((u) => u.roleId === 2).length;

    return { total, admins, customers };
  }, [users]);

  // --- Search & Filter Logic ---
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        u.email.toLowerCase().includes(searchText.toLowerCase()) ||
        u.phone.includes(searchText) ||
        u.id.toLowerCase().includes(searchText.toLowerCase());

      const matchRole = roleFilter === undefined || u.roleId === roleFilter;

      return matchSearch && matchRole;
    });
  }, [users, searchText, roleFilter]);

  // --- Handlers ---
  const handleResetFilters = () => {
    setSearchText("");
    setRoleFilter(undefined);
    message.info("Đã đặt lại bộ lọc!");
  };

  const handleOpenCreate = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({
      roleId: 2, // Customer by default
      gender: "MALE",
      address: "",
      totalOrders: 0,
      totalSpent: 0,
    });
    setFormModalOpen(true);
  };

  const handleOpenEdit = (user: MockUser, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingUser(user);
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      roleId: user.roleId,
      gender: user.gender,
      address: user.address,
      totalOrders: user.totalOrders,
      totalSpent: user.totalSpent,
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

      // Simulate a small delay for premium feel
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (isEditing && editingUser) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === editingUser.id
              ? {
                  ...u,
                  fullName: values.fullName,
                  email: values.email,
                  phone: values.phone,
                  roleId: values.roleId,
                  gender: values.gender,
                  address: values.address,
                  totalOrders: values.totalOrders,
                  totalSpent: values.totalSpent,
                  avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
                    values.fullName
                  )}`,
                }
              : u
          )
        );
        message.success("Cập nhật thông tin người dùng thành công!");
      } else {
        const newUser: MockUser = {
          id: `USR-${Math.floor(100 + Math.random() * 900)}`,
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          roleId: values.roleId,
          status: "ACTIVE",
          gender: values.gender,
          address: values.address,
          createdAt: dayjs().toISOString(),
          avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
            values.fullName
          )}`,
          totalOrders: values.totalOrders || 0,
          totalSpent: values.totalSpent || 0,
        };
        setUsers((prev) => [newUser, ...prev]);
        message.success("Thêm người dùng mới thành công!");
      }

      handleCloseModal();
    } catch (err) {
      console.error("Form Validation Error:", err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setUsers((prev) => prev.filter((u) => u.id !== id));
    message.success("Đã xóa người dùng thành công!");
    if (selectedUser?.id === id) {
      setDetailDrawerOpen(false);
    }
  };

  const handleViewDetails = (user: MockUser) => {
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
  const columns: ColumnsType<MockUser> = [
    {
      title: "Mã ND",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id: string) => (
        <span className="tw:font-mono tw:text-slate-500 tw:text-xs">{id}</span>
      ),
    },
    {
      title: "Họ và tên / Email",
      key: "name_email",
      render: (_, record) => (
        <div className="tw:flex tw:items-center tw:gap-3">
          <Avatar
            src={record.avatarUrl}
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
      dataIndex: "phone",
      key: "phone",
      width: 130,
      render: (phone: string) => (
        <span className="tw:text-slate-600 tw:font-medium">{phone || "—"}</span>
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
              value={kpis.total}
              prefix={<UserOutlined className="tw:text-blue-500 tw:mr-2" />}
              valueStyle={{ fontSize: "24px", fontWeight: "800", color: "#1e293b" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="tw:rounded-2xl tw:shadow-sm tw:border-slate-100 hover:tw:shadow-md tw:transition-all">
            <Statistic
              title={<span className="tw:text-slate-400 tw:text-xs tw:font-semibold">Quản trị viên</span>}
              value={kpis.admins}
              prefix={<SafetyCertificateOutlined className="tw:text-purple-500 tw:mr-2" />}
              valueStyle={{ fontSize: "24px", fontWeight: "800", color: "#8b5cf6" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="tw:rounded-2xl tw:shadow-sm tw:border-slate-100 hover:tw:shadow-md tw:transition-all">
            <Statistic
              title={<span className="tw:text-slate-400 tw:text-xs tw:font-semibold">Khách hàng</span>}
              value={kpis.customers}
              prefix={<ShoppingCartOutlined className="tw:text-amber-500 tw:mr-2" />}
              valueStyle={{ fontSize: "24px", fontWeight: "800", color: "#f59e0b" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Row 2: Search & Filter Panel */}
      <Card className="tw:rounded-2xl tw:shadow-sm tw:border-slate-100 tw:bg-slate-50/50" bodyStyle={{ padding: "16px 24px" }}>
        <div className="tw:flex tw:flex-col lg:tw:flex-row lg:tw:items-center tw:justify-between tw:gap-4">
          {/* Filters on Left */}
          <Space wrap size="middle" className="tw:w-full lg:tw:w-auto">
            <Input
              placeholder="Tìm theo tên, email, SĐT hoặc mã..."
              prefix={<SearchOutlined className="tw:text-slate-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
              className="tw:h-10 tw:rounded-xl"
              allowClear
            />
            <Select
              placeholder="Lọc vai trò"
              value={roleFilter}
              onChange={setRoleFilter}
              style={{ width: 180 }}
              className="tw:h-10"
              allowClear
              options={[
                { value: 1, label: "Quản trị viên" },
                { value: 2, label: "Khách hàng" },
              ]}
            />
            {(searchText || roleFilter !== undefined) && (
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
          <Space size="large" className="tw:w-full lg:tw:w-auto tw:justify-between lg:tw:justify-end">
            <div className="tw:text-xs tw:text-slate-400 tw:font-medium">
              Hiển thị {filteredUsers.length} trên tổng số {users.length} người dùng
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
        <Table<MockUser>
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            pageSizeOptions: ["5", "10", "20"],
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
        destroyOnClose
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
                <Input placeholder="VD: email@example.com" className="tw:h-10 tw:rounded-lg" />
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

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="totalOrders" label="Số đơn hàng (Lịch sử)">
                <Input type="number" min={0} className="tw:h-10 tw:rounded-lg" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="totalSpent" label="Tổng chi tiêu (VND)">
                <Input type="number" min={0} className="tw:h-10 tw:rounded-lg" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Drawer: Detailed User Profile Viewer */}
      <Drawer
        title={
          <div className="tw:flex tw:items-center tw:gap-3">
            <Avatar src={selectedUser?.avatarUrl} icon={<UserOutlined />} size="large" />
            <div className="tw:flex tw:flex-col">
              <span className="tw:font-bold tw:text-slate-800">{selectedUser?.fullName}</span>
              <span className="tw:text-xs tw:text-slate-500 tw:font-mono">{selectedUser?.id}</span>
            </div>
          </div>
        }
        placement="right"
        width={500}
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
                    <span>{selectedUser.phone}</span>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                  <div className="tw:flex tw:items-center tw:gap-2">
                    {selectedUser.gender === "MALE" ? (
                      <>
                        <ManOutlined className="tw:text-blue-500" />
                        <span>Nam</span>
                      </>
                    ) : selectedUser.gender === "FEMALE" ? (
                      <>
                        <WomanOutlined className="tw:text-pink-500" />
                        <span>Nữ</span>
                      </>
                    ) : (
                      <span>Khác</span>
                    )}
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">
                  <div className="tw:flex tw:items-start tw:gap-2">
                    <HomeOutlined className="tw:text-slate-400 tw:mt-1" />
                    <span>{selectedUser.address}</span>
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
                    {getClvTier(selectedUser.totalSpent).name === "Bronze Member" ? (
                      <Tag>{getClvTier(selectedUser.totalSpent).name}</Tag>
                    ) : (
                      <Tag color={getClvTier(selectedUser.totalSpent).color}>
                        {getClvTier(selectedUser.totalSpent).name}
                      </Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng số đơn mua">
                    <span className="tw:font-bold tw:text-slate-800">{selectedUser.totalOrders} đơn hàng</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng chi tiêu">
                    <span className="tw:font-bold tw:text-green-600">
                      {formatVND(selectedUser.totalSpent)}
                    </span>
                  </Descriptions.Item>
                  <Descriptions.Item label="Giá trị đơn trung bình">
                    <span className="tw:text-slate-600 tw:font-medium">
                      {selectedUser.totalOrders > 0
                        ? formatVND(Math.round(selectedUser.totalSpent / selectedUser.totalOrders))
                        : "0 đ"}
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




