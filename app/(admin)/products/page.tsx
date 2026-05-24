"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Table,
  Button,
  Input,
  Select,
  Switch,
  Tag,
  Space,
  Image,
  message,
  Popconfirm,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  ReloadOutlined,
  ShoppingOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { Tooltip } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { debounce } from "lodash";
import { Product, ProductListParams } from "@/types/product.types";
import { Category } from "@/types/category.types";
import { ProductService } from "@/services/product.service";
import { CategoryService } from "@/services/category.service";
import ProductFormModal from "./components/ProductFormModal";

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "true", label: "Đang bán" },
  { value: "false", label: "Đã ẩn" },
];

export default function ProductsPage() {
  // --- State ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // Filters & Pagination
  const [params, setParams] = useState<ProductListParams>({
    page: 1,
    size: 10,
  });
  const [searchName, setSearchName] = useState("");

  // Chuyển đổi categories thành options cho Select
  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  // --- Fetch Data ---
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const result = await ProductService.getList(params);
      console.log(result);
      setProducts(result.items);
      setTotal(result.total);
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [params]);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await CategoryService.getList();
      setCategories(data);
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // --- Debounced Search ---
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setParams((prev) => ({ ...prev, page: 1, name: value || undefined }));
      }, 500),
    [],
  );

  // Cleanup debounce khi unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSearchChange = (value: string) => {
    setSearchName(value);
    debouncedSearch(value);
  };

  const handleCategoryFilter = (value?: number | null) => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      categoryId: value ?? undefined,
    }));
  };

  const handleStatusFilter = (value: string) => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      isPublished: value === "all" ? undefined : value === "true",
    }));
  };

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setParams((prev) => ({
      ...prev,
      page: pagination.current ?? 1,
      size: pagination.pageSize ?? 10,
    }));
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      await ProductService.toggleStatus(product.id, {
        isPublished: !product.isPublished,
      });
      message.success(
        product.isPublished ? "Đã ẩn sản phẩm" : "Đã hiển thị sản phẩm",
      );
      fetchProducts();
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleOpenEdit = async (product: Product) => {
    try {
      // Fetch chi tiết đầy đủ (bao gồm details & images)
      const detail = await ProductService.getDetail(product.id);
      setEditingProduct(detail);
      setModalOpen(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  const handleReset = () => {
    setSearchName("");
    debouncedSearch.cancel();
    setParams({ page: 1, size: 10 });
  };
  // --- Table Columns ---
  const columns: ColumnsType<Product> = [
    {
      title: "Sản phẩm",
      key: "productInfo",
      render: (_: any, record: Product) => (
        <Space size="middle">
          {/*  */}
          <div className="tw:relative tw:w-16 tw:h-16 tw:rounded-xl tw:overflow-hidden tw:border tw:border-slate-100 tw:shadow-sm">
            {record.images && record.images.length > 0 ? (
              <div>
                <Image
                  src={record.images[0].imageUrl}
                  alt={record.name}
                  width={64}
                  height={64}
                  className="tw:object-cover"
                  preview={{
                    mask: <div className="tw:text-[10px]">Xem ảnh</div>,
                  }}
                  fallback="https://placehold.co/200x200?text=No+Image"
                />
              </div>
            ) : (
              <div className="tw:w-full tw:h-full tw:bg-slate-50 tw:flex tw:items-center tw:justify-center">
                <ShoppingOutlined className="tw:text-slate-300 tw:text-xl" />
              </div>
            )}
          </div>
          <div className="tw:flex tw:flex-col tw:gap-0.5">
            <span className="tw:font-bold tw:text-slate-800 tw:text-base tw:line-clamp-1">
              {record.name}
            </span>
            <span className="tw:text-slate-400 tw:text-xs tw:line-clamp-1">
              {record.brand || "Không có thương hiệu"}
            </span>
          </div>
        </Space>
      ),
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (category: Product["category"]) => (
        <Tag color="blue">{category?.name || "—"}</Tag>
      ),
    },

    {
      title: "Phân loại",
      dataIndex: "details",
      key: "details",
      width: 100,
      align: "center",
      render: (details: Product["details"]) => (
        <Tag color="geekblue">{details?.length || 0} loại</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isPublished",
      key: "isPublished",
      width: 120,
      align: "center",
      render: (isPublished: boolean, record: Product) => (
        <Switch
          checked={isPublished}
          checkedChildren="Bán"
          unCheckedChildren="Ẩn"
          onChange={() => handleToggleStatus(record)}
          className={isPublished ? "tw:bg-green-500" : "tw:bg-slate-300"}
        />
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      align: "center",
      render: (_: any, record: Product) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined className="tw:text-blue-500" />}
              onClick={() => handleOpenEdit(record)}
              className="tw:bg-blue-50 hover:tw:bg-blue-100 tw:rounded-lg"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="tw:flex tw:flex-col md:tw:flex-row md:tw:items-center tw:justify-between tw:mb-8 tw:gap-4">
        <div>
          <h1 className="tw:text-3xl tw:font-extrabold tw:text-slate-900 tw:m-0 tw:tracking-tight">
            Quản lý Sản phẩm
          </h1>
          <p className="tw:text-slate-500 tw:mt-1 tw:mb-0 tw:text-base">
            Kiểm soát danh mục sản phẩm, biến thể và trạng thái kinh doanh của
            bạn.
          </p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
          size="large"
          className="tw:h-12 tw:px-6 tw:rounded-xl tw:bg-blue-600 tw:shadow-lg tw:shadow-blue-200 hover:tw:scale-105 tw:transition-transform"
        >
          Thêm sản phẩm mới
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="tw:bg-white tw:p-5 tw:rounded-2xl tw:border tw:border-slate-100 tw:shadow-sm tw:mb-6">
        <div className="tw:flex tw:flex-wrap tw:gap-4 tw:items-center">
          <Input
            placeholder="Tìm theo tên sản phẩm..."
            prefix={<SearchOutlined className="tw:text-slate-400" />}
            value={searchName}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="tw:max-w-xs tw:h-11 tw:rounded-xl"
            allowClear
          />
          <Select
            placeholder="Danh mục"
            options={[
              { value: undefined, label: "Tất cả danh mục" },
              ...categoryOptions,
            ]}
            onChange={handleCategoryFilter}
            className="tw:min-w-[180px] tw:h-11"
            allowClear
          />
          <Select
            placeholder="Trạng thái"
            options={STATUS_OPTIONS}
            onChange={handleStatusFilter}
            defaultValue="all"
            className="tw:min-w-[160px] tw:h-11"
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={handleReset}
            className="tw:h-11 tw:px-5 tw:rounded-xl tw:bg-slate-50 tw:text-slate-600 tw:border-slate-200 hover:tw:bg-slate-100"
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="tw:bg-white tw:rounded-2xl tw:border tw:border-slate-100 tw:shadow-sm tw:overflow-hidden">
        <Table<Product>
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={loading}
          pagination={{
            current: params.page,
            pageSize: params.size,
            total: total,
            showSizeChanger: true,
            className: "tw:px-6 tw:py-4",
          }}
          onChange={handleTableChange}
          scroll={{ x: 900 }}
        />
      </div>

      {/* Modal Create / Edit */}
      <ProductFormModal
        open={modalOpen}
        editingProduct={editingProduct}
        categories={categories}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchProducts}
      />
    </div>
  );
}
