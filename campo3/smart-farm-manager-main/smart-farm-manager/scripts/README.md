# Database Population Script

This script populates the MongoDB database with realistic mock data for testing and development purposes.

## Prerequisites

1. **MongoDB** must be running on `localhost:27017` (or set `MONGODB_URI` environment variable)
2. Install dependencies:

```bash
npm install
```

This will install:

- **@faker-js/faker**: For generating realistic mock data
- **tsx**: For running TypeScript scripts directly

## Usage

Run the populate script:

```bash
npm run populate
```

## What it does

The script will:

1. **Connect** to MongoDB
2. **Clear** all existing data from collections
3. **Generate** mock data in dependency order:
   - ✅ **Farmers** (10)
   - ✅ **Fields** (3 per farmer = 30 total)
   - ✅ **Crops** (2 per field = 60 total)
   - ✅ **Animals** (8 per farmer = 80 total)
   - ✅ **Equipment** (4 per farmer = 40 total)
   - ✅ **Transactions** (15 per farmer = 150 total)
4. **Display** summary statistics
5. **Disconnect** from MongoDB

## Configuration

You can adjust the number of generated records by modifying the `COUNTS` object in `scripts/populate.ts`:

```typescript
const COUNTS = {
  farmers: 10,
  fieldsPerFarmer: 3,
  cropsPerField: 2,
  animalsPerFarmer: 8,
  equipmentPerFarmer: 4,
  transactionsPerFarmer: 15,
};
```

## Data Details

### Farmers

- Realistic names using Faker
- Unique emails
- Random roles (admin/worker)
- First farmer is always admin

### Fields

- Random names with locations
- Area: 1-50 hectares
- Various soil types: Clay, Sandy, Loamy, Silty, Peaty, Chalky
- Locations: North Field, South Field, East Valley, West Hills, etc.

### Crops

- Crop types: Wheat, Corn, Soybeans, Rice, Barley, Oats, Cotton, Tomatoes, Potatoes, Carrots
- Planting dates in the past 180 days
- Harvest dates 60-150 days after planting

### Animals

- Species: Cattle, Sheep, Goat, Pig, Chicken, Horse, Duck
- Unique tags (e.g., "AB-1234")
- Birth dates up to 5 years old
- Weight: 50-800 kg
- Health status: healthy, sick, recovering, excellent

### Equipment

- Types: Tractor, Harvester, Plow, Seeder, Sprayer, Irrigation System, Trailer
- Status: active, maintenance, retired
- Purchase dates in the past 5 years
- Last service date after purchase date

### Transactions

- Types: income, expense
- Income categories: crop_sales, livestock_sales, subsidies, other
- Expense categories: seeds, fertilizers, equipment, labor, utilities, maintenance, fuel, other
- Amount: $50-$5000
- Payment methods: cash, bank_transfer, card, check
- Payment status: paid, pending, overdue
- 30% of maintenance/equipment expenses are linked to actual equipment

## Example Output

```
✅ Connected to MongoDB
🗑️  Clearing existing data...
✅ Database cleared
👨‍🌾 Creating 10 farmers...
✅ Created 10 farmers
🌾 Creating 3 fields per farmer...
✅ Created 30 fields
🌱 Creating 2 crops per field...
✅ Created 60 crops
🐄 Creating 8 animals per farmer...
✅ Created 80 animals
🚜 Creating 4 equipment per farmer...
✅ Created 40 equipment items
💰 Creating 15 transactions per farmer...
✅ Created 150 transactions

✨ Database population complete!
📊 Summary:
   - Farmers: 10
   - Fields: 30
   - Crops: 60
   - Animals: 80
   - Equipment: 40
   - Transactions: 150
   - Total documents: 370

👋 Disconnected from MongoDB
```

## Troubleshooting

### MongoDB Connection Error

Make sure MongoDB is running:

```bash
docker ps  # Check if MongoDB container is running
```

Or start the container:

```bash
docker-compose up -d
```

### Package Not Found

Install dependencies:

```bash
npm install
```

### TypeScript Errors

The script uses `tsx` to run TypeScript directly. Make sure it's installed:

```bash
npm install -D tsx @faker-js/faker
```

## Dependencies

- **@faker-js/faker**: Generates realistic mock data
- **tsx**: Runs TypeScript scripts without compilation
- **mongoose**: MongoDB ODM (already in project dependencies)

## Notes

⚠️ **Warning**: This script will **delete all existing data** before populating the database. Make sure you're running it on a development database, not production!
