"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useAddFarmer } from "@/utils/hooks/api/farmers/usePostFarmer";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, Plus } from "lucide-react";

import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/Drawer";
import { Dialog } from "@/components/ui/Dialog";

import { Form, FormField } from "@/components/ui/Form/form";
import { FormInputField } from "@/components/ui/Form/FormInputField";
import { FormSelectField } from "@/components/ui/Form/FormSelectField";

const farmerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["worker", "admin"], "Role is required"),
});

type FarmerFormData = z.infer<typeof farmerSchema>;

export const AddFarmerDrawer = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FarmerFormData>({
    resolver: zodResolver(farmerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "worker",
    },
    mode: "all",
  });

  const { watch, handleSubmit, reset, control, formState } = form;
  const { isValid } = formState;

  const formValues = watch();
  const isFormUpdated = useMemo(
    () => Object.values(formValues).some((value) => value !== ""),
    [formValues]
  );

  const addFarmerMut = useAddFarmer({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["farmers"] });
      toast.success("Farmer added successfully!", {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
    },

    onError: (error) => {
      console.error("Error creating assessment:", error);
      toast.error("Failed to add farmer. Please try again.", {
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    },
  });
  const isSubmitDisabled =
    !isValid || Object.keys(formValues).length === 0 || addFarmerMut.isPending;

  const onSubmit = async (data: FarmerFormData) => {
    try {
      await addFarmerMut.mutateAsync(data);
      setOpenDrawer(false);
      reset();
    } catch (error) {
      console.error("Error creating assessment:", error);
    }
  };

  const onDialogConfirmCancel = () => {
    reset();
    setOpenDialog(false);
    setOpenDrawer(false);
  };

  const handleCancel = () => {
    if (isFormUpdated) setOpenDialog(true);
    else {
      setOpenDrawer(false);
      reset();
    }
  };

  const toggleDrawerState = (isOpen: boolean) => {
    if (isOpen) setOpenDrawer(true);
    else handleCancel();
  };

  const renderDrawerFooter = () => (
    <>
      <Button onClick={handleSubmit(onSubmit)} disabled={isSubmitDisabled}>
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
            Add Farmer
          </Button>
        }
        title="Add New Farmer"
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
                  required
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
        title="Cancel Form"
        description="Are you sure you want to cancel? All changes will be lost."
        onConfirm={onDialogConfirmCancel}
        onCancel={() => setOpenDialog(false)}
      />
    </>
  );
};
