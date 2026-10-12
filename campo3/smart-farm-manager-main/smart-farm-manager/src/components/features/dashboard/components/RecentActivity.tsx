"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Calendar,
  DollarSign,
  Sprout,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { RecentActivityProps } from "./types";
import dayjs from "dayjs";

export const RecentActivity = ({
  crops,
  transactions,
}: RecentActivityProps) => {
  // Recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  // Upcoming harvests (next 30 days)
  const upcomingHarvests = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000
    );

    return crops
      .filter((crop) => {
        const harvestDate = new Date(crop.harvest_date);
        // Only include crops whose harvest date is in the future and within 30 days
        return harvestDate >= now && harvestDate <= thirtyDaysFromNow;
      })
      .sort(
        (a, b) =>
          new Date(a.harvest_date).getTime() -
          new Date(b.harvest_date).getTime()
      )
      .slice(0, 5);
  }, [crops]);

  // Recently planted (last 7 days)
  const recentlyPlanted = useMemo(() => {
    const sevenDaysAgo = new Date(
      new Date().getTime() - 7 * 24 * 60 * 60 * 1000
    );

    return crops
      .filter((crop) => {
        const plantingDate = new Date(crop.planting_date);
        return plantingDate >= sevenDaysAgo;
      })
      .sort(
        (a, b) =>
          new Date(b.planting_date).getTime() -
          new Date(a.planting_date).getTime()
      )
      .slice(0, 5);
  }, [crops]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Recent Transactions */}
      <Card className="p-6 border-2 border-black dark:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recent Transactions
          </h3>
        </div>
        <div className="space-y-3">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((tx) => (
              <div
                key={tx._id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  {tx.type === "income" ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {tx.category.replace("_", " ")}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {dayjs(tx.date).format("MMM D, YYYY")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${
                      tx.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}$
                    {tx.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {tx.payment_status}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No recent transactions
            </p>
          )}
        </div>
      </Card>

      {/* Upcoming Harvests */}
      <Card className="p-6 border-2 border-black dark:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Upcoming Harvests
          </h3>
        </div>
        <div className="space-y-3">
          {upcomingHarvests.length > 0 ? (
            upcomingHarvests.map((crop) => (
              <div
                key={crop._id}
                className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
              >
                <div className="flex items-center gap-3">
                  <Sprout className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {crop.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {crop.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">
                    {dayjs(crop.harvest_date).format("MMM D")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {dayjs(crop.harvest_date).diff(dayjs(), "day")} days
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No upcoming harvests
            </p>
          )}
        </div>
      </Card>

      {/* Recently Planted */}
      <Card className="p-6 border-2 border-black dark:border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
        <div className="flex items-center gap-3 mb-4">
          <Sprout className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Recently Planted
          </h3>
        </div>
        <div className="space-y-3">
          {recentlyPlanted.length > 0 ? (
            recentlyPlanted.map((crop) => (
              <div
                key={crop._id}
                className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
              >
                <div className="flex items-center gap-3">
                  <Sprout className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {crop.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {crop.type}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-purple-600">
                    {dayjs(crop.planting_date).format("MMM D")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {dayjs().diff(dayjs(crop.planting_date), "day")} days ago
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No recently planted crops
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};
