# Technology Stack

## Language
- **Kotlin 2.2.21** - Primary programming language
- **Java 21** - JVM toolchain version

## Framework
- **Spring Boot 4.0.0** - Application framework
- **Spring WebFlux** - Reactive web framework
- **Spring Data JPA** - Data access layer

## Build Tool
- **Gradle** with Kotlin DSL - Build automation

## Database
- **PostgreSQL 16** - Primary database (Alpine Linux container)
- **Flyway** - Database migration tool

## Libraries & Dependencies
- **Kotlin Coroutines** - Asynchronous programming
- **Project Reactor** - Reactive programming
- **WebClient** - HTTP client
- **Jackson Kotlin Module** - JSON serialization/deserialization
- **JUnit 5** - Testing framework

## Development Tools
- **Spring Boot DevTools** - Development-time tooling

## Infrastructure
- **Docker Compose** - Container orchestration for local development

## Coding Conventions
- **Use `suspend fun` for methods** - All methods should be defined as suspend functions to support Kotlin coroutines and reactive programming patterns
