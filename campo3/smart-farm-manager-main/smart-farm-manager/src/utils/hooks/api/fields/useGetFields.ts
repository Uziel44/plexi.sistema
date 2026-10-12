import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import { Field } from "./types";

export const getAllFields = async (): Promise<Field[]> =>
  apiClient<Field[]>("/fields");

export const useGetFields = () =>
  useQuery({
    queryKey: ["fields"],
    queryFn: getAllFields,
  });
