"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFarmers } from "@/utils/hooks/api/farmers/useGetFarmers";
import dayjs from "dayjs";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/Drawer";
import { Dialog } from "@/components/ui/Dialog";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Form, FormField } from "@/components/ui/Form/form";
import { FormInputField } from "@/components/ui/Form/FormInputField";
import { FormSelectField } from "@/components/ui/Form/FormSelectField";

import type { Equipment } from "@/utils/hooks/api/equipment/types";
import type { EditEquipmentDrawerProps } from "../types";

const equipmentSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    type: z.string().min(1, "Type is required"),
    status: z.string().min(1, "Status is required"),
    purchase_date: z.date({ message: "Purchase date is required" }),
    last_service_date: z.date({ message: "Last service date is required" }),
    farmer_id: z.string().min(1, "Farmer ID is required"),
  })
  .refine((data) => data.last_service_date > data.purchase_date, {
    message: "Last service date must be after purchase date",
    path: ["last_service_date"],
  });

type EquipmentFormData = z.infer<typeof equipmentSchema>;

export const EditEquipmentDrawer = ({
  equipment,
  open,
  onOpenChange,
  onUpdate,
}: EditEquipmentDrawerProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  const { data: farmers } = useFarmers();

  const farmersOptions = useMemo(() => {
    if (!farmers) return [];
    return farmers.map((farmer) => ({
      label: farmer.name,
      value: farmer._id,
    }));
  }, [farmers]);

  // Helper function to extract field_id as string

  const getFarmerId = (farmerId: string | { _id: string; name: string }) => {
    return typeof farmerId === "object" ? farmerId._id : farmerId;
  };

  const form = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: equipment.name,
      type: equipment.type,
      status: equipment.status,
      purchase_date: dayjs(equipment.purchase_date).toDate(),
      last_service_date: dayjs(equipment.last_service_date).toDate(),
      farmer_id: getFarmerId(equipment.farmer_id),
    },
    mode: "all",
  });

  const { handleSubmit, reset, control, formState } = form;
  const { isValid, isDirty } = formState;

  const isFormUpdated = useMemo(() => isDirty, [isDirty]);

  // Reset form when equipment changes or drawer opens
  useEffect(() => {
    if (open && equipment) {
      reset({
        name: equipment.name,
        type: equipment.type,
        status: equipment.status,
        purchase_date: dayjs(equipment.purchase_date).toDate(),
        last_service_date: dayjs(equipment.last_service_date).toDate(),
        farmer_id: getFarmerId(equipment.farmer_id),
      });
    }
  }, [open, equipment, reset]);

  const onSubmit = async (data: EquipmentFormData) => {
    const updateData: Equipment = {
      _id: equipment._id,
      name: data.name,
      type: data.type,
      status: data.status,
      purchase_date: data.purchase_date,
      last_service_date: data.last_service_date,
      farmer_id: data.farmer_id,
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Equipment name */}
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormInputField label="Name" required {...field} />
              )}
            />

            {/* Species */}
            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormInputField label="Type" required {...field} />
              )}
            />
            {/* Status */}
            <FormField
              control={control}
              name="status"
              render={({ field }) => (
                <FormInputField label="Status" required {...field} />
              )}
            />
            {/* Purchase date */}
            <Controller
              name="purchase_date"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  mode="date"
                  label="Purchase Date"
                  required
                  value={field.value ?? null}
                  onChange={(date) => field.onChange(date)}
                />
              )}
            />
            {/* Last service date */}
            <Controller
              name="last_service_date"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  mode="date"
                  label="Last Service Date"
                  required
                  value={field.value ?? null}
                  onChange={(date) => field.onChange(date)}
                />
              )}
            />

            {/* Field select */}
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
