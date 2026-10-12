import type { Farmer } from "@/utils/hooks/api/farmers/types";

export type ActionButton = {
  id: string;
  label: string;
};

export type EditFarmerDrawerProps = {
  farmer: Farmer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (data: Farmer) => Promise<void>;
};
