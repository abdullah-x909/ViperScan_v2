# ViperScan - Security Testing Platform

## Overview

ViperScan is a modern web-based security testing platform designed as an open-source alternative to Burp Suite Pro. It provides comprehensive web application security testing capabilities including HTTP proxy functionality, vulnerability scanning, request repeating, fuzzing, and logging. The application is built with a React frontend and Express.js backend, featuring real-time updates through WebSocket connections and a modular architecture for extensibility.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: WebSocket hooks for live updates

The frontend follows a component-based architecture with a dashboard layout containing multiple tabs for different security testing functions (Proxy, Scanner, Repeater, Fuzzer, Logger, Tools).

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Real-time Communication**: WebSocket Server for broadcasting updates
- **API Design**: RESTful endpoints for CRUD operations
- **Storage Layer**: Abstract storage interface for database operations

The backend implements a modular route-based architecture with separate concerns for HTTP request handling, vulnerability management, scan sessions, and tool integrations.

### Database Schema
- **HTTP Requests**: Stores intercepted requests with headers, body, response data, and timing information
- **Vulnerabilities**: Tracks discovered security issues with severity, CVSS scores, and remediation guidance
- **Scan Sessions**: Manages automated security scans with progress tracking
- **Fuzzer Results**: Stores payload testing results with response analysis
- **Tools**: Manages external security tool integrations

### Real-time Features
- WebSocket connections for live request interception
- Real-time vulnerability discovery notifications
- Live scan progress updates
- Tool output streaming

### Development Environment
- **Build System**: Vite for fast development and optimized production builds
- **Type Safety**: TypeScript throughout the stack with shared type definitions
- **Code Quality**: ESLint configuration for consistent code standards
- **Development Server**: Hot module replacement and error overlay integration

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe database operations and migrations
- **Connection Pooling**: PostgreSQL connection management

### UI Framework
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-built component library built on Radix
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Comprehensive icon library

### Development Tools
- **Vite**: Build tool with React plugin support
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing with Autoprefixer
- **ESBuild**: Fast JavaScript bundler for production

### Runtime Dependencies
- **TanStack React Query**: Server state management and caching
- **Wouter**: Minimalist routing library
- **Date-fns**: Date manipulation utilities
- **Class Variance Authority**: Utility for managing component variants

### Validation and Forms
- **Zod**: Schema validation
- **React Hook Form**: Form state management
- **Drizzle-Zod**: Integration between Drizzle ORM and Zod validation

### Real-time Communication
- **WebSocket (ws)**: Server-side WebSocket implementation
- **Native WebSocket API**: Client-side real-time communication