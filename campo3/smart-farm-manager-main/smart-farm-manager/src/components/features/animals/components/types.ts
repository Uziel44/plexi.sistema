import type { Animal } from "@/utils/hooks/api/animals/types";
export type ActionButton = {
  id: string;
  label: string;
};

export type AnimalAnalyticsProps = {
  animals: Animal[];
  open: boolean;
  onClose: () => void;
};

export type AnimalsHeaderProps = {
  onViewAnalytics: () => void;
};

export type EditAnimalsDrawerProps = {
  animal: Animal;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (data: Animal) => Promise<void>;
};
