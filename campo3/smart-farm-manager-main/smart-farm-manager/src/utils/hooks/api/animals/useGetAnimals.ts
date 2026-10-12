import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import { Animal } from "./types";

export const getAllAnimals = async (): Promise<Animal[]> =>
  apiClient<Animal[]>("/animals");

export const useGetAnimals = () =>
  useQuery({
    queryKey: ["animals"],
    queryFn: getAllAnimals,
  });
