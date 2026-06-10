"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  DatePicker,
  Button,
  Table,
  Skeleton,
  message,
  Tag,
} from "antd";
import {
  FileExcelOutlined,
  FilterOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  SalesReportItemDto,
  CategoryDistributionDto,
  CustomerLoyaltyDto,
  TopProductResponseDto,
} from "@/types/statistics.types";
import { StatisticsService } from "@/services/statistics.service";
import type { ColumnsType } from "antd/es/table";
import dayjs, { Dayjs } from "dayjs";
import type { RangePickerProps } from "antd/es/date-picker";

const { RangePicker } = DatePicker;

const VND = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

const CATEGORY_COLORS = [
  "#1677ff", "#6366f1", "#f59e0b", "#10b981",
  "#ef4444", "#a78bfa", "#34d399",
];

// ─── Mini KPI Pill ─────────────────────────────────────────────────────────
function KpiPill({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className="tw:flex tw:flex-col tw:items-center tw:justify-center tw:rounded-2xl tw:px-6 tw:py-4 tw:min-w-[130px]"
      style={{ background: color + "18", border: `1.5px solid ${color}30` }}
    >
      <span
        className="tw:text-2xl tw:font-extrabold tw:leading-tight"
        style={{ color }}
      >
        {value}
      </span>
      <span className="tw:text-xs tw:text-slate-500 tw:mt-1 tw:text-center">
        {label}
      </span>
    </div>
  );
}

// ─── Custom Donut Label ────────────────────────────────────────────────────
function DonutCenter({ viewBox, label, sub }: any) {
  const { cx, cy } = viewBox || { cx: 0, cy: 0 };
  return (
    <g>
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fill="#0f172a"
        fontSize={18}
        fontWeight={700}
      >
        {label}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize={11}>
        {sub}
      </text>
    </g>
  );
}

// ─── Main Reports Page ──────────────────────────────────────────────────────

