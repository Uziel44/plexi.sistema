import { Schema, model, models, Document, Types } from "mongoose";

export interface ITransaction extends Document {
  type: "income" | "expense";
  category: string;
  amount: number;
  date: Date;
  description?: string;
  payment_method: "cash" | "bank_transfer" | "card" | "check";
  payment_status: "paid" | "pending" | "overdue";

  // References
  farmer_id: Types.ObjectId;
  equipment_id?: Types.ObjectId; // Optional: link to equipment for maintenance costs

  // Optional fields
  invoice_number?: string;
  vendor_name?: string; // Who you paid or who paid you
}

const TransactionSchema = new Schema<ITransaction>(
  {
    type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
    },
    category: {
      type: String,
      required: true,
      // For expenses: "seeds", "fertilizers", "equipment", "labor", "utilities", "maintenance", "fuel", "other"
      // For income: "crop_sales", "livestock_sales", "subsidies", "other"
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
    payment_method: {
      type: String,
      required: true,
      enum: ["cash", "bank_transfer", "card", "check"],
      default: "cash",
    },
    payment_status: {
      type: String,
      required: true,
      enum: ["paid", "pending", "overdue"],
      default: "paid",
    },

    // References
    farmer_id: {
      type: Schema.Types.ObjectId,
      ref: "Farmer",
      required: true,
      index: true,
    },
    equipment_id: {
      type: Schema.Types.ObjectId,
      ref: "Equipment",
    },

    // Optional fields
    invoice_number: {
      type: String,
      trim: true,
    },
    vendor_name: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Indexes for better query performance
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ type: 1, category: 1 });
TransactionSchema.index({ farmer_id: 1, date: -1 });

const Transaction =
  models.Transaction || model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
