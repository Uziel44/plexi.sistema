import { Field } from "../fields/types";

export type Crop = {
  _id: string;
  name: string;
  type: string;
  planting_date: string;
  harvest_date: string;
  field_id: Field | string;
  __v?: number;
};

export type CropPayload = Omit<Crop, "_id" | "__v">;

export type UpdateCropPayload = {
  id: string;
  name: string;
  type: string;
  planting_date: Date;
  harvest_date: Date;
  field_id: string;
};
