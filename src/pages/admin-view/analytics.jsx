import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { isSuperAdminUser } from "@/config/routes";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Award,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Truck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import api from "@/api/axios";

const REFRESH_INTERVAL_MS = 60_000;

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

const CHANNEL_COLORS = {
  confirmed: "#059669",
  inProcess: "#f59e0b",
  shipped: "#3b82f6",
};

const CHANNEL_ICONS = {
  confirmed: <CheckCircle className="w-4 h-4 text-teal-500" />,
  inProcess: <Clock className="w-4 h-4 text-amber-500" />,
  shipped: <Truck className="w-4 h-4 text-blue-500" />,
};

function ChangeBadge({ value, label }) {
  const num = Number(value) || 0;
  const isUp = num >= 0;
  const Icon = isUp ? ArrowUpRight : ArrowDownRight;
  const color = isUp ? "text-emerald-600" : "text-rose-600";

  return (
    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
      <span className={`${color} font-semibold inline-flex items-center`}>
        <Icon className="w-3 h-3" />
        {isUp ? "+" : ""}
        {num}%
      </span>
      {label}
    </p>
  );
}

const emptyAnalytics = {
  metrics: {
    totalRevenue: 0,
    totalOrders: 0,
    successfulOrders: 0,
    aov: 0,
    activeProductsCount: 0,
    subscribersCount: 0,
    revenueChangePercent: 0,
    ordersChangePercent: 0,
  },
  salesTrend: [],
  orderStatusStats: { total: 0, breakdown: [], channelTotal: 0, channels: [] },
  categorySales: [],
  topProducts: [],
};

