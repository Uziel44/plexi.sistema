import mongoose, { Document } from "mongoose";
import { faker } from "@faker-js/faker";

// Import models
import Farmer from "../src/models/Farmer";
import Field from "../src/models/Field";
import Crop from "../src/models/Crop";
import Animal from "../src/models/Animal";
import Equipment from "../src/models/Equipment";
import Transaction from "../src/models/Transaction";

// Types
type FarmerDoc = Document & { _id: mongoose.Types.ObjectId };
type FieldDoc = Document & { _id: mongoose.Types.ObjectId };
type EquipmentDoc = Document & {
  _id: mongoose.Types.ObjectId;
  farmer_id: mongoose.Types.ObjectId;
};

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb://admin:farmpass123@localhost:27017/smart_farm_db?authSource=admin";

// Configuration
const COUNTS = {
  farmers: 10,
  fieldsPerFarmer: 3,
  cropsPerField: 2,
  animalsPerFarmer: 8,
  equipmentPerFarmer: 4,
  transactionsPerFarmer: 15,
};

// Helper data
const CROP_TYPES = [
  "Wheat",
  "Corn",
  "Soybeans",
  "Rice",
  "Barley",
  "Oats",
  "Cotton",
  "Tomatoes",
  "Potatoes",
  "Carrots",
];

const SOIL_TYPES = ["Clay", "Sandy", "Loamy", "Silty", "Peaty", "Chalky"];

const LOCATIONS = [
  "North Field",
  "South Field",
  "East Valley",
  "West Hills",
  "Central Plains",
  "Riverside",
  "Mountain View",
  "Sunny Meadow",
];

const ANIMAL_SPECIES = [
  "Cattle",
  "Sheep",
  "Goat",
  "Pig",
  "Chicken",
  "Horse",
  "Duck",
];

const ANIMAL_HEALTH_STATUS = ["healthy", "sick", "recovering", "excellent"];

const EQUIPMENT_TYPES = [
  "Tractor",
  "Harvester",
  "Plow",
  "Seeder",
  "Sprayer",
  "Irrigation System",
  "Trailer",
];

const EQUIPMENT_STATUSES = ["active", "maintenance", "retired"];

const EXPENSE_CATEGORIES = [
  "seeds",
  "fertilizers",
  "equipment",
  "labor",
  "utilities",
  "maintenance",
  "fuel",
  "other",
];

const INCOME_CATEGORIES = [
  "crop_sales",
  "livestock_sales",
  "subsidies",
  "other",
];

const PAYMENT_METHODS = ["cash", "bank_transfer", "card", "check"];

const PAYMENT_STATUSES = ["paid", "pending", "overdue"];

// Random helper functions
const randomElement = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];

const randomDate = (start: Date, end: Date): Date => {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
};

const randomPastDate = (daysBack: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date;
};

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log("🗑️  Clearing existing data...");
  await Promise.all([
    Farmer.deleteMany({}),
    Field.deleteMany({}),
    Crop.deleteMany({}),
    Animal.deleteMany({}),
    Equipment.deleteMany({}),
    Transaction.deleteMany({}),
  ]);
  console.log("✅ Database cleared");
}

async function populateFarmers() {
  console.log(`👨‍🌾 Creating ${COUNTS.farmers} farmers...`);
  const farmers = [];

  for (let i = 0; i < COUNTS.farmers; i++) {
    const farmer = await Farmer.create({
      name: faker.person.fullName(),
      email: faker.internet.email().toLowerCase(),
      password: faker.internet.password(),
      role: i === 0 ? "admin" : randomElement(["admin", "worker"]),
    });
    farmers.push(farmer);
  }

  console.log(`✅ Created ${farmers.length} farmers`);
  return farmers;
}

async function populateFields(farmers: FarmerDoc[]) {
  console.log(`🌾 Creating ${COUNTS.fieldsPerFarmer} fields per farmer...`);
  const fields = [];

  for (const farmer of farmers) {
    for (let i = 0; i < COUNTS.fieldsPerFarmer; i++) {
      const field = await Field.create({
        name: `${randomElement(LOCATIONS)} - ${faker.number.int({
          min: 1,
          max: 100,
        })}`,
        area: faker.number.float({ min: 1, max: 50, fractionDigits: 1 }),
        location: randomElement(LOCATIONS),
        soil_type: randomElement(SOIL_TYPES),
        farmer_id: farmer._id,
      });
      fields.push(field);
    }
  }

  console.log(`✅ Created ${fields.length} fields`);
  return fields;
}

async function populateCrops(fields: FieldDoc[]) {
  console.log(`🌱 Creating ${COUNTS.cropsPerField} crops per field...`);
  const crops = [];

  for (const field of fields) {
    for (let i = 0; i < COUNTS.cropsPerField; i++) {
      const plantingDate = randomPastDate(180);
      const harvestDate = new Date(plantingDate);
      harvestDate.setDate(
        harvestDate.getDate() + faker.number.int({ min: 60, max: 150 })
      );

      const crop = await Crop.create({
        name: `${randomElement(CROP_TYPES)} Batch ${faker.number.int({
          min: 1,
          max: 999,
        })}`,
        type: randomElement(CROP_TYPES),
        planting_date: plantingDate,
        harvest_date: harvestDate,
        field_id: field._id,
      });
      crops.push(crop);
    }
  }

  console.log(`✅ Created ${crops.length} crops`);
  return crops;
}

