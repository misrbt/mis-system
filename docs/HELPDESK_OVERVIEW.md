# MIS Helpdesk Support — What We Built

A plain-English summary of the helpdesk ticketing system, written for anyone
(not just developers) to understand what's been delivered.

---

## The Problem We Solved

Before this project, when a bank employee had an IT concern — a slow PC, a
printer that wouldn't print, a login that got locked, a CBS error —
they'd call, walk over, or send an email to the MIS team. Nothing was
tracked, reminders got lost in sticky notes, and nobody could see at a
glance how many concerns were open or how long they were taking to fix.

The Helpdesk Support module changes that. Every concern becomes a **ticket**
with a number, a status, and a full history. End users can submit from any
browser without logging in. The MIS team sees everything in one dashboard
and can chat back and forth with the requester until the issue is closed.

---

## The Big Picture

There are **two sides** to the system:

### 1. The Public Side — for every employee in the bank

URL (production): **https://mis.rbtbank.com/public-helpdesk**

No username, no password. Any employee can walk up, open the page, and:

- Submit a new concern
- Check the status of a concern they submitted before
- Chat with the MIS team about their ticket

### 2. The Admin Side — for the MIS / IT team

URL (production): **https://mis.rbtbank.com/helpdesk**

MIS staff log in with their existing account. They see every ticket from
every branch, can triage, assign, reply, and close.

Both sides are looking at the same tickets — the public side just shows a
simplified view tailored to the person who filed the ticket.

---

## What an Employee Can Do (Public Side)

### A friendly home page

When the page loads they see:

- A welcome headline: **"Having an IT issue? We're here to help."**
- Two big buttons: **Submit a Ticket** and **Track a Ticket**
- A simple 3-step explainer: _Submit → MIS takes over → Track until resolved_
- A list of **categories** they can report (Hardware, Software, Network,
  Account, Email, Printer, Peripherals, CBS, Other) — each with a short
  description so they know which one to pick
- A **"Try these quick fixes first"** panel with expandable troubleshooting
  tips: computer won't start, WiFi down, can't log in, printer stuck, email
  issues, slow apps, CBS errors, keyboard/mouse/monitor. Many employees can
  fix their issue without even filing a ticket.
- **Tips** for filing a faster-to-resolve ticket

### Submitting a ticket

The submit flow is two steps so it doesn't feel overwhelming:

**Step 1 — "Who are you?"**
They type their name. As they type, matching names appear from the
employee directory. They pick themselves. The system automatically pulls
their **branch, OBO (Branch Lite Unit), section, and position** — so MIS
knows exactly where this person works without them having to spell it out.

**Step 2 — "What's wrong?"**
Now the form reveals:

- **Title** (short summary)
- **Description** (what happened, what they were trying to do)
- **Contact number** (so MIS can call them back if needed)
- **AnyDesk number** (so MIS can take over their screen remotely)
- **Category** and **Priority**
- **Screenshot/photo** — **required**. They have to attach at least one
  image showing the issue. This dramatically cuts back-and-forth.

When they submit, they get a **ticket number** like
`TKT-2026-000001` with a big "Copy" button. They can click "Track this
ticket" to go straight to the status page, or save the number for later.

### Tracking a ticket

They paste their ticket number and see:

- The current **status** badge (Open, In Progress, Resolved, etc.)
- The full description and all the details they submitted
- Who from MIS is handling it
- The **Conversation** — a chat-style thread with the MIS team
- Any screenshots/photos/videos attached during the conversation

### Two-way chat with MIS

This is the heart of the system. The Conversation looks and feels like a
modern messaging app:

- MIS replies appear on the left in blue bubbles, with a shield icon and
  the person's name
- Their own replies appear on the right in dark blue bubbles
- Each message shows how long ago it was posted (e.g., "2m ago")
- They can **add emoji** from a picker organized by category
- They can **attach photos and videos** — drag in a screenshot of a new
  error message, or record a short video showing the problem
- The moment MIS replies, their message appears **instantly without
  refreshing** the page (real-time chat)

Once a ticket is Closed or Cancelled, the chat box locks with a friendly
note: _"If you need more help, please submit a new ticket."_

---

## What the MIS Team Can Do (Admin Side)

### Dashboard at a glance

On the first screen, six counter cards show:

- **Total tickets**
- **Open** — waiting for someone to pick up
- **In Progress** — being worked on
- **Resolved**
- **Overdue** — past due date, not yet resolved (in red)
- **Unassigned** — nobody is handling it yet (in amber)

### The tickets list

A searchable, filterable table of every ticket. Filters include:

- Search box (ticket number, title, requester name)
- Status, priority, category
- Branch / section / assignee
- Date range (created between X and Y)
- Quick toggles: "Overdue only", "Unassigned only"

Each row shows the ticket number, title, category, requester + branch,
priority and status badges, assignee, due date, and created date.

### Fast inline editing

This is a big time-saver for MIS staff:

- **Click the status badge** on any row → a dropdown appears → pick a new
  status. If you pick "Resolved" or "Closed", a popup asks for a resolution
  summary (optional). Otherwise it asks "Yes, change?" — one click and done.
- **Click the assignee name** on any row → dropdown of all MIS staff → pick
  a new person. If the ticket is already assigned, it asks "Reassign from
  Juan to Maria?" If not, "Assign to Maria?" One click, re-assigned.

### Ticket detail view

Clicking any ticket opens the full detail page. It shows:

- All the ticket info (title, description, category, contact number,
  AnyDesk, all the requester's organizational data — branch, OBO, section,
  position)