export default function AdminAnalytics() {
  const { user } = useSelector((state) => state.auth || {});
  const [analytics, setAnalytics] = useState(emptyAnalytics);
  const [orders, setOrders] = useState([]);
  
  // Default custom range: last 30 days
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [timeFrame, setTimeFrame] = useState("7days");
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [chartWidth, setChartWidth] = useState(500);
  const [lastUpdated, setLastUpdated] = useState(null);

  const isInvalidRange = useMemo(() => {
    if (!startDate || !endDate) return false;
    return new Date(startDate) > new Date(endDate);
  }, [startDate, endDate]);

  const chartContainerRef = useRef(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;
    const handleResize = () => {
      setChartWidth(chartContainerRef.current.clientWidth || 500);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [loading]);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (timeFrame === "custom" && (!startDate || !endDate || isInvalidRange)) {
        setAnalytics(emptyAnalytics);
        setFetchError(isInvalidRange ? "End date must be on or after start date." : null);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setFetchError(null);

      try {
        const overviewParams = { timeFrame };
        if (timeFrame === "custom") {
          overviewParams.startDate = startDate;
          overviewParams.endDate = endDate;
        }

        const [overviewRes, ordersRes] = await Promise.all([
          api.get("/api/admin/analytics/overview", {
            params: overviewParams,
            skipGlobalLoader: true,
          }),
          api.get("/api/admin/orders/get?page=1&limit=1000", {
            skipGlobalLoader: true,
          }),
        ]);

        if (overviewRes.data?.success && overviewRes.data.data) {
          const data = overviewRes.data.data;
          setAnalytics({
            metrics: { ...emptyAnalytics.metrics, ...(data.metrics || {}) },
            salesTrend: data.salesTrend || [],
            orderStatusStats: data.orderStatusStats || emptyAnalytics.orderStatusStats,
            categorySales: data.categorySales || [],
            topProducts: data.topProducts || [],
          });
          setLastUpdated(data.generatedAt || new Date().toISOString());
        }

        if (ordersRes.data?.success) {
          const orderData = ordersRes.data.data?.orders || ordersRes.data.data || [];
          setOrders(orderData);
        }
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        const msg =
          err?.response?.data?.message ||
          (err?.response?.status === 400
            ? "Invalid date range."
            : "Failed to load analytics data.");
        setFetchError(msg);
        setAnalytics(emptyAnalytics);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [timeFrame, startDate, endDate, isInvalidRange]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData(true);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  const { metrics: rawMetrics, salesTrend, categorySales, topProducts } = analytics;
  const apiChannels = analytics.orderStatusStats?.channels || [];

  const confirmedCount = apiChannels.find((c) => c.key === "confirmed")?.count ?? 0;
  const inProcessCount = apiChannels.find((c) => c.key === "inProcess")?.count ?? 0;
  const shippedCount = apiChannels.find((c) => c.key === "shipped")?.count ?? 0;

  // Calculate specific period revenues
  const revenueStats = useMemo(() => {
    let totalRevenue = 0;
    let todayRevenue = 0;
    let weekRevenue = 0;
    let monthRevenue = 0;

    const now = new Date();
    
    // Start of Today (local time)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    // Start of Week (Monday as start of week)
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);

    // Start of Month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

    const isRevenueStatus = (status) => {
      const s = String(status || "").toLowerCase();
      return s !== "rejected" && s !== "pending";
    };

    orders.forEach((o) => {
      if (!o.orderDate || !isRevenueStatus(o.orderStatus)) return;
      const amount = Number(o.totalAmount || 0);
      const date = new Date(o.orderDate);

      // All-time Total Revenue
      totalRevenue += amount;

      // Today
      if (date >= startOfToday) {
        todayRevenue += amount;
      }

      // This Week
      if (date >= startOfWeek) {
        weekRevenue += amount;
      }

      // This Month
      if (date >= startOfMonth) {
        monthRevenue += amount;
      }
    });

    return {
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
    };
  }, [orders]);

  const metrics = useMemo(() => ({
    ...rawMetrics,
    confirmedOrders: confirmedCount,
    inProcessOrders: inProcessCount,
    shippedOrders: shippedCount,
  }), [rawMetrics, confirmedCount, inProcessCount, shippedCount]);

  const orderStatusStats = useMemo(() => {
    const channels = apiChannels.map((ch) => ({
      key: ch.key,
      name: ch.name,
      count: ch.count || 0,
      percentage: ch.percentage || 0,
      color: CHANNEL_COLORS[ch.key] || "#94a3b8",
      icon: CHANNEL_ICONS[ch.key],
    }));

    const total = analytics.orderStatusStats?.channelTotal ?? 0;
    let cumulative = 0;

    const list = channels.map((item) => {
      const percentage = item.percentage;
      const segment = {
        ...item,
        strokeDasharray: `${percentage} ${100 - percentage}`,
        strokeDashoffset: 100 - cumulative,
      };
      cumulative += percentage;
      return segment;
    });

    return { total, list };
  }, [apiChannels, analytics.orderStatusStats?.channelTotal]);

  const chartPoints = useMemo(() => {
    if (salesTrend.length === 0) return [];

    const height = 160;
    const paddingLeft = 45;
    const paddingRight = 15;
    const paddingTop = 20;
    const paddingBottom = 20;

    const activeWidth = chartWidth - paddingLeft - paddingRight;
    const activeHeight = height - paddingTop - paddingBottom;

    const maxVal = Math.max(...salesTrend.map((d) => d.value), 100);

    return salesTrend.map((d, index) => {
      const x =
        paddingLeft +
        (salesTrend.length > 1
          ? (index / (salesTrend.length - 1)) * activeWidth
          : activeWidth / 2);

      const valRatio = maxVal > 0 ? d.value / maxVal : 0;
      const y = paddingTop + activeHeight - valRatio * activeHeight;

      return {
        x,
        y,
        label: d.label,
        value: d.value,
        index,
      };
    });
  }, [salesTrend, chartWidth]);

  const svgPathData = useMemo(() => {
    if (chartPoints.length === 0) return { line: "", area: "" };

    const linePath =
      `M ${chartPoints[0].x},${chartPoints[0].y} ` +
      chartPoints
        .slice(1)
        .map((p) => `L ${p.x},${p.y}`)
        .join(" ");

    const height = 160;
    const paddingBottom = 20;
    const areaBottomY = height - paddingBottom;
    const areaPath = `${linePath} L ${chartPoints[chartPoints.length - 1].x},${areaBottomY} L ${chartPoints[0].x},${areaBottomY} Z`;

    return { line: linePath, area: areaPath };
  }, [chartPoints]);

  const handleMouseMove = (e) => {
    if (chartPoints.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    let closest = chartPoints[0];
    let minDist = Math.abs(chartPoints[0].x - mouseX);

    for (let i = 1; i < chartPoints.length; i++) {
      const dist = Math.abs(chartPoints[i].x - mouseX);
      if (dist < minDist) {
        minDist = dist;
        closest = chartPoints[i];
      }
    }

    setHoveredPoint(closest);
  };

  if (!isSuperAdminUser(user)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3">
        <RefreshCw className="w-10 h-10 animate-spin text-[#08665F]" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading analytics from database...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent">
            Analytics Overview
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Live shop performance from your database
            {lastUpdated && (
              <span className="text-slate-400">
                {" "}
                · Updated {new Date(lastUpdated).toLocaleTimeString("en-IN")}
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 shadow-inner">
            {[
              { id: "7days", name: "7 Days" },
              { id: "30days", name: "30 Days" },
              { id: "all", name: "All Time" },
              { id: "custom", name: "Custom" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setTimeFrame(item.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${
                  timeFrame === item.id
                    ? "bg-[#08665F] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md transition-colors"
              title="Refresh statistics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {timeFrame === "custom" && (
            <div className="flex flex-col gap-1.5">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1 shadow-sm"
              >
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`h-8 border rounded bg-white px-2 text-xs focus:outline-none focus:ring-1 ${
                    isInvalidRange
                      ? "border-rose-300 focus:ring-rose-500 text-rose-600 bg-rose-50/30"
                      : "border-slate-200 focus:ring-[#08665F]"
                  }`}
                  aria-label="Start date"
                />
                <span className="text-xs text-slate-500 font-medium">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`h-8 border rounded bg-white px-2 text-xs focus:outline-none focus:ring-1 ${
                    isInvalidRange
                      ? "border-rose-300 focus:ring-rose-500 text-rose-600 bg-rose-50/30"
                      : "border-slate-200 focus:ring-[#08665F]"
                  }`}
                  aria-label="End date"
                />
              </motion.div>
              {isInvalidRange && (
                <span className="text-[10px] text-rose-500 font-semibold px-1 select-none animate-pulse">
                  Start date must be before or equal to End date.
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {fetchError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {fetchError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="border border-slate-100 shadow-sm relative overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Orders</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-800">{metrics.totalOrders}</div>
              <ChangeBadge value={metrics.ordersChangePercent} label="vs previous period" />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="border border-slate-100 shadow-sm relative overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirmed Orders</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-[#059669]">
                <CheckCircle className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-800">{metrics.confirmedOrders}</div>
              <p className="text-xs text-slate-500 mt-1">
                <span className="text-emerald-600 font-semibold">
                  {metrics.totalOrders > 0 ? ((metrics.confirmedOrders / metrics.totalOrders) * 100).toFixed(0) : 0}%
                </span> of total orders
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="border border-slate-100 shadow-sm relative overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">In Process Orders</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                <Clock className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-800">{metrics.inProcessOrders}</div>
              <p className="text-xs text-slate-500 mt-1">
                <span className="text-sky-600 font-semibold">
                  {metrics.totalOrders > 0 ? ((metrics.inProcessOrders / metrics.totalOrders) * 100).toFixed(0) : 0}%
                </span> of total orders
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="border border-slate-100 shadow-sm relative overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Shipped Orders</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Truck className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-800">{metrics.shippedOrders}</div>
              <p className="text-xs text-slate-500 mt-1">
                <span className="text-indigo-600 font-semibold">
                  {metrics.totalOrders > 0 ? ((metrics.shippedOrders / metrics.totalOrders) * 100).toFixed(0) : 0}%
                </span> of total orders
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="border border-slate-100 shadow-sm relative overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-800">
                {formatCurrency(revenueStats.totalRevenue)}
              </div>
              <p className="text-xs text-slate-500 mt-1">All-time sales revenue</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Revenue */}
        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="border border-slate-100 shadow-sm relative overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-800">
                {formatCurrency(revenueStats.todayRevenue)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Today's sales revenue</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* This Week's Revenue */}
        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="border border-slate-100 shadow-sm relative overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">This Week's Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-800">
                {formatCurrency(revenueStats.weekRevenue)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Weekly sales revenue</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* This Month's Revenue */}
        <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="border border-slate-100 shadow-sm relative overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">This Month's Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-800">
                {formatCurrency(revenueStats.monthRevenue)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Monthly sales revenue</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border border-slate-100 shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">Sales Performance</CardTitle>
              <p className="text-xs text-slate-500">Revenue from paid orders in the selected timeframe.</p>
            </div>
            <div className="flex items-center gap-4">
              {hoveredPoint && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-xs bg-slate-900 text-white rounded px-2.5 py-1 shadow"
                >
                  <span className="font-semibold">{hoveredPoint.label}: </span>
                  <span className="font-black text-teal-400">{formatCurrency(hoveredPoint.value)}</span>
                </motion.div>
              )}
              <div className="flex items-center gap-3 bg-emerald-50/60 border border-emerald-100/50 rounded-xl px-4 py-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Revenue</div>
                  <div className="text-lg font-black text-emerald-800 leading-tight">
                    {formatCurrency(metrics.totalRevenue)}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div ref={chartContainerRef} className="relative w-full h-[180px] select-none">
              {salesTrend.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                  No transaction data available for this timeframe.
                </div>
              ) : (
                <svg
                  width={chartWidth}
                  height={160}
                  className="overflow-visible"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#08665F" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#08665F" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>

                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                    const y = 20 + ratio * 120;
                    const maxVal = Math.max(...salesTrend.map((d) => d.value), 100);
                    const gridVal = maxVal * (1 - ratio);
                    return (
                      <g key={i} className="opacity-40">
                        <line
                          x1={45}
                          y1={y}
                          x2={chartWidth - 15}
                          y2={y}
                          stroke="#e2e8f0"
                          strokeDasharray="4 4"
                        />
                        <text x={35} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-medium">
                          {gridVal > 1000 ? `${(gridVal / 1000).toFixed(0)}k` : gridVal.toFixed(0)}
                        </text>
                      </g>
                    );
                  })}

                  <path d={svgPathData.area} fill="url(#chartGradient)" />
                  <path
                    d={svgPathData.line}
                    fill="none"
                    stroke="#08665F"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {chartPoints.map((p, idx) => (
                    <circle
                      key={idx}
                      cx={p.x}
                      cy={p.y}
                      r={hoveredPoint?.index === p.index ? 6 : 3}
                      fill={hoveredPoint?.index === p.index ? "#08665F" : "#ffffff"}
                      stroke="#08665F"
                      strokeWidth={2}
                      className="transition-all duration-150 cursor-pointer"
                    />
                  ))}

                  {chartPoints
                    .filter((_, idx) => {
                      const totalPoints = chartPoints.length;
                      if (totalPoints <= 10) return true;
                      if (totalPoints <= 20) return idx % 2 === 0;
                      if (totalPoints <= 50) return idx % 5 === 0;
                      if (totalPoints <= 100) return idx % 10 === 0;
                      return idx % Math.ceil(totalPoints / 8) === 0;
                    })
                    .map((p, idx) => (
                      <text
                        key={idx}
                        x={p.x}
                        y={155}
                        textAnchor="middle"
                        className="text-[10px] fill-slate-400 font-semibold uppercase"
                      >
                        {p.label}
                      </text>
                    ))}

                  {hoveredPoint && (
                    <line
                      x1={hoveredPoint.x}
                      y1={20}
                      x2={hoveredPoint.x}
                      y2={140}
                      stroke="#08665F"
                      strokeWidth={1.5}
                      strokeDasharray="2 2"
                      className="pointer-events-none"
                    />
                  )}
                </svg>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg font-bold text-slate-800">Order Channels</CardTitle>
            <p className="text-xs text-slate-500">Distribution of orders grouped by processing status.</p>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col items-center">
            {orderStatusStats.list.length === 0 ? (
              <div className="py-12 text-slate-400 text-sm">No statuses to report.</div>
            ) : (
              <div className="w-full flex flex-col gap-6">
                <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
                  <svg width="100%" height="100%" viewBox="0 0 40 40" className="transform -rotate-90">
                    <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                    {orderStatusStats.list.filter(s => s.percentage > 0).map((segment, idx) => (
                      <circle
                        key={segment.name}
                        cx="20"
                        cy="20"
                        r="15.915"
                        fill="transparent"
                        stroke={segment.color}
                        strokeWidth="3.2"
                        strokeDasharray={segment.strokeDasharray}
                        strokeDashoffset={segment.strokeDashoffset}
                        className="transition-all duration-300"
                      />
                    ))}
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-black text-slate-700">{orderStatusStats.total}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Orders</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs w-full">
                  {orderStatusStats.list.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-50 hover:bg-slate-50 transition-colors"
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-700 truncate capitalize">{item.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {item.count} orders ({item.percentage.toFixed(0)}%)
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-lg font-bold text-slate-800">Category Revenue Shares</CardTitle>
            <p className="text-xs text-slate-500">Gross receipts segmented across product categories.</p>
          </CardHeader>
          <CardContent className="pt-6">
            {categorySales.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">No categorical sales logged.</div>
            ) : (
              <div className="space-y-4">
                {categorySales.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>{item.category}</span>
                      <span className="text-slate-500">
                        {formatCurrency(item.revenue)} ({item.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-teal-500 to-[#08665F] rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">Top Performing Items</CardTitle>
              <p className="text-xs text-slate-500">Highest grossing catalogue listings.</p>
            </div>
            
          </CardHeader>
          <CardContent className="pt-6">
            {topProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                No items have been sold in this range.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {topProducts.map((p, idx) => (
                  <div key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex-shrink-0 w-8 h-8 rounded bg-slate-50 border overflow-hidden flex items-center justify-center text-xs font-bold text-slate-500">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-700 truncate">{p.title}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {p.quantity} units sold
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
