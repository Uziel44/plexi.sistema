import {
  useMutation,
  UseMutationResult,
  UseMutationOptions,
} from "@tanstack/react-query";
import { Crop, UpdateCropPayload } from "./types";
import { apiClient } from "../../apiClient";
async function updateCrop(data: UpdateCropPayload): Promise<Crop> {
  return apiClient<Crop>("/crops", {
    method: "PUT",
    body: data,
  });
}

export function useUpdateCrop(
  options?: UseMutationOptions<Crop, Error, UpdateCropPayload>
): UseMutationResult<Crop, Error, UpdateCropPayload> {
  return useMutation({
    mutationFn: updateCrop,
    ...options,
  });
}