- The quick status-change form
- All original attachments with clickable image previews
- **Two-column bottom half:**
  - Left: attachments panel (upload more, delete existing)
  - Right: **Conversation + Activity Log**
    - Conversation — actual human back-and-forth, clean and focused
    - Activity Log (collapsible, secondary) — every status change and
      assignment change for audit trail

MIS staff can reply with text, emojis, and photos/videos — same as what
the requester sees on their side.

---

## How It All Talks Together

### The "one source of truth"

Every ticket, every comment, every attachment lives in **one database
table**. The public side and admin side are two different views of the
same records. When a MIS staff member replies on the admin side, that
reply shows up on the public side instantly — no sync, no delay, no
data duplication.

### Real-time chat (Socket.io)

When either party posts a new comment, the server pushes the new message
to the other side over a **WebSocket** connection. The other person sees
it appear without refreshing — exactly like WhatsApp or Messenger.

If the connection drops (WiFi hiccup, etc.), it reconnects automatically.
If the real-time service is ever down, comments still work — they just
won't arrive live, and the person would need to refresh to see new ones.
There's an emergency switch to turn real-time off instantly without
redeploying anything.

### Organizational smarts

The helpdesk reuses everything we already know about the bank:

- **Branches** (Main Office, Jasaan, Salay, CDO, Maramag, etc.)
- **Branch Lite Units** / **OBOs** (Gingoog BLU, Camiguin BLU)
- **Sections / Departments** (HR, Accounting, Cash, Loan, Audit)
- **Positions** (Teller, Branch Manager, Loan Officer, and so on)

When an employee picks their name on the submit form, their entire
organizational context comes along with the ticket. MIS can then filter
"show me all tickets from Jasaan Branch" or "all Loan Section tickets this
week" without anyone having to type that information.

### Data-driven categories

Categories aren't hard-coded. They live in a table. The initial 9 are:
Hardware, Software, Network, Account, Email, Printer, Peripherals, **CBS**
(Core Banking System), and Other. Adding a new category later is just a
data change — no new code, no redeploy.

Each category has a **description** that shows as a tooltip/hint when
someone picks it — so a confused user sees _"Application errors, software
crashes, installation help..."_ under "Software" and knows they're in the
right place.

### Ticket numbers

Every ticket gets a **human-friendly number** in the format
`TKT-2026-000001` — same format banking slips use. The year is in the
number so you can tell at a glance how old a ticket is. Numbers don't
reset; they increment forever.

### Audit trail

Every change to a ticket — status change, assignment change, comment
added, ticket created — gets logged automatically as a "system remark".
The MIS team can expand the Activity Log on any ticket to see the
complete history: _"Status changed from Open to In Progress by Augustin
at 3:13 PM"_, _"Ticket assigned to Bryan by Augustin at 3:12 PM"_, and
so on.

---

## Where Everything Runs

In production, the system runs on **three pieces** on the same server:

1. **The website + API** (Laravel, PHP) — serves the pages and handles
   the database
2. **The front-end** (React, prebuilt files served by Nginx)
3. **The chat server** (Node.js + Socket.io) — keeps live WebSocket
   connections open to every browser currently viewing a ticket

All three sit behind **Nginx** which presents a single clean URL to the
outside world (`mis.rbtbank.com`), handles TLS/HTTPS, and routes requests
to the right process internally.

Staging works identically, just on `staging.mis.local` with different
credentials.

---

## What This Delivers

For the **employee**:

- Self-serve — report an IT issue anytime, from anywhere on the network
- Clear expectations — they can see status, not just wonder
- Fast communication — chat instead of phone tag
- A record — no "did you get my email about the printer?" moments

For **MIS / IT team**:

- One screen for every open concern
- Instant filtering by branch, section, priority, status
- Quick triage — click a badge to update status, click a name to reassign
- Full conversation history per ticket, with screenshots and videos inline
- Audit log for every change (who, when, what)
- Data to show leadership: tickets per branch, average resolution time,
  bottlenecks

For **management**:

- Clean numbers on helpdesk performance
- Visibility into which branches and departments generate the most
  concerns (staffing, training, equipment decisions)
- A single system rather than scattered emails, notes, and phone logs

---

## Capabilities at a Glance

| Feature                                           | Available |
| ------------------------------------------------- | --------- |
| End users can submit tickets without logging in   | ✅        |
| Required screenshot/image on ticket submission    | ✅        |
| Automatic ticket numbers (TKT-YYYY-NNNNNN)        | ✅        |
| Copy-to-clipboard ticket number after submit      | ✅        |
| Track ticket by number, no login required         | ✅        |
| Real-time chat between employee and MIS           | ✅        |
| Photo + video attachments in comments             | ✅        |
| Emoji picker in comments                          | ✅        |
| MIS inline status + assignee editing              | ✅        |
| Reassignment with confirmation dialog             | ✅        |
| Resolve with summary note                         | ✅        |
| Filters by branch, section, assignee, date        | ✅        |
| Categories manageable (data-driven) including CBS | ✅        |
| Activity log / audit trail per ticket             | ✅        |
| Overdue / unassigned alerts in dashboard          | ✅        |
| Employee organization data auto-attached          | ✅        |
| Same URL for public + admin (separated by path)   | ✅        |
| Dedicated staging and production environments     | ✅        |
| Emergency kill switch for real-time               | ✅        |

---

_Document last updated when the system was delivered. For deployment
instructions see `realtime-server/DEPLOY.md` and the Laravel and frontend
deployment procedures._
