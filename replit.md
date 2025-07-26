# Gym Class Tracker

## Overview

This is a full-stack web application for tracking gym class attendance with user authentication. It's built with React on the frontend, Express.js on the backend, and uses Drizzle ORM for database operations. The application includes Replit OAuth authentication, user-specific data storage, and a mobile-optimized iOS-style interface. Users can securely sign in and track their gym class attendance with persistent data storage in PostgreSQL.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application uses a three-tier architecture:

1. **Frontend**: React SPA with TypeScript, built with Vite
2. **Backend**: Express.js REST API server
3. **Database**: PostgreSQL with Drizzle ORM

The codebase is organized as a monorepo with shared TypeScript types and schemas between frontend and backend.

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation
- **Routing**: Wouter for lightweight client-side routing

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Style**: RESTful endpoints under `/api` prefix
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Data Storage**: In-memory storage (MemStorage) for development, designed to be swapped with database implementation
- **Validation**: Zod schemas shared between frontend and backend

### Database Schema
- **gym_classes table**: Stores gym class records with id, date, attendance count, and optional notes
- **Schema Location**: `shared/schema.ts` for type safety across the stack
- **Migrations**: Managed by Drizzle Kit with output to `./migrations`

### Development Tools
- **Database**: Configured for PostgreSQL via Neon serverless driver
- **Type Safety**: Full TypeScript coverage with shared types
- **Code Quality**: ESLint and TypeScript compiler checks
- **Development**: Hot module replacement via Vite

## Data Flow

1. **Client Requests**: React components use TanStack Query to fetch data
2. **API Layer**: Express routes handle HTTP requests and validate input with Zod
3. **Business Logic**: Storage abstraction layer processes gym class operations
4. **Data Persistence**: Currently in-memory storage, ready for database implementation
5. **Response**: JSON responses sent back to client and cached by TanStack Query

### API Endpoints
- `GET /api/gym-classes` - Fetch all gym classes
- `GET /api/gym-classes/:id` - Fetch specific gym class
- `POST /api/gym-classes` - Create new gym class
- `PATCH /api/gym-classes/:id` - Update existing gym class
- `DELETE /api/gym-classes/:id` - Delete gym class

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL driver for serverless environments
- **@tanstack/react-query**: Server state management and caching
- **drizzle-orm**: Type-safe database ORM
- **react-hook-form**: Form handling with validation
- **@hookform/resolvers**: Zod integration for form validation
- **wouter**: Lightweight React router

### UI Dependencies
- **@radix-ui/***: Headless UI primitives for accessibility
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe CSS class variants
- **lucide-react**: Icon library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **drizzle-kit**: Database migration and introspection tools

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React app to `dist/public`
2. **Backend Build**: esbuild bundles Express server to `dist/index.js`
3. **Database**: Drizzle migrations applied via `db:push` command

### Environment Configuration
- **Development**: Uses Vite dev server with Express API proxy
- **Production**: Express serves static files and API from single process
- **Database**: Requires `DATABASE_URL` environment variable for PostgreSQL connection

### Scripts
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build both frontend and backend for production
- `npm run start`: Start production server
- `npm run db:push`: Apply database schema changes

The application is designed to be easily deployable to platforms like Replit, Vercel, or any Node.js hosting environment with PostgreSQL support.