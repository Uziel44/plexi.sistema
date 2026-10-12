import { Schema, model, models, Document } from "mongoose";

export interface IFarmer extends Document {
  name: string;
  email: string;
  password: string;
  role: "admin" | "worker";
}

const FarmerSchema = new Schema<IFarmer>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "worker"], default: "worker" },
});

const Farmer = models.Farmer || model<IFarmer>("Farmer", FarmerSchema);
export default Farmer;
