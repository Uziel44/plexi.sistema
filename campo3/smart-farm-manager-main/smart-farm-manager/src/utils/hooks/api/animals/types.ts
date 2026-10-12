import { Farmer } from "../farmers/types";

export type Animal = {
  _id: string;
  tag: string;
  species: string;
  birth_date: Date;
  weight: number;
  health_status: string;
  farmer_id: Farmer | string;
  __v?: number;
};
export type AnimalPayload = Omit<Animal, "_id" | "__v">;

export type UpdateAnimalPayload = {
  id: string;
  tag: string;
  species: string;
  birth_date: Date;
  weight: number;
  health_status: string;
  farmer_id: string;
};
