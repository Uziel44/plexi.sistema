import { useState, useMemo } from "react";
import {
  X,
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  PawPrint,
} from "lucide-react";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { useCurrentTheme } from "@/utils/hooks/useCurrentTheme";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/card";

import type { AnimalAnalyticsProps } from "./types";
import { COLORS, NIVO_THEME_DARK, NIVO_THEME_LIGHT } from "@/utils/constants";

export const AnimalsAnalytics = ({
  animals,
  open,
  onClose,
}: AnimalAnalyticsProps) => {
  const [selectedSpecies, setSelectedSpecies] = useState("all");
  const [selectedHealthStatus, setSelectedHealthStatus] = useState("all");
  const [selectedFarmer, setSelectedFarmer] = useState("all");

  const theme = useCurrentTheme();
  const isDarkMode = theme === "dark";

  // Extract unique values for filters
  const { species, healthStatuses, farmers } = useMemo(() => {
    const speciesSet = new Set<string>();
    const healthSet = new Set<string>();
    const farmersMap = new Map<string, string>();

    animals.forEach((animal) => {
      speciesSet.add(animal.species);
      healthSet.add(animal.health_status);
      if (animal.farmer_id && typeof animal.farmer_id === "object") {
        farmersMap.set(animal.farmer_id._id, animal.farmer_id.name);
      }
    });

    return {
      species: Array.from(speciesSet),
      healthStatuses: Array.from(healthSet),
      farmers: Array.from(farmersMap.entries()).map(([id, name]) => ({
        id,
        name,
      })),
    };
  }, [animals]);

  // Filter animals based on selections
  const filteredAnimals = useMemo(() => {
    return animals.filter((animal) => {
      const speciesMatch =
        selectedSpecies === "all" || animal.species === selectedSpecies;
      const healthMatch =
        selectedHealthStatus === "all" ||
        animal.health_status === selectedHealthStatus;
      const farmerMatch =
        selectedFarmer === "all" ||
        (animal.farmer_id &&
          typeof animal.farmer_id === "object" &&
          animal.farmer_id._id === selectedFarmer);
      return speciesMatch && healthMatch && farmerMatch;
    });
  }, [animals, selectedSpecies, selectedHealthStatus, selectedFarmer]);

  // Calculate statistics
  const stats = useMemo(() => {
    // Animals by species
    const speciesCounts = new Map<string, number>();
    filteredAnimals.forEach((animal) => {
      const current = speciesCounts.get(animal.species) || 0;
      speciesCounts.set(animal.species, current + 1);
    });
    const animalsBySpecies = Array.from(speciesCounts.entries()).map(
      ([id, value]) => ({
        id,
        label: id,
        value,
      })
    );

    // Health status distribution
    const healthCounts = new Map<string, number>();
    filteredAnimals.forEach((animal) => {
      const current = healthCounts.get(animal.health_status) || 0;
      healthCounts.set(animal.health_status, current + 1);
    });
    const healthDistribution = Array.from(healthCounts.entries()).map(
      ([id, value]) => ({
        id,
        label: id,
        value,
      })
    );

    // Top farmers by animal count
    const farmerCounts = new Map<string, { name: string; count: number }>();
    filteredAnimals.forEach((animal) => {
      if (animal.farmer_id && typeof animal.farmer_id === "object") {
        const farmerId = animal.farmer_id._id;
        const farmerName = animal.farmer_id.name;
        const current = farmerCounts.get(farmerId) || {
          name: farmerName,
          count: 0,
        };
        farmerCounts.set(farmerId, {
          name: farmerName,
          count: current.count + 1,
        });
      }
    });
    const topFarmersByCount = Array.from(farmerCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((f) => ({ farmer: f.name, "Animal Count": f.count }));

    // Average weight by species
    const speciesWeights = new Map<string, number>();
    const speciesWeightCounts = new Map<string, number>();
    filteredAnimals.forEach((animal) => {
      const currentWeight = speciesWeights.get(animal.species) || 0;
      const currentCount = speciesWeightCounts.get(animal.species) || 0;
      speciesWeights.set(animal.species, currentWeight + animal.weight);
      speciesWeightCounts.set(animal.species, currentCount + 1);
    });
    const avgWeightBySpecies = Array.from(speciesWeights.entries()).map(
      ([species, totalWeight]) => ({
        species,
        "Average Weight": parseFloat(
          (totalWeight / (speciesWeightCounts.get(species) || 1)).toFixed(1)
        ),
      })
    );

    // Age distribution
    const currentYear = new Date().getFullYear();
    const ageGroups: Record<string, number> = {
      "0-1 years": 0,
      "1-2 years": 0,
      "2-3 years": 0,
      "3-4 years": 0,
      "4+ years": 0,
    };
    filteredAnimals.forEach((animal) => {
      const birthYear = new Date(animal.birth_date).getFullYear();
      const age = currentYear - birthYear;
      if (age < 1) ageGroups["0-1 years"]++;
      else if (age < 2) ageGroups["1-2 years"]++;
      else if (age < 3) ageGroups["2-3 years"]++;
      else if (age < 4) ageGroups["3-4 years"]++;
      else ageGroups["4+ years"]++;
    });
    const ageDistribution = Object.entries(ageGroups)
      .filter(([, value]) => value > 0)
      .map(([id, value]) => ({
        id,
        label: id,
        value,
      }));

    // Total statistics
    const totalAnimals = filteredAnimals.length;
    const totalWeight = filteredAnimals.reduce(
      (sum, animal) => sum + animal.weight,
      0
    );
    const avgWeight = totalAnimals > 0 ? totalWeight / totalAnimals : 0;
    const healthyCount = filteredAnimals.filter(
      (a) => a.health_status.toLowerCase() === "healthy"
    ).length;
    const healthPercentage =
      totalAnimals > 0 ? (healthyCount / totalAnimals) * 100 : 0;

    return {
      animalsBySpecies,
      healthDistribution,
      topFarmersByCount,
      avgWeightBySpecies,
      ageDistribution,
      totalAnimals,
      avgWeight,
      healthPercentage,
      healthyCount,
    };
  }, [filteredAnimals]);

  if (!open) return null;

  return (
    <Card className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Animals Analytics</h2>
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
              <label className="block text-sm font-medium mb-1">Species:</label>
              <Select
                placeholder="All Species"
                value={selectedSpecies}
                onChange={(value) => setSelectedSpecies(value)}
                options={[
                  { value: "all", label: "All Species" },
                  ...species.map((s) => ({
                    value: s as string,
                    label: s as string,
                  })),
                ]}
                fullWidth
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Health Status:
              </label>
              <Select
                placeholder="All Statuses"
                value={selectedHealthStatus}
                onChange={(value) => setSelectedHealthStatus(value)}
                options={[
                  { value: "all", label: "All Statuses" },
                  ...healthStatuses.map((status) => ({
                    value: status as string,
                    label: status as string,
                  })),
                ]}
                fullWidth
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Farmer:</label>
              <Select
                placeholder="All Farmers"
                value={selectedFarmer}
                onChange={(value) => setSelectedFarmer(value)}
                options={[
                  { value: "all", label: "All Farmers" },
                  ...farmers.map((farmer) => ({
                    value: farmer.id,
                    label: farmer.name,
                  })),
                ]}
                fullWidth
              />
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Total Animals
                  </p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {stats.totalAnimals}
                  </p>
                </div>
                <PawPrint className="w-10 h-10 text-blue-400" />
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                    Healthy Animals
                  </p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
                    {stats.healthPercentage.toFixed(0)}%
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {stats.healthyCount} of {stats.totalAnimals}
                  </p>
                </div>
                <Activity className="w-10 h-10 text-green-400" />
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    Avg Weight
                  </p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                    {stats.avgWeight.toFixed(0)} kg
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-purple-400" />
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                    Species Types
                  </p>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                    {stats.animalsBySpecies.length}
                  </p>
                </div>
                <Users className="w-10 h-10 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Animals by Species */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Animals by Species
              </h3>
              <div style={{ height: 300 }}>
                {stats.animalsBySpecies.length > 0 ? (
                  <ResponsivePie
                    data={stats.animalsBySpecies}
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
                    tooltip={({ datum }) => (
                      <div className="bg-white dark:bg-gray-800 px-3 py-2 shadow-lg rounded border border-gray-200 dark:border-gray-700">
                        <strong>{datum.label}</strong>
                        <div>
                          {datum.value} animals (
                          {((datum.value / stats.totalAnimals) * 100).toFixed(
                            1
                          )}
                          %)
                        </div>
                      </div>
                    )}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Health Status Distribution */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Health Status Distribution
              </h3>
              <div style={{ height: 300 }}>
                {stats.healthDistribution.length > 0 ? (
                  <ResponsivePie
                    data={stats.healthDistribution}
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
                    tooltip={({ datum }) => (
                      <div className="bg-white dark:bg-gray-800 px-3 py-2 shadow-lg rounded border border-gray-200 dark:border-gray-700">
                        <strong>{datum.label}</strong>
                        <div>
                          {datum.value} animals (
                          {((datum.value / stats.totalAnimals) * 100).toFixed(
                            1
                          )}
                          %)
                        </div>
                      </div>
                    )}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Top Farmers by Animal Count */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Top Farmers by Animal Count
              </h3>
              <div style={{ height: 300 }}>
                {stats.topFarmersByCount.length > 0 ? (
                  <ResponsiveBar
                    data={stats.topFarmersByCount}
                    keys={["Animal Count"]}
                    indexBy="farmer"
                    margin={{ top: 10, right: 20, bottom: 80, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: "linear" }}
                    colors={isDarkMode ? ["#60a5fa"] : ["#3b82f6"]}
                    theme={isDarkMode ? NIVO_THEME_DARK : NIVO_THEME_LIGHT}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45,
                      legend: "Farmers",
                      legendPosition: "middle",
                      legendOffset: 70,
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: "Number of Animals",
                      legendPosition: "middle",
                      legendOffset: -50,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    enableLabel={false}
                    tooltip={({ value, indexValue }) => (
                      <div className="bg-white dark:bg-gray-800 px-3 py-2 shadow-lg rounded border border-gray-200 dark:border-gray-700">
                        <strong>{indexValue}</strong>
                        <div>{value} animals</div>
                      </div>
                    )}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Average Weight by Species */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Average Weight by Species
              </h3>
              <div style={{ height: 300 }}>
                {stats.avgWeightBySpecies.length > 0 ? (
                  <ResponsiveBar
                    data={stats.avgWeightBySpecies}
                    keys={["Average Weight"]}
                    indexBy="species"
                    margin={{ top: 10, right: 20, bottom: 80, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: "linear" }}
                    colors={isDarkMode ? ["#22c55e"] : ["#10b981"]}
                    theme={isDarkMode ? NIVO_THEME_DARK : NIVO_THEME_LIGHT}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45,
                      legend: "Species",
                      legendPosition: "middle",
                      legendOffset: 70,
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: "Weight (kg)",
                      legendPosition: "middle",
                      legendOffset: -50,
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    enableLabel={false}
                    tooltip={({ value, indexValue }) => (
                      <div className="bg-white dark:bg-gray-800 px-3 py-2 shadow-lg rounded border border-gray-200 dark:border-gray-700">
                        <strong>{indexValue}</strong>
                        <div>{value} kg</div>
                      </div>
                    )}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Age Distribution */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Age Distribution
              </h3>
              <div style={{ height: 300 }}>
                {stats.ageDistribution.length > 0 ? (
                  <ResponsivePie
                    data={stats.ageDistribution}
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
                    tooltip={({ datum }) => (
                      <div className="bg-white dark:bg-gray-800 px-3 py-2 shadow-lg rounded border border-gray-200 dark:border-gray-700">
                        <strong>{datum.label}</strong>
                        <div>
                          {datum.value} animals (
                          {((datum.value / stats.totalAnimals) * 100).toFixed(
                            1
                          )}
                          %)
                        </div>
                      </div>
                    )}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
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
