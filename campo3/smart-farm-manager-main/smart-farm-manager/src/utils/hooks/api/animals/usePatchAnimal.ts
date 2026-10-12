import {
  useMutation,
  UseMutationResult,
  UseMutationOptions,
} from "@tanstack/react-query";
import { Animal, UpdateAnimalPayload } from "./types";
import { apiClient } from "../../apiClient";
async function updateAnimal(data: UpdateAnimalPayload): Promise<Animal> {
  return apiClient<Animal>("/animals", {
    method: "PUT",
    body: data,
  });
}

export function useUpdateAnimal(
  options?: UseMutationOptions<Animal, Error, UpdateAnimalPayload>
): UseMutationResult<Animal, Error, UpdateAnimalPayload> {
  return useMutation({
    mutationFn: updateAnimal,
    ...options,
  });
}
