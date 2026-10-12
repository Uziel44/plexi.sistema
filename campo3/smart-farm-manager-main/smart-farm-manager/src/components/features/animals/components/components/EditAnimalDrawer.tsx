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

import type { Animal } from "@/utils/hooks/api/animals/types";
import type { EditAnimalsDrawerProps } from "../types";

const aniamlsSchema = z.object({
  tag: z.string().min(1, "Tag is required"),
  species: z.string().min(1, "Species is required"),
  birth_date: z.date({ message: "Birth date is required" }),
  weight: z.number().min(1, "Weight is required"),
  health_status: z.string().min(1, "Health status is required"),
  farmer_id: z.string().min(1, "Farmer ID is required"),
});

type AnimalFormData = z.infer<typeof aniamlsSchema>;

export const EditAnimalDrawer = ({
  animal,
  open,
  onOpenChange,
  onUpdate,
}: EditAnimalsDrawerProps) => {
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

  const form = useForm<AnimalFormData>({
    resolver: zodResolver(aniamlsSchema),
    defaultValues: {
      tag: animal.tag,
      species: animal.species,
      birth_date: dayjs(animal.birth_date).toDate(),
      weight: animal.weight,
      health_status: animal.health_status,
      farmer_id: getFarmerId(animal.farmer_id),
    },
    mode: "all",
  });

  const { handleSubmit, reset, control, formState } = form;
  const { isValid, isDirty } = formState;

  const isFormUpdated = useMemo(() => isDirty, [isDirty]);

  // Reset form when crop changes or drawer opens
  useEffect(() => {
    if (open && animal) {
      reset({
        tag: animal.tag,
        species: animal.species,
        birth_date: dayjs(animal.birth_date).toDate(),
        weight: animal.weight,
        health_status: animal.health_status,
        farmer_id: getFarmerId(animal.farmer_id),
      });
    }
  }, [open, animal, reset]);

  const onSubmit = async (data: AnimalFormData) => {
    const updateData: Animal = {
      _id: animal._id,
      tag: data.tag,
      species: data.species,
      birth_date: data.birth_date,
      weight: data.weight,
      health_status: data.health_status,
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
            <FormField
              control={control}
              name="tag"
              render={({ field }) => (
                <FormInputField label="Name" required {...field} />
              )}
            />

            <FormField
              control={control}
              name="species"
              render={({ field }) => (
                <FormInputField label="Species" required {...field} />
              )}
            />

            <Controller
              name="birth_date"
              control={control}
              render={({ field }) => (
                <DateTimePicker
                  mode="date"
                  label="Birth Date"
                  required
                  value={field.value ?? null}
                  onChange={(date) => field.onChange(date)}
                />
              )}
            />
            <FormField
              control={control}
              name="weight"
              render={({ field }) => (
                <FormInputField
                  type="number"
                  label="Weight (in kg)"
                  required
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              )}
            />

            <FormField
              control={control}
              name="health_status"
              render={({ field }) => (
                <FormInputField label="Health Status" required {...field} />
              )}
            />

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
