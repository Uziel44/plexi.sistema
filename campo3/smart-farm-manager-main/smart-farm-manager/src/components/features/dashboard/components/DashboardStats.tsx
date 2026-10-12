"use client";

import { useMemo } from "react";
import {
  Grid2X2Check,
  Sprout,
  PawPrint,
  Wrench,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import type { DashboardStatsProps } from "./types";

export const DashboardStats = ({
  fields,
  crops,
  animals,
  equipment,
  transactions,
}: DashboardStatsProps) => {
  const stats = useMemo(() => {
    // Fields stats
    const totalFields = fields.length;
    const totalArea = fields.reduce(
      (sum: number, field) => sum + field.area,
      0
    );

    // Crops stats
    const totalCrops = crops.length;
    // Active crops are those whose harvest date hasn't passed yet
    const now = new Date();
    const activeCrops = crops.filter((crop) => {
      const harvestDate = new Date(crop.harvest_date);
      return harvestDate > now;
    }).length;

    // Animals stats
    const totalAnimals = animals.length;
    const healthyAnimals = animals.filter(
      (animal) => animal.health_status === "Healthy"
    ).length;
    console.log("Healthy Animals:", healthyAnimals);

    // Equipment stats
    const totalEquipment = equipment.length;
    const activeEquipment = equipment.filter(
      (eq) => eq.status === "active"
    ).length;

    // Financial stats
    const totalIncome = transactions
      .filter((tx) => tx.type === "income")
      .reduce((sum: number, tx) => sum + tx.amount, 0);

    const totalExpense = transactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum: number, tx) => sum + tx.amount, 0);

    const netCashFlow = totalIncome - totalExpense;

    const pendingPayments = transactions.filter(
      (tx) => tx.payment_status === "pending"
    ).length;

    return {
      totalFields,
      totalArea,
      totalCrops,
      activeCrops,
      totalAnimals,
      healthyAnimals,
      totalEquipment,
      activeEquipment,
      totalIncome,
      totalExpense,
      netCashFlow,
      pendingPayments,
    };
  }, [fields, crops, animals, equipment, transactions]);

  return (
    <div className="mb-8">
      {/* Primary Stats - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Fields Card */}
        <Card className="p-6 border-2 border-black dark:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-500 dark:bg-blue-600 rounded-lg">
              <Grid2X2Check className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Total Fields
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalFields}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {stats.totalArea.toFixed(1)} ha total area
            </p>
          </div>
        </Card>

        {/* Crops Card */}
        <Card className="p-6 border-2 border-black dark:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-green-500 dark:bg-green-600 rounded-lg">
              <Sprout className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Total Crops
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalCrops}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {stats.activeCrops} active crops
            </p>
          </div>
        </Card>

        {/* Animals Card */}
        <Card className="p-6 border-2 border-black dark:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-500 dark:bg-purple-600 rounded-lg">
              <PawPrint className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Total Animals
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalAnimals}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {stats.healthyAnimals} healthy
            </p>
          </div>
        </Card>

        {/* Equipment Card */}
        <Card className="p-6 border-2 border-black dark:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-orange-500 dark:bg-orange-600 rounded-lg">
              <Wrench className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Equipment
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalEquipment}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {stats.activeEquipment} active
            </p>
          </div>
        </Card>
      </div>

      {/* Financial Stats - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <Card className="p-6 border-2 border-black dark:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/30">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-emerald-500 dark:bg-emerald-600 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Total Income
            </p>
            <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">
              ${stats.totalIncome.toLocaleString()}
            </p>
          </div>
        </Card>

        {/* Total Expense */}
        <Card className="p-6 border-2 border-black dark:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-red-500 dark:bg-red-600 rounded-lg">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Total Expense
            </p>
            <p className="text-3xl font-bold text-red-700 dark:text-red-400">
              ${stats.totalExpense.toLocaleString()}
            </p>
          </div>
        </Card>

        {/* Net Cash Flow */}
        <Card
          className={`p-6 border-2 border-black dark:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] ${
            stats.netCashFlow >= 0
              ? "bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/30 dark:to-cyan-800/30"
              : "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className={`p-3 rounded-lg ${
                stats.netCashFlow >= 0
                  ? "bg-cyan-500 dark:bg-cyan-600"
                  : "bg-amber-500 dark:bg-amber-600"
              }`}
            >
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Net Cash Flow
            </p>
            <p
              className={`text-3xl font-bold ${
                stats.netCashFlow >= 0
                  ? "text-cyan-700 dark:text-cyan-400"
                  : "text-amber-700 dark:text-amber-400"
              }`}
            >
              ${stats.netCashFlow.toLocaleString()}
            </p>
          </div>
        </Card>

        {/* Pending Payments */}
        <Card className="p-6 border-2 border-black dark:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-yellow-500 dark:bg-yellow-600 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Pending Payments
            </p>
            <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">
              {stats.pendingPayments}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
