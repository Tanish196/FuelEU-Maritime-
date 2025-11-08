# Agent Workflow Documentation

This document serves as a comprehensive log of interactions with AI agents, including the prompts provided and the corresponding outputs generated. It facilitates tracking, review, and improvement of agent-assisted development processes.

## Overview

- **Project**: FuelEU-Maritime
- **Date Created**: November 6, 2025
- **Purpose**: Track AI agent interactions for code generation and project development

## Agent Interactions

### Interaction 1: .gitignore File Generation

**Date**: November 7, 2025  
**Agent**: GitHub Copilot - GPT-5 mini
**Task**: Generate a comprehensive `.gitignore` file for a Node.js + TypeScript + Prisma + Express backend project using hexagonal architecture.

**Prompt**:
```
Generate a .gitignore file for a Node.js + TypeScript + Prisma + Express backend project using hexagonal architecture.
```

**Output**:

```gitignore
# Dependencies
node_modules/
/.pnp
.pnp.js

# Environment variables
.env
.env.*
!.env.example

# Build output
/dist
/build

# Prisma
/prisma/migrations/
/prisma/*.db

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Coverage
coverage/
.nyc_output

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local development
.cache/
.tmp/
.temp/

# Optional eslint cache
.eslintcache

# Optional REPL history
w
```
### Interaction 2: Domain interfaces — assistant provided, user refactor

**Date**: November 8, 2025  
**Agent**: GitHub Copilot - GPT-5 mini  
**Task**: Provide TypeScript domain interfaces and Prisma models for the project.

**Prompt**:
```
I’m setting up the backend for my Fuel EU Maritime project using TypeScript, Prisma, and PostgreSQL.

I need you to generate a Prisma `schema.prisma` file and also define corresponding TypeScript interfaces for each model that I can use in my `core/domain` layer (since this project follows Hexagonal Architecture).

Here’s the database structure I want:

**Tables and columns**

1. routes → stores base route information
   - id (Int, @id, @default(autoincrement()))
   - route_id (String, unique)
   - vesselType (String)
   - fuelType (String)
   - year (Int)
   - ghg_intensity (Float)
   - fuelConsumption (Float)
   - distance (Float)
   - totalEmissions (Float)
   - is_baseline (Boolean, default false)

2. ship_compliance → stores computed compliance balance (CB) data
   - id (Int, @id, @default(autoincrement()))
   - ship_id (String)
   - year (Int)
   - cb_gco2eq (Float)

3. bank_entries → stores banked or applied CB records
   - id (Int, @id, @default(autoincrement()))
   - ship_id (String)
   - year (Int)
   - amount_gco2eq (Float)

4. pools → acts as a pool registry
   - id (Int, @id, @default(autoincrement()))
   - year (Int)
   - created_at (DateTime, @default(now()))

5. pool_members → stores each ship’s allocation in a pool
   - id (Int, @id, @default(autoincrement()))
   - pool_id (Int)
   - ship_id (String)
   - cb_before (Float)
   - cb_after (Float)

**Relationships**
- `ship_compliance.ship_id` → `routes.route_id`
- `bank_entries.ship_id` → `routes.route_id`
- `pool_members.pool_id` → `pools.id`

Use Prisma’s `@relation` syntax and proper `@@map` annotations for table names.  
The datasource is PostgreSQL and the client should be Prisma Client JS.
```

