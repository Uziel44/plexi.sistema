import {
  useMutation,
  UseMutationResult,
  UseMutationOptions,
} from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import { Crop, CropPayload } from "./types";

async function addCrop(data: CropPayload): Promise<Crop> {
  return apiClient<Crop>("/crops", {
    method: "POST",
    body: data,
  });
}

export function useAddCrop(
  options?: UseMutationOptions<Crop, Error, CropPayload>
): UseMutationResult<
  Crop, // Type of returned data
  Error, // Type of error
  CropPayload // Type of variables you pass to mutate()
> {
  return useMutation({
    mutationFn: addCrop,
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
