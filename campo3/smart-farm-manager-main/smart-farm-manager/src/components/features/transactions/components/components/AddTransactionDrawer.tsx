"use client";

import * as z from "zod";
import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, Plus } from "lucide-react";

import { useAddTransaction } from "@/utils/hooks/api/transactions/usePostTransaction";
import { useFarmers } from "@/utils/hooks/api/farmers/useGetFarmers";
import { useGetEquipment } from "@/utils/hooks/api/equipment/useGetEquipment";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/Drawer";
import { Dialog } from "@/components/ui/Dialog";
import { Form, FormField } from "@/components/ui/Form/form";
import { FormInputField } from "@/components/ui/Form/FormInputField";
import { FormSelectField } from "@/components/ui/Form/FormSelectField";
import { DateTimePicker } from "@/components/ui/datetime-picker";

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

export const AddTransactionDrawer = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const queryClient = useQueryClient();

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
    return equipment.map((equip) => ({
      label: equip.name,
      value: equip._id,
    }));
  }, [equipment]);

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "income",
      category: "",
      amount: 1,
      date: new Date(),
      description: "",
      payment_method: "cash",
      payment_status: "paid",
      farmer_id: "",
      equipment_id: "",
      invoice_number: "",
      vendor_name: "",
    },

    mode: "all",
  });

  const { handleSubmit, reset, control, formState } = form;
  const { isValid, isDirty } = formState;

  const addMutation = useAddTransaction({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction added successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    },

    onError: (error) => {
      console.error("Error creating transaction:", error);
      toast.error("Failed to add transaction. Please try again.", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    },
  });

  const onSubmit = async (data: TransactionFormData) => {
    try {
      const payload = {
        ...data,
      };
      await addMutation.mutateAsync(payload);
      setOpenDrawer(false);
      reset();
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  };

  const onDialogConfirmCancel = () => {
    reset();
    setOpenDialog(false);
    setOpenDrawer(false);
  };

  const handleCancel = () => {
    if (isDirty) {
      setOpenDialog(true);
    } else {
      setOpenDrawer(false);
      reset();
    }
  };

  const toggleDrawerState = (isOpen: boolean) => {
    if (isOpen) {
      setOpenDrawer(true);
    } else {
      handleCancel();
    }
  };

  const renderDrawerFooter = () => (
    <>
      <Button
        type="submit"
        form="transaction-form"
        disabled={!isValid || addMutation.isPending}
      >
        Submit
      </Button>
      <Button variant="outline" onClick={handleCancel}>
        Cancel
      </Button>
    </>
  );

  return (
    <>
      <Drawer
        open={openDrawer}
        onOpenChange={toggleDrawerState}
        trigger={
          <Button variant="outline">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Button>
        }
        title="Add New Transaction"
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
        title="Cancel Form"
        description="Are you sure you want to cancel? All changes will be lost."
        onConfirm={onDialogConfirmCancel}
        onCancel={() => setOpenDialog(false)}
      />
    </>
  );
};
