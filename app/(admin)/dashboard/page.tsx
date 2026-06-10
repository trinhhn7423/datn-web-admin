"use client";

import React, { useEffect, useState } from "react";
import { Card, Select, Table, Badge, Avatar, Skeleton, message, Radio } from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  UserOutlined,
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
  BarChart,
  Bar,
  LabelList,
} from "recharts";
import {
  KpiResponse,
  ChartDataDto,
  OrderStatusChartDto,
  TopProductResponseDto,
  LowStockResponseDto,
  TopCustomerResponseDto,
  KpiTrend,
} from "@/types/statistics.types";
import { StatisticsService } from "@/services/statistics.service";
import type { ColumnsType } from "antd/es/table";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  ShoppingBag,
  Users,
} from "lucide-react";

const { Option } = Select;

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#fbbf24",
  CONFIRMED: "#60a5fa",
  SHIPPING: "#a78bfa",
  COMPLETED: "#34d399",
  CANCELLED: "#f87171",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const VND = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

// ─── KPI Card Component ─────────────────────────────────────────────────────

interface GlassKpiCardProps {
  title: string;
  value: number;
  trend: KpiTrend;
  percentageChange: number;
  gradient: string;
  icon: React.ReactNode;
  isCurrency?: boolean;
  loading: boolean;
}

function GlassKpiCard({
  title,
  value,
  trend,
  percentageChange,
  gradient,
  icon,
  isCurrency,
  loading,
}: GlassKpiCardProps) {
  if (loading) {
    return (
      <div className="tw:rounded-2xl tw:p-6 tw:bg-white tw:border tw:border-slate-100 tw:shadow-sm">
        <Skeleton active paragraph={{ rows: 2 }} />
      </div>
    );
  }

  const trendColor =
    trend === "UP" ? "#22c55e" : trend === "DOWN" ? "#ef4444" : "#94a3b8";
  const TrendIcon =
    trend === "UP" ? TrendingUp : trend === "DOWN" ? TrendingDown : Minus;

  return (
    <div
      className="tw:rounded-2xl tw:p-6 tw:relative tw:overflow-hidden tw:shadow-lg tw:transition-transform tw:duration-300 hover:tw:-translate-y-1"
      style={{ background: gradient }}
    >
      {/* Decorative glow circle */}
      <div
        className="tw:absolute tw:-top-6 tw:-right-6 tw:w-28 tw:h-28 tw:rounded-full tw:opacity-20"
        style={{ background: "rgba(255,255,255,0.4)" }}
      />
      <div
        className="tw:absolute tw:bottom-0 tw:right-8 tw:w-16 tw:h-16 tw:rounded-full tw:opacity-10"
        style={{ background: "rgba(255,255,255,0.6)" }}
      />

      {/* Icon */}
      <div className="tw:flex tw:items-center tw:justify-between tw:mb-4">
        <div className="tw:bg-white/20 tw:rounded-xl tw:p-3 tw:flex tw:items-center tw:justify-center">
          {icon}
        </div>
        <div
          className="tw:flex tw:items-center tw:gap-1 tw:rounded-full tw:px-3 tw:py-1 tw:text-xs tw:font-bold"
          style={{
            background: "rgba(255,255,255,0.25)",
            color: "white",
          }}
        >
          <TrendIcon size={12} />
          {trend === "NEUTRAL" ? "0%" : `${percentageChange}%`}
        </div>
      </div>

      {/* Value */}
      <div className="tw:text-white">
        <p className="tw:text-white/70 tw:text-xs tw:font-medium tw:mb-1 tw:uppercase tw:tracking-wider">
          {title}
        </p>
        <p className="tw:text-2xl tw:font-extrabold tw:m-0 tw:leading-tight">
          {isCurrency
            ? VND.format(value)
            : value.toLocaleString("vi-VN")}
        </p>
        <p className="tw:text-white/60 tw:text-[11px] tw:mt-2 tw:mb-0">
          {trend === "UP" ? "▲" : trend === "DOWN" ? "▼" : "—"} So với kỳ trước
        </p>
      </div>
    </div>
  );
}