async function populateAnimals(farmers: FarmerDoc[]) {
  console.log(`🐄 Creating ${COUNTS.animalsPerFarmer} animals per farmer...`);
  const animals = [];

  for (const farmer of farmers) {
    for (let i = 0; i < COUNTS.animalsPerFarmer; i++) {
      const animal = await Animal.create({
        tag: `${faker.string.alpha({
          length: 2,
          casing: "upper",
        })}-${faker.number.int({ min: 1000, max: 9999 })}`,
        species: randomElement(ANIMAL_SPECIES),
        birth_date: randomPastDate(1825), // Up to 5 years old
        weight: faker.number.float({ min: 50, max: 800, fractionDigits: 1 }),
        health_status: randomElement(ANIMAL_HEALTH_STATUS),
        farmer_id: farmer._id,
      });
      animals.push(animal);
    }
  }

  console.log(`✅ Created ${animals.length} animals`);
  return animals;
}

async function populateEquipment(farmers: FarmerDoc[]) {
  console.log(
    `🚜 Creating ${COUNTS.equipmentPerFarmer} equipment per farmer...`
  );
  const equipment = [];

  for (const farmer of farmers) {
    for (let i = 0; i < COUNTS.equipmentPerFarmer; i++) {
      const purchaseDate = randomPastDate(1825);
      const lastServiceDate = randomDate(purchaseDate, new Date());

      const equipmentItem = await Equipment.create({
        name: `${randomElement(EQUIPMENT_TYPES)} ${faker.number.int({
          min: 1,
          max: 50,
        })}`,
        type: randomElement(EQUIPMENT_TYPES),
        status: randomElement(EQUIPMENT_STATUSES),
        purchase_date: purchaseDate,
        last_service_date: lastServiceDate,
        farmer_id: farmer._id,
      });
      equipment.push(equipmentItem);
    }
  }

  console.log(`✅ Created ${equipment.length} equipment items`);
  return equipment;
}

async function populateTransactions(
  farmers: FarmerDoc[],
  equipment: EquipmentDoc[]
) {
  console.log(
    `💰 Creating ${COUNTS.transactionsPerFarmer} transactions per farmer...`
  );
  const transactions = [];

  for (const farmer of farmers) {
    // Get farmer's equipment
    const farmerEquipment = equipment.filter(
      (eq) => eq.farmer_id.toString() === farmer._id.toString()
    );

    for (let i = 0; i < COUNTS.transactionsPerFarmer; i++) {
      const type = randomElement(["income", "expense"]);
      const category =
        type === "income"
          ? randomElement(INCOME_CATEGORIES)
          : randomElement(EXPENSE_CATEGORIES);

      // 30% chance to link equipment for maintenance/equipment expenses
      const shouldLinkEquipment =
        type === "expense" &&
        (category === "maintenance" || category === "equipment") &&
        farmerEquipment.length > 0 &&
        Math.random() > 0.7;

      const transaction = await Transaction.create({
        type,
        category,
        amount: faker.number.float({ min: 50, max: 5000, fractionDigits: 2 }),
        date: randomPastDate(365),
        description: faker.lorem.sentence(),
        payment_method: randomElement(PAYMENT_METHODS),
        payment_status: randomElement(PAYMENT_STATUSES),
        farmer_id: farmer._id,
        equipment_id: shouldLinkEquipment
          ? randomElement(farmerEquipment)._id
          : undefined,
        invoice_number:
          Math.random() > 0.5
            ? `INV-${faker.number.int({ min: 10000, max: 99999 })}`
            : undefined,
        vendor_name: type === "expense" ? faker.company.name() : undefined,
      });
      transactions.push(transaction);
    }
  }

  console.log(`✅ Created ${transactions.length} transactions`);
  return transactions;
}

async function populate() {
  try {
    await connectDB();
    await clearDatabase();

    // Populate in dependency order
    const farmers = await populateFarmers();
    const fields = await populateFields(farmers);
    const crops = await populateCrops(fields);
    const animals = await populateAnimals(farmers);
    const equipment = await populateEquipment(farmers);
    const transactions = await populateTransactions(farmers, equipment);

    console.log("\n✨ Database population complete!");
    console.log("📊 Summary:");
    console.log(`   - Farmers: ${farmers.length}`);
    console.log(`   - Fields: ${fields.length}`);
    console.log(`   - Crops: ${crops.length}`);
    console.log(`   - Animals: ${animals.length}`);
    console.log(`   - Equipment: ${equipment.length}`);
    console.log(`   - Transactions: ${transactions.length}`);
    console.log(
      `   - Total documents: ${
        farmers.length +
        fields.length +
        crops.length +
        animals.length +
        equipment.length +
        transactions.length
      }`
    );
  } catch (error) {
    console.error("❌ Error populating database:", error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Disconnected from MongoDB");
  }
}

// Run the populate script
populate();
