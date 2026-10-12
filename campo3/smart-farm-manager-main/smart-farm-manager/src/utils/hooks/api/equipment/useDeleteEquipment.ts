import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiClient } from "../../apiClient";

async function deleteEquipment(id: string): Promise<void> {
  await apiClient(`/equipment?id=${id}`, { method: "DELETE" });
}

export function useDeleteEquipment(
  options?: UseMutationOptions<void, Error, string>
): UseMutationResult<void, Error, string> {
  return useMutation({
    mutationFn: deleteEquipment,
    ...options,
  });
}
