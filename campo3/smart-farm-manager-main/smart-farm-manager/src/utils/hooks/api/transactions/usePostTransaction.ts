import {
  useMutation,
  UseMutationResult,
  UseMutationOptions,
} from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import { Transaction, TransactionPayload } from "./types";

async function addTransaction(data: TransactionPayload): Promise<Transaction> {
  return apiClient<Transaction>("/transactions", {
    method: "POST",
    body: data,
  });
}

export function useAddTransaction(
  options?: UseMutationOptions<Transaction, Error, TransactionPayload>
): UseMutationResult<
  Transaction, // Type of returned data
  Error, // Type of error
  TransactionPayload // Type of variables you pass to mutate()
> {
  return useMutation({
    mutationFn: addTransaction,
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
