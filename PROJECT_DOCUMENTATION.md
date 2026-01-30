# Store Bloom 72 - System Documentation & Migration Guide

## 1. Executive Summary
**Project Name:** Store Bloom 72
**Current Stack:** React (Vite) + Supabase (PostgreSQL)
**Description:** A high-performance, enterprise-ready e-commerce/store management dashboard featuring multi-store support, advanced analytics, and a page builder.
**Key Characteristic:** The system is "AI-vibe coded," meaning it leverages modern, rapid-development patterns (Shadcn UI, Tailwind, Supabase) to deliver a premium feel with complex underlying logic handled largely by database automation (RLS, Triggers).

---

## 2. System Architecture: How It Works

### The Core Concept
The application is a **Single Page Application (SPA)** built with **React**. It talks *directly* to the database (Supabase) for 90% of its operations.

- **Frontend (The Face):**
  - **Vite & React:** Handles the UI and logic running in the user's browser.
  - **Shadcn UI & Tailwind:** Provides the "Premium" aesthetic with pre-built, accessible components.
  - **TanStack Query:** Manages data fetching (caching, loading states) so the app feels instant.

- **Backend (The Brain):**
  - **Supabase (PostgreSQL):** It is not just a database; it is the entire backend.
  - **Auth:** Handles user login/signup.
  - **Row Level Security (RLS):** *CRITICAL COMPONENT.* Security is defined *in the database*, not in the code. This determines who can see what data (e.g., "A seller can only see *their* orders").
  - **Edge Functions:** Run server-side logic (like processing payments) securely.

### Data Flow
1. **User Action:** User clicks "View Orders".
2. **Client Request:** `src/integrations/supabase/client.ts` sends a request to Supabase.
3. **Security Check (RLS):** The Database checks: "Who is asking? Is this user allowed to see this table?" using policies defined in `supabase/migrations`.
4. **Response:** Data is returned directly to the browser.
5. **UI Update:** React re-renders the page with the new data.

---

## 3. Developer Guide: How to Understand & Modify

### Folder Structure
- **`src/pages`**: The screens of your app (e.g., Dashboard, Analytics). Start here to change a page's look.
- **`src/components`**: Reusable building blocks (buttons, charts, sidebar).
- **`src/integrations/supabase`**: The connection to the database.
- **`supabase/migrations`**: **The DNA of your project.** Every database table, security rule, and feature is defined here in SQL files.

### "How do I change X?"

#### **Scenario A: I want to change the text/color on a button.**
1. Find the page in `src/pages`.
2. Look for the JSX code (HTML-like syntax).
3. Change the Tailwind classes (e.g., `bg-blue-500` to `bg-red-500`) or text.

#### **Scenario B: I want to add a new column to the database (e.g., "User Date of Birth").**
1. **The Right Way:** specific a new SQL migration file in `supabase/migrations` (e.g., `ALTER TABLE profiles ADD COLUMN dob DATE;`).
2. **The Quick Way (for now):** Use the Supabase Dashboard SQL Editor to run the command, but save it in a file so you don't lose track.

#### **Scenario C: I want to fix a bug in the Analytics Logic.**
1. Check if the logic is in the **Frontend** (calculating averages in React) or **Backend** (a Database View).
2. If it is complex analytics, it's likely a **SQL View** defined in a migration file. You will need to edit the SQL definition to fix the calculation.

---

## 4. Migration Plan: Supabase to MySQL

### Feasibility: **High Difficulty**
**Why?** The current system uses capabilities specific to PostgreSQL and Supabase that **MySQL does not have natively**.
- **RLS (Row Level Security):** Supabase handles security *automatically*. MySQL does not support this in the same way. You cannot just "switch DBs". You must **build a custom backend API** (Node.js/Python) to handle security permissions that Supabase was doing for free.
- **Realtime:** Supabase provides live updates. MySQL does not have this out-of-the-box.
- **Auth:** You will need to replace Supabase Auth with a custom solution or another provider (e.g., Auth0) and wire it manually.

### Estimated Time & Effort
- **Time:** **3 - 5 Weeks** (Full-time for a skilled Full-Stack Developer).
- **Cost:** High (Developer hours + server infrastructure implementation).

### Step-by-Step Execution Plan

#### Phase 1: Preparation (Week 1)
1. **Schema Mapping:** Map every PostgreSQL table/type to MySQL.
   - *Challenge:* `JSONB` -> `JSON`. `UUID` -> `CHAR(36)`. `Arrays` -> `JSON` or separate tables.
2. **Infrastructure Setup:** Set up a MySQL server (AWS RDS, DigitalOcean, etc.) and a Backend Server (Node.js/Express or NestJS).

#### Phase 2: Building the Missing Backend (Weeks 2-3)
*This is the hardest part. You are replacing the "Supabase magic".*
3. **Create API Endpoints:** Write an API for every database action (GET /orders, POST /products).
4. **Implement Security:** Re-write every RLS policy from `supabase/migrations` into code.
   - *Example:* Instead of Database saying "Show only user's orders", your Node.js code must say: `if (user.id === order.owner_id) return data`.
5. **Port Auth:** Implement JWT handling to replace Supabase Auth.

#### Phase 3: Data Migration (Week 4)
6. **Export Data:** Dump data from Supabase (Postgres).
7. **Transform:** Write script to convert Postgres dump to MySQL format.
8. **Import:** Load into MySQL.

#### Phase 4: Frontend Refactor (Week 4-5)
9. **Remove Supabase Client:** Delete `@supabase/supabase-js`.
10. **Connect new API:** Rewrite every `supabase.from('table').select()` call to use `fetch('/api/table')` or `axios`.

### Recommendation
**Do not switch to MySQL unless absolutely necessary.**
The system is built on an architecture that relies on PostgreSQL's advanced features. Moving to MySQL turns a "Serverless" modern app into a traditional "3-Tier" app, adding significant maintenance burden and development cost.

---

## 5. System Introspection (Deep Dive)
*For the "Hardcore" Technical Team*

- **Database Triggers:** The system uses triggers for things like "Updating updated_at timestamp" or "Handling user creation". These are located in the early migration files.
- **Views:** Analytics (like the globe or dashboard charts) often rely on SQL Views (`CREATE VIEW ...`). These are virtual tables that pre-calculate data for speed.
- **optimizations:** Recent updates added indexes and partition strategies for "Enterprise" scale. These are specific to Postgres.

