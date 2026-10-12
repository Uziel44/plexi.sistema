import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiClient } from "../../apiClient";

async function deleteAnimal(id: string): Promise<void> {
  await apiClient(`/animals?id=${id}`, { method: "DELETE" });
}

export function useDeleteAnimal(
  options?: UseMutationOptions<void, Error, string>
): UseMutationResult<void, Error, string> {
  return useMutation({
    mutationFn: deleteAnimal,
    ...options,
  });
}
