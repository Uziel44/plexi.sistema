import {
  useMutation,
  UseMutationResult,
  UseMutationOptions,
} from "@tanstack/react-query";
import { Transaction, UpdateTransactionPayload } from "./types";
import { apiClient } from "../../apiClient";
async function updateTransaction(
  data: UpdateTransactionPayload
): Promise<Transaction> {
  return apiClient<Transaction>("/transactions", {
    method: "PUT",
    body: data,
  });
}

export function useUpdateTransaction(
  options?: UseMutationOptions<Transaction, Error, UpdateTransactionPayload>
): UseMutationResult<Transaction, Error, UpdateTransactionPayload> {
  return useMutation({
    mutationFn: updateTransaction,
    ...options,
  });
}
