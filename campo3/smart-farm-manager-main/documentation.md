# Smart Farm Manager

This is a project that aims to be an ERP for a farm environment.

First, I set up the Next project which will be the fullstack solution. The DB will be a MongoDB database container exposed on 27017 port.

## Step 1. Define data model for MongoDB

The application uses 6 core entities:

- **Farmers** - System users (farm administrators)
  - Fields: `_id`, `name`, `email`, `password`, `role`
- **Fields** - Land parcels from the farm
  - Fields: `_id`, `name`, `area`, `location`, `soil_type`, `farmer_id`
- **Crops** - Types of plants cultivated
  - Fields: `_id`, `name`, `type`, `planting_date`, `harvest_date`, `field_id`
- **Animals** - Farm animal records
  - Fields: `_id`, `tag`, `species`, `birth_date`, `weight`, `health_status`, `farmer_id`
- **Equipment** - Tractors, machinery, etc.
  - Fields: `_id`, `name`, `type`, `status`, `purchase_date`, `last_service_date`, `farmer_id`
- **Transactions** - Financial transactions records
  - Fields: `_id`, `type` (income/expense), `category`, `amount`, `date`, `description`, `payment_method`, `payment_status`, `farmer_id`, `equipment_id` (optional), `invoice_number`, `vendor_name`

## Conceptual ERD Model

```
┌──────────────┐           ┌──────────────┐
│   Farmers    │           │   Equipment  │
│--------------│           │--------------│
│ _id          │◄──────────┤ farmer_id    │
│ name         │           │ name         │
│ email        │           │ type         │
│ password     │           │ status       │
│ role         │           │ purchase_date│
└──────┬───────┘           │ last_service │
       │                   └──────────────┘
       │
       │1        ┌──────────────┐
       │         │   Fields     │
       │────────►│--------------│
       │         │ _id          │
       │         │ name         │
       │         │ area         │
       │         │ location     │
       │         │ soil_type    │
       │         │ farmer_id    │
       │         └──────┬───────┘
       │                │
       │1               │1..*
       │                ▼
       │         ┌──────────────┐
       │         │   Crops      │
       │         │--------------│
       │         │ _id          │
       │         │ name         │
       │         │ type         │
       │         │ planting_date│
       │         │ harvest_date │
       │         │ field_id     │
       │         └──────────────┘
       │
       │1
       │
       ▼
┌──────────────┐
│   Animals    │
│--------------│
│ _id          │
│ tag          │
│ species      │
│ birth_date   │
│ weight       │
│ health_status│
│ farmer_id    │
└──────────────┘

┌────────────────────┐
│   Transactions     │
│--------------------│
│ _id                │
│ type               │
│ category           │
│ amount             │
│ date               │
│ description        │
│ payment_method     │
│ payment_status     │
│ farmer_id          │
│ equipment_id       │
│ invoice_number     │
│ vendor_name        │
└────────────────────┘
```

## Relationships

| Relationship             | Type      | Description                                      |
| ------------------------ | --------- | ------------------------------------------------ |
| Farmer → Fields          | 1-to-many | A farmer owns many fields                        |
| Field → Crops            | 1-to-many | A field has many crops                           |
| Farmer → Animals         | 1-to-many | A farmer owns many animals                       |
| Farmer → Equipment       | 1-to-many | A farmer owns many pieces of equipment           |
| Farmer → Transactions    | 1-to-many | A farmer has many financial transactions         |
| Equipment → Transactions | 1-to-many | Optional link for equipment-related transactions |

MongoDB fiind o bază NoSQL, relațiile nu se implementează prin foreign keys reale, ci prin referințe logice (ID-uri).

De exemplu, în Fields salvăm farmer_id (ObjectId al fermierului), iar în Crops salvăm field_id.

## Implementation Steps

- Define the models inside `/models` folder for each entity
- Connect to the MongoDB database using Mongoose in `/lib/mongodb.ts` file
- Create a reusable apiClient in `/utils/hooks/apiClient.ts` for making API requests
- Build CRUD operations for each entity with API routes in `/app/api/`
- Create frontend components in `/components/features/` for each entity

---

## 1. Data Model (Database — 6 Entities)

The following 6 main entities are implemented:

