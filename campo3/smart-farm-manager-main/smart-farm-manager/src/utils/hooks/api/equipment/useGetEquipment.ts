import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import { Equipment } from "./types";

export const getAllEquipment = async (): Promise<Equipment[]> =>
  apiClient<Equipment[]>("/equipment");

export const useGetEquipment = () =>
  useQuery({
    queryKey: ["equipment"],
    queryFn: getAllEquipment,
  });
