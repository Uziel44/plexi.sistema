import { Schema, model, models, Document, Types } from "mongoose";

export interface IEquipment extends Document {
  name: string;
  type: string;
  status: string;
  purchase_date: Date;
  last_service_date: Date;
  farmer_id: Types.ObjectId;
}

const EquipmentSchema = new Schema<IEquipment>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  status: {
    type: String,
    enum: ["active", "maintenance", "retired"],
    default: "active",
  },
  purchase_date: { type: Date, required: true },
  last_service_date: { type: Date },
  farmer_id: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
});

const Equipment =
  models.Equipment || model<IEquipment>("Equipment", EquipmentSchema);
export default Equipment;
