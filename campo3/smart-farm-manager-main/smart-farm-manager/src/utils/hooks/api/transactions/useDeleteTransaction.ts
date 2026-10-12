import {
  useMutation,
  UseMutationOptions,
  UseMutationResult,
} from "@tanstack/react-query";
import { apiClient } from "../../apiClient";

async function deleteTransaction(id: string): Promise<void> {
  await apiClient(`/transactions?id=${id}`, { method: "DELETE" });
}

export function useDeleteTransaction(
  options?: UseMutationOptions<void, Error, string>
): UseMutationResult<void, Error, string> {
  return useMutation({
    mutationFn: deleteTransaction,
    ...options,
  });
}
