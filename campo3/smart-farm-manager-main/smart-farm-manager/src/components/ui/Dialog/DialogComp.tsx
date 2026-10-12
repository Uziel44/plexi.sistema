import { Button } from "@/components/ui/button";

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Dialog as ShadcnDialog,
} from "./shadcn-dialog";

export const Dialog = ({
  open,
  setOpen,
  onConfirm,
  onCancel,
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel = "Ok",
}: {
  open: boolean;
  setOpen?: (value: boolean) => void;
  onConfirm?: () => void;
  onCancel?: () => void;
  title: string;
  description: string;
  cancelLabel?: string;
  confirmLabel?: string;
}) => {
  const handleCancelClick = () => {
    setOpen?.(false);
    if (onCancel) {
      onCancel();
    }
  };

  const handleOkClick = () => {
    setOpen?.(false);
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <>
      <ShadcnDialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="uppercase">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="justify-end space-x-2">
            <Button
              variant="outline"
              className="uppercase"
              onClick={handleCancelClick}
            >
              {cancelLabel}
            </Button>
            <Button className="uppercase" onClick={handleOkClick}>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </ShadcnDialog>
    </>
  );
};