// ─── Donut Center Label ─────────────────────────────────────────────────────
function DonutCenterLabel({ viewBox, total }: any) {
  const { cx, cy } = viewBox || { cx: 0, cy: 0 };
  return (
    <g>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#0f172a" fontSize={22} fontWeight={700}>
        {total}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#94a3b8" fontSize={11}>
        Tổng đơn
      </text>
    </g>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [loadingKpi, setLoadingKpi] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [loadingTables, setLoadingTables] = useState(true);

  const [period, setPeriod] = useState<"DAY" | "WEEK" | "MONTH">("MONTH");
  const [chartType, setChartType] = useState<"MONTH" | "YEAR">("MONTH");

  const [kpiData, setKpiData] = useState<KpiResponse | null>(null);
  const [revenueData, setRevenueData] = useState<ChartDataDto[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusChartDto[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductResponseDto[]>([]);
  const [lowStock, setLowStock] = useState<LowStockResponseDto[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomerResponseDto[]>([]);

  useEffect(() => { fetchKpi(); }, [period]);
  useEffect(() => { fetchCharts(); }, [chartType]);
  useEffect(() => { fetchTables(); }, []);

  const fetchKpi = async () => {
    try {
      setLoadingKpi(true);
      const data = await StatisticsService.getKpi(period);
      setKpiData(data);
    } catch (error: any) {
      message.error(error.message || "Lỗi tải KPI");
    } finally {
      setLoadingKpi(false);
    }
  };

  const fetchCharts = async () => {
    try {
      setLoadingCharts(true);
      const [revData, statusData] = await Promise.all([
        StatisticsService.getRevenueChart(chartType),
        StatisticsService.getOrderStatusChart(),
      ]);
      setRevenueData(revData);
      setOrderStatusData(statusData);
    } catch (error: any) {
      message.error(error.message || "Lỗi tải biểu đồ");
    } finally {
      setLoadingCharts(false);
    }
  };

  const fetchTables = async () => {
    try {
      setLoadingTables(true);
      const [products, stock, customers] = await Promise.all([
        StatisticsService.getTopProducts(7),
        StatisticsService.getLowStock(10, 5),
        StatisticsService.getTopCustomers(5),
      ]);
      setTopProducts(products);
      setLowStock(stock);
      setTopCustomers(customers);
    } catch (error: any) {
      message.error(error.message || "Lỗi tải bảng dữ liệu");
    } finally {
      setLoadingTables(false);
    }
  };

  const totalOrderStatus = orderStatusData.reduce((s, d) => s + d.count, 0);

  // Columns
  const lowStockCols: ColumnsType<LowStockResponseDto> = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => (
        <div className="tw:flex tw:flex-col">
          <span className="tw:font-medium tw:text-slate-800">{record.productName}</span>
          <span className="tw:text-xs tw:text-slate-400">
            {record.color} · {record.size}
          </span>
        </div>
      ),
    },
    {
      title: "Tồn kho",
      dataIndex: "stock",
      key: "stock",
      align: "center",
      render: (stock) => (
        <Badge
          count={stock}
          showZero
          color={stock === 0 ? "#f87171" : stock < 5 ? "#fbbf24" : "#60a5fa"}
        />
      ),
    },
  ];

  const topCustomerCols: ColumnsType<TopCustomerResponseDto> = [
    {
      title: "Khách hàng",
      key: "customer",
      render: (_, record) => (
        <div className="tw:flex tw:items-center tw:gap-3">
          <Avatar src={record.avatarUrl || undefined} icon={<UserOutlined />} />
          <div className="tw:flex tw:flex-col">
            <span className="tw:font-medium tw:text-slate-800">{record.fullName}</span>
            <span className="tw:text-xs tw:text-slate-400">{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Chi tiêu",
      dataIndex: "totalSpent",
      key: "totalSpent",
      align: "right",
      render: (val) => (
        <span className="tw:font-semibold tw:text-emerald-600">
          {VND.format(val)}
        </span>
      ),
    },
  ];

  return (
    <div className="tw:flex tw:flex-col tw:gap-6">
      {/* ── Header ── */}
      <div className="tw:flex tw:items-center tw:justify-between">
        <div>
          <h1 className="tw:text-3xl tw:font-extrabold tw:text-slate-900 tw:m-0">
            Dashboard
          </h1>
          <p className="tw:text-slate-400 tw:mt-1 tw:mb-0 tw:text-sm">
            Tổng quan hoạt động kinh doanh TH-Store
          </p>
        </div>
        <Select value={period} onChange={setPeriod} className="tw:w-40">
          <Option value="DAY">Hôm nay</Option>
          <Option value="WEEK">Tuần này</Option>
          <Option value="MONTH">Tháng này</Option>
        </Select>
      </div>

      <div className="tw:flex tw:flex-wrap tw:gap-4">
        <div className="tw:w-full tw:sm:w-auto tw:sm:flex-1 tw:sm:max-w-[280px]">
          <GlassKpiCard
            title="Tổng Doanh Thu"
            value={kpiData?.revenue?.value || 0}
            trend={kpiData?.revenue?.trend || "NEUTRAL"}
            percentageChange={kpiData?.revenue?.percentageChange || 0}
            gradient="linear-gradient(135deg, #1677ff 0%, #6366f1 100%)"
            icon={<DollarSign size={20} color="white" />}
            isCurrency
            loading={loadingKpi}
          />
        </div>
        <div className="tw:w-full tw:sm:w-auto tw:sm:flex-1 tw:sm:max-w-[280px]">
          <GlassKpiCard
            title="Tổng Đơn Hàng"
            value={kpiData?.orders?.value || 0}
            trend={kpiData?.orders?.trend || "NEUTRAL"}
            percentageChange={kpiData?.orders?.percentageChange || 0}
            gradient="linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)"
            icon={<ShoppingBag size={20} color="white" />}
            loading={loadingKpi}
          />
        </div>
        <div className="tw:w-full tw:sm:w-auto tw:sm:flex-1 tw:sm:max-w-[280px]">
          <GlassKpiCard
            title="Khách Hàng Mới"
            value={kpiData?.customers?.value || 0}
            trend={kpiData?.customers?.trend || "NEUTRAL"}
            percentageChange={kpiData?.customers?.percentageChange || 0}
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
            icon={<Users size={20} color="white" />}
            loading={loadingKpi}
          />
        </div>
      </div>

      {/* ── Row 2: Revenue Chart + Order Status Donut ── */}
      <div className="tw:grid tw:grid-cols-1 tw:lg:grid-cols-3 tw:gap-6">
        {/* Area+Line Revenue Chart */}
        <Card
          className="tw:rounded-2xl tw:shadow-sm tw:lg:col-span-2"
          title={
            <span className="tw:font-bold tw:text-slate-800">
              Biểu đồ doanh thu
            </span>
          }
          extra={
            <Radio.Group
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              buttonStyle="solid"
              size="small"
            >
              <Radio.Button value="MONTH">Tháng này</Radio.Button>
              <Radio.Button value="YEAR">Năm nay</Radio.Button>
            </Radio.Group>
          }
        >
          {loadingCharts ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <div className="tw:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={revenueData}
                  margin={{ top: 10, right: 40, left: 10, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1677ff" stopOpacity={0.3} />
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
                    tickFormatter={(val) => `${(val / 1_000_000).toFixed(0)}M`}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    formatter={(val: any, name: any) => {
                      if (name === "value")
                        return [VND.format(Number(val)), "Doanh thu"];
                      return [val, "Đơn hàng"];
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
                    dataKey="value"
                    stroke="#1677ff"
                    strokeWidth={2.5}
                    fill="url(#revenueGrad)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Donut — Order Status */}
        <Card
          className="tw:rounded-2xl tw:shadow-sm"
          title={
            <span className="tw:font-bold tw:text-slate-800">
              Trạng thái đơn hàng
            </span>
          }
        >
          {loadingCharts ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <div className="tw:h-[320px] tw:flex tw:flex-col tw:items-center tw:justify-center">
              {orderStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="45%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={4}
                      labelLine={false}
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[entry.status] || "#94a3b8"}
                        />
                      ))}
                      <DonutCenterLabel total={totalOrderStatus} />
                    </Pie>
                    <RechartsTooltip
                      formatter={(val: any, name: any) => [
                        val,
                        STATUS_LABELS[name as string] || name,
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
                      formatter={(val) => STATUS_LABELS[val] || val}
                      wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="tw:text-slate-400">Không có dữ liệu</span>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* ── Row 3: Top Products Horizontal Bar + Low Stock + Top Customers ── */}
      <div className="tw:grid tw:grid-cols-1 tw:lg:grid-cols-3 tw:gap-6">
        {/* Top Products Horizontal Bar Chart */}
        <Card
          title={
            <span className="tw:font-bold tw:text-slate-800">
              Sản phẩm bán chạy
            </span>
          }
          className="tw:rounded-2xl tw:shadow-sm"
        >
          {loadingTables ? (
            <Skeleton active paragraph={{ rows: 7 }} />
          ) : (
            <div className="tw:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={topProducts.slice(0, 7)}
                  margin={{ top: 0, right: 50, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="productName"
                    width={90}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) =>
                      val.length > 12 ? val.slice(0, 12) + "…" : val
                    }
                  />
                  <RechartsTooltip
                    formatter={(val: any) => [`${val} sản phẩm`, "Đã bán"]}
                    contentStyle={{
                      borderRadius: 10,
                      border: "none",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar
                    dataKey="totalSold"
                    fill="url(#barGrad)"
                    radius={[0, 6, 6, 0]}
                    maxBarSize={16}
                  >
                    <LabelList
                      dataKey="totalSold"
                      position="right"
                      style={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Low Stock Table */}
        <Card
          title={
            <span className="tw:font-bold tw:text-slate-800">Sắp hết hàng</span>
          }
          className="tw:rounded-2xl tw:shadow-sm"
          styles={{ body: { padding: 0 } }}
        >
          <Table
            columns={lowStockCols}
            dataSource={lowStock}
            rowKey="productDetailId"
            pagination={false}
            loading={loadingTables}
            size="small"
          />
        </Card>

        {/* Top Customers Table */}
        <Card
          title={
            <span className="tw:font-bold tw:text-slate-800">Khách hàng VIP</span>
          }
          className="tw:rounded-2xl tw:shadow-sm"
          styles={{ body: { padding: 0 } }}
        >
          <Table
            columns={topCustomerCols}
            dataSource={topCustomers}
            rowKey="userId"
            pagination={false}
            loading={loadingTables}
            size="small"
          />
        </Card>
      </div>
    </div>
  );
}
