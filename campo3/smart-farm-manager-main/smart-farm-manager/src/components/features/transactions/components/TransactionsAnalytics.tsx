import { useState, useMemo } from "react";
import {
  X,
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  Wallet,
} from "lucide-react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/card";
import { COLORS, NIVO_THEME_DARK, NIVO_THEME_LIGHT } from "@/utils/constants";
import { useCurrentTheme } from "@/utils/hooks/useCurrentTheme";
import type { TransactionsAnalyticsProps } from "./types";

export const TransactionsAnalytics = ({
  transactions,
  open,
  onClose,
}: TransactionsAnalyticsProps) => {
  const [selectedFarmer, setSelectedFarmer] = useState("all");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [timeRange, setTimeRange] = useState("all");

  const theme = useCurrentTheme();
  const isDarkMode = theme === "dark";

  // Extract unique filter options
  const filterOptions = useMemo(() => {
    const farmers = new Set<string>();
    const categories = new Set<string>();
    const statuses = new Set<string>();

    transactions?.forEach((tx) => {
      if (typeof tx.farmer_id === "object" && tx.farmer_id?.name) {
        farmers.add(tx.farmer_id.name);
      }
      categories.add(tx.category);
      statuses.add(tx.payment_status);
    });

    return {
      farmers: Array.from(farmers).sort(),
      categories: Array.from(categories).sort(),
      statuses: Array.from(statuses).sort(),
    };
  }, [transactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (!transactions) return [];

    let filtered = transactions.filter((tx) => {
      if (
        selectedFarmer !== "all" &&
        (typeof tx.farmer_id !== "object" ||
          tx.farmer_id?.name !== selectedFarmer)
      ) {
        return false;
      }
      if (
        selectedPaymentStatus !== "all" &&
        tx.payment_status !== selectedPaymentStatus
      ) {
        return false;
      }
      if (selectedType !== "all" && tx.type !== selectedType) {
        return false;
      }
      if (selectedCategory !== "all" && tx.category !== selectedCategory) {
        return false;
      }
      return true;
    });

    // Apply time range filter
    if (timeRange !== "all") {
      const now = new Date();
      const cutoffDate = new Date();

      switch (timeRange) {
        case "7days":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "30days":
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case "90days":
          cutoffDate.setDate(now.getDate() - 90);
          break;
        case "year":
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter((tx) => new Date(tx.date) >= cutoffDate);
    }

    return filtered;
  }, [
    transactions,
    selectedFarmer,
    selectedPaymentStatus,
    selectedType,
    selectedCategory,
    timeRange,
  ]);

  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalExpense = filteredTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0);

    const netCashFlow = totalIncome - totalExpense;

    const paid = filteredTransactions.filter(
      (tx) => tx.payment_status === "paid"
    ).length;
    const pending = filteredTransactions.filter(
      (tx) => tx.payment_status === "pending"
    ).length;
    const overdue = filteredTransactions.filter(
      (tx) => tx.payment_status === "overdue"
    ).length;

    const avgTransactionAmount =
      filteredTransactions.length > 0
        ? filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0) /
          filteredTransactions.length
        : 0;

    return {
      totalIncome,
      totalExpense,
      netCashFlow,
      paid,
      pending,
      overdue,
      total: filteredTransactions.length,
      avgTransactionAmount,
    };
  }, [filteredTransactions]);

  // Income vs Expense by Category
  const categoryBreakdown = useMemo(() => {
    const breakdown: Record<string, { income: number; expense: number }> = {};

    filteredTransactions.forEach((tx) => {
      if (!breakdown[tx.category]) {
        breakdown[tx.category] = { income: 0, expense: 0 };
      }
      if (tx.type === "income") {
        breakdown[tx.category].income += tx.amount;
      } else {
        breakdown[tx.category].expense += tx.amount;
      }
    });

    return Object.entries(breakdown)
      .map(([category, amounts]) => ({
        category,
        income: amounts.income,
        expense: amounts.expense,
      }))
      .sort((a, b) => b.income + b.expense - (a.income + a.expense))
      .slice(0, 10);
  }, [filteredTransactions]);

  // Payment method distribution
  const paymentMethodData = useMemo(() => {
    const methods: Record<string, number> = {};

    filteredTransactions.forEach((tx) => {
      methods[tx.payment_method] =
        (methods[tx.payment_method] || 0) + tx.amount;
    });

    return Object.entries(methods)
      .map(([method, amount], idx) => ({
        id: method,
        label: method
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        value: amount,
        color: COLORS[idx % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  // Payment status distribution
  const paymentStatusData = useMemo(() => {
    const statuses: Record<string, number> = {};

    filteredTransactions.forEach((tx) => {
      statuses[tx.payment_status] = (statuses[tx.payment_status] || 0) + 1;
    });

    return Object.entries(statuses).map(([status, count], idx) => ({
      id: status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: COLORS[idx % COLORS.length],
    }));
  }, [filteredTransactions]);

  // Monthly trend
  const monthlyTrend = useMemo(() => {
    const monthlyData: Record<string, { income: number; expense: number }> = {};

    filteredTransactions.forEach((tx) => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }

      if (tx.type === "income") {
        monthlyData[monthKey].income += tx.amount;
      } else {
        monthlyData[monthKey].expense += tx.amount;
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort();

    return [
      {
        id: "Income",
        color: COLORS[0],
        data: sortedMonths.map((month) => ({
          x: month,
          y: monthlyData[month].income,
        })),
      },
      {
        id: "Expense",
        color: COLORS[3],
        data: sortedMonths.map((month) => ({
          x: month,
          y: monthlyData[month].expense,
        })),
      },
    ];
  }, [filteredTransactions]);

  // Top farmers by transaction volume
  const farmerData = useMemo(() => {
    const farmers: Record<string, { total: number; count: number }> = {};

    filteredTransactions.forEach((tx) => {
      const farmerName =
        typeof tx.farmer_id === "object" && tx.farmer_id?.name
          ? tx.farmer_id.name
          : "Unknown";

      if (!farmers[farmerName]) {
        farmers[farmerName] = { total: 0, count: 0 };
      }
      farmers[farmerName].total += tx.amount;
      farmers[farmerName].count += 1;
    });

    return Object.entries(farmers)
      .map(([farmer, data]) => ({
        farmer,
        total: data.total,
        count: data.count,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [filteredTransactions]);

  // Category distribution (pie chart)
  const categoryDistribution = useMemo(() => {
    const categories: Record<string, number> = {};

    filteredTransactions.forEach((tx) => {
      categories[tx.category] = (categories[tx.category] || 0) + tx.amount;
    });

    return Object.entries(categories)
      .map(([category, amount], idx) => ({
        id: category,
        label: category
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        value: amount,
        color: COLORS[idx % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  if (!open) return null;

  return (
    <Card className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Transactions Analytics
            </h2>
          </div>
          <Button
            onClick={onClose}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Filters */}
          <div className="p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 border border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                Time Range
              </label>
              <Select
                value={timeRange}
                onChange={setTimeRange}
                options={[
                  { value: "all", label: "All Time" },
                  { value: "7days", label: "Last 7 Days" },
                  { value: "30days", label: "Last 30 Days" },
                  { value: "90days", label: "Last 90 Days" },
                  { value: "year", label: "Last Year" },
                ]}
                fullWidth
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                Farmer
              </label>
              <Select
                value={selectedFarmer}
                onChange={setSelectedFarmer}
                options={[
                  { value: "all", label: "All Farmers" },
                  ...filterOptions.farmers.map((f) => ({ value: f, label: f })),
                ]}
                fullWidth
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                Type
              </label>
              <Select
                value={selectedType}
                onChange={setSelectedType}
                options={[
                  { value: "all", label: "All Types" },
                  { value: "income", label: "Income" },
                  { value: "expense", label: "Expense" },
                ]}
                fullWidth
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                Category
              </label>
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                options={[
                  { value: "all", label: "All Categories" },
                  ...filterOptions.categories.map((c) => ({
                    value: c as string,
                    label: (c as string)
                      .split("_")
                      .map(
                        (w: string) => w.charAt(0).toUpperCase() + w.slice(1)
                      )
                      .join(" "),
                  })),
                ]}
                fullWidth
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                Payment Status
              </label>
              <Select
                value={selectedPaymentStatus}
                onChange={setSelectedPaymentStatus}
                options={[
                  { value: "all", label: "All Statuses" },
                  ...filterOptions.statuses.map((s) => ({
                    value: s as string,
                    label:
                      (s as string).charAt(0).toUpperCase() +
                      (s as string).slice(1),
                  })),
                ]}
                fullWidth
              />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Income
                </span>
              </div>
              <p className="text-3xl font-bold text-green-600">
                ${stats.totalIncome.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                From{" "}
                {
                  filteredTransactions.filter((tx) => tx.type === "income")
                    .length
                }{" "}
                transactions
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3 mb-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Expense
                </span>
              </div>
              <p className="text-3xl font-bold text-red-600">
                ${stats.totalExpense.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                From{" "}
                {
                  filteredTransactions.filter((tx) => tx.type === "expense")
                    .length
                }{" "}
                transactions
              </p>
            </div>

            <div
              className={`${
                stats.netCashFlow >= 0
                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800"
                  : "bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800"
              } p-4 rounded-lg border`}
            >
              <div className="flex items-center gap-3 mb-2">
                <DollarSign
                  className={`w-5 h-5 ${
                    stats.netCashFlow >= 0 ? "text-blue-600" : "text-orange-600"
                  }`}
                />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Net Cash Flow
                </span>
              </div>
              <p
                className={`text-3xl font-bold ${
                  stats.netCashFlow >= 0 ? "text-blue-600" : "text-orange-600"
                }`}
              >
                ${stats.netCashFlow.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.netCashFlow >= 0 ? "Positive" : "Negative"} balance
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-2">
                <Wallet className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Avg Transaction
                </span>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                ${stats.avgTransactionAmount.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.paid} paid • {stats.pending} pending • {stats.overdue}{" "}
                overdue
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Income vs Expense Trend */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Calendar className="w-5 h-5 text-blue-600" />
                Monthly Trend
              </h3>
              <div className="h-80">
                {monthlyTrend[0]?.data.length > 0 ? (
                  <ResponsiveLine
                    data={monthlyTrend}
                    margin={{ top: 20, right: 110, bottom: 60, left: 80 }}
                    xScale={{ type: "point" }}
                    yScale={{ type: "linear", min: "auto", max: "auto" }}
                    curve="monotoneX"
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45,
                      legend: "Month",
                      legendOffset: 50,
                      legendPosition: "middle",
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: "Amount ($)",
                      legendOffset: -60,
                      legendPosition: "middle",
                      format: (value) => `$${value.toLocaleString()}`,
                    }}
                    theme={isDarkMode ? NIVO_THEME_DARK : NIVO_THEME_LIGHT}
                    colors={{ datum: "color" }}
                    pointSize={8}
                    pointColor={{ theme: "background" }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: "serieColor" }}
                    pointLabelYOffset={-12}
                    useMesh={true}
                    legends={[
                      {
                        anchor: "bottom-right",
                        direction: "column",
                        justify: false,
                        translateX: 100,
                        translateY: 0,
                        itemsSpacing: 0,
                        itemDirection: "left-to-right",
                        itemWidth: 80,
                        itemHeight: 20,
                        itemOpacity: 0.75,
                        symbolSize: 12,
                        symbolShape: "circle",
                      },
                    ]}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Income vs Expense by Category */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Income vs Expense by Category (Top 10)
              </h3>
              <div className="h-80">
                {categoryBreakdown.length > 0 ? (
                  <ResponsiveBar
                    data={categoryBreakdown}
                    keys={["income", "expense"]}
                    indexBy="category"
                    margin={{ top: 20, right: 130, bottom: 60, left: 80 }}
                    padding={0.3}
                    groupMode="grouped"
                    valueScale={{ type: "linear" }}
                    colors={[COLORS[0], COLORS[3]]}
                    theme={isDarkMode ? NIVO_THEME_DARK : NIVO_THEME_LIGHT}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45,
                      legend: "Category",
                      legendPosition: "middle",
                      legendOffset: 50,
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: "Amount ($)",
                      legendPosition: "middle",
                      legendOffset: -60,
                      format: (value) => `$${value.toLocaleString()}`,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor="#ffffff"
                    legends={[
                      {
                        dataFrom: "keys",
                        anchor: "bottom-right",
                        direction: "column",
                        justify: false,
                        translateX: 120,
                        translateY: 0,
                        itemsSpacing: 2,
                        itemWidth: 100,
                        itemHeight: 20,
                        itemDirection: "left-to-right",
                        itemOpacity: 0.85,
                        symbolSize: 20,
                      },
                    ]}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Distribution */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <CreditCard className="w-5 h-5 text-orange-600" />
                Payment Methods
              </h3>
              <div className="h-80">
                {paymentMethodData.length > 0 ? (
                  <ResponsivePie
                    data={paymentMethodData}
                    margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    colors={COLORS}
                    theme={isDarkMode ? NIVO_THEME_DARK : NIVO_THEME_LIGHT}
                    borderWidth={1}
                    borderColor={{
                      from: "color",
                      modifiers: [["darker", isDarkMode ? 0.8 : 0.4]],
                    }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor={isDarkMode ? "#e5e7eb" : "#374151"}
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: "color" }}
                    arcLabelsSkipAngle={10}
                    arcLabel={(d) => `$${d.value.toLocaleString()}`}
                    arcLabelsTextColor={{
                      from: "color",
                      modifiers: [["darker", isDarkMode ? 2 : 1.6]],
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Top Farmers by Transaction Volume */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Users className="w-5 h-5 text-blue-600" />
                Top Farmers by Volume (Top 10)
              </h3>
              <div className="h-80">
                {farmerData.length > 0 ? (
                  <ResponsiveBar
                    data={farmerData}
                    keys={["total"]}
                    indexBy="farmer"
                    margin={{ top: 20, right: 30, bottom: 60, left: 80 }}
                    padding={0.3}
                    valueScale={{ type: "linear" }}
                    colors={COLORS[4]}
                    theme={isDarkMode ? NIVO_THEME_DARK : NIVO_THEME_LIGHT}
                    borderColor={{
                      from: "color",
                      modifiers: [["darker", isDarkMode ? 0.8 : 0.4]],
                    }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45,
                      legend: "Farmer",
                      legendPosition: "middle",
                      legendOffset: 50,
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: "Total Amount ($)",
                      legendPosition: "middle",
                      legendOffset: -60,
                      format: (value) => `$${value.toLocaleString()}`,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    label={(d) => `${d.value?.toLocaleString() ?? "0"}`}
                    labelTextColor="#ffffff"
                    tooltip={({ indexValue, value, data }) => (
                      <div className="bg-white dark:bg-gray-800 px-3 py-2 rounded shadow-lg border border-gray-200 dark:border-gray-700">
                        <strong className="text-gray-900 dark:text-gray-100">
                          {indexValue}
                        </strong>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Total: ${value.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          Transactions: {data.count}
                        </div>
                      </div>
                    )}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Stats Summary */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Completed Payments
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{stats.paid}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.total > 0
                  ? ((stats.paid / stats.total) * 100).toFixed(1)
                  : 0}
                % of total
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Pending Payments
                </span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.total > 0
                  ? ((stats.pending / stats.total) * 100).toFixed(1)
                  : 0}
                % of total
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Overdue Payments
                </span>
              </div>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.total > 0
                  ? ((stats.overdue / stats.total) * 100).toFixed(1)
                  : 0}
                % of total
              </p>
            </div>
          </div>
          <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Status Distribution */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Clock className="w-5 h-5 text-purple-600" />
                Payment Status
              </h3>
              <div className="h-80">
                {paymentStatusData.length > 0 ? (
                  <ResponsivePie
                    data={paymentStatusData}
                    margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    colors={COLORS}
                    theme={isDarkMode ? NIVO_THEME_DARK : NIVO_THEME_LIGHT}
                    borderWidth={1}
                    borderColor={{
                      from: "color",
                      modifiers: [["darker", isDarkMode ? 0.8 : 0.4]],
                    }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor={isDarkMode ? "#e5e7eb" : "#374151"}
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: "color" }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{
                      from: "color",
                      modifiers: [["darker", isDarkMode ? 2 : 1.6]],
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Category Distribution */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Amount by Category
              </h3>
              <div className="h-80">
                {categoryDistribution.length > 0 ? (
                  <ResponsivePie
                    data={categoryDistribution}
                    margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
                    innerRadius={0.5}
                    padAngle={0.7}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    colors={COLORS}
                    theme={isDarkMode ? NIVO_THEME_DARK : NIVO_THEME_LIGHT}
                    borderWidth={1}
                    borderColor={{
                      from: "color",
                      modifiers: [["darker", isDarkMode ? 0.8 : 0.4]],
                    }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor={isDarkMode ? "#e5e7eb" : "#374151"}
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: "color" }}
                    arcLabelsSkipAngle={10}
                    arcLabel={(d) => `$${d.value.toLocaleString()}`}
                    arcLabelsTextColor={{
                      from: "color",
                      modifiers: [["darker", isDarkMode ? 2 : 1.6]],
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Card>
  );
};
