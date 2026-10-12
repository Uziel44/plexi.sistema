import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import { Farmer } from "./types";

export const getAllFarmers = async (): Promise<Farmer[]> =>
  apiClient<Farmer[]>("/farmers");

export const useFarmers = () =>
  useQuery({
    queryKey: ["farmers"],
    queryFn: getAllFarmers,
  });
