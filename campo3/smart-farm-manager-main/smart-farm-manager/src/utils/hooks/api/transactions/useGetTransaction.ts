import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import { Transaction } from "./types";

export const getAllTransactions = async (): Promise<Transaction[]> =>
  apiClient<Transaction[]>("/transactions");

export const useGetTransactions = () =>
  useQuery({
    queryKey: ["transactions"],
    queryFn: getAllTransactions,
  });
