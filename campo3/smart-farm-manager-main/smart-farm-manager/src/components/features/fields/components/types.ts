import type { Field } from "@/utils/hooks/api/fields/types";

export type ActionButton = {
  id: string;
  label: string;
};

export type FieldsAnalyticsProps = {
  fields: Field[];
  open: boolean;
  onClose: () => void;
};

export type FieldsHeaderProps = {
  onViewAnalytics: () => void;
};

export type EditFieldDrawerProps = {
  field: Field;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (data: Field) => Promise<void>;
};
