# Yale Summer Debate Program Portal

## Prerequisites

- Node.js 18+
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up your environment variables:

```bash
cp .env.example .env
```

Then edit `.env` with your values.

4. Set up the database:

```bash
# Create database tables
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

5. Run the development server:

```bash
npm run dev
# or
yarn dev
```

## Environment Variables

The following environment variables are required:

- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

## Tech Stack

- Next.js 14
- TypeScript
- Prisma
- PostgreSQL
- NextAuth.js
- Tailwind CSS
- Shadcn/ui

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm start`: Start production server
- `npm run lint`: Run ESLint
- `npx prisma studio`: Open Prisma database UI
