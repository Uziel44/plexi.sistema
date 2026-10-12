import { Schema, model, models, Document, Types } from "mongoose";

export interface IAnimal extends Document {
  tag: string;
  species: string;
  birth_date: Date;
  weight: number;
  health_status: string;
  farmer_id: Types.ObjectId;
}

const AnimalSchema = new Schema<IAnimal>({
  tag: { type: String, required: true, unique: true },
  species: { type: String, required: true },
  birth_date: { type: Date, required: true },
  weight: { type: Number, required: true },
  health_status: { type: String, required: true },
  farmer_id: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
});

const Animal = models.Animal || model<IAnimal>("Animal", AnimalSchema);
export default Animal;
