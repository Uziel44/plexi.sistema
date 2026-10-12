import { Equipment } from "../equipment/types";
import { Farmer } from "../farmers/types";
export type Transaction = {
  _id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: Date;
  description?: string;
  payment_method: "cash" | "bank_transfer" | "card" | "check";
  payment_status: "paid" | "pending" | "overdue";
  farmer_id: Farmer | string;
  equipment_id?: Equipment | string;
  invoice_number?: string;
  vendor_name?: string;
  __v?: number;
};

export type TransactionPayload = Omit<Transaction, "_id" | "__v">;

export type UpdateTransactionPayload = {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: Date;
  description?: string;
  payment_method: "cash" | "bank_transfer" | "card" | "check";
  payment_status: "paid" | "pending" | "overdue";
  farmer_id: string;
  equipment_id?: string;
  invoice_number?: string;
  vendor_name?: string;
};
