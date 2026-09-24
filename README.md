# Classroom Complaint Portal — College Department

A complete, production-grade **Classroom Complaint Management System** built with **React.js**, **Node.js / Express.js**, and **MySQL**, adhering to strict role-based access control (RBAC), JWT authentication, auto-sequencing complaint IDs, audit trails, and locked two-way communication threads.

---

## 🏗️ Tech Stack

* **Frontend:** React 18, React Router v6, Axios, Lucide Icons, Vanilla CSS3 (Pastel Design System)
* **Backend:** Node.js, Express.js (REST API)
* **Database:** MySQL (InnoDB engine, utf8mb4)
* **Authentication:** JSON Web Tokens (JWT), `bcryptjs` password hashing

---

## 👥 Pre-seeded Accounts & Credentials

### 1. Student Accounts (57 Accounts Pre-seeded)
* **Student IDs:** `25USS101` through `25USS157`
* **Passwords:** Matches numeric ID portion:
  * `25USS101` → Password: `101`
  * `25USS102` → Password: `102`
  * ... up to `25USS157` → Password: `157`

### 2. Faculty & HOD Accounts
| Staff ID | Name | Role | Password |
|---|---|---|---|
| `25abc101` | **Jeno Mam** | **HOD** | `101` |
| `25abc102` | **Soffi Mam** | Faculty | `102` |
| `25abc103` | **Jaine Sir** | Faculty | `103` |
| `25abc104` | **Banumathi Mam** | Faculty | `104` |
| `25abc105` | **Julli Mam** | Faculty | `105` |
| `25abc106` | **Joiel Sir** | Faculty | `106` |

### 3. Administrator
* **Admin ID:** `admin`
* **Password:** `admin123`

---

## ⚡ Quick Start & Run Instructions

### Prerequisites
* **Node.js** (v18 or higher)
* **MySQL Server** (running locally on port `3306` or configured in `.env`)

### Step 1: Database Setup & Seeding

1. Open your terminal in the `server` directory:
   ```bash
   cd "c:\Users\Jaiso\class projuct\server"
   ```

2. Verify or update your MySQL connection credentials in `server/.env`:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=classroom_complaint_portal
   JWT_SECRET=classroom_complaint_portal_secret_key_2026_jwt
   ```

3. Run the automated database setup and seed script:
   ```bash
   npm run seed
   ```
   *This automatically creates the `classroom_complaint_portal` database, creates all 7 tables with foreign keys, and seeds the Admin, 6 Faculty/HOD staff members, and all 57 Student accounts (`25USS101`–`25USS157`).*

   *(Optional: You can also import `server/schema.sql` directly via MySQL Workbench / phpMyAdmin).*

### Step 2: Start the Backend Server

From the `server` directory, run:
```bash
npm start
```
The API server will listen on `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).

### Step 3: Start the Frontend React Client

1. Open a second terminal and navigate to `client`:
   ```bash
   cd "c:\Users\Jaiso\class projuct\client"
   ```

2. Launch the Vite development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 🧭 System Workflow & Core Rules

### 1. Landing & Role Selection
The login page features a unified 4-tab interface:
* **Student:** Enter Student ID (`25USS101` – `25USS157`) and Password (`101` – `157`).
* **Faculty:** Select Faculty name from dropdown + Password.
* **HOD:** Select HOD name from dropdown + Password.
* **Admin:** Enter Admin ID (`admin`) + Password (`admin123`).

### 2. Student Workflow
* **Submit Grievance:** Addressed strictly to either the HOD **OR** one selected Faculty member.
* **Auto-Sequence ID:** Automatically assigned format `CMP001`, `CMP002`, `CMP003`...
* **Chat Thread:** Dedicated two-way conversation with assigned staff until marked `Resolved`.
* **Permanent Lock:** Students cannot modify or delete complaints, or alter complaint status.

### 3. Faculty & HOD Workflow
* **Dedicated Visibility:** Staff view only complaints explicitly addressed to them.
* **Auto-Update to "Seen":** When recipient opens a `Pending` complaint, it immediately switches status to `Seen`.
* **Status Progression:** `Pending` → `Seen` → `In Progress` → `Replied` → `Resolved`.
* **Auto-Update to "Replied":** When staff replies in the chat thread while not in progress, status updates to `Replied`.
* **Mandatory Resolution Note:** To mark a complaint `Resolved`, a detailed note explaining the resolution is required.
* **Locking:** Once marked `Resolved`, the conversation is permanently locked, and the Resolution Note is displayed prominently at the top.
* **Notification Toggle:** Staff can toggle in-app alerts ON/OFF from the navbar or dashboard.

### 4. Admin Workflow (Independent Portal)
* **Direct Admin Dashboard:** Metrics on students, staff, total complaints, and breakdown across all 5 statuses.
* **Audit Visibility:** Full visibility into conversation trails and the immutable `complaint_history` status audit log.
* **Account Control:** One-click toggle to activate or suspend any Student or Staff account.
* **Strict Boundary:** Admin has read/inspect access across all complaints, but cannot alter the sender or recipient of existing complaints.

---

## 🎨 Pastel Design System Tokens

* **Background:** Light `#f8fafc`
* **Cards & Surfaces:** Clean White `#ffffff`, border `#e2e8f0`, radius `10px`
* **Status Badges:**
  * 🟡 **Pending:** `#fef9c3` (text `#854d0e`, border `#fde047`)
  * 🟣 **Seen:** `#f3e8ff` (text `#6b21a8`, border `#d8b4fe`)
  * 🟠 **In Progress:** `#ffedd5` (text `#9a3412`, border `#fed7aa`)
  * 🔵 **Replied:** `#eff6ff` (text `#1e40af`, border `#bfdbfe`)
  * 🟢 **Resolved:** `#dcfce7` (text `#166534`, border `#bbf7d0`)
