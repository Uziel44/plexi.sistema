"use client";

import * as z from "zod";
import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, Plus } from "lucide-react";

import { useAddCrop } from "@/utils/hooks/api/crops/usePostCrop";
import { useGetFields } from "@/utils/hooks/api/fields/useGetFields";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/Drawer";
import { Dialog } from "@/components/ui/Dialog";
import { Form, FormField } from "@/components/ui/Form/form";
import { FormInputField } from "@/components/ui/Form/FormInputField";
import { FormSelectField } from "@/components/ui/Form/FormSelectField";
import { DateTimePicker } from "@/components/ui/datetime-picker";

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

export const AddCropDrawer = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: fields } = useGetFields();

  const fieldsOptions = useMemo(() => {
    if (!fields) return [];
    return fields.map((field) => ({
      label: field.name,
      value: field._id,
    }));
  }, [fields]);

  const form = useForm<CropFormData>({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      name: "",
      type: "",
      planting_date: undefined,
      harvest_date: undefined,
      field_id: "",
    },
    mode: "all",
  });

  const { handleSubmit, reset, control, formState } = form;
  const { isValid, isDirty } = formState;

  const addCropMut = useAddCrop({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crops"] });
      toast.success("Crop added successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    },

    onError: (error) => {
      console.error("Error creating crop:", error);
      toast.error("Failed to add crop. Please try again.", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    },
  });

  const onSubmit = async (data: CropFormData) => {
    try {
      const payload = {
        ...data,
        planting_date: data.planting_date.toISOString(),
        harvest_date: data.harvest_date.toISOString(),
      };
      await addCropMut.mutateAsync(payload);
      setOpenDrawer(false);
      reset();
    } catch (error) {
      console.error("Error creating crop:", error);
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
        form="crop-form"
        disabled={!isValid || addCropMut.isPending}
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
            Add Crop
          </Button>
        }
        title="Add New Crop"
        footer={renderDrawerFooter()}
        hideFooterCloseButton
      >
        <Form {...form}>
          <form
            id="crop-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Crop name */}
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
        title="Cancel Form"
        description="Are you sure you want to cancel? All changes will be lost."
        onConfirm={onDialogConfirmCancel}
        onCancel={() => setOpenDialog(false)}
      />
    </>
  );
};
