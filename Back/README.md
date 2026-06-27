# RentHub

Full-stack short-term rental platform built with **React + Vite** (frontend) and **.NET 9 Minimal APIs** (backend), backed by **PostgreSQL** and containerized with Docker.

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| [Docker](https://docs.docker.com/get-docker/) | 24+ | Run the backend and database |
| [Docker Compose](https://docs.docker.com/compose/) | v2+ | Orchestrate services |
| [Node.js](https://nodejs.org/) | 20+ | Run the frontend |
| [npm](https://www.npmjs.com/) | 9+ | Install frontend dependencies |

> **Note:** If port `5432` is already in use by a local PostgreSQL instance, stop it first:
> ```bash
> sudo systemctl stop postgresql
> ```
> Also make sure your user belongs to the `docker` group:
> ```bash
> sudo usermod -aG docker $USER && newgrp docker
> ```

---

## Running the Project with Docker

### 1. Backend (API + Database)

```bash
cd Back
docker compose up --build
```

This starts two containers:

| Container | Description | URL |
|-----------|-------------|-----|
| `renthub-db` | PostgreSQL 16 database | `localhost:5432` |
| `renthub-api` | .NET 9 REST API | `http://localhost:8080` |

On first startup, the API automatically creates the schema and seeds sample data, including a test host account:

- **Email:** `anfitrion@renthub.co`
- **Password:** `Owner123*`

Swagger UI is available at: `http://localhost:8080/swagger`

To stop the containers:

```bash
docker compose down        # keeps the database volume
docker compose down -v     # also removes the database volume
```

### 2. Frontend

Open a new terminal:

```bash
cd Front
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

## Architecture

### Backend — Clean Architecture

The backend is structured into four projects with dependencies pointing strictly inward:

```
RentHub.Domain          → Entities, enums, value objects. No external dependencies.
RentHub.Application     → Use cases, DTOs, interfaces (ports). Depends on Domain.
RentHub.Infrastructure  → EF Core, repositories, JWT, Excel export, KYC, notifications. Depends on Application.
RentHub.Api             → Minimal APIs, middleware, authentication, CORS, Swagger. Entry point.
```

### Frontend — Feature-based Structure

Built with React 19, Vite, TailwindCSS, TanStack Query, Zustand, and React Router v7. The source code is organized by feature:

```
src/
├── api/          → API client and mock layer
├── features/     → catalog, auth, bookings, wishlist, owner, kyc
├── pages/        → page-level components
├── store/        → Zustand global state (auth, wishlist)
├── routes/       → centralized route definitions
└── components/   → shared UI components
```

---

## How Technical Problems Were Approached

### Double-booking Prevention
`BookingRepository.HasOverlapAsync` runs an overlap check (`CheckInDate < to AND from < CheckOutDate`) directly at the database level before confirming any reservation. Cancelled bookings are excluded from the check. A compound index on `(PropertyId, CheckInDate, CheckOutDate)` ensures this query performs efficiently.

### Standard Check-in / Check-out Times
`Booking.Create` enforces fixed times in the domain layer — check-in at **14:00** and check-out at **12:00** — so the client cannot override them.

### KYC Gate for First Booking
`BookingService` rejects a user's first booking with a `409 Conflict` if their identity has not been approved yet, enforcing the KYC requirement before any reservation is confirmed.

### AI-powered KYC
`IKycService` is implemented as `StubKycService`, a simulated service ready to be swapped for a real AI provider. Only the extracted data and the verdict are persisted; the uploaded document image is never stored.

### Omnichannel Notifications
`INotificationService` saves in-app notifications and logs email dispatches (stubbed). The service is designed to be extended with real email/SMS providers without changing the application layer.

### Excel Export
`ExcelExporter` (via ClosedXML) generates a `.xlsx` report containing dates, price, guest, and property information. It can be filtered by a specific property or export the entire portfolio.

---

## Main API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/register` | — | Register a new user |
| `POST` | `/api/auth/login` | — | Login and receive a JWT |
| `GET` | `/api/properties?city=&from=&to=` | — | Property catalog with filters |
| `GET` | `/api/properties/{id}` | — | Property detail |
| `POST` | `/api/bookings` | JWT | Create a booking (validates overlap + KYC) |
| `GET` | `/api/bookings/me` | JWT | List my bookings |
| `GET/POST/DELETE` | `/api/favorites` | JWT | Wishlist management |
| `POST` | `/api/kyc` | JWT | Upload identity document (multipart: `front`, `back`) |
| `GET` | `/api/owner/properties` | JWT (Owner) | Owner dashboard |
| `POST` | `/api/owner/properties` | JWT (Owner) | Publish a new property |
| `GET` | `/api/owner/reports/export?propertyId=` | JWT (Owner) | Download `.xlsx` report |