import { useState, useMemo } from "react";
import {
  X,
  BarChart3,
  TrendingUp,
  Users,
  Wrench,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { useCurrentTheme } from "@/utils/hooks/useCurrentTheme";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/card";
import type { EquipmentAnalyticsProps } from "./types";
import { COLORS, NIVO_THEME_DARK, NIVO_THEME_LIGHT } from "@/utils/constants";

export const EquipmentAnalytics = ({
  equipment,
  open,
  onClose,
}: EquipmentAnalyticsProps) => {
  const [selectedFarmer, setSelectedFarmer] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const theme = useCurrentTheme();
  const isDarkMode = theme === "dark";

  // Extract unique farmers, types, and statuses
  const filterOptions = useMemo(() => {
    const farmers = new Set<string>();
    const types = new Set<string>();
    const statuses = new Set<string>();

    equipment?.forEach((eq) => {
      if (typeof eq.farmer_id === "object" && eq.farmer_id?.name) {
        farmers.add(eq.farmer_id.name);
      }
      types.add(eq.type);
      statuses.add(eq.status);
    });

    return {
      farmers: Array.from(farmers).sort(),
      types: Array.from(types).sort(),
      statuses: Array.from(statuses).sort(),
    };
  }, [equipment]);

  // Filter equipment based on selections
  const filteredEquipment = useMemo(() => {
    if (!equipment) return [];

    return equipment.filter((eq) => {
      if (
        selectedFarmer !== "all" &&
        (typeof eq.farmer_id !== "object" ||
          eq.farmer_id?.name !== selectedFarmer)
      ) {
        return false;
      }
      if (selectedStatus !== "all" && eq.status !== selectedStatus) {
        return false;
      }
      if (selectedType !== "all" && eq.type !== selectedType) {
        return false;
      }
      return true;
    });
  }, [equipment, selectedFarmer, selectedStatus, selectedType]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredEquipment.length;
    const active = filteredEquipment.filter(
      (e) => e.status === "active"
    ).length;
    const maintenance = filteredEquipment.filter(
      (e) => e.status === "maintenance"
    ).length;
    const retired = filteredEquipment.filter(
      (e) => e.status === "retired"
    ).length;

    // Calculate average age
    const now = new Date();
    const totalAge = filteredEquipment.reduce((sum, eq) => {
      const purchaseDate = new Date(eq.purchase_date);
      const ageInYears =
        (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return sum + ageInYears;
    }, 0);
    const avgAge = total > 0 ? (totalAge / total).toFixed(1) : "0";

    // Equipment needing service (>6 months since last service)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const needsService = filteredEquipment.filter((eq) => {
      if (!eq.last_service_date) return true;
      return new Date(eq.last_service_date) < sixMonthsAgo;
    }).length;

    return { total, active, maintenance, retired, avgAge, needsService };
  }, [filteredEquipment]);

  // Equipment by type
  const equipmentByType = useMemo(() => {
    const typeCount: Record<string, number> = {};
    filteredEquipment.forEach((eq) => {
      typeCount[eq.type] = (typeCount[eq.type] || 0) + 1;
    });

    return Object.entries(typeCount)
      .map(([type, count], idx) => ({
        id: type,
        label: type,
        value: count,
        color: COLORS[idx % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredEquipment]);

  // Equipment by status
  const equipmentByStatus = useMemo(() => {
    const statusCount: Record<string, number> = {};
    filteredEquipment.forEach((eq) => {
      statusCount[eq.status] = (statusCount[eq.status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([status, count], idx) => ({
      id: status,
      label: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: COLORS[idx % COLORS.length],
    }));
  }, [filteredEquipment]);

  // Equipment by farmer
  const equipmentByFarmer = useMemo(() => {
    const farmerCount: Record<string, number> = {};
    filteredEquipment.forEach((eq) => {
      const farmer =
        typeof eq.farmer_id === "object" && eq.farmer_id?.name
          ? eq.farmer_id.name
          : "Unknown";
      farmerCount[farmer] = (farmerCount[farmer] || 0) + 1;
    });

    return Object.entries(farmerCount)
      .map(([farmer, count]) => ({ farmer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredEquipment]);

  // Equipment age distribution
  const ageDistribution = useMemo(() => {
    const now = new Date();
    const ageRanges: Record<string, number> = {
      "0-1 years": 0,
      "1-2 years": 0,
      "2-3 years": 0,
      "3-5 years": 0,
      "5+ years": 0,
    };

    filteredEquipment.forEach((eq) => {
      const purchaseDate = new Date(eq.purchase_date);
      const ageInYears =
        (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

      if (ageInYears < 1) ageRanges["0-1 years"]++;
      else if (ageInYears < 2) ageRanges["1-2 years"]++;
      else if (ageInYears < 3) ageRanges["2-3 years"]++;
      else if (ageInYears < 5) ageRanges["3-5 years"]++;
      else ageRanges["5+ years"]++;
    });

    return Object.entries(ageRanges).map(([range, count]) => ({
      range,
      count,
    }));
  }, [filteredEquipment]);

  // Service status breakdown
  const serviceStatus = useMemo(() => {
    const now = new Date();
    const categories: Record<string, number> = {
      "Recently Serviced": 0,
      "Due Soon": 0,
      Overdue: 0,
      "Never Serviced": 0,
    };

    filteredEquipment.forEach((eq) => {
      if (!eq.last_service_date) {
        categories["Never Serviced"]++;
        return;
      }

      const lastService = new Date(eq.last_service_date);
      const monthsSince =
        (now.getTime() - lastService.getTime()) / (1000 * 60 * 60 * 24 * 30);

      if (monthsSince < 3) categories["Recently Serviced"]++;
      else if (monthsSince < 6) categories["Due Soon"]++;
      else categories["Overdue"]++;
    });

    return Object.entries(categories)
      .filter(([, count]) => count > 0)
      .map(([category, count]) => ({ category, count }));
  }, [filteredEquipment]);

  if (!open) return null;

  return (
    <Card className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Equipment Analytics</h2>
          </div>
          <Button onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Filters */}
          <div className="p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 border">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                Filter by Farmer
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
                Filter by Status
              </label>
              <Select
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={[
                  { value: "all", label: "All Statuses" },
                  ...filterOptions.statuses.map((s) => ({
                    value: s,
                    label: s.charAt(0).toUpperCase() + s.slice(1),
                  })),
                ]}
                fullWidth
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">
                Filter by Type
              </label>
              <Select
                value={selectedType}
                onChange={setSelectedType}
                options={[
                  { value: "all", label: "All Types" },
                  ...filterOptions.types.map((t) => ({ value: t, label: t })),
                ]}
                fullWidth
              />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Equipment
                </span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.active} active • {stats.maintenance} in maintenance •{" "}
                {stats.retired} retired
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Average Age
                </span>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {stats.avgAge} years
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Across all equipment in system
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Needs Service
                </span>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {stats.needsService}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Overdue or never serviced (&gt;6 months)
              </p>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Equipment by Type */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Equipment by type
              </h3>
              <div className="h-80">
                {equipmentByType.length > 0 ? (
                  <ResponsivePie
                    data={equipmentByType}
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

            {/* Equipment by Status */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Equipment status
              </h3>
              <div className="h-80">
                {equipmentByStatus.length > 0 ? (
                  <ResponsivePie
                    data={equipmentByStatus}
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

            {/* Equipment by Farmer */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Equipment by farmer (Top 10)
              </h3>
              <div className="h-80">
                {equipmentByFarmer.length > 0 ? (
                  <ResponsiveBar
                    data={equipmentByFarmer}
                    keys={["count"]}
                    indexBy="farmer"
                    margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: "linear" }}
                    colors={COLORS[0]}
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
                      legend: "Count",
                      legendPosition: "middle",
                      legendOffset: -50,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor="#ffffff"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Equipment Age Distribution */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                Age distribution
              </h3>
              <div className="h-80">
                {ageDistribution.length > 0 ? (
                  <ResponsiveBar
                    data={ageDistribution}
                    keys={["count"]}
                    indexBy="range"
                    margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: "linear" }}
                    colors={COLORS[1]}
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
                      legend: "Age Range",
                      legendPosition: "middle",
                      legendOffset: 50,
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: "Count",
                      legendPosition: "middle",
                      legendOffset: -50,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor="#ffffff"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Service Status */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 lg:col-span-2">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                Service Status Breakdown
              </h3>
              <div className="h-80">
                {serviceStatus.length > 0 ? (
                  <ResponsiveBar
                    data={serviceStatus}
                    keys={["count"]}
                    indexBy="category"
                    margin={{ top: 20, right: 30, bottom: 60, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: "linear" }}
                    colors={COLORS[2]}
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
                      tickRotation: 0,
                      legend: "Service Status",
                      legendPosition: "middle",
                      legendOffset: 40,
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: "Count",
                      legendPosition: "middle",
                      legendOffset: -50,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor="#ffffff"
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
