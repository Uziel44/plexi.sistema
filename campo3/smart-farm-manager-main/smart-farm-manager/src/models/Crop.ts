import { Schema, model, models, Document, Types } from "mongoose";

export interface ICrop extends Document {
  name: string;
  type: string;
  planting_date: Date;
  harvest_date: Date;
  field_id: Types.ObjectId;
}

const CropSchema = new Schema<ICrop>({
  name: { type: String, required: true },
  type: { type: String, required: true },
  planting_date: { type: Date, required: true },
  harvest_date: { type: Date },
  field_id: { type: Schema.Types.ObjectId, ref: "Field", required: true },
});

const Crop = models.Crop || model<ICrop>("Crop", CropSchema);
export default Crop;
