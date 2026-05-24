"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  Tooltip,
  message,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  PictureOutlined,
  TagsOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import type { UploadFile } from "antd";
import { Product, ProductDetail, ProductImage } from "@/types/product.types";
import { Category } from "@/types/category.types";
import { ProductService } from "@/services/product.service";

interface ProductFormModalProps {
  open: boolean;
  editingProduct: Product | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  name: string;
  description?: string;
  brand?: string;
  origin?: string;
  categoryId: number;
  details: ProductDetail[];
}

export default function ProductFormModal({
  open,
  editingProduct,
  categories,
  onClose,
  onSuccess,
}: ProductFormModalProps) {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const isEditing = !!editingProduct;
  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));

  useEffect(() => {
    if (open && editingProduct) {
      form.setFieldsValue({
        name: editingProduct.name,
        description: editingProduct.description,
        brand: editingProduct.brand,
        origin: editingProduct.origin,
        categoryId: editingProduct.category?.id,
        details: editingProduct.details.map((d) => ({
          id: d.id,
          color: d.color,
          size: d.size,
          price: d.price,
          stock: d.stock,
        })),
      });

      const existingImages: UploadFile[] = editingProduct.images.map(
        (img: ProductImage) => ({
          uid: String(img.id),
          name: `image-${img.id}`,
          status: "done" as const,
          url: img.imageUrl,
        })
      );
      setFileList(existingImages);
    } else if (open) {
      form.resetFields();
      form.setFieldsValue({ details: [{ color: "", size: "", price: 0, stock: 0 }] });
      setFileList([]);
    }
  }, [open, editingProduct, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const detailsPayload = values.details.map((d) => {
        const detail: ProductDetail = {
          color: d.color,
          size: d.size,
          price: d.price,
          stock: d.stock,
        };
        if (d.id) detail.id = d.id;
        return detail;
      });

      const formPayload = {
        name: values.name,
        description: values.description,
        brand: values.brand,
        origin: values.origin,
        categoryId: values.categoryId,
        details: JSON.stringify(detailsPayload),
      };

      if (isEditing && editingProduct) {
        const retainedIds = fileList
          .filter((f) => f.url && !f.originFileObj)
          .map((f) => Number(f.uid));
        const newFiles = fileList.filter((f) => !!f.originFileObj);
        await ProductService.update(editingProduct.id, formPayload, retainedIds, newFiles);
        message.success("Cập nhật sản phẩm thành công!");
      } else {
        const newFiles = fileList.filter((f) => !!f.originFileObj);
        await ProductService.create(formPayload, newFiles);
        message.success("Tạo sản phẩm mới thành công!");
      }

      onSuccess();
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="tw:flex tw:items-center tw:gap-2 tw:text-base tw:font-semibold">
          <AppstoreOutlined className="tw:text-blue-500" />
          <span>{isEditing ? "Chỉnh sửa Sản phẩm" : "Thêm Sản phẩm mới"}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={780}
      centered
      styles={{
        body: {
          maxHeight: "72vh",
          overflowY: "auto",
          padding: "16px 24px",
        },
      }}
      footer={[
        <Button key="cancel" size="large" onClick={onClose} className="tw:rounded-lg">
          Hủy bỏ
        </Button>,
        <Button
          key="submit"
          type="primary"
          size="large"
          loading={loading}
          onClick={handleSubmit}
          className="tw:rounded-lg tw:px-8"
        >
          {isEditing ? "Cập nhật sản phẩm" : "Tạo sản phẩm"}
        </Button>,
      ]}
      destroyOnHidden
    >

      <style>{`
        .variant-item {
          margin-bottom: 0 !important;
        }
        .variant-item .ant-form-item-explain {
          position: absolute;
          top: 100%;
          left: 0;
          z-index: 10;
          font-size: 11px;
          line-height: 1.2;
          margin-top: 2px;
        }
      `}</style>
      <Form form={form} layout="vertical" className="tw:mt-2">

        {/* ── PHẦN 1: Thông tin cơ bản ── */}
        <div className="tw:mb-5">
          <div className="tw:flex tw:items-center tw:gap-2 tw:mb-3">
            <InfoCircleOutlined className="tw:text-blue-500" />
            <span className="tw:font-semibold tw:text-sm tw:text-slate-700">
              Thông tin cơ bản
            </span>
          </div>

          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
            className="tw:mb-1"
          >
            <Input placeholder="VD: Áo Thun Basic" />
          </Form.Item>

          <div className="tw:grid tw:grid-cols-3 tw:gap-3 tw:mb-3">
            <Form.Item
              name="categoryId"
              label="Danh mục"
              rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
              className="tw:mb-0"
            >
              <Select placeholder="Chọn danh mục" options={categoryOptions} />
            </Form.Item>
            <Form.Item name="brand" label="Thương hiệu" className="tw:mb-0">
              <Input placeholder="VD: Gucci" />
            </Form.Item>
            <Form.Item name="origin" label="Xuất xứ" className="tw:mb-0">
              <Input placeholder="VD: Việt Nam" />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả" className="tw:mb-0">
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết sản phẩm..." />
          </Form.Item>
        </div>

        <div className="tw:border-t tw:border-slate-100 tw:my-4" />

        {/* ── PHẦN 2: Hình ảnh sản phẩm ── */}
        <div className="tw:mb-5">
          <div className="tw:flex tw:items-center tw:gap-2 tw:mb-3">
            <PictureOutlined className="tw:text-blue-500" />
            <span className="tw:font-semibold tw:text-sm tw:text-slate-700">
              Hình ảnh sản phẩm
            </span>
          </div>

          <Upload
            listType="picture-card"
            fileList={fileList}
            onChange={({ fileList: newList }) => setFileList(newList)}
            beforeUpload={() => false}
            multiple
            accept="image/*"
          >
            {fileList.length < 8 && (
              <div>
                <PlusOutlined />
                <div className="tw:mt-1 tw:text-xs">Tải ảnh</div>
              </div>
            )}
          </Upload>
          <p className="tw:text-xs tw:text-slate-400 tw:mt-1">
            * Tối đa 8 ảnh. Chấp nhận định dạng: jpg, png, webp.
          </p>
        </div>

        <div className="tw:border-t tw:border-slate-100 tw:my-4" />

        {/* ── PHẦN 3: Biến thể / Phân loại ── */}
        <div>
          <div className="tw:flex tw:items-center tw:gap-2 tw:mb-3">
            <TagsOutlined className="tw:text-blue-500" />
            <span className="tw:font-semibold tw:text-sm tw:text-slate-700">
              Phân loại sản phẩm (Biến thể)
            </span>
          </div>

          <Form.List name="details">
            {(fields, { add, remove }) => (
              <>
                {/* Header row */}
                <div className="tw:grid tw:grid-cols-[1fr_1fr_1.2fr_1fr_23px] tw:gap-2 tw:mb-1 tw:px-3">
                  <span className="tw:text-xs tw:font-medium tw:text-slate-500">Màu sắc</span>
                  <span className="tw:text-xs tw:font-medium tw:text-slate-500">Kích cỡ</span>
                  <span className="tw:text-xs tw:font-medium tw:text-slate-500">Giá bán (VNĐ)</span>
                  <span className="tw:text-xs tw:font-medium tw:text-slate-500">Tồn kho</span>
                  <span />
                </div>

                {fields.map(({ key, name, ...restField }) => (
                  <div
                    key={key}
                    className="tw:grid tw:grid-cols-[1fr_1fr_1.2fr_1fr_23px] tw:gap-2 tw:mb-2 tw:items-center tw:justify-center tw:bg-slate-50 tw:rounded-lg tw:px-3 tw:py-2"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "color"]}
                      rules={[{ required: true, message: "Nhập màu" }]}
                    className="variant-item"
                    >
                      <Input placeholder="VD: Trắng" size="small" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "size"]}
                      rules={[{ required: true, message: "Nhập size" }]}
                      className="variant-item"
                    >
                      <Input placeholder="VD: L, XL" size="small" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "price"]}
                      rules={[{ required: true, message: "Nhập giá" }]}
                     className="variant-item"
                    >
                      <InputNumber
                        placeholder="Giá"
                        min={0}
                        size="small"
                        className="tw:w-full"
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value!.replace(/\$\s?|(,*)/g, "") as unknown as number}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "stock"]}
                      rules={[{ required: true, message: "Nhập SL" }]}
                     className="variant-item tw:w-full"
                    >
                      <InputNumber
                        placeholder="Số lượng"
                        min={0}
                        size="small"
                        className="tw:w-full"
                      />
                    </Form.Item>

                    {fields.length > 1 ? (
                      <Tooltip title="Xóa biến thể">
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                          className="tw:mt-0.5"
                        />
                      </Tooltip>
                    ) : (
                      <span />
                    )}
                  </div>
                ))}

                <Button
                  type="dashed"
                  onClick={() => add({ color: "", size: "", price: 0, stock: 0 })}
                  icon={<PlusOutlined />}
                  className="tw:w-full tw:mt-1 tw:rounded-lg"
                >
                  Thêm phân loại
                </Button>
              </>
            )}
          </Form.List>
        </div>

      </Form>
    </Modal>
  );
}
