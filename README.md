# Fidelity Forge

WELLSFARGO — Build Specification
(Working project name: wellsfargo Bank | Product name: wellsfargo)
Type: live banking web app — /portfolio/learning project
Status: Requirements finalized, ready for build

> ⚠️ This is a fictional, live banking application for demonstration and learning purposes only. It does not connect to real banking networks, real accounts, or real money movement. All balances and transactions are live data stored in Supabase.

---

1. Tech Stack

- Frontend: Next.js + TypeScript
- Backend/DB/Auth: Supabase (Postgres + Auth + Row-Level Security)
- Deployment: Vercel (.vercel.app domain is fine for now)
- Responsive: Full support for both mobile (bottom tab bar, matching reference screens) and desktop (sidebar nav, wider dashboard grid)

---

2. Authentication (User-Facing)

- Email + password signup
- Email verification required (Supabase OTP/magic link) before dashboard access
- Sign in with "Remember me"
- Self-serve password reset: user requests reset → email link/OTP → set new password screen
- Logout / protected routes for all authenticated pages
- Passwords are hashed by Supabase Auth by default — never stored or displayed in plaintext, anywhere, including to admin

3. Admin Access (Separate System)

- Hardcoded/whitelisted admin login — password + a single whitelisted admin email (stored as env variable), checked server-side
- Not tied to normal user signup/auth flow
- Admin panel capabilities:
- Fund/credit accounts: select user → account type → amount → credit (creates a "completed" transaction, updates balance instantly)
- Set transaction status manually: Pending / Completed / Failed / Cancelled
- Trigger password reset email on a user's behalf (admin never sees or sets the actual password)
- Reply to support tickets
- View all users, accounts, transactions, card requests

---

4. Accounts

- Each user gets multiple accounts: Checking + Savings
- Starting balance: $0 for all new users
- Balances only change via:
- Admin credit (instant, completed)
- Transfers initiated by the user (see below)
- No user-initiated deposits in v1 (admin-only funding)

---

5. Cards

- User-requested, not auto-issued at signup
- Request flow: user selects card type → pays a processing fee deducted from their live balance
- Fee varies by card type — placeholder: Standard = $2,000, adjustable per tier later
- Cosmetic "Pay with: USD / BTC / NGN" selector on the request form (purely visual — no real currency/crypto interaction; the fee is always deducted from the live balance)
- If balance is insufficient, request is blocked
- Once issued: Visa Debit-style virtual card with masked number, card holder name, expiry, daily limit
- Card management: Lock/unlock, View PIN, Card Settings, Report Lost/Stolen
- Recent card transactions list per card

---

6. Transfers

- Form fields: Recipient Name, Bank Name, Account Number, Routing Number (optional), Amount, Description
- Saved recipients/beneficiaries list for repeat transfers
- Flow: Enter Details → Review → Confirm → Complete (matches reference screenshot's 4-step flow)
- Transaction states: Pending → Completed (auto-transitions after a short delay), plus Failed / Cancelled (admin-set only)
- Balance is only deducted once the transaction reaches Completed — not during Pending
- No transfer limits for v1
- Transaction receipt includes: Reference/Transaction ID, Type, Date/Time, Description, Recipient, Bank, Account, Amount, Status
- Users can download/share transaction receipts as PDF

---

7. Transaction History

- Full list with search
- Clear visual distinction between credits (incoming, green) and debits (outgoing, red)
- Status badges: Completed / Pending / Failed / Cancelled
- Tap into any transaction for full receipt detail + PDF share

---

8. Deposits- No user-initiated deposit flow in v1 — all funding happens via the admin panel only
- (Deposit shortcut can remain visually in Quick Actions for future use, but not functional yet — flag clearly if included, or omit entirely for v1)

---

9. Notifications

- Real-time, backend-triggered in-app notifications with bell icon + unread badge count
- Trigger events: transfer completed/pending, new device login, deposit/admin credit received, password changed, profile updated, card issued, etc.
- Notifications page with filter tabs: All / Transactions / Security / Promotions / System
- "Mark all as read" support
- Friendly empty state when there are no notifications

---

10. Dashboard (matches reference screenshot exactly)

- Greeting ("Good morning, [Name]")
- Total Balance card (Total + Available balance)
- Quick Actions: Transfer Money, Deposit Funds (UI only, non-functional), My Cards, Transactions, Support Center, More
- Accounts Overview (swipeable/paged account cards)
- Recent Transactions (preview list, "See All" link)
- Bottom tab bar (mobile) / sidebar (desktop): Home, Accounts, Transfer, Cards, More

---

11. Settings

- Profile: Phone, Date of Birth, Address, City, Country — all editable, Save Changes
- Currency Preference: wide list of currencies (USD, EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, NGN, ZAR, etc.) — this only changes display currency, not actual balances
- No password change field on this page (handled via reset-email flow instead)
- Notification preferences: toggle push/email notifications on/off

---

12. Support Center

- No live chat (removed from scope)
- Quick Help tiles: Call Us, Email Us, FAQs
- Popular Topics list (Account & Profile, Transactions & Transfers, Deposits & Withdrawals, Cards & Payments, Security & Privacy, More Topics)
- User-submitted tickets: simple form (Subject + Category + Message)
- Ticket history with status (Resolved / In Progress)
- You (admin) respond to tickets from the admin panel — not a public live chat

---

13. Empty / Loading / Error States

- Empty states: friendly message (not a blank list) for no transactions, no cards, no notifications, no recipients, etc.
- Loading states: standard skeleton loaders
- Error states: standard toast messages (e.g. "Transfer failed, please try again")

---

14. Security & Backend Rules

- Passwords: hashed via Supabase Auth, never exposed — even to admin
- Row-Level Security: users can only read/write their own accounts, transactions, cards, recipients, notifications, and tickets
- Balance mutations happen server-side only — never directly from client (prevents users editing their own balance)
- Admin routes protected separately from user auth (whitelisted email check)
- No secrets/API keys in frontend code
- Server-side validation on all transaction/card-request logic

---

15. Database Tables (starting point)

- users (extends Supabase auth.users — profile fields, currency preference)
- accounts (user_id, type [checking/savings], balance, account_number)
- transactions (account_id, type, amount, status, recipient info, reference, description, timestamps)
- cards (user_id, account_id, card_type, masked_number, expiry, daily_limit, status, PIN [hashed/encrypted], fee_paid)
- recipients (user_id, name, bank, account_number, routing_number — saved beneficiaries)
- notifications (user_id, type, title, message, read_at, created_at)
- support_tickets (user_id, subject, category, message, status, admin_reply)
- admin_actions (audit log: admin credits, status changes, ticket replies — who did what, when)

---

16. Explicitly Out of Scope for v1

- Live chat
- User-initiated deposits
- Password change from settings (uses reset-email flow instead)
- 2FA/TOTP on admin login
- Real crypto/payment processor integration of any kind
- Transfer limits
- Business accounts

---

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/6298ed18-6e62-4566-bf42-5fb02b955009).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
