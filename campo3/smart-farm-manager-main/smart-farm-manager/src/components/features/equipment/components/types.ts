import { Equipment } from "@/utils/hooks/api/equipment/types";
export type ActionButton = {
  id: string;
  label: string;
};

export type EquipmentAnalyticsProps = {
  equipment: Equipment[];
  open: boolean;
  onClose: () => void;
};

export type EquipmentHeaderProps = {
  onViewAnalytics: () => void;
};

export type EditEquipmentDrawerProps = {
  equipment: Equipment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (data: Equipment) => Promise<void>;
};
