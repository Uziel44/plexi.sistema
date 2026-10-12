import { Transaction } from "@/utils/hooks/api/transactions/types";
export type ActionButton = {
  id: string;
  label: string;
};

export type TransactionsAnalyticsProps = {
  transactions: Transaction[];
  open: boolean;
  onClose: () => void;
};

export type TransactionHeaderProps = {
  onViewAnalytics: () => void;
};

export type EditTransactionDrawerProps = {
  transaction: Transaction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (data: Transaction) => Promise<void>;
};
