import {
  useMutation,
  UseMutationResult,
  UseMutationOptions,
} from "@tanstack/react-query";
import { apiClient } from "../../apiClient";
import { Animal, AnimalPayload } from "./types";

async function addAnimal(data: AnimalPayload): Promise<Animal> {
  return apiClient<Animal>("/animals", {
    method: "POST",
    body: data,
  });
}

export function useAddAnimal(
  options?: UseMutationOptions<Animal, Error, AnimalPayload>
): UseMutationResult<
  Animal, // Type of returned data
  Error, // Type of error
  AnimalPayload // Type of variables you pass to mutate()
> {
  return useMutation({
    mutationFn: addAnimal,
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