| Entity          | Description                              | Key Fields                                                                                            |
| --------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Farmer**      | Users of the system (admins, workers)    | `name`, `email`, `password`, `role`                                                                   |
| **Field**       | Land parcels                             | `name`, `area`, `location`, `soil_type`, `farmer_id`                                                  |
| **Crop**        | Crops cultivated on fields               | `name`, `type`, `planting_date`, `harvest_date`, `field_id`                                           |
| **Animal**      | Animals managed on the farm              | `tag`, `species`, `birth_date`, `weight`, `health_status`, `farmer_id`                                |
| **Equipment**   | Agricultural machinery                   | `name`, `type`, `status`, `purchase_date`, `last_service_date`, `farmer_id`                           |
| **Transaction** | Financial transactions (income/expenses) | `type`, `category`, `amount`, `date`, `payment_method`, `payment_status`, `farmer_id`, `equipment_id` |

---

## 2. CRUD Functionalities (6 Data Management Interfaces)

Each entity has a complete interface (frontend + backend):

| Page            | Functions     | Description                                                           |
| --------------- | ------------- | --------------------------------------------------------------------- |
| `/farmers`      | CRUD complete | Add, edit, delete, and list farmers                                   |
| `/fields`       | CRUD complete | Manage land parcels with location and soil type tracking              |
| `/crops`        | CRUD complete | Manage crops (linked to fields)                                       |
| `/animals`      | CRUD complete | Manage livestock with health tracking                                 |
| `/equipment`    | CRUD complete | Manage machinery and equipment                                        |
| `/transactions` | CRUD complete | Manage financial transactions (income/expenses) with payment tracking |

🔹 These constitute the 6 data collection/management interfaces required by the project.

---

## 3. Reports (Minimum 4 Reporting/Data Query Interfaces)

There are analytics pages where data from multiple entities is combined:

| Report                        | Purpose                                                | Entities Queried                         |
| ----------------------------- | ------------------------------------------------------ | ---------------------------------------- |
| **1️⃣ Fields Analytics**       | Field distribution, area analysis, top farmers         | `fields` + `farmers`                     |
| **2️⃣ Animals Analytics**      | Livestock health status, species distribution          | `animals` + `farmers`                    |
| **3️⃣ Crops Analytics**        | Crop lifecycle tracking, harvest predictions           | `crops` + `fields`                       |
| **4️⃣ Equipment Analytics**    | Equipment status, maintenance tracking                 | `equipment` + `farmers`                  |
| **5️⃣ Transactions Analytics** | Financial overview, income vs expenses, payment status | `transactions` + `farmers` + `equipment` |

### Details:

**1️⃣ Fields Analytics Component:**

- Integrates 2 entities (`fields` + `farmers`)
- Offers interactive filters (by location, soil type, and farmer)
- Provides computed statistics (totals, averages, top performers)
- Contains 4 different charts with Nivo (bar charts, pie charts)
- Displays summary KPIs (total area, total fields, average field size)

**2️⃣ Animals Analytics Component:**

- Integrates animals data with farmer information
- Interactive filters by species, health status, and farmer
- Visual charts showing species distribution and health statistics
- Summary cards with total animals, average weight, and health overview

**3️⃣ Crops Analytics Component:**

- Tracks crop planting and harvest schedules
- Links crops to specific fields
- Visualizes crop type distribution
- Calendar views for planting/harvest dates

**4️⃣ Equipment Analytics Component:**

- Equipment status monitoring (active, maintenance, retired)
- Service history tracking
- Equipment distribution by farmer
- Maintenance schedule visualization

**5️⃣ Transactions Analytics Component:**

- Financial tracking with income vs expense analysis
- Payment status monitoring (paid, pending, overdue)
- Category-wise breakdown of transactions
- Equipment-linked expense tracking
- Monthly/yearly financial trends

Charts are added to make the data visual and interactive using Nivo library.

---

## 4. Implementation Order

✅ **Completed:**

- Farmers CRUD ✓
- Fields CRUD ✓
- Crops CRUD (with Field relationship) ✓
- Animals CRUD ✓
- Equipment CRUD ✓
- Transactions CRUD (with Farmer and Equipment relationships) ✓
- Analytics dashboards for all entities ✓
- Neobrutalism design system implementation ✓
- Dark/Light theme support ✓

**Next Steps:**

- Additional reporting features
- Dashboard homepage with overview statistics
- Advanced filtering and search
- Data export capabilities
- Mobile responsiveness improvements

---

## 5. General Architecture

### Backend

- **Next.js API Routes** - Serverless API endpoints in `/app/api/`
- **MongoDB** - NoSQL database running in Docker container (port 27017)
- **Mongoose** - ODM for MongoDB with schema validation

### Frontend

