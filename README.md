# Summer Program Application Portal

A full-stack application portal built with Next.js 13+, featuring student applications, admin management, and automated workflows.

Live link: https://ysdp-portal.vercel.app/

## Features

### Student Features

- **Account Management**
  - Email-based authentication
  - Password reset functionality
  - Profile management
- **Application Process**
  - Auto-saving application form
  - Application status tracking
  - Profile completion requirements
  - Real-time form validation

### Admin Features

- **Dashboard**
  - Application statistics
  - Recent applications overview
  - Status distribution metrics
- **Application Management**
  - Detailed application viewing
  - Status updates (Accept/Deny/Waitlist)
  - Search and filter capabilities
- **Admin Tools**
  - Email list generator by status
  - Bulk email management
  - Data management tools

## Tech Stack

- **Frontend**

  - Next.js 13+ (App Router)
  - React Query for data fetching
  - Tailwind CSS for styling
  - Shadcn UI components
  - React Hook Form with Zod validation

- **Backend**
  - Next.js API Routes
  - Prisma ORM
  - PostgreSQL database
  - NextAuth.js for authentication
  - Resend for email services

## Setup

1. **Clone and Install**

   ```bash
   git clone [repository-url]
   cd [project-name]
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file with:

   ```env
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET="your-secret"
   NEXTAUTH_URL="http://localhost:3000"
   RESEND_API_KEY="your-resend-api-key"
   ```

3. **Database Setup**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Create Admin User**

   ```bash
   npm run make-admin your@email.com
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## Application Flow

1. **Student Journey**

   - Sign up with email
   - Complete profile
   - Fill application
   - Submit for review
   - Track application status

2. **Admin Journey**
   - Access admin dashboard
   - Review applications
   - Update application statuses
   - Generate email lists
   - Manage student data

## Deployment

The application is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Add environment variables
3. Deploy with the following build settings:
   ```json
   {
     "buildCommand": "prisma generate && next build",
     "installCommand": "npm install"
   }
   ```

## Security Features

- Role-based access control
- Secure password reset flow
- Protected API routes
- Admin-only sections
- Form validation and sanitization

## Database Schema

Key models include:

- User (authentication and role management)
- Profile (student information)
- Application (application data and status)

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run make-admin`: Create admin user
- `npm run lint`: Run ESLint
- `npm run prisma:generate`: Generate Prisma client
- `npm run prisma:push`: Push schema to database

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a pull request

## License

[Your chosen license]
