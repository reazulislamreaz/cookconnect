# CookconneKt — Backend

REST API serving both clients in this repository: the public site (`../../Frontend`)
and the administration dashboard (`../../Dashboard`).

**Node.js · Express · TypeScript · MongoDB (Mongoose) · modular monolith**

> **Status: planning.** No implementation code yet — the documents below are for
> review before any is written.

## Documents

| Document | What it covers |
| --- | --- |
| [`01-ARCHITECTURE.md`](01-ARCHITECTURE.md) | Module boundaries, folder layout, request lifecycle, auth model, the business rules carried over from the client specification |
| [`02-DATABASE.md`](02-DATABASE.md) | 18 collections with fields, indexes, relationships, and the reasoning behind each modelling decision |
| [`03-API-CONTRACT.md`](03-API-CONTRACT.md) | Every endpoint, mapped to the screen that consumes it |
| [`04-TASKS.md`](04-TASKS.md) | 31 tasks in 8 phases, each with acceptance criteria |

## Reading order

Architecture → Database → API contract → Tasks. The first three explain *what*
is being built and why; the fourth is the order it gets built in.

## Two open decisions

Both affect a single task each and neither blocks the start of work:

- **Object storage** for uploads (task 2.2) — S3, Cloudflare R2 or Backblaze B2.
- **Email provider** (task 4.2) — SMTP, Resend, SendGrid or Mailgun. Worth
  checking Moroccan deliverability before committing.