- **Next.js 16** with App Router - React framework
- **React 19** - UI library
- **TypeScript 5** - Type-safe development
- **TanStack Query (React Query)** - Data fetching and caching
- **TailwindCSS 4** - Utility-first styling
- **shadcn/ui + Radix UI** - Accessible component library
- **Nivo** - Data visualization library

### State Management

- React Query for server state
- React Context for theme management
- React Hook Form for form state with Zod validation

### Design System

- Neobrutalism-inspired design with bold borders
- Consistent dark/light theme support
- Responsive layouts with mobile-first approach
- Accessible components following WCAG guidelines

---

## 6. Tech Stack Summary

**Core Framework:** Next.js 16 (App Router), React 19, TypeScript 5

**Database:** MongoDB 7.0 (Dockerized), Mongoose 8.19

**Styling:** TailwindCSS 4, shadcn/ui, Radix UI primitives

**State Management:** TanStack Query 5, React Hook Form 7, Zod 4

**Data Visualization:** Nivo (bar, pie, line charts)

**UI Components:** Lucide React icons, Sonner toasts, Vaul drawers

**Development Tools:** ESLint 9, PostCSS, Docker

---

## 7. Project Structure

```
smart-farm-manager/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes (backend)
│   │   │   ├── animals/
│   │   │   ├── crops/
│   │   │   ├── equipment/
│   │   │   ├── farmers/
│   │   │   ├── fields/
│   │   │   └── transactions/
│   │   ├── animals/           # Animals management page
│   │   ├── crops/             # Crops management page
│   │   ├── equipment/         # Equipment management page
│   │   ├── farmers/           # Farmers management page
│   │   ├── fields/            # Fields management page
│   │   ├── transactions/      # Transactions management page
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Home page
│   ├── components/
│   │   ├── features/          # Feature-specific components
│   │   │   ├── animals/      # Animal CRUD + analytics
│   │   │   ├── crops/        # Crop CRUD + analytics
│   │   │   ├── equipment/    # Equipment CRUD + analytics
│   │   │   ├── farmers/      # Farmer CRUD + analytics
│   │   │   ├── fields/       # Field CRUD + analytics
│   │   │   └── transactions/ # Transaction CRUD + analytics
│   │   └── ui/               # Reusable UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── Dialog/
│   │       ├── Drawer/
│   │       ├── Form/
│   │       ├── Select/
│   │       └── Table/
│   ├── lib/                  # Utility libraries
│   │   ├── mongodb.ts        # Database connection
│   │   └── utils.ts          # Helper functions
│   ├── models/               # Mongoose models
│   │   ├── Animal.ts
│   │   ├── Crop.ts
│   │   ├── Equipment.ts
│   │   ├── Farmer.ts
│   │   ├── Field.ts
│   │   └── Transaction.ts
│   ├── providers/            # React context providers
│   │   ├── LayoutProvider.tsx
│   │   ├── QueryClient.tsx
│   │   └── ThemeProvider.tsx
│   └── utils/                # Utilities and hooks
│       ├── constants.ts
│       ├── routes.ts
│       └── hooks/            # Custom React hooks
│           ├── apiClient.ts
│           └── api/          # Entity-specific hooks
├── public/                   # Static assets
├── docker-compose.yml        # MongoDB container config
└── package.json
```

---

## 8. Key Features Implemented

### Data Visualization

- Interactive bar charts for comparative analysis
- Pie charts for distribution visualization
- Real-time data updates with React Query
- Dark/light mode compatible chart themes

### User Experience

- Responsive data tables with sorting, filtering, and pagination
- Drawer-based forms for adding/editing records
- Confirmation dialogs for destructive actions
- Toast notifications for user feedback
- Loading states and error handling

### Data Management

- Complete CRUD operations for all 6 entities
- Form validation with Zod schemas
- Relationship management between entities
- Optimistic updates with automatic cache invalidation

### Analytics & Reporting

- Interactive filters for data analysis
- Summary statistics and KPIs
- Top performers tracking
- Distribution analysis across multiple dimensions
- Financial tracking with income/expense categorization

---

## 9. MongoDB Collections

The following collections are created in the `smart_farm_db` database:

- `farmers` - User accounts and farm managers
- `fields` - Land parcels with location and soil data
- `crops` - Crop records linked to fields
- `animals` - Livestock inventory
- `equipments` - Farm machinery and tools (note: plural form)
- `transactions` - Financial records (income and expenses)

Collections are automatically created by Mongoose when the first document is inserted.
