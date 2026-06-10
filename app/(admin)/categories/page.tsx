"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  message,
  Popconfirm,
  Tooltip,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from "@/types/category.types";
import { CategoryService } from "@/services/category.service";

export default function CategoriesPage() {
  // --- State ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form] = Form.useForm<CreateCategoryPayload>();

  const isEditing = !!editingCategory;

  // --- Fetch Data ---
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await CategoryService.getList();
      setCategories(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // --- Handlers ---
  const handleOpenCreate = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitLoading(true);

      if (isEditing && editingCategory) {
        const payload: UpdateCategoryPayload = {
          name: values.name,
          description: values.description,
        };
        await CategoryService.update(editingCategory.id, payload);
        message.success("Cập nhật danh mục thành công!");
      } else {
        await CategoryService.create(values);
        message.success("Tạo danh mục mới thành công!");
      }

      handleCloseModal();
      fetchCategories();
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await CategoryService.delete(id);
      message.success("Xóa danh mục thành công!");
      fetchCategories();
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  // --- Table Columns ---
  const columns: ColumnsType<Category> = [
    {
      title: "STT",
      key: "index",
      width: 70,
      align: "center",
      render: (_: unknown, __: Category, index: number) => (
        <span className="tw:text-slate-500 tw:font-medium">{index + 1}</span>
      ),
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (name: string) => (
        <span className="tw:font-semibold tw:text-slate-800">{name}</span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (desc: string) => (
        <span className="tw:text-slate-500">{desc || "—"}</span>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      align: "center",
      render: (_: unknown, record: Category) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleOpenEdit(record)}
              className="tw:text-blue-500 hover:tw:text-blue-600"
            />
          </Tooltip>
          <Popconfirm
            title="Xóa danh mục"
            description="Bạn có chắc chắn muốn xóa danh mục này?"
            icon={<ExclamationCircleFilled className="tw:text-red-500" />}
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Xóa">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="tw:flex tw:items-center tw:justify-between tw:mb-6">
        <div>
          <h1 className="tw:text-2xl tw:font-bold tw:text-slate-800 tw:m-0">
            Quản lý Danh mục
          </h1>
          <p className="tw:text-slate-500 tw:mt-1 tw:mb-0 tw:text-sm">
            Quản lý danh mục sản phẩm trong hệ thống.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
          size="large"
        >
          Thêm danh mục
        </Button>
      </div>

      {/* Table */}
      <Table<Category>
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
        pagination={false}
      />

      {/* Modal Create / Edit */}
      <Modal
        title={isEditing ? "Chỉnh sửa Danh mục" : "Thêm Danh mục mới"}
        open={modalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={handleSubmit}
          >
            {isEditing ? "Cập nhật" : "Tạo mới"}
          </Button>,
        ]}
        forceRender
        destroyOnHidden
      >
        <Form form={form} layout="vertical" className="tw:mt-4">
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[
              { required: true, message: "Vui lòng nhập tên danh mục!" },
              { max: 100, message: "Tên danh mục tối đa 100 ký tự!" },
            ]}
          >
            <Input placeholder="VD: Áo Thun, Quần Jean..." />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { max: 500, message: "Mô tả tối đa 500 ký tự!" },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Mô tả ngắn gọn về danh mục..."
              showCount
              maxLength={500}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
