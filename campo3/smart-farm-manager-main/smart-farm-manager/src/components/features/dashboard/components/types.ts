import type { Field } from "@/utils/hooks/api/fields/types";
import type { Crop } from "@/utils/hooks/api/crops/types";
import type { Animal } from "@/utils/hooks/api/animals/types";
import type { Equipment } from "@/utils/hooks/api/equipment/types";
import type { Transaction } from "@/utils/hooks/api/transactions/types";

export type DashboardStatsProps = {
  fields: Field[];
  crops: Crop[];
  animals: Animal[];
  equipment: Equipment[];
  transactions: Transaction[];
};

export type DashboardChartsProps = {
  fields: Field[];
  crops: Crop[];
  animals: Animal[];
  equipment: Equipment[];
  transactions: Transaction[];
};

export type RecentActivityProps = {
  crops: Crop[];
  transactions: Transaction[];
};
