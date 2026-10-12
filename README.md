# Student Management System (SMS)

A full-stack web application built for managing student enrollments, academic programmes, staff operations, and tuition fee payments. 

## Tech Stack
* **Framework**: Next.js 16 (App Router, Server Actions)
* **Language**: TypeScript
* **Database & ORM**: PostgreSQL with Prisma
* **Styling**: Tailwind CSS
* **Testing**: Vitest (Integration tests against live DB)
 

## Getting Started

### 1. Clone & Install
```bash
git clone [https://github.com/developersaif/student-management-system.git](https://github.com/developersaif/student-management-system.git)
cd student-management-system
npm install


# create a .env file put your DATABASE_URL = your_prisma_database_url
DATABASE_URL="your_prisma_database_url"

# Generate the Prisma Client
npx prisma generate

# Run database migrations to create tables and constraints
npx prisma migrate dev --name init

# To run the database seed script in Prisma,
npx prisma db seed

# run development server 
npm run dev

# production build   
npm run build

#optional 
npm test
