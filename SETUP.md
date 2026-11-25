# PsalmTech Solutions: setup guide

Follow these steps once, in order. Each one is a few clicks. Total time: about 30 minutes.

---

## Step 1: Set up the database (Supabase)

1. Open your project at **supabase.com** → **SQL Editor** → **New query**.
2. Open the file `supabase/schema.sql` from this repository on GitHub, copy **all** of it, paste it in, and click **Run**. You should see "Success".
3. New query again → paste all of `supabase/seed.sql` → **Run**. This creates the *Data Analytics with Power BI* course with its 6 modules. Run it **only once**.
4. Go to **Authentication → URL Configuration**:
   - **Site URL:** your Vercel address (e.g. `https://psalmtech-web.vercel.app`). You'll get it in Step 2, so come back and fill this in.
   - **Redirect URLs** → Add: `https://YOUR-VERCEL-ADDRESS/auth/callback`
5. Go to **Project Settings → API** and keep this page open. You need three values in Step 2:
   - Project URL
   - `anon` `public` key
   - `service_role` key (**secret**: never share it or put it in the website code)

## Step 2: Put the site online (Vercel)

1. On **vercel.com** → **Add New… → Project** → import **`PsalmTech/psalmtech-web`**.
2. Before clicking Deploy, open **Environment Variables** and add these five:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase `anon public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase `service_role` key |
| `PAYSTACK_SECRET_KEY` | from Step 4 (put `sk_test_placeholder` for now) |
| `NEXT_PUBLIC_SITE_URL` | your Vercel address, e.g. `https://psalmtech-web.vercel.app` (no slash at the end) |

3. Click **Deploy**. When it finishes, copy your site address, go back to Step 1.4 and fill in the Site URL and Redirect URL.
4. If you change an environment variable later: **Deployments → ⋯ → Redeploy**.

## Step 3: Make yourself the admin

1. Open your site → **Log in → Create account**, and sign up with **psalmtech0@gmail.com**. Confirm the email Supabase sends you.
2. In Supabase **SQL Editor**, run:

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'psalmtech0@gmail.com');
```

3. Log out and back in. You'll now see the **Admin dashboard** (`/admin`).

## Step 4: Payments (Paystack)

1. Create an account at **paystack.com** (choose Nigeria).
2. **Settings → API Keys & Webhooks**:
   - Copy the **Test Secret Key** (`sk_test_…`) → paste it into Vercel as `PAYSTACK_SECRET_KEY` → Redeploy.
   - **Test Webhook URL:** `https://YOUR-SITE/api/paystack/webhook`
3. Set a course price: **Admin → Courses → Data Analytics with Power BI → Fee in naira** → Save.
4. Test it: create a second account (a different email), open the course, click **Pay & enrol**, and pay with Paystack's test card. Paystack shows the test card details on its checkout page in test mode. The student should land straight in the course.
5. **Going live:** once Paystack approves your business (Settings → Go Live), copy the **Live Secret Key** (`sk_live_…`) into Vercel, set the **Live Webhook URL** to the same address, and Redeploy.

> The 20% discount is applied automatically to anyone who chose **Student** or **Researcher** at sign-up. You can change the % per course in Admin.

---

## Everyday use

**Add lessons:** Admin → Courses → open the course → open a module → *Add a lesson*.
- **Videos:** upload to YouTube as **Unlisted** (or Google Drive / Vimeo) and paste the link. Don't upload video files to the site.
- **Files** (slides, datasets, PDFs): attach directly. Only enrolled students can download them.

**Assignments:** Admin → Courses → *New assessment* (assignment, quiz or project, with a due date and max score). Students upload their work; you grade it in **To Grade**, where students see the score and your feedback instantly.

**Announcements:** post from the course page in Admin. Enrolled students see them on their dashboard.

**Bank transfer payments:** Admin → Students → *Enrol a student manually*.

**Messages:** students chat with you from their portal; reply in Admin → Messages. It's live, no refresh needed.

**Quote requests** from the website arrive in Admin → Quote Requests, with one-tap WhatsApp/email replies.

**Client reviews:** edit `src/content/reviews.ts` on GitHub (pencil icon). Change `approved: false` to `approved: true` for each client who has said OK, then commit. Vercel redeploys automatically and the reviews section appears.

**Marquee announcement** (the cyan scrolling bar): it shows your first published course. To change the wording, edit `src/components/SiteHeader.tsx`.

---

## Good to know

- **Free plan limits:** Supabase's free plan pauses a project after about a week with no visitors; open the dashboard and click *Restore* if that happens. Storage is 1 GB. Upgrade when the academy grows.
- **Email:** Supabase sends sign-up emails from its own address, with a low hourly limit. For a busy launch, connect your own email sender (Supabase → Authentication → SMTP).
- **Google sign-in** (optional): Supabase → Authentication → Providers → Google. Until it's set up, students use email and password.
- **Your own domain:** Vercel → Settings → Domains. Then update `NEXT_PUBLIC_SITE_URL`, the Supabase Site URL and Redirect URL, and the Paystack webhook.
