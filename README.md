# Eyries Esports — Full Site (Login + Admin Panel + MongoDB)

A scrollable, single-page site for Eyries Esports with:
- Login / signup gate (no one sees the site without an account)
- Two roles: **admin** (can edit every section live) and **user**/fan (view-only)
- Hamburger menu (☰ top-right) that jumps to **Home → About → Achievements → Contact**
- All content (founder, co-founders, team, achievements, contact/socials) stored in **MongoDB** and editable from the page itself when logged in as admin

This is a real client–server app now (not a single static file), because a browser can never talk to MongoDB directly without exposing your database password to the world. The flow is:

```
Browser (public/index.html, styles.css, app.js)
        ↓  fetch() calls
Node.js + Express server (server/)
        ↓  Mongoose
MongoDB Atlas (your database, in the cloud)
```

---

## 1. Set up MongoDB Atlas (free) — do this first

1. Go to **mongodb.com/cloud/atlas/register** and create a free account.
2. Create a new **free cluster** (it'll suggest "M0 Free Tier" — pick that).
3. When asked for a **database user**, set a username and password — write these down, you'll need them in a moment. (Use a password with no `@`, `:`, or `/` characters to avoid URL-encoding headaches.)
4. When asked about **network access**, click **"Allow access from anywhere"** (0.0.0.0/0) for now — you can lock this down later once it's running.
5. Once the cluster is created, click **Connect → Drivers**, choose **Node.js**, and copy the connection string. It looks like:
   ```
   mongodb+srv://yourusername:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your real database user password, and add a database name before the `?`, e.g. `.../eyries?retryWrites=true...`. This becomes your `MONGODB_URI`.

---

## 2. Install and configure

You'll need **Node.js** installed on your computer (download from nodejs.org if you don't have it — version 18 or newer).

```bash
# 1. Open a terminal inside this project folder, then:
npm install

# 2. Copy the example environment file
cp .env.example .env
```

Now open `.env` in any text editor and fill in:
- `MONGODB_URI` — the connection string from step 1 above
- `JWT_SECRET` — any long random string. You can generate one by running:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- `SEED_ADMIN_USERNAME` / `SEED_ADMIN_PASSWORD` — the first admin login you'll use. **Change the password to something real.**

---

## 3. Create your first admin account + starter content

```bash
npm run seed
```

This connects to your MongoDB, creates one admin user (from the username/password in `.env`), and fills in placeholder content (founder, co-founders, team, achievements, contact) so the site isn't empty on first load. Safe to run more than once — it skips creation if the admin already exists.

---

## 4. Run the server

```bash
npm start
```

You should see:
```
✅ Connected to MongoDB
✅ Eyries Esports server running at http://localhost:4000
```

Open **http://localhost:4000** in your browser. Log in with the admin username/password you set in `.env`.

If you see an error instead, copy the exact error text — common causes:
- `MONGODB_URI is not set` → you didn't fill in `.env`, or didn't save it
- `Could not connect to MongoDB` → usually a wrong password in the connection string, or you skipped "Allow access from anywhere" in Atlas network settings

---

## 5. Using the site

**As admin:**
- Every editable piece of text (hero text, names, titles, bios, achievement details, contact info, social links) shows a small **EDIT** tag when you hover over it.
- Click any of those to open an edit box, change the text, and click **Save** — it writes straight to MongoDB. Every other logged-in user sees the update next time they load the page.
- Photo fields work by pasting an image URL (a link to an image hosted somewhere, e.g. an Imgur link, or an image you've uploaded to your own hosting) — direct file upload isn't built in yet.

**As a fan/user:**
- Sign up with the "New here? Create a fan account" link on the login screen.
- Can view everything, but no EDIT tags appear and the API rejects any edit attempt even if attempted directly — the role check happens on the server, not just in the page's JavaScript.

---

## 6. Deploying this for real (so others can visit it on a real URL)

`localhost:4000` only works on your own computer. To put this on a real URL, you need a host that can run a **Node.js server continuously** (this is different from GitHub Pages, which only hosts static files and can't run a server or talk to MongoDB).

Reasonable free/cheap options:
- **Render.com** — connect your GitHub repo, choose "Web Service," set the same environment variables from your `.env` file in their dashboard, done.
- **Railway.app** — similar flow to Render.
- A basic **VPS** (DigitalOcean, etc.) if you want full control — more setup work.

In all cases: push this project to a GitHub repo (everything except `.env` and `node_modules`, already excluded via `.gitignore`), connect that repo to the host, and set `MONGODB_URI`, `JWT_SECRET`, and the seed variables as environment variables in the host's dashboard (not in a committed `.env` file — never commit real secrets to GitHub).

---

## File structure

```
.
├── package.json
├── .env.example          → copy to .env and fill in real values (never commit .env)
├── .gitignore
├── server/
│   ├── server.js          → Express app entry point
│   ├── seed.js             → creates first admin + placeholder content
│   ├── models/
│   │   ├── User.js         → login credentials (hashed passwords + role)
│   │   └── Content.js      → founder/co-founders/team/achievements/contact
│   ├── routes/
│   │   ├── auth.js         → /api/auth/login, /api/auth/signup
│   │   └── content.js      → /api/content (GET for all, PUT for admin only)
│   └── middleware/
│       └── auth.js         → checks login token + admin role on protected routes
└── public/
    ├── index.html          → login screen + the scrollable site
    ├── styles.css
    ├── app.js               → frontend logic: login, rendering, nav, admin editing
    └── assets/
        └── logo.png
```

## Security notes (already handled, explained so you understand the why)

- Passwords are hashed with **bcrypt** before they ever touch the database — even if someone got read access to your MongoDB, they would not see plain-text passwords.
- Login sessions use a **signed JWT token** — the server can tell if a token was tampered with.
- The admin-only edit endpoint checks the role **on the server** (`server/middleware/auth.js`), not just by hiding buttons in the browser — so a regular user can't bypass the UI and call the edit endpoint directly.
- `.env` (your real secrets) is excluded from git via `.gitignore` — only `.env.example` (with fake placeholder values) should ever be committed.
