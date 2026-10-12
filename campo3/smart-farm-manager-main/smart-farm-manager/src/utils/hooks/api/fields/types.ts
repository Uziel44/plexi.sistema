import type { Farmer } from "../farmers/types";
export type Field = {
  _id: string;
  name: string;
  area: number;
  location: string;
  soil_type: string;
  farmer_id: Farmer | string;
  __v?: number;
};

export type FieldPayload = Omit<Field, "_id" | "__v">;

export type UpdateFieldPayload = {
  id: string;
  name: string;
  area: number;
  location: string;
  soil_type: string;
  farmer_id: string;
};
