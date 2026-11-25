# PsalmTech Solutions: website & academy

Business website + learning portal (LMS) for PsalmTech Solutions.

- **Website:** services, training, about, classroom gallery, client reviews, quote requests, WhatsApp
- **Student portal:** sign-up/login, enrol & pay (Paystack), lessons with progress, assignments with file upload, grades & feedback, live chat with the instructor, payments, profile
- **Admin:** overview & revenue, courses/modules/lessons/assessments, grading, students & manual enrolment, quote inbox, messages, payments

**Stack:** Next.js 15 (App Router) · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage, Realtime) · Paystack · Vercel

👉 **Setting it up for the first time? Read [SETUP.md](SETUP.md).**

## Local development

```bash
cp .env.example .env.local   # fill in your keys
npm install
npm run dev                  # http://localhost:3000
```

## Where things are

| What | Where |
|---|---|
| Database tables & security rules | `supabase/schema.sql` |
| Starter course | `supabase/seed.sql` |
| Homepage | `src/app/page.tsx` |
| Client reviews | `src/content/reviews.ts` |
| Student portal | `src/app/portal/` |
| Admin | `src/app/admin/` |
| Payments | `src/lib/paystack.ts`, `src/app/api/paystack/` |
| Images | `public/images/` |
