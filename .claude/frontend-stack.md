# Frontend Technology Stack

## Framework
- **React 18+** with **TypeScript** - Primary frontend framework
- **Vite** or **Next.js** - Build tool and development server options

## Build Tool Options

### Option 1: Vite (Recommended for SPA)
- Fast development server with HMR
- Optimized production builds
- Simple configuration
- Best for Single Page Applications with Spring Boot REST API backend

### Option 2: Next.js (Recommended for SSR/Full-Stack)
- React meta-framework with Server-Side Rendering
- App Router for modern React patterns
- API routes capability
- Best for SEO-critical applications or when you need server-side rendering

## Integration with Spring Boot
- Spring Boot serves as REST API backend
- Frontend consumes reactive endpoints (WebFlux)
- CORS configuration required in Spring Boot
- Separate frontend and backend deployments (recommended)
- Use fetch API or axios for HTTP requests to Spring Boot endpoints

## Key Libraries
- **TypeScript** - Type safety matching Kotlin backend
- **React Router** (for Vite) or Next.js routing
- **TanStack Query (React Query)** - Data fetching and caching
- **Axios** or **Fetch API** - HTTP client
- **Zod** or **Yup** - Runtime type validation
- **Tailwind CSS** or **Material-UI** - Styling framework

## Development Conventions
- Use TypeScript for all components and utilities
- Async/await for API calls to reactive Spring Boot endpoints
- Component-based architecture
- Functional components with hooks
- Environment variables for API base URLs
- **Always use dark mode** - All pages and components should be styled with dark backgrounds and light text

## Project Structure
```
frontend/
├── src/
│   ├── components/     # Reusable React components
│   ├── pages/          # Page components
│   ├── services/       # API service layer
│   ├── types/          # TypeScript type definitions
│   ├── hooks/          # Custom React hooks
│   └── utils/          # Utility functions
├── public/             # Static assets
└── package.json
```

## API Communication
- Base URL configuration via environment variables
- TypeScript interfaces matching Kotlin data classes
- Error handling for reactive endpoints
- Support for WebSocket connections if needed
