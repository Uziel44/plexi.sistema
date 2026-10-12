"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFarmers } from "@/utils/hooks/api/farmers/useGetFarmers";
import { useGetEquipment } from "@/utils/hooks/api/equipment/useGetEquipment";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/Drawer";
import { Dialog } from "@/components/ui/Dialog";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Form, FormField } from "@/components/ui/Form/form";
import { FormInputField } from "@/components/ui/Form/FormInputField";
import { FormSelectField } from "@/components/ui/Form/FormSelectField";

import type { EditTransactionDrawerProps } from "../types";
import { Transaction } from "@/utils/hooks/api/transactions/types";

const transactionSchema = z
  .object({
    type: z.enum(["income", "expense"], { message: "Type is required" }),
    category: z.string().min(1, "Category is required"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    date: z.date({ message: "Date is required" }),
    description: z.string().optional(),
    payment_method: z.enum(["cash", "bank_transfer", "card", "check"], {
      message: "Payment method is required",
    }),
    payment_status: z.enum(["paid", "pending", "overdue"], {
      message: "Payment status is required",
    }),
    farmer_id: z.string().min(1, "Farmer is required"),
    equipment_id: z.string().optional(),
    invoice_number: z.string().optional(),
    vendor_name: z.string().optional(),
  })
  .refine((data) => data.amount > 0, {
    message: "Amount must be greater than 0",
    path: ["amount"],
  });

type TransactionFormData = z.infer<typeof transactionSchema>;

export const EditTransactionDrawer = ({
  transaction,
  open,
  onOpenChange,
  onUpdate,
}: EditTransactionDrawerProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  const { data: farmers } = useFarmers();
  const { data: equipment } = useGetEquipment();

  const farmersOptions = useMemo(() => {
    if (!farmers) return [];
    return farmers.map((farmer) => ({
      label: farmer.name,
      value: farmer._id,
    }));
  }, [farmers]);

  const equipmentOptions = useMemo(() => {
    if (!equipment) return [];
    return equipment.map((equipment) => ({
      label: equipment.name,
      value: equipment._id,
    }));
  }, [equipment]);

  // Helper function to extract field_id as string

  const getFarmerId = (farmerId: string | { _id: string; name: string }) => {
    return typeof farmerId === "object" ? farmerId._id : farmerId;
  };

  const getEquipmentId = (
    equipmentId: string | { _id: string; name: string }
  ) => {
    return typeof equipmentId === "object" ? equipmentId._id : equipmentId;
  };

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: transaction.type,
      category: transaction.category,
      amount: transaction.amount,
      date: transaction.date,
      description: transaction.description,
      payment_method: transaction.payment_method,
      payment_status: transaction.payment_status,
      farmer_id: getFarmerId(transaction.farmer_id),
      equipment_id: getEquipmentId(transaction?.equipment_id || ""),
      invoice_number: transaction.invoice_number,
      vendor_name: transaction.vendor_name,
    },
    mode: "all",
  });

  const { handleSubmit, reset, control, formState } = form;
  const { isValid, isDirty } = formState;

  const isFormUpdated = useMemo(() => isDirty, [isDirty]);

  // Reset form when equipment changes or drawer opens
  useEffect(() => {
    if (open && transaction) {
      reset({
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        date: transaction.date,
        description: transaction.description,
        payment_method: transaction.payment_method,
        payment_status: transaction.payment_status,
        farmer_id: getFarmerId(transaction.farmer_id),
        equipment_id: getEquipmentId(transaction.equipment_id || ""),
        invoice_number: transaction.invoice_number,
        vendor_name: transaction.vendor_name,
      });
    }
  }, [open, transaction, reset]);

  const onSubmit = async (data: TransactionFormData) => {
    const updateData: Transaction = {
      _id: transaction._id,
      type: data.type,
      category: data.category,
      amount: data.amount,
      date: data.date,
      description: data.description,
      payment_method: data.payment_method,
      payment_status: data.payment_status,
      farmer_id: data.farmer_id,
      equipment_id: data.equipment_id,
      invoice_number: data.invoice_number,
      vendor_name: data.vendor_name,
    };

    if (onUpdate) {
      await onUpdate(updateData);
    }
    onOpenChange(false);
  };

  const onDialogConfirmCancel = () => {
    reset();
    setOpenDialog(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (isFormUpdated) {
      setOpenDialog(true);
    } else {
      onOpenChange(false);
      reset();
    }
  };

  const toggleDrawerState = (isOpen: boolean) => {
    if (isOpen) {
      onOpenChange(true);
    } else {
      handleCancel();
    }
  };

  const renderDrawerFooter = () => (
    <>
      <Button onClick={handleSubmit(onSubmit)} disabled={!isValid}>
        Update
      </Button>
      <Button variant="outline" onClick={handleCancel}>
        Cancel
      </Button>
    </>
  );

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={toggleDrawerState}
        title="Edit Crop"
        footer={renderDrawerFooter()}
        hideFooterCloseButton
      >
        <Form {...form}>
          <form
            id="transaction-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Type */}
            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormSelectField
                  label="Type"
                  required
                  fullWidth
                  options={[
                    { label: "Income", value: "income" },
                    { label: "Expense", value: "expense" },
                  ]}
                  {...field}
                />
              )}
            />
            {/* Category */}
            <FormField
              control={control}
              name="category"
              render={({ field }) => (
                <FormInputField
                  label="Category"
                  required
                  fullWidth
                  {...field}
                />
              )}
            />
            {/* Amount */}
            <FormField
              control={control}
              name="amount"
              render={({ field }) => (
                <FormInputField
                  type="number"
                  label="Amount"
                  required
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />
            {/* Date */}
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  mode="date"
                  label="Date"
                  required
                  value={field.value ?? null}
                  onChange={(date) => field.onChange(date)}
                />
              )}
            />
            {/* Description */}
            <FormField
              control={control}
              name="description"
              render={({ field }) => (
                <FormInputField label="Description" fullWidth {...field} />
              )}
            />
            {/* Payment Method */}
            <FormField
              control={control}
              name="payment_method"
              render={({ field }) => (
                <FormSelectField
                  label="Payment Method"
                  required
                  fullWidth
                  options={[
                    { label: "Cash", value: "cash" },
                    { label: "Bank Transfer", value: "bank_transfer" },
                    { label: "Card", value: "card" },
                  ]}
                  {...field}
                />
              )}
            />
            {/* Payment Status */}
            <FormField
              control={control}
              name="payment_status"
              render={({ field }) => (
                <FormSelectField
                  label="Payment Status"
                  required
                  fullWidth
                  options={[
                    { label: "Paid", value: "paid" },
                    { label: "Pending", value: "pending" },
                    { label: "Overdue", value: "overdue" },
                  ]}
                  {...field}
                />
              )}
            />
            {/* Farmer */}
            <FormField
              control={control}
              name="farmer_id"
              render={({ field }) => (
                <FormSelectField
                  label="Farmer"
                  required
                  fullWidth
                  options={farmersOptions}
                  {...field}
                />
              )}
            />
            {/* Equipment */}
            <FormField
              control={control}
              name="equipment_id"
              render={({ field }) => (
                <FormSelectField
                  label="Equipment"
                  fullWidth
                  options={equipmentOptions}
                  {...field}
                />
              )}
            />
            {/* Invoice Number */}
            <FormField
              control={control}
              name="invoice_number"
              render={({ field }) => (
                <FormInputField label="Invoice Number" fullWidth {...field} />
              )}
            />
            {/* Vendor Name */}
            <FormField
              control={control}
              name="vendor_name"
              render={({ field }) => (
                <FormInputField label="Vendor Name" fullWidth {...field} />
              )}
            />
          </form>
        </Form>
      </Drawer>

      <Dialog
        open={openDialog}
        setOpen={setOpenDialog}
        title="Cancel Changes"
        description="Are you sure you want to cancel? All changes will be lost."
        onConfirm={onDialogConfirmCancel}
        onCancel={() => setOpenDialog(false)}
      />
    </>
  );
};
