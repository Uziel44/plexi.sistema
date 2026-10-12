import { Farmer } from "../farmers/types";

export type Equipment = {
  _id: string;
  name: string;
  type: string;
  status: string;
  purchase_date: Date;
  last_service_date: Date;
  farmer_id: Farmer | string;
  __v?: number;
};
export type EquipmentPayload = Omit<Equipment, "_id" | "__v">;

export type UpdateEquipmentPayload = {
  id: string;
  name: string;
  type: string;
  status: string;
  purchase_date: Date;
  last_service_date: Date;
  farmer_id: string;
};
