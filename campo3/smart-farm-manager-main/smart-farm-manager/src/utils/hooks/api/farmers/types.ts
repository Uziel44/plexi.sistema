export type Farmer = {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "admin" | "worker";
  __v?: number;
};

export type FarmerPayload = Omit<Farmer, "_id" | "__v">;

export type UpdateFarmerPayload = {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "admin" | "worker";
};
