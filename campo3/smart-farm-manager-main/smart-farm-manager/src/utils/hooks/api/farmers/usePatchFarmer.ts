import {
  useMutation,
  UseMutationResult,
  UseMutationOptions,
} from "@tanstack/react-query";
import { Farmer, UpdateFarmerPayload } from "./types";
import { apiClient } from "../../apiClient";
async function updateFarmer(data: UpdateFarmerPayload): Promise<Farmer> {
  return apiClient<Farmer>("/farmers", {
    method: "PUT",
    body: data,
  });
}

export function useUpdateFarmer(
  options?: UseMutationOptions<Farmer, Error, UpdateFarmerPayload>
): UseMutationResult<Farmer, Error, UpdateFarmerPayload> {
  return useMutation({
    mutationFn: updateFarmer,
    ...options,
  });
}
