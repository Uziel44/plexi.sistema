import {
  useMutation,
  UseMutationResult,
  UseMutationOptions,
} from "@tanstack/react-query";
import { Field, UpdateFieldPayload } from "./types";
import { apiClient } from "../../apiClient";
async function updateField(data: UpdateFieldPayload): Promise<Field> {
  return apiClient<Field>("/fields", {
    method: "PUT",
    body: data,
  });
}

export function useUpdateField(
  options?: UseMutationOptions<Field, Error, UpdateFieldPayload>
): UseMutationResult<Field, Error, UpdateFieldPayload> {
  return useMutation({
    mutationFn: updateField,
    ...options,
  });
}
