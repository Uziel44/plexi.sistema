import {
  useMutation,
  UseMutationResult,
  UseMutationOptions,
} from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import { Equipment, EquipmentPayload } from "./types";

async function addEquipment(data: EquipmentPayload): Promise<Equipment> {
  return apiClient<Equipment>("/equipment", {
    method: "POST",
    body: data,
  });
}

export function useAddEquipment(
  options?: UseMutationOptions<Equipment, Error, EquipmentPayload>
): UseMutationResult<
  Equipment, // Type of returned data
  Error, // Type of error
  EquipmentPayload // Type of variables you pass to mutate()
> {
  return useMutation({
    mutationFn: addEquipment,
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
