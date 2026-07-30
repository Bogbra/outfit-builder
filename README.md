# Outfit Builder & Style Dashboard

A full-stack fashion application for creating, saving, and managing complete outfits.

## Overview

The Outfit Builder helps users combine products across different categories, colors, sizes, and styles.

Selected items are displayed in a live preview, while compatibility rules and automatic price calculation support the outfit-building process.

The project also includes an admin dashboard for managing products and viewing catalog statistics.

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
git clone <repository-url>
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