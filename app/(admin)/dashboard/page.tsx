"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Statistic,
  Select,
  Table,
  Badge,
  Avatar,
  Skeleton,
  message,
  Radio,
} from "antd";
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  WalletOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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

const { Option } = Select;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const STATUS_COLORS: Record<string, string> = {
  PENDING: "#faad14", // Vàng
  CONFIRMED: "#1677ff", // Xanh dương
  SHIPPING: "#722ed1", // Tím
  COMPLETED: "#52c41a", // Xanh lá
  CANCELLED: "#f5222d", // Đỏ
};

export default function DashboardPage() {
  const [loadingKpi, setLoadingKpi] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [loadingTables, setLoadingTables] = useState(true);

  const [period, setPeriod] = useState<"DAY" | "WEEK" | "MONTH">("MONTH");
  const [chartType, setChartType] = useState<"MONTH" | "YEAR">("MONTH");

  const [kpiData, setKpiData] = useState<KpiResponse | null>(null);
  const [revenueData, setRevenueData] = useState<ChartDataDto[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusChartDto[]>(
    [],
  );
  const [topProducts, setTopProducts] = useState<TopProductResponseDto[]>([]);
  const [lowStock, setLowStock] = useState<LowStockResponseDto[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomerResponseDto[]>(
    [],
  );

  useEffect(() => {
    fetchKpi();
  }, [period]);

  useEffect(() => {
    fetchCharts();
  }, [chartType]);

  useEffect(() => {
    fetchTables();
  }, []);

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
        StatisticsService.getTopProducts(5),
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

  const renderTrend = (percentage: number, trend: KpiTrend) => {
    if (trend === "UP") {
      return (
        <span className="tw:text-green-500 tw:text-sm tw:font-semibold tw:ml-2">
          <ArrowUpOutlined /> {percentage}%
        </span>
      );
    }
    if (trend === "DOWN") {
      return (
        <span className="tw:text-red-500 tw:text-sm tw:font-semibold tw:ml-2">
          <ArrowDownOutlined /> {Math.abs(percentage)}%
        </span>
      );
    }
    return (
      <span className="tw:text-slate-400 tw:text-sm tw:font-semibold tw:ml-2">
        <MinusOutlined /> 0%
      </span>
    );
  };

  // Columns for Tables
  const topProductCols: ColumnsType<TopProductResponseDto> = [
    { title: "Sản phẩm", dataIndex: "productName", key: "productName" },
    {
      title: "Đã bán",
      dataIndex: "totalSold",
      key: "totalSold",
      align: "center",
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      align: "right",
      render: (val) => (
        <span className="tw:font-semibold tw:text-blue-600">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(val)}
        </span>
      ),
    },
  ];

  const lowStockCols: ColumnsType<LowStockResponseDto> = [
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, record) => (
        <div className="tw:flex tw:flex-col">
          <span className="tw:font-medium">{record.productName}</span>
          <span className="tw:text-xs tw:text-slate-500">
            Màu: {record.color} | Size: {record.size}
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
          color={stock === 0 ? "#f5222d" : stock < 5 ? "#faad14" : "#1677ff"}
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
          <Avatar src={record.avatarUrl} icon={<UserOutlined />} />
          <div className="tw:flex tw:flex-col">
            <span className="tw:font-medium">{record.fullName}</span>
            <span className="tw:text-xs tw:text-slate-500">{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Đơn",
      dataIndex: "totalOrders",
      key: "totalOrders",
      align: "center",
    },
    {
      title: "Chi tiêu",
      dataIndex: "totalSpent",
      key: "totalSpent",
      align: "right",
      render: (val) => (
        <span className="tw:font-semibold tw:text-green-600">
          {new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(val)}
        </span>
      ),
    },
  ];

  return (
    <div className="tw:flex tw:flex-col tw:gap-6">
      {/* Header */}
      <div className="tw:flex tw:items-center tw:justify-between">
        <div>
          <h1 className="tw:text-3xl tw:font-extrabold tw:text-slate-900 tw:m-0">
            Dashboard
          </h1>
          <p className="tw:text-slate-500 tw:mt-1 tw:mb-0">
            Tổng quan hoạt động kinh doanh.
          </p>
        </div>
        <Select value={period} onChange={setPeriod} className="tw:w-40 tw:h-10">
          <Option value="DAY">Hôm nay</Option>
          <Option value="WEEK">Tuần này</Option>
          <Option value="MONTH">Tháng này</Option>
        </Select>
      </div>

      {/* Row 1: KPI */}
      <div className="tw:grid tw:grid-cols-3 tw:gap-4">
        <Card
          className="tw:rounded-2xl tw:shadow-sm"
          loading={loadingKpi}
          size="small"
        >
          <Statistic
            title={
              <span className="tw:text-slate-500 tw:font-medium tw:text-xs">
                Tổng Doanh Thu
              </span>
            }
            value={kpiData?.revenue?.value || 0}
            prefix={<WalletOutlined className="tw:text-blue-500 tw:mr-2" />}
            formatter={(val) =>
              new Intl.NumberFormat("vi-VN", {
                style: "currency",
                currency: "VND",
              }).format(Number(val))
            }
            valueStyle={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#0f172a",
            }}
          />
          <div className="tw:mt-1 tw:flex tw:items-center">
            <span className="tw:text-[11px] tw:text-slate-400">
              So với kỳ trước:
            </span>
            {kpiData &&
              renderTrend(
                kpiData.revenue.percentageChange,
                kpiData.revenue.trend,
              )}
          </div>
        </Card>

        <Card
          className="tw:rounded-2xl tw:shadow-sm"
          loading={loadingKpi}
          size="small"
        >
          <Statistic
            title={
              <span className="tw:text-slate-500 tw:font-medium tw:text-xs">
                Tổng Đơn Hàng
              </span>
            }
            value={kpiData?.orders?.value || 0}
            prefix={
              <ShoppingCartOutlined className="tw:text-purple-500 tw:mr-2" />
            }
            valueStyle={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#0f172a",
            }}
          />
          <div className="tw:mt-1 tw:flex tw:items-center">
            <span className="tw:text-[11px] tw:text-slate-400">
              So với kỳ trước:
            </span>
            {kpiData &&
              renderTrend(
                kpiData.orders.percentageChange,
                kpiData.orders.trend,
              )}
          </div>
        </Card>

        <Card
          className="tw:rounded-2xl tw:shadow-sm"
          loading={loadingKpi}
          size="small"
        >
          <Statistic
            title={
              <span className="tw:text-slate-500 tw:font-medium tw:text-xs">
                Khách Hàng Mới
              </span>
            }
            value={kpiData?.customers?.value || 0}
            prefix={<UserOutlined className="tw:text-green-500 tw:mr-2" />}
            valueStyle={{
              fontSize: "20px",
              fontWeight: "bold",
              color: "#0f172a",
            }}
          />
          <div className="tw:mt-1 tw:flex tw:items-center">
            <span className="tw:text-[11px] tw:text-slate-400">
              So với kỳ trước:
            </span>
            {kpiData &&
              renderTrend(
                kpiData.customers.percentageChange,
                kpiData.customers.trend,
              )}
          </div>
        </Card>
      </div>

      {/* Row 2: Charts */}
      <div className="tw:grid tw:grid-cols-1 tw:lg:grid-cols-3 tw:gap-6">
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
            >
              <Radio.Button value="MONTH">Tháng này</Radio.Button>
              <Radio.Button value="YEAR">Năm nay</Radio.Button>
            </Radio.Group>
          }
        >
          {loadingCharts ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : (
            <div className="tw:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={revenueData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                    tick={{ fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    formatter={(val: number) =>
                      new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(val)
                    }
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#1677ff"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

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
            <div className="tw:h-[350px] tw:flex tw:flex-col tw:items-center tw:justify-center">
              {orderStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            STATUS_COLORS[entry.status] ||
                            COLORS[index % COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
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

      {/* Row 3: Tables */}
      <div className="tw:grid tw:grid-cols-1 tw:lg:grid-cols-3 tw:gap-6">
        <Card
          title={
            <span className="tw:font-bold tw:text-slate-800">
              Sản phẩm bán chạy
            </span>
          }
          className="tw:rounded-2xl tw:shadow-sm"
          bodyStyle={{ padding: 0 }}
        >
          <Table
            columns={topProductCols}
            dataSource={topProducts}
            rowKey="productId"
            pagination={false}
            loading={loadingTables}
            size="small"
          />
        </Card>

        <Card
          title={
            <span className="tw:font-bold tw:text-slate-800">Sắp hết hàng</span>
          }
          className="tw:rounded-2xl tw:shadow-sm"
          bodyStyle={{ padding: 0 }}
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

        <Card
          title={
            <span className="tw:font-bold tw:text-slate-800">
              Khách hàng VIP
            </span>
          }
          className="tw:rounded-2xl tw:shadow-sm"
          bodyStyle={{ padding: 0 }}
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
