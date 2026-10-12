import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import { Crop } from "./types";

export const getAllCrops = async (): Promise<Crop[]> =>
  apiClient<Crop[]>("/crops");

export const useGetCrops = () =>
  useQuery({
    queryKey: ["crops"],
    queryFn: getAllCrops,
  });