export default function ReportsPage() {
  const defaultStart = dayjs().startOf("month");
  const defaultEnd = dayjs().endOf("month");

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    defaultStart,
    defaultEnd,
  ]);
  const [loadingSales, setLoadingSales] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingLoyalty, setLoadingLoyalty] = useState(true);
  const [loadingTopProducts, setLoadingTopProducts] = useState(true);
  const [exportingExcel, setExportingExcel] = useState(false);

  const [salesData, setSalesData] = useState<SalesReportItemDto[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryDistributionDto[]>([]);
  const [loyaltyData, setLoyaltyData] = useState<CustomerLoyaltyDto | null>(null);
  const [topProducts, setTopProducts] = useState<TopProductResponseDto[]>([]);

  const startStr = dateRange[0].format("YYYY-MM-DD");
  const endStr = dateRange[1].format("YYYY-MM-DD");

  const fetchSalesReport = useCallback(async () => {
    try {
      setLoadingSales(true);
      const data = await StatisticsService.getSalesReport(startStr, endStr);
      setSalesData(data);
    } catch (e: any) {
      message.error(e.message || "Lỗi tải báo cáo doanh số");
    } finally {
      setLoadingSales(false);
    }
  }, [startStr, endStr]);

  const fetchStaticData = useCallback(async () => {
    try {
      setLoadingCategory(true);
      setLoadingLoyalty(true);
      setLoadingTopProducts(true);
      const [cat, loyalty, products] = await Promise.all([
        StatisticsService.getCategoryDistribution(),
        StatisticsService.getCustomerLoyalty(),
        StatisticsService.getTopProducts(10),
      ]);
      setCategoryData(cat);
      setLoyaltyData(loyalty);
      setTopProducts(products);
    } catch (e: any) {
      message.error(e.message || "Lỗi tải dữ liệu");
    } finally {
      setLoadingCategory(false);
      setLoadingLoyalty(false);
      setLoadingTopProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesReport();
  }, []);

  useEffect(() => {
    fetchStaticData();
  }, []);

  const handleApply = () => {
    fetchSalesReport();
  };

  const handleExportExcel = async () => {
    try {
      setExportingExcel(true);
      await StatisticsService.exportSalesExcel(startStr, endStr);
      message.success("Xuất file Excel thành công!");
    } catch (e: any) {
      message.error(e.message || "Lỗi xuất Excel");
    } finally {
      setExportingExcel(false);
    }
  };

  // Total revenue for the filtered period
  const totalRevenue = salesData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = salesData.reduce((s, d) => s + d.orderCount, 0);

  // Top 6 categories + "Khác"
  const categoryChartData = (() => {
    if (categoryData.length <= 6) return categoryData;
    const top6 = categoryData.slice(0, 6);
    const others = categoryData.slice(6).reduce(
      (acc, cur) => ({
        categoryId: -1,
        categoryName: "Khác",
        revenue: acc.revenue + cur.revenue,
        percentage: acc.percentage + cur.percentage,
      }),
      { categoryId: -1, categoryName: "Khác", revenue: 0, percentage: 0 }
    );
    return [...top6, others];
  })();

  const loyaltyChartData = loyaltyData
    ? [
        { name: "Khách hàng mới", value: loyaltyData.newCustomersCount },
        { name: "Khách quay lại", value: loyaltyData.returningCustomersCount },
      ]
    : [];

  // Top products table columns
  const topProductCols: ColumnsType<TopProductResponseDto> = [
    {
      title: "#",
      key: "index",
      render: (_, __, idx) => (
        <span
          className="tw:font-bold tw:text-slate-400 tw:w-6 tw:inline-block tw:text-center"
        >
          {idx + 1}
        </span>
      ),
      width: 40,
    },
    {
      title: "Sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (name) => (
        <span className="tw:font-medium tw:text-slate-800">{name}</span>
      ),
    },
    {
      title: "Đã bán",
      dataIndex: "totalSold",
      key: "totalSold",
      align: "center",
      render: (val) => (
        <Tag color="blue" className="tw:font-semibold">
          {val.toLocaleString("vi-VN")} sp
        </Tag>
      ),
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      align: "right",
      render: (val) => (
        <span className="tw:font-semibold tw:text-blue-600">
          {VND.format(val)}
        </span>
      ),
      sorter: (a, b) => a.revenue - b.revenue,
      defaultSortOrder: "descend",
    },
    {
      title: "% Tổng DT",
      key: "pct",
      align: "center",
      render: (_, record) => {
        const allRevenue = topProducts.reduce((s, p) => s + p.revenue, 0);
        const pct =
          allRevenue > 0
            ? ((record.revenue / allRevenue) * 100).toFixed(1)
            : "0.0";
        return (
          <div className="tw:flex tw:items-center tw:gap-2">
            <div
              className="tw:h-1.5 tw:rounded-full tw:bg-blue-500"
              style={{ width: `${Math.min(Number(pct), 100)}%`, minWidth: 4, maxWidth: 60 }}
            />
            <span className="tw:text-xs tw:text-slate-500">{pct}%</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="tw:flex tw:flex-col tw:gap-6">
      {/* ── Header ── */}
      <div className="tw:flex tw:items-start tw:justify-between tw:flex-wrap tw:gap-4">
        <div>
          <h1 className="tw:text-3xl tw:font-extrabold tw:text-slate-900 tw:m-0 tw:flex tw:items-center tw:gap-2">
            <BarChartOutlined className="tw:text-blue-500" />
            Báo Cáo Thống Kê
          </h1>
          <p className="tw:text-slate-400 tw:mt-1 tw:mb-0 tw:text-sm">
            Phân tích doanh số, danh mục và hành vi khách hàng theo thời gian
          </p>
        </div>
      </div>

      {/* ── Section 1: Dynamic Sales Report ── */}
      <Card
        className="tw:rounded-2xl tw:shadow-sm"
        title={
          <span className="tw:font-bold tw:text-slate-800 tw:text-base">
            📈 Báo Cáo Doanh Số Tùy Chọn
          </span>
        }
        extra={
          <div className="tw:flex tw:items-center tw:gap-2 tw:flex-wrap">
            <RangePicker
              value={dateRange}
              onChange={(vals) => {
                if (vals && vals[0] && vals[1]) {
                  setDateRange([vals[0], vals[1]]);
                }
              }}
              format="DD/MM/YYYY"
              allowClear={false}
              size="small"
            />
            <Button
              icon={<FilterOutlined />}
              type="primary"
              size="small"
              onClick={handleApply}
              loading={loadingSales}
            >
              Áp dụng
            </Button>
            <Button
              icon={<FileExcelOutlined />}
              size="small"
              onClick={handleExportExcel}
              loading={exportingExcel}
              className="tw:border-emerald-500 tw:text-emerald-600 hover:tw:bg-emerald-50"
            >
              Xuất Excel
            </Button>
          </div>
        }
      >
        {/* Summary pills */}
        <div className="tw:flex tw:gap-4 tw:mb-4 tw:flex-wrap">
          <KpiPill
            label="Tổng doanh thu"
            value={VND.format(totalRevenue)}
            color="#1677ff"
          />
          <KpiPill
            label="Tổng đơn hàng"
            value={totalOrders.toLocaleString("vi-VN")}
            color="#f59e0b"
          />
          <KpiPill
            label="Trung bình/ngày"
            value={
              salesData.length > 0
                ? VND.format(Math.round(totalRevenue / salesData.length))
                : "0 ₫"
            }
            color="#10b981"
          />
        </div>

        {loadingSales ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : (
          <div className="tw:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={salesData}
                margin={{ top: 10, right: 50, left: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1677ff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1677ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}M`}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: "#f59e0b", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <RechartsTooltip
                  formatter={(val: any, name: any) => {
                    if (name === "revenue")
                      return [VND.format(Number(val)), "Doanh thu"];
                    return [`${val} đơn`, "Số đơn hàng"];
                  }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1677ff"
                  strokeWidth={2.5}
                  fill="url(#salesGrad)"
                  dot={{ fill: "#1677ff", r: 3 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orderCount"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{ fill: "#f59e0b", r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* ── Section 2: Category Distribution + Customer Loyalty ── */}
      <div className="tw:grid tw:grid-cols-1 tw:lg:grid-cols-2 tw:gap-6">
        {/* Category Donut */}
        <Card
          className="tw:rounded-2xl tw:shadow-sm"
          title={
            <span className="tw:font-bold tw:text-slate-800 tw:text-base">
              🍩 Cơ Cấu Doanh Thu Theo Danh Mục
            </span>
          }
        >
          {loadingCategory ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <div className="tw:h-[320px]">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="revenue"
                      nameKey="categoryName"
                      cx="50%"
                      cy="45%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                    >
                      {categoryChartData.map((_, idx) => (
                        <Cell
                          key={`cat-cell-${idx}`}
                          fill={CATEGORY_COLORS[idx % CATEGORY_COLORS.length]}
                        />
                      ))}
                      <DonutCenter
                        label={`${categoryChartData.length}`}
                        sub="danh mục"
                      />
                    </Pie>
                    <RechartsTooltip
                      formatter={(val: any, name: any) => [
                        VND.format(Number(val)),
                        name,
                      ]}
                      contentStyle={{
                        borderRadius: 12,
                        border: "none",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                      formatter={(val, entry: any) =>
                        `${val} (${entry?.payload?.percentage?.toFixed(1)}%)`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="tw:flex tw:items-center tw:justify-center tw:h-full tw:text-slate-400">
                  Chưa có dữ liệu
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Customer Loyalty */}
        <Card
          className="tw:rounded-2xl tw:shadow-sm"
          title={
            <span className="tw:font-bold tw:text-slate-800 tw:text-base">
              👥 Phân Tích Khách Hàng
            </span>
          }
        >
          {loadingLoyalty ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <div className="tw:flex tw:flex-col tw:h-full tw:gap-4">
              {/* KPI Pills */}
              <div className="tw:flex tw:gap-3 tw:flex-wrap">
                <KpiPill
                  label="Khách hàng mới"
                  value={loyaltyData?.newCustomersCount || 0}
                  color="#1677ff"
                />
                <KpiPill
                  label="Khách quay lại"
                  value={loyaltyData?.returningCustomersCount || 0}
                  color="#6366f1"
                />
                <KpiPill
                  label="Tỷ lệ trung thành"
                  value={`${loyaltyData?.returningRate || 0}%`}
                  color="#10b981"
                />
              </div>

              {/* Loyalty Donut */}
              <div className="tw:h-[200px]">
                {loyaltyChartData.some((d) => d.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={loyaltyChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        <Cell fill="#1677ff" />
                        <Cell fill="#6366f1" />
                        <DonutCenter
                          label={`${loyaltyData?.returningRate || 0}%`}
                          sub="trung thành"
                        />
                      </Pie>
                      <RechartsTooltip
                        formatter={(val: any, name: any) => [val, name]}
                        contentStyle={{
                          borderRadius: 12,
                          border: "none",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{ fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="tw:flex tw:items-center tw:justify-center tw:h-full tw:text-slate-400">
                    Chưa có dữ liệu
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* ── Section 3: Top Products Detail Table ── */}
      <Card
        className="tw:rounded-2xl tw:shadow-sm"
        title={
          <span className="tw:font-bold tw:text-slate-800 tw:text-base">
            🏆 Top Sản Phẩm Bán Chạy (All-time)
          </span>
        }
        extra={
          <Button
            icon={<FileExcelOutlined />}
            onClick={handleExportExcel}
            loading={exportingExcel}
            className="tw:border-emerald-500 tw:text-emerald-600 hover:tw:bg-emerald-50"
            size="small"
          >
            Xuất Excel
          </Button>
        }
      >
        <Table
          columns={topProductCols}
          dataSource={topProducts}
          rowKey="productId"
          pagination={false}
          loading={loadingTopProducts}
          size="middle"
          rowClassName={(_, idx) =>
            idx % 2 === 0 ? "tw:bg-white" : "tw:bg-slate-50/50"
          }
        />
      </Card>
    </div>
  );
}
