# Outfit Builder & Style Dashboard

A full-stack fashion application for creating, saving, and managing complete outfits.

## Overview

The Outfit Builder helps users combine products across different categories, colors, sizes, and styles.

Selected items are displayed in a live preview, while compatibility rules and automatic price calculation support the outfit-building process.

The project also includes an admin dashboard for managing products and viewing catalog statistics.

## Screenshots

| Catalog | Outfit builder | Admin dashboard |
| --- | --- | --- |
| ![Product catalog](screenshots/catalog.png) | ![Outfit builder with a complete outfit](screenshots/outfit-builder.png) | ![Admin dashboard](screenshots/admin-dashboard.png) |

## Features

- Product catalog with filtering and pagination
- Interactive outfit builder with live preview
- Product compatibility rules
- Category, color, size, and style filtering
- Automatic price calculation
- Saved outfits
- AI-powered virtual try-on integration
- Admin authentication
- Product management dashboard
- REST and GraphQL APIs
- Responsive and accessible user interface
- Automated unit, component, integration, and end-to-end tests

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Radix UI
- Zustand
- Zod

### Backend

- Node.js
- Express
- GraphQL Yoga
- PostgreSQL
- Prisma

### Testing and Infrastructure

- Vitest
- Playwright
- Docker
- GitHub Actions
- pnpm workspaces

## Architecture

The project is organized as a monorepo with separate frontend, API, and shared packages.

```text
apps/
├── web/          Next.js frontend
└── api/          REST and GraphQL API

packages/
├── ui/           Shared UI components
├── contracts/    Shared schemas, types, and business logic
└── config/       Shared development configuration
```

Next.js Server Components handle server-side catalog and outfit data.

Interactive features such as product selection, outfit management, and admin actions are implemented through focused client components.

Shared Zod schemas provide consistent validation between the frontend and backend.

## Getting Started

### Requirements

- Node.js
- pnpm
- Docker

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/Bogbra/outfit-builder.git
cd outfit-builder
pnpm install
```

Create the local environment files:

```bash
cp .env.example .env
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
```

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Run the database migrations and seed the database:

```bash
pnpm --filter api exec prisma migrate dev
pnpm --filter api db:seed
```

Start the frontend:

```bash
pnpm dev
```

Start the API in a separate terminal:

```bash
pnpm dev:api
```

The applications are available at:

```text
Frontend: http://localhost:3000
API:      http://localhost:8080
```

## Available Scripts

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Run the Playwright end-to-end tests:

```bash
pnpm --filter web test:e2e
```

## Testing

The project includes:

- Unit tests for shared business logic
- Component tests for interactive UI elements
- API integration tests
- Authentication and authorization tests
- Product and outfit workflow tests
- Playwright end-to-end smoke tests

External virtual try-on requests are mocked during automated testing to avoid non-deterministic results and third-party API costs.

Virtual try-on uploads a user's photo to fashn.ai, a third-party image-generation service, to produce the composited result. The feature is experimental, offers no fit guarantee, and results are only retained for a limited time (see `expiresAt` handling in the try-on request lifecycle) before they stop being servable.

## Security

The application includes:

- Server-side input validation
- JWT-based admin authentication
- Revocable admin sessions
- Rate limiting
- Security headers
- GraphQL query restrictions
- Environment-based secret management
- Protected admin routes

## Current Scope

This repository is a portfolio project and is not currently deployed as a commercial application.

The current implementation includes:

- A single admin account
- EUR as the supported currency
- Curated stock photography
- IP-based rate limiting for virtual try-on requests

User registration, multi-user roles, and public outfit-sharing links are outside the current project scope.

Known limitations, relevant if this were ever deployed publicly rather than run locally:

- Saved outfits are shared demo data: they are not associated with individual users or browser sessions, and any client can list or delete any outfit. There is currently no ownership or access control on the public outfit endpoints.
- Polling a try-on request (`GET /api/try-on/:id`) can itself advance the try-on chain to its next (paid) step. Two near-simultaneous polls for the same request — from multiple tabs, retries, or duplicate network requests — can each observe the same "step complete" state and both trigger the next provider call, causing redundant upstream generations and a benign race on the final database write. This is acceptable for a single-operator local/demo run but would need atomic state transitions (e.g. optimistic locking or a dedicated "advancing" status) before a multi-user public deployment.