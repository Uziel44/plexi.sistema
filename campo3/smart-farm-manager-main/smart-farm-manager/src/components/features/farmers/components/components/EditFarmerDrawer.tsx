"use client";

import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/Drawer";
import { Dialog } from "@/components/ui/Dialog";

import { Form, FormField } from "@/components/ui/Form/form";
import { FormInputField } from "@/components/ui/Form/FormInputField";
import { FormSelectField } from "@/components/ui/Form/FormSelectField";

import type { Farmer } from "@/utils/hooks/api/farmers/types";
import type { EditFarmerDrawerProps } from "../types";

const farmerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
  password: z.string().optional(),
  role: z.enum(["worker", "admin"], "Role is required"),
});

type FarmerFormData = z.infer<typeof farmerSchema>;

export const EditFarmerDrawer = ({
  farmer,
  open,
  onOpenChange,
  onUpdate,
}: EditFarmerDrawerProps) => {
  const [openDialog, setOpenDialog] = useState(false);

  const form = useForm<FarmerFormData>({
    resolver: zodResolver(farmerSchema),
    defaultValues: {
      name: farmer.name,
      email: farmer.email,
      password: "",
      role: farmer.role,
    },
    mode: "all",
  });

  const { handleSubmit, reset, control, formState } = form;
  const { isValid, isDirty } = formState;

  const isFormUpdated = useMemo(() => isDirty, [isDirty]);

  // Reset form when farmer changes or drawer opens
  useEffect(() => {
    if (open && farmer) {
      reset({
        name: farmer.name,
        email: farmer.email,
        password: "",
        role: farmer.role,
      });
    }
  }, [open, farmer, reset]);

  const onSubmit = async (data: FarmerFormData) => {
    const updateData: Farmer = {
      _id: farmer._id,
      name: data.name,
      email: data.email,
      role: data.role,
      password: data.password || farmer.password,
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
        title="Edit Farmer"
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
            <FormField
              control={control}
              name="email"
              render={({ field }) => (
                <FormInputField
                  label="Email"
                  type="email"
                  required
                  {...field}
                />
              )}
            />
            <FormField
              control={control}
              name="password"
              render={({ field }) => (
                <FormInputField
                  label="Password"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  {...field}
                />
              )}
            />
            <FormField
              control={control}
              name="role"
              render={({ field }) => (
                <FormSelectField
                  label="Role"
                  required
                  fullWidth
                  options={[
                    { label: "Worker", value: "worker" },
                    { label: "Admin", value: "admin" },
                  ]}
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
