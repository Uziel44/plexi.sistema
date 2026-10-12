"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGetFields } from "@/utils/hooks/api/fields/useGetFields";
import dayjs from "dayjs";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/Drawer";
import { Dialog } from "@/components/ui/Dialog";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Form, FormField } from "@/components/ui/Form/form";
import { FormInputField } from "@/components/ui/Form/FormInputField";
import { FormSelectField } from "@/components/ui/Form/FormSelectField";

import type { Crop } from "@/utils/hooks/api/crops/types";
import type { EditCropDrawerProps } from "../types";

const cropSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    type: z.string().min(1, "Type is required"),
    planting_date: z.date({ message: "Planting date is required" }),
    harvest_date: z.date({ message: "Harvest date is required" }),
    field_id: z.string().min(1, "Field ID is required"),
  })
  .refine((data) => data.harvest_date > data.planting_date, {
    message: "Harvest date must be after planting date",
    path: ["harvest_date"],
  });

type CropFormData = z.infer<typeof cropSchema>;

export const EditCropDrawer = ({
  crop,
  open,
  onOpenChange,
  onUpdate,
}: EditCropDrawerProps) => {
  const [openDialog, setOpenDialog] = useState(false);
  const { data: fields } = useGetFields();

  const fieldsOptions = useMemo(() => {
    if (!fields) return [];
    return fields.map((field) => ({
      label: field.name,
      value: field._id,
    }));
  }, [fields]);

  // Helper function to extract field_id as string
  const getFieldId = (fieldId: string | { _id: string; name: string }) => {
    return typeof fieldId === "object" ? fieldId._id : fieldId;
  };

  const form = useForm<CropFormData>({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      name: crop.name,
      type: crop.type,
      planting_date: dayjs(crop.planting_date).toDate(),
      harvest_date: dayjs(crop.harvest_date).toDate(),
      field_id: getFieldId(crop.field_id),
    },
    mode: "all",
  });

  const { handleSubmit, reset, control, formState } = form;
  const { isValid, isDirty } = formState;

  const isFormUpdated = useMemo(() => isDirty, [isDirty]);

  // Reset form when crop changes or drawer opens
  useEffect(() => {
    if (open && crop) {
      reset({
        name: crop.name,
        type: crop.type,
        planting_date: dayjs(crop.planting_date).toDate(),
        harvest_date: dayjs(crop.harvest_date).toDate(),
        field_id: getFieldId(crop.field_id),
      });
    }
  }, [open, crop, reset]);

  const onSubmit = async (data: CropFormData) => {
    const updateData: Crop = {
      _id: crop._id,
      name: data.name,
      type: data.type,
      planting_date: dayjs(data.planting_date).toDate().toISOString(),
      harvest_date: dayjs(data.harvest_date).toDate().toISOString(),
      field_id: data.field_id,
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
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormInputField label="Name" required {...field} />
              )}
            />
            {/* Crop type */}
            <FormField
              control={control}
              name="type"
              render={({ field }) => (
                <FormInputField label="Type" required {...field} />
              )}
            />

            {/* Planting date */}
            <Controller
              name="planting_date"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  mode="date"
                  label="Planting Date"
                  required
                  value={field.value ?? null}
                  onChange={(date) => field.onChange(date)}
                />
              )}
            />

            {/* Harvest date */}
            <Controller
              name="harvest_date"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  mode="date"
                  label="Harvest Date"
                  required
                  value={field.value ?? null}
                  onChange={(date) => field.onChange(date)}
                  minDate={form.getValues("planting_date") ?? undefined}
                />
              )}
            />

            {/* Field select */}
            <FormField
              control={control}
              name="field_id"
              render={({ field }) => (
                <FormSelectField
                  label="Field"
                  required
                  fullWidth
                  options={fieldsOptions}
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
