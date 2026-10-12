import { useState, useMemo } from "react";
import { useCurrentTheme } from "@/utils/hooks/useCurrentTheme";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";
import {
  Calendar,
  MapPin,
  Sprout,
  TrendingUp,
  Filter,
  BarChart3,
  X,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/Select";

import type { CropsAnalyticsProps } from "./types";
import { COLORS, NIVO_THEME_DARK, NIVO_THEME_LIGHT } from "@/utils/constants";

export const CropsAnalytics = ({
  crops: data,
  open,
  onClose,
}: CropsAnalyticsProps) => {
  const [filters, setFilters] = useState({
    cropType: "all",
    location: "all",
    soilType: "all",
    status: "all",
  });

  const theme = useCurrentTheme();
  const isDarkMode = theme === "dark";

  const [sortBy, setSortBy] = useState("name");

  // Extract unique values for filters
  const filterOptions = useMemo(() => {
    const types = new Set<string>();
    const locations = new Set<string>();
    const soils = new Set<string>();

    data?.forEach((crop) => {
      types.add(crop.type);
      if (typeof crop.field_id === "object" && crop.field_id?.location) {
        locations.add(crop.field_id.location);
      }
      if (typeof crop.field_id === "object" && crop.field_id?.soil_type) {
        soils.add(crop.field_id.soil_type);
      }
    });

    return {
      types: Array.from(types).filter(Boolean),
      locations: Array.from(locations).filter(Boolean),
      soils: Array.from(soils).filter(Boolean),
    };
  }, [data]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    if (!data) return [];

    const filtered = data.filter((crop) => {
      if (filters.cropType !== "all" && crop.type !== filters.cropType)
        return false;
      if (
        filters.location !== "all" &&
        (typeof crop.field_id !== "object" ||
          crop.field_id?.location !== filters.location)
      )
        return false;
      if (
        filters.soilType !== "all" &&
        (typeof crop.field_id !== "object" ||
          crop.field_id?.soil_type !== filters.soilType)
      )
        return false;

      if (filters.status !== "all") {
        const isHarvested =
          crop.harvest_date && new Date(crop.harvest_date) < new Date();
        const isActive =
          crop.planting_date &&
          new Date(crop.planting_date) <= new Date() &&
          (!crop.harvest_date || new Date(crop.harvest_date) >= new Date());
        const isPlanned =
          crop.planting_date && new Date(crop.planting_date) > new Date();

        if (filters.status === "harvested" && !isHarvested) return false;
        if (filters.status === "active" && !isActive) return false;
        if (filters.status === "planned" && !isPlanned) return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "area":
          const aArea =
            typeof a.field_id === "object" ? a.field_id?.area || 0 : 0;
          const bArea =
            typeof b.field_id === "object" ? b.field_id?.area || 0 : 0;
          return bArea - aArea;

        // What is this? what's the logic? what's exactly being sorted here?
        case "planting_date":
          return (
            new Date(b.planting_date).getTime() -
            new Date(a.planting_date).getTime()
          );
        default:
          return 0;
      }
    });

    return filtered;
  }, [data, filters, sortBy]);

  // Statistics calculations
  const statistics = useMemo(() => {
    if (!filteredData.length) return null;

    const totalArea = filteredData.reduce(
      (sum, crop) =>
        sum +
        (typeof crop.field_id === "object" ? crop.field_id?.area || 0 : 0),
      0
    );
    const avgArea = totalArea / filteredData.length;

    const harvested = filteredData.filter(
      (c) => c.harvest_date && new Date(c.harvest_date) < new Date()
    ).length;
    const active = filteredData.filter((c) => {
      const planted = new Date(c.planting_date) <= new Date();
      const notHarvested =
        !c.harvest_date || new Date(c.harvest_date) >= new Date();
      return planted && notHarvested;
    }).length;
    const planned = filteredData.filter(
      (c) => new Date(c.planting_date) > new Date()
    ).length;

    return {
      total: filteredData.length,
      totalArea: totalArea.toFixed(2),
      avgArea: avgArea.toFixed(2),
      harvested,
      active,
      planned,
    };
  }, [filteredData]);

  // Crop type distribution
  const cropTypeData = useMemo(() => {
    const distribution: Record<string, number> = {};
    filteredData.forEach((crop) => {
      distribution[crop.type] = (distribution[crop.type] || 0) + 1;
    });

    return Object.entries(distribution).map(([type, count], idx) => ({
      id: type,
      label: type,
      value: count,
      color: COLORS[idx % COLORS.length],
    }));
  }, [filteredData]);

  // Area by location
  const areaByLocation = useMemo(() => {
    const locationData: Record<string, number> = {};
    filteredData.forEach((crop) => {
      const loc =
        (typeof crop.field_id === "object" && crop.field_id?.location) ||
        "Unknown";
      const area =
        typeof crop.field_id === "object" ? crop.field_id?.area || 0 : 0;
      locationData[loc] = (locationData[loc] || 0) + area;
    });

    return Object.entries(locationData).map(([location, area]) => ({
      location,
      area: parseFloat(area.toFixed(2)),
    }));
  }, [filteredData]);

  // Timeline data (crops by month)
  const timelineData = useMemo(() => {
    const monthCounts: Record<string, number> = {};

    filteredData.forEach((crop) => {
      const date = new Date(crop.planting_date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });

    const sorted = Object.entries(monthCounts).sort();

    return [
      {
        id: "Plantings",
        data: sorted.map(([month, count]) => ({
          x: month,
          y: count,
        })),
      },
    ];
  }, [filteredData]);

  // Soil type distribution
  const soilTypeData = useMemo(() => {
    const distribution: Record<string, number> = {};
    filteredData.forEach((crop) => {
      const soil: string =
        (typeof crop.field_id === "object" && crop.field_id?.soil_type) ||
        "Unknown";
      distribution[soil] = (distribution[soil] || 0) + 1;
    });

    return Object.entries(distribution).map(([type, count]) => ({
      soil: type,
      count,
    }));
  }, [filteredData]);

  if (!data || data.length === 0) {
    return <div className="p-6 text-gray-400">No crops data available</div>;
  }

  if (!open) return null;

  return (
    <Card className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Crops Analytics</h2>
          </div>
          <Button onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 gap-6 space-y-6">
          {/* Filters Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700 ">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Filters & Sorting</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm text-gray-400 dark:text-gray-300 mb-1">
                  Crop Type
                </label>
                <Select
                  placeholder="All crops types"
                  value={filters.cropType}
                  onChange={(value) =>
                    setFilters({ ...filters, cropType: value })
                  }
                  options={[
                    { value: "all", label: "All Crop Types" },
                    ...filterOptions.types.map((type) => ({
                      value: type,
                      label: type,
                    })),
                  ]}
                  fullWidth
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 dark:text-gray-300 mb-1">
                  Location
                </label>
                <Select
                  placeholder="All locations"
                  value={filters.location}
                  onChange={(value) =>
                    setFilters({ ...filters, location: value })
                  }
                  options={[
                    { value: "all", label: "All Locations" },
                    ...filterOptions.locations.map((loc) => ({
                      value: loc,
                      label: loc,
                    })),
                  ]}
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 dark:text-gray-300 mb-1">
                  Soil type
                </label>
                <Select
                  placeholder="All soil types"
                  value={filters.soilType}
                  onChange={(value) =>
                    setFilters({ ...filters, soilType: value })
                  }
                  options={[
                    { value: "all", label: "All Soil Types" },
                    ...filterOptions.soils.map((soil) => ({
                      value: soil,
                      label: soil,
                    })),
                  ]}
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 dark:text-gray-300 mb-1">
                  Status
                </label>
                <Select
                  placeholder="All statuses"
                  value={filters.status}
                  onChange={(value) =>
                    setFilters({ ...filters, status: value })
                  }
                  options={[
                    { value: "all", label: "All Statuses" },
                    { value: "active", label: "Active" },
                    { value: "harvested", label: "Harvested" },
                    { value: "planned", label: "Planned" },
                  ]}
                  fullWidth
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 dark:text-gray-300 mb-1">
                  Sort By
                </label>
                <Select
                  placeholder="Sort by"
                  value={sortBy}
                  onChange={(value) => setSortBy(value)}
                  options={[
                    { value: "name", label: "Name" },
                    { value: "area", label: "Area (Largest)" },
                    { value: "planting_date", label: "Planting Date" },
                  ]}
                  fullWidth
                />
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          {statistics && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Sprout className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Crops
                  </span>
                </div>
                <p className="text-2xl font-bold">{statistics.total}</p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Area
                  </span>
                </div>
                <p className="text-2xl font-bold ">{statistics.totalArea} ha</p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Area
                  </span>
                </div>
                <p className="text-2xl font-bold ">{statistics.avgArea} ha</p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-green-200 dark:border-green-700 bg-green-900/20  flex flex-col items-center justify-center text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Active
                </span>
                <p className="text-2xl font-bold text-green-400">
                  {statistics.active}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-blue-200 dark:border-blue-700 bg-blue-900/20 flex flex-col items-center justify-center text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Harvested
                </span>
                <p className="text-2xl font-bold text-blue-400">
                  {statistics.harvested}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-yellow-200  dark:border-yellow-700  dark:bg-yellow-900/20 flex flex-col items-center justify-center text-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Planned
                </span>
                <p className="text-2xl font-bold text-yellow-400">
                  {statistics.planned}
                </p>
              </div>
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Crop Type Distribution */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold  mb-4">
                Crop type distribution
              </h3>
              <div className="h-80">
                <ResponsivePie
                  data={cropTypeData}
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
              </div>
            </div>

            {/* Area by Location */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">
                Total Area by Location
              </h3>
              <div className="h-80">
                <ResponsiveBar
                  data={areaByLocation}
                  keys={["area"]}
                  indexBy="location"
                  margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
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
                    legend: "Location",
                    legendPosition: "middle",
                    legendOffset: 45,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "Area (ha)",
                    legendPosition: "middle",
                    legendOffset: -50,
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor="#ffffff"
                  role="application"
                />
              </div>
            </div>

            {/* Planting Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold  mb-4">Planting Timeline</h3>
              <div className="h-80">
                <ResponsiveLine
                  data={timelineData}
                  margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
                  xScale={{ type: "point" }}
                  yScale={{
                    type: "linear",
                    min: "auto",
                    max: "auto",
                    stacked: false,
                  }}
                  curve="monotoneX"
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: -45,
                    legend: "Month",
                    legendOffset: 45,
                    legendPosition: "middle",
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "Number of Crops",
                    legendOffset: -50,
                    legendPosition: "middle",
                  }}
                  colors={COLORS}
                  pointSize={10}
                  pointColor={{ theme: "background" }}
                  pointBorderWidth={2}
                  pointBorderColor={{ from: "serieColor" }}
                  pointLabelYOffset={-12}
                  useMesh={true}
                  theme={isDarkMode ? NIVO_THEME_DARK : NIVO_THEME_LIGHT}
                />
              </div>
            </div>

            {/* Soil Type Distribution */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold  mb-4">
                Crops by Soil Type
              </h3>
              <div className="h-80">
                <ResponsiveBar
                  data={soilTypeData}
                  keys={["count"]}
                  indexBy="soil"
                  margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
                  padding={0.3}
                  layout="horizontal"
                  valueScale={{ type: "linear" }}
                  colors={COLORS[1]}
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
                    legend: "Number of Crops",
                    legendPosition: "middle",
                    legendOffset: 40,
                  }}
                  axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: "Soil Type",
                    legendPosition: "middle",
                    legendOffset: -50,
                  }}
                  labelSkipWidth={12}
                  labelSkipHeight={12}
                  labelTextColor="#ffffff"
                  theme={isDarkMode ? NIVO_THEME_DARK : NIVO_THEME_LIGHT}
                />
              </div>
            </div>
          </div>

          {/* Crops List */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold mb-4">
              Crops List ({filteredData.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 dark:border-gray-700">
                  <tr className="text-left  dark:text-gray-400">
                    <th className="pb-3 font-medium">Crop Name</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">Field</th>
                    <th className="pb-3 font-medium">Location</th>
                    <th className="pb-3 font-medium">Area (ha)</th>
                    <th className="pb-3 font-medium">Soil</th>
                    <th className="pb-3 font-medium">Planted</th>
                    <th className="pb-3 font-medium">Harvested</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-gray-300">
                  {filteredData.map((crop) => {
                    const isHarvested =
                      crop.harvest_date &&
                      new Date(crop.harvest_date) < new Date();
                    const isActive =
                      new Date(crop.planting_date) <= new Date() &&
                      (!crop.harvest_date ||
                        new Date(crop.harvest_date) >= new Date());
                    const status = isHarvested
                      ? "Harvested"
                      : isActive
                      ? "Active"
                      : "Planned";
                    const statusColor = isHarvested
                      ? "text-blue-700 dark:text-blue-400"
                      : isActive
                      ? "text-green-700 dark:text-green-400"
                      : "text-yellow-700 dark:text-yellow-400";

                    return (
                      <tr
                        key={crop._id}
                        className="border-b  border-gray-200  dark:border-gray-700/50 hover:dark:bg-gray-700/30 hover:bg-gray-100"
                      >
                        <td className="py-3 font-medium">{crop.name}</td>
                        <td className="py-3">{crop.type}</td>
                        <td className="py-3">
                          {typeof crop.field_id === "object"
                            ? crop.field_id?.name
                            : crop.field_id}
                        </td>
                        <td className="py-3 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {typeof crop.field_id === "object"
                            ? crop.field_id?.location
                            : "Unknown"}
                        </td>
                        <td className="py-3">
                          {typeof crop.field_id === "object"
                            ? crop.field_id?.area
                            : "Unknown"}
                        </td>
                        <td className="py-3">
                          {typeof crop.field_id === "object"
                            ? crop.field_id?.soil_type
                            : "Unknown"}
                        </td>
                        <td className="py-3">
                          {new Date(crop.planting_date).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          {crop.harvest_date
                            ? new Date(crop.harvest_date).toLocaleDateString()
                            : "Not set"}
                        </td>
                        <td className={`py-3 font-medium ${statusColor}`}>
                          {status}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Card>
    </Card>
  );
};
