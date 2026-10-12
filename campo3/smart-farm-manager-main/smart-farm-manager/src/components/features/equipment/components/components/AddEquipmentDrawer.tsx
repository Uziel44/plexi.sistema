"use client";

import * as z from "zod";
import { useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, Plus } from "lucide-react";

import { useAddEquipment } from "@/utils/hooks/api/equipment/usePostEquipment";
import { useFarmers } from "@/utils/hooks/api/farmers/useGetFarmers";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/Drawer";
import { Dialog } from "@/components/ui/Dialog";
import { Form, FormField } from "@/components/ui/Form/form";
import { FormInputField } from "@/components/ui/Form/FormInputField";
import { FormSelectField } from "@/components/ui/Form/FormSelectField";
import { DateTimePicker } from "@/components/ui/datetime-picker";

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

export const AddEquipmentDrawer = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: farmers } = useFarmers();

  const farmersOptions = useMemo(() => {
    if (!farmers) return [];
    return farmers.map((farmer) => ({
      label: farmer.name,
      value: farmer._id,
    }));
  }, [farmers]);

  const form = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: {
      name: "",
      type: "",
      status: "",
      purchase_date: new Date(),
      last_service_date: new Date(),
      farmer_id: "",
    },
    mode: "all",
  });

  const { handleSubmit, reset, control, formState } = form;
  const { isValid, isDirty } = formState;

  const addEquipmentMut = useAddEquipment({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      toast.success("Equipment added successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    },

    onError: (error) => {
      console.error("Error creating equipment:", error);
      toast.error("Failed to add equipment. Please try again.", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    },
  });

  const onSubmit = async (data: EquipmentFormData) => {
    try {
      const payload = {
        ...data,
      };
      await addEquipmentMut.mutateAsync(payload);
      setOpenDrawer(false);
      reset();
    } catch (error) {
      console.error("Error creating equipment:", error);
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
        form="equipment-form"
        disabled={!isValid || addEquipmentMut.isPending}
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
            Add Equipment
          </Button>
        }
        title="Add New Equipment"
        footer={renderDrawerFooter()}
        hideFooterCloseButton
      >
        <Form {...form}>
          <form
            id="equipment-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Equipment name */}
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormInputField label="Name" required {...field} />
              )}
            />

            {/* Type */}
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
                <FormSelectField
                  label="Status"
                  required
                  fullWidth
                  options={[
                    { label: "Active", value: "active" },
                    { label: "Maintenance", value: "maintenance" },
                    { label: "Retired", value: "retired" },
                  ]}
                  {...field}
                />
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
        title="Cancel Form"
        description="Are you sure you want to cancel? All changes will be lost."
        onConfirm={onDialogConfirmCancel}
        onCancel={() => setOpenDialog(false)}
      />
    </>
  );
};
