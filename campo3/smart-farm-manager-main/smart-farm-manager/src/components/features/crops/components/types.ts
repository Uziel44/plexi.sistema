import type { Crop } from "@/utils/hooks/api/crops/types";
export type ActionButton = {
  id: string;
  label: string;
};

export type CropsAnalyticsProps = {
  crops: Crop[];
  open: boolean;
  onClose: () => void;
};

export type CropsHeaderProps = {
  onViewAnalytics: () => void;
};

export type EditCropDrawerProps = {
  crop: Crop;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (data: Crop) => Promise<void>;
};
