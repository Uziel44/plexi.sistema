import { Schema, model, models, Document, Types } from "mongoose";

export interface IField extends Document {
  name: string;
  area: number;
  location: string;
  soil_type: string;
  farmer_id: Types.ObjectId;
}

const FieldSchema = new Schema<IField>({
  name: { type: String, required: true },
  area: { type: Number, required: true },
  location: { type: String, required: true },
  soil_type: { type: String, required: true },
  farmer_id: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
});

const Field = models.Field || model<IField>("Field", FieldSchema);
export default Field;
