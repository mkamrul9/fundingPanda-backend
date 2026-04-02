# FundingPanda — Backend API

A robust REST + WebSocket backend powering FundingPanda — a platform that connects academic research students with industry sponsors. This repository contains the API, real-time messaging server, and integrations for payments and cloud media.

---

**Highlights**

- Role-based access (Students, Sponsors, Super Admins) via BetterAuth
- ACID-safe operations for resource claiming and financial updates (Prisma)
- Stripe Checkout + secure webhook handling for donations
- Cloud media streaming to Cloudinary (PDFs, images, chat media)
- Real-time messaging using Socket.io
- Zod-driven validation and centralized error handling

---

## Table of contents

- [Live deployments](#live-deployments)
- [Tech stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Environment variables](#environment-variables)
- [Local development](#local-development)
- [Database & seed](#database--seed)
- [Testing webhooks locally](#testing-webhooks-locally)
- [Key API endpoints](#key-api-endpoints)
- [Contributing](#contributing)
- [License](#license)

---

## Live deployments

- Frontend (Vercel): https://funding-panda-frontend.vercel.app/
- Backend (Render): https://fundingpanda-backend.onrender.com/

Quick checks:
- API root status: https://fundingpanda-backend.onrender.com/
- API health: https://fundingpanda-backend.onrender.com/api/v1/health

---

## Tech stack

- Runtime: Node.js
- Framework: Express.js (TypeScript)
- Database: PostgreSQL
- ORM: Prisma
- Authentication: BetterAuth
- Validation: Zod
- Real-time: Socket.io
- Integrations: Stripe, Cloudinary, Multer

---

## Prerequisites

Install the following before you start:

- Node.js (v18+)
- PostgreSQL (local or hosted)
- Stripe CLI (for local webhook testing)

---

## Environment variables

Create a `.env` file at the project root and set the values below (example):

```env
# Application
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fundingpanda?schema=public

# BetterAuth
BETTER_AUTH_SECRET=replace-with-random-secret
BETTER_AUTH_URL=http://localhost:5000
TRUSTED_ORIGINS=https://funding-panda-frontend.vercel.app,https://your-preview.vercel.app

# Email (recommended for Render production: Brevo API)
BREVO_API_KEY=xkeysib_xxx
BREVO_SENDER_EMAIL=youremail@example.com
BREVO_SENDER_NAME=FundingPanda Security

# Optional alternatives
# RESEND_API_KEY=re_xxx
# FROM_EMAIL=FundingPanda <onboarding@resend.dev>

# Admin seed (used by the seeder)
ADMIN_EMAIL=admin@fundingpanda.com
ADMIN_PASSWORD=SuperSecretPassword123!

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Notes:
- Keep secrets out of source control.
- In production, use environment management appropriate to your host/provider.

---

## Local development

1. Clone and install

```bash
git clone <repository-url>
cd fundingpanda-backend
npm install
```

2. Prepare the database and Prisma client

```bash
npx prisma db push
npx prisma generate
```

3. Seed initial data (creates Super Admin)

```bash
npx prisma db seed
```

4. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:5000` by default.

---

## Render deployment notes (important)

If your production database already has tables/data and your repo does not yet contain Prisma migrations, using `npx prisma migrate deploy` in Render build command will fail with `P3005`.

Use this Render build command instead for now:

```bash
npm run build:render
```

And use this start command:

```bash
npm run start
```

When you are ready to adopt Prisma migrations in production, first create a proper baseline migration and mark it as applied before switching Render back to `npx prisma migrate deploy`.

---

## Testing webhooks locally

To test Stripe webhooks during development use the Stripe CLI:

```bash
stripe listen --forward-to localhost:5000/api/v1/donations/webhook
```

Copy the generated webhook signing secret from the CLI and set `STRIPE_WEBHOOK_SECRET` in your `.env` for local verification.

---

## Key API endpoints

- `/api/auth/*` — registration, login, password reset, session management
- `/api/v1/projects/*` — project CRUD, media uploads, status management
- `/api/v1/resources/*` — hardware/software creation and transactional claiming
- `/api/v1/donations/*` — Stripe checkout and webhook handling
- `/api/v1/messages/*` — chat history and media uploads (WebSocket + HTTP)
- `/api/v1/timeline/*` — project milestones and lifecycle events
- `/api/v1/admin/*` — admin utilities, analytics, approvals

```mermaid
erDiagram
	User {
		String id PK
		String email UK
		String name
		UserRole role
		String image
		String bio
		Boolean emailVerified
		String university
		Boolean isVerified
		DateTime createdAt
		DateTime updatedAt
	}

	Category {
		String id PK
		String name UK
		String description
		DateTime createdAt
		DateTime updatedAt
	}

	Resource {
		String id PK
		String name
		ResourceType type
		String description
		Int totalQuantity
		Int availableQuantity
		String lenderId FK
		DateTime createdAt
		DateTime updatedAt
	}

	ResourceClaim {
		String id PK
		String studentId FK
		String resourceId FK
		String status
		DateTime createdAt
		DateTime updatedAt
	}

	Session {
		String id PK
		DateTime expiresAt
		String token
		DateTime createdAt
		DateTime updatedAt
		String ipAddress
		String userAgent
		String userId FK
	}

	Account {
		String id PK
		String accountId
		String providerId
		String userId FK
		String accessToken
		String refreshToken
		String idToken
		DateTime expiresAt
		String password
		DateTime createdAt
		DateTime updatedAt
	}

	Verification {
		String id PK
		String identifier
		String value
		DateTime expiresAt
	}

	Project {
		String id PK
		String title
		String description
		Float goalAmount
		Float raisedAmount
		String pitchVideoUrl
		String pitchDocUrl
		String[] images
		String adminFeedback
		ProjectStatus status
		String studentId FK
		DateTime createdAt
		DateTime updatedAt
	}

	Donation {
		String id PK
		Float amount
		String userId FK
		String projectId FK
		DateTime createdAt
	}

	TimelineEvent {
		String id PK
		String projectId FK
		TimelineEventType type
		String title
		String description
		String mediaUrl
		DateTime createdAt
	}

	Review {
		String id PK
		Int rating
		String comment
		String reviewerId FK
		String revieweeId FK
		String projectId FK
		DateTime createdAt
	}

	Message {
		String id PK
		String content
		String imageUrl
		String senderId FK
		String receiverId FK
		Boolean isRead
		DateTime createdAt
	}

	%% Relationships

	%% Implicit Many-to-Many Relations
	Category }o--o{ User : "tagged by"
	Category }o--o{ Project : "categorizes"
	Category }o--o{ Resource : "categorizes"

	%% One-to-Many Relations
	User ||--o{ Resource : "lends"
	User ||--o{ ResourceClaim : "claims (as student)"
	Resource ||--o{ ResourceClaim : "is claimed via"
    
	User ||--o{ Session : "has"
	User ||--o{ Account : "has"
    
	User ||--o{ Project : "creates (as student)"
    
	User ||--o{ Donation : "makes"
	Project ||--o{ Donation : "receives"
    
	Project ||--o{ TimelineEvent : "has timeline event"
    
	User ||--o{ Review : "gives (as reviewer)"
	User ||--o{ Review : "receives (as reviewee)"
	Project ||--o{ Review : "receives"
    
	User ||--o{ Message : "sends"
	User ||--o{ Message : "receives"
```

---

## Contributing

- Run `npm run lint` and `npm run build` before opening a pull request (if applicable).
- Follow existing code patterns (controllers, services, validation via Zod).
- Add tests for new critical behavior when practical.

---

## License

Developed by Kamrul Islam. All rights reserved.

