"use client";

import { useMemo } from "react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";
import { Card } from "@/components/ui/card";
import { useCurrentTheme } from "@/utils/hooks/useCurrentTheme";
import { COLORS, NIVO_THEME_DARK, NIVO_THEME_LIGHT } from "@/utils/constants";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  MapPin,
  Activity,
  Leaf,
} from "lucide-react";

import type { DashboardChartsProps } from "./types";

export const DashboardCharts = ({
  fields,
  crops,
  animals,
  equipment,
  transactions,
}: DashboardChartsProps) => {
  const theme = useCurrentTheme();
  const isDarkMode = theme === "dark";

  // Area by Location
  const areaByLocation = useMemo(() => {
    const locationMap = new Map<string, number>();
    fields.forEach((field) => {
      const current = locationMap.get(field.location) || 0;
      locationMap.set(field.location, current + field.area);
    });

    return Array.from(locationMap.entries())
      .map(([location, area]) => ({
        location,
        area: parseFloat(area.toFixed(1)),
      }))
      .sort((a, b) => b.area - a.area)
      .slice(0, 8);
  }, [fields]);

  // Crop Type Distribution
  const cropTypeDistribution = useMemo(() => {
    const typeMap = new Map<string, number>();
    crops.forEach((crop) => {
      const current = typeMap.get(crop.type) || 0;
      typeMap.set(crop.type, current + 1);
    });

    return Array.from(typeMap.entries())
      .map(([type, count], idx) => ({
        id: type,
        label: type,
        value: count,
        color: COLORS[idx % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [crops]);

  // Animal Species Distribution
  const animalSpeciesDistribution = useMemo(() => {
    const speciesMap = new Map<string, number>();
    animals.forEach((animal) => {
      const current = speciesMap.get(animal.species) || 0;
      speciesMap.set(animal.species, current + 1);
    });

    return Array.from(speciesMap.entries())
      .map(([species, count], idx) => ({
        id: species,
        label: species,
        value: count,
        color: COLORS[idx % COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [animals]);

  // Equipment Status Distribution
  const equipmentStatusData = useMemo(() => {
    const statusMap = new Map<string, number>();
    equipment.forEach((eq) => {
      const current = statusMap.get(eq.status) || 0;
      statusMap.set(eq.status, current + 1);
    });

    return Array.from(statusMap.entries()).map(([status, count]) => ({
      status:
        status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
      count,
    }));
  }, [equipment]);

  // Monthly Financial Trend (last 6 months)
  const monthlyFinancialTrend = useMemo(() => {
    const monthlyData = new Map<
      string,
      { income: number; expense: number; net: number }
    >();

    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const current = monthlyData.get(monthKey) || {
        income: 0,
        expense: 0,
        net: 0,
      };

      if (tx.type === "income") {
        current.income += tx.amount;
      } else {
        current.expense += tx.amount;
      }
      current.net = current.income - current.expense;

      monthlyData.set(monthKey, current);
    });

    const sortedMonths = Array.from(monthlyData.keys()).sort().slice(-6);

    return [
      {
        id: "Income",
        color: COLORS[0],
        data: sortedMonths.map((month) => ({
          x: month,
          y: monthlyData.get(month)?.income || 0,
        })),
      },
      {
        id: "Expense",
        color: COLORS[3],
        data: sortedMonths.map((month) => ({
          x: month,
          y: monthlyData.get(month)?.expense || 0,
        })),
      },
      {
        id: "Net",
        color: COLORS[4],
        data: sortedMonths.map((month) => ({
          x: month,
          y: monthlyData.get(month)?.net || 0,
        })),
      },
    ];
  }, [transactions]);

  // Crop Timeline - Active vs Harvested
  const cropTimelineData = useMemo(() => {
    const now = new Date();
    let active = 0;
    let harvested = 0;

    crops.forEach((crop) => {
      const harvestDate = new Date(crop.harvest_date);
      if (harvestDate > now) {
        active++;
      } else {
        harvested++;
      }
    });

    return [
      { status: "Active", count: active },
      { status: "Harvested", count: harvested },
    ];
  }, [crops]);

  return (
    <div className="mb-8 space-y-6">
      {/* First Row - 2 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area by Location - Bar Chart */}
        <Card className="p-6 border-2 border-black dark:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Field Area by Location
            </h3>
          </div>
          <div className="h-80">
            {areaByLocation.length > 0 ? (
              <ResponsiveBar
                data={areaByLocation}
                keys={["area"]}
                indexBy="location"
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
                  legend: "Location",
                  legendPosition: "middle",
                  legendOffset: 50,
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
                enableLabel={false}
                tooltip={({ value, indexValue }) => (
                  <div className="bg-white dark:bg-gray-800 px-3 py-2 shadow-lg rounded border border-gray-200 dark:border-gray-700">
                    <strong>{indexValue}</strong>
                    <div>{value} ha</div>
                  </div>
                )}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </div>
        </Card>

        {/* Crop Type Distribution - Pie Chart */}
        <Card className="p-6 border-2 border-black dark:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-3 mb-4">
            <Leaf className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Crop Type Distribution
            </h3>
          </div>
          <div className="h-80">
            {cropTypeDistribution.length > 0 ? (
              <ResponsivePie
                data={cropTypeDistribution}
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
        </Card>
      </div>

      {/* Second Row - Financial Trend (full width) */}
      <Card className="p-6 border-2 border-black dark:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Financial Trend (Last 6 Months)
          </h3>
        </div>
        <div className="h-80">
          {monthlyFinancialTrend[0]?.data.length > 0 ? (
            <ResponsiveLine
              data={monthlyFinancialTrend}
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
      </Card>

      {/* Third Row - 3 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Animal Species - Pie Chart */}
        <Card className="p-6 border-2 border-black dark:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-3 mb-4">
            <PieChart className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Animal Species
            </h3>
          </div>
          <div className="h-64">
            {animalSpeciesDistribution.length > 0 ? (
              <ResponsivePie
                data={animalSpeciesDistribution}
                margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                colors={COLORS}
                theme={isDarkMode ? NIVO_THEME_DARK : NIVO_THEME_LIGHT}
                enableArcLinkLabels={false}
                arcLabelsSkipAngle={10}
                arcLabel={(d) => `${d.value}`}
                arcLabelsTextColor={{
                  from: "color",
                  modifiers: [["darker", isDarkMode ? 2 : 1.6]],
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data
              </div>
            )}
          </div>
        </Card>

        {/* Equipment Status - Bar Chart */}
        <Card className="p-6 border-2 border-black dark:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Equipment Status
            </h3>
          </div>
          <div className="h-64">
            {equipmentStatusData.length > 0 ? (
              <ResponsiveBar
                data={equipmentStatusData}
                keys={["count"]}
                indexBy="status"
                margin={{ top: 10, right: 20, bottom: 60, left: 50 }}
                padding={0.3}
                valueScale={{ type: "linear" }}
                colors={COLORS[1]}
                theme={isDarkMode ? NIVO_THEME_DARK : NIVO_THEME_LIGHT}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                enableLabel={true}
                labelTextColor="#ffffff"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data
              </div>
            )}
          </div>
        </Card>

        {/* Crop Timeline - Bar Chart */}
        <Card className="p-6 border-2 border-black dark:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Crop Timeline
            </h3>
          </div>
          <div className="h-64">
            {cropTimelineData.length > 0 ? (
              <ResponsiveBar
                data={cropTimelineData}
                keys={["count"]}
                indexBy="status"
                margin={{ top: 10, right: 20, bottom: 60, left: 50 }}
                padding={0.3}
                valueScale={{ type: "linear" }}
                colors={COLORS[2]}
                theme={isDarkMode ? NIVO_THEME_DARK : NIVO_THEME_LIGHT}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: -45,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                enableLabel={true}
                labelTextColor="#ffffff"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No data
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
