import {
  useMutation,
  UseMutationResult,
  UseMutationOptions,
} from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import { Field, FieldPayload } from "./types";

async function addField(data: FieldPayload): Promise<Field> {
  return apiClient<Field>("/fields", {
    method: "POST",
    body: data,
  });
}

export function useAddField(
  options?: UseMutationOptions<Field, Error, FieldPayload>
): UseMutationResult<
  Field, // Type of returned data
  Error, // Type of error
  FieldPayload // Type of variables you pass to mutate()
> {
  return useMutation({
    mutationFn: addField,
    ...options,
  });
}

// Benefits of this hook:

// const addFarmer = useAddFarmer();

// addFarmer.mutate({
//   name: "Ion Popescu",
//   email: "ion@ferma.ro",
//   password: "12345",
//   role: "admin",
// });