**Assistant Output**: It generated a single file `backend/src/core/domain/models.ts` containing all domain interfaces in one place. Created `schema.prisma`
```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")     
  directUrl = env("DIRECT_URL")
}

model Route {
  id              Int               @id @default(autoincrement())
  route_id        String            @unique
  vesselType      String
  fuelType        String
  year            Int
  ghg_intensity   Float
  fuelConsumption Float
  distance        Float
  totalEmissions  Float
  is_baseline     Boolean           @default(false)

  // Back-relations
  shipCompliances ShipCompliance[]  
  bankEntries     BankEntry[]      

  @@map("routes")
}

model ShipCompliance {
  id        Int     @id @default(autoincrement())
  ship_id   String
  year      Int
  cb_gco2eq Float

  // Relation to Route via Route.route_id (which is unique)
  route Route @relation(fields: [ship_id], references: [route_id])

  @@map("ship_compliance")
}

model BankEntry {
  id            Int     @id @default(autoincrement())
  ship_id       String
  year          Int
  amount_gco2eq Float

  // Relation to Route via Route.route_id
  route Route @relation(fields: [ship_id], references: [route_id])

  @@map("bank_entries")
}

model Pool {
  id         Int          @id @default(autoincrement())
  year       Int
  created_at DateTime     @default(now())

  // members relation
  members    PoolMember[]

  @@map("pools")
}

model PoolMember {
  id       Int     @id @default(autoincrement())
  pool_id  Int
  ship_id  String
  cb_before Float
  cb_after  Float

  // Relation to Pool
  pool Pool @relation(fields: [pool_id], references: [id])

  @@map("pool_members")
}

```
```typescript
export interface Route {
  id: number;
  routeId: string; // maps to prisma `route_id`
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number; // maps to prisma `ghg_intensity`
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean; // maps to prisma `is_baseline`

  // Optional relations (may be omitted in domain DTOs)
  shipCompliances?: ShipCompliance[];
  bankEntries?: BankEntry[];
}

export interface ShipCompliance {
  id: number;
  shipId: string; // maps to prisma `ship_id` and relates to Route.route_id
  year: number;
  cbGco2eq: number; // maps to prisma `cb_gco2eq`

  // Optional relation
  route?: Route;
}

export interface BankEntry {
  id: number;
  shipId: string; // maps to prisma `ship_id` and relates to Route.route_id
  year: number;
  amountGco2eq: number; // maps to prisma `amount_gco2eq`

  // Optional relation
  route?: Route;
}

export interface Pool {
  id: number;
  year: number;
  createdAt: Date; // maps to prisma `created_at`

  members?: PoolMember[];
}

export interface PoolMember {
  id: number;
  poolId: number; // maps to prisma `pool_id`
  shipId: string; // maps to prisma `ship_id`
  cbBefore: number; // maps to prisma `cb_before`
  cbAfter: number; // maps to prisma `cb_after`

  // Optional relation
  pool?: Pool;
}
```

**My changes (refactor)**: I split the single `models.ts` into multiple per-model files under `backend/src/core/domain/`. Added direct and database url for efficient database generation in `prisma.schema` and similar changes in `prisma.config.ts` file. The new files and their current contents are recorded below (as read from the workspace):

- `prisma.schema`
```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")     
  directUrl = env("DIRECT_URL")
}
```

- `backend/src/core/domain/BankEntry.ts`

```typescript
import type { Route } from "./Route";

export interface BankEntry {
  id: number;
  shipId: string;
  year: number;
  amountGco2eq: number;

  // Optional relation
  route?: Route;
}
```

- `backend/src/core/domain/Pool.ts`

```typescript
import type { PoolMember } from "./PoolMember";
export interface Pool {
  id: number;
  year: number;
  createdAt: Date;

  members?: PoolMember[];
}
```

- `backend/src/core/domain/PoolMember.ts`

```typescript
import type { Pool } from "./Pool";

export interface PoolMember {
  id: number;
  poolId: number;
  shipId: string;
  cbBefore: number; 
  cbAfter: number; 
  
  // Optional relation
  pool?: Pool;
}
```

- `backend/src/core/domain/Route.ts`

```typescript
import type { ShipCompliance, BankEntry } from "./index"

export interface Route {
  id: number;
  routeId: string; // maps to prisma `route_id`
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number; // maps to prisma `ghg_intensity`
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean; // maps to prisma `is_baseline`

  // Optional relations (may be omitted in domain DTOs)
  shipCompliances?: ShipCompliance[];
  bankEntries?: BankEntry[];
}
```

- `backend/src/core/domain/ShipCompliance.ts`

```typescript
import type { Route } from "./Route";

export interface ShipCompliance {
  id: number;
  shipId: string; // maps to prisma `ship_id` and relates to Route.route_id
  year: number;
  cbGco2eq: number;

  // Optional relation
  route?: Route;
}
```

- `backend/src/core/domain/index.ts` (barrel)

```typescript
export * from "./Route";
export * from "./ShipCompliance";
export * from "./BankEntry";
export * from "./Pool";
export * from "./PoolMember";
```

**Notes about the refactor**:

- The per-file approach improves modularity and makes imports cleaner in other parts of the codebase. Each model file imports just the types it needs (or the barrel `index.ts` when appropriate).
- All interfaces retain the same field names and mapping intent.

---

*This document will be updated as more agent and user interactions occur. For traceability, include a short description of why structural changes were made when you refactor files.*
.node_repl_history