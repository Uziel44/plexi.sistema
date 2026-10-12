"use client";

import { Eye, EyeOff } from "lucide-react";
import { createElement, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/Form/form";

import { Input, InputProps } from "../input";

interface PasswordFieldProps extends Omit<InputProps, "type"> {
  label?: string;
  description?: string;
  placeholder?: string;
}

export const FormPasswordField = ({
  label = "Password",
  description,
  placeholder = "Enter password",
  className,
  ...props
}: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="relative">
          <Input
            {...props}
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            className={`pr-10 ${className || ""}`}
            autoComplete="new-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={togglePasswordVisibility}
            aria-label="Toggle password visibility"
          >
            {createElement(showPassword ? EyeOff : Eye, {
              className: "h-5 w-5 text-muted-foreground",
            })}
          </Button>
        </div>
      </FormControl>
      <FormMessage />
      {description && <FormDescription>{description}</FormDescription>}
    </FormItem>
  );
};
