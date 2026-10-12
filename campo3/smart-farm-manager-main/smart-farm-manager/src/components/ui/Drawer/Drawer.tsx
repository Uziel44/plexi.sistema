"use client";

import { ScrollArea } from "@radix-ui/react-scroll-area";
import { X } from "lucide-react";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";

import {
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  ShadcnDrawer,
} from "./shadcn-drawer";

export type DrawerProps = {
  open: boolean;
  onOpenChange?: (open: boolean) => void; //optional for external control
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  direction?: "top" | "bottom" | "left" | "right";
  hideFooterCloseButton?: boolean;
  trigger?: ReactNode;
};

export const Drawer = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  direction = "right",
  hideFooterCloseButton = false,
  trigger,
}: DrawerProps) => {
  return (
    <ShadcnDrawer direction={direction} open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <div className="absolute top-2 right-2">
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" aria-label="Close">
              <X size={16} />
            </Button>
          </DrawerClose>
        </div>
        {(title || description) && (
          <DrawerHeader>
            {title && <DrawerTitle>{title}</DrawerTitle>}
            {description && (
              <DrawerDescription>{description}</DrawerDescription>
            )}
          </DrawerHeader>
        )}
        <ScrollArea className="flex-1 p-4 w-full overflow-auto">
          {children}
        </ScrollArea>
        <DrawerFooter className="flex flex-row">
          {footer}
          {!hideFooterCloseButton && (
            <DrawerClose asChild>
              <Button
                aria-label="close drawer"
                variant="outline"
                className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
              >
                Cancel
              </Button>
            </DrawerClose>
          )}
        </DrawerFooter>
      </DrawerContent>
    </ShadcnDrawer>
  );
};

Drawer.displayName = "Drawer";
