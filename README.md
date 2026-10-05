# AI Customer Support Agent

A production-style vertical slice for an e-commerce AI customer support agent that validates and processes refunds through deterministic business tools.

## Features

- Next.js App Router + TypeScript
- MongoDB + Mongoose
- 15 mock customer profiles
- Mock order database with policy edge cases
- Strict refund policy
- OpenAI tool/function calling
- Deterministic refund validation
- Safe refund processing with a state check
- Structured agent activity logs
- Admin dashboard with near-real-time log refresh
- Zod API validation
- Clear service/tool/model separation

## Architecture

```text
Customer Chat
     |
     v
POST /api/agent
     |
     v
Agent Service
     |
     +---- get_customer --------> Customer Service ----> MongoDB
     |
     +---- get_order -----------> Order Service ------> MongoDB
     |
     +---- check_refund_policy --> Refund Service ----> MongoDB
     |
     +---- process_refund ------> Refund Service ----> MongoDB
     |
     v
Final customer response

Admin Dashboard
     |
     v
GET /api/logs
     |
     v
AgentLog collection
```

The LLM orchestrates the tools, but the refund policy is enforced in server-side business logic. The LLM cannot override a negative policy result.

## Requirements

- Node.js 20+
- MongoDB local or hosted
- OpenAI API key

## Setup

```bash
npm install
```

Create `.env.local`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ai-customer-support
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-5-mini
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Seed the database:

```bash
npm run seed
```

Run:

```bash
npm run dev
```

Open:

- Customer: http://localhost:3000
- Admin: http://localhost:3000/admin

## Demo scenarios

### Successful refund

Use:

> I want a refund for ORD1001.

The agent should retrieve the order, validate the policy, and process the refund.

### Policy violation

Use:

> I want a refund for ORD1008.

ORD1008 was delivered outside the 30-day refund window, so the policy service should deny the refund.

### Non-refundable product

Use:

> I want a refund for ORD1005.

The product is explicitly marked non-refundable.

### Manual approval

Use:

> I want a refund for ORD1011.

The order is eligible but exceeds the automatic refund threshold, so the agent should return a manual-approval result instead of automatically refunding it.

## Security / production notes

- Never commit `.env.local`.
- Do not expose the OpenAI API key to the browser.
- Validate API input on the server.
- Keep authorization checks in the backend.
- Do not rely on the LLM for business-rule enforcement.
- The production version should add authentication/authorization for the admin dashboard.
- For horizontally scaled deployments, replace polling with a durable event/pub-sub layer such as Redis, Kafka, or a managed realtime provider.

## Reasoning logs

The dashboard records structured events such as:

- `agent_started`
- `tool:get_customer`
- `tool:get_order`
- `tool:check_refund_policy`
- `tool:process_refund`
- `agent_completed`
- `agent_failed`

These are action/result logs, not private chain-of-thought.

## Loom demo flow

1. Show architecture briefly.
2. Open customer chat.
3. Submit a standard refund.
4. Show successful refund.
5. Open admin dashboard and show tool sequence.
6. Submit the 47-day-old order.
7. Show the policy denial.
8. Show the corresponding dashboard logs.
9. Walk through the agent service and refund service.
10. Explain that business rules are deterministic and the LLM only orchestrates tools.

## Mock AI Mode

The project supports a deterministic Mock AI mode for demos and development when OpenAI API credits are unavailable.

Set this in `.env.local`:

```env
AGENT_MODE=mock
```

Mock mode does not call OpenAI. It still runs the real application tools and refund policy against MongoDB:

```text
Customer message
      ↓
Mock Agent
      ↓
get_order
      ↓
check_refund_policy
      ↓
   ┌──┴───────────────┐
   ↓                  ↓
DENIED        MANUAL APPROVAL
   ↓                  
   └─────── or ───────┘
          ↓
   process_refund
          ↓
      REFUNDED
```

Useful demo cases:

- `ORD1001` → automatic refund
- `ORD1005` → denied because product is non-refundable
- `ORD1006` → denied because refund was already processed
- `ORD1008` → denied because the 30-day refund window expired
- `ORD1011` → manual approval required because amount exceeds the automatic limit
- `ORD1010` → denied because the order is still processing

To use the real OpenAI agent again:

```env
AGENT_MODE=openai
OPENAI_API_KEY=your_real_api_key
OPENAI_MODEL=gpt-5-mini
```

## Role-based authentication and manual approvals

Run `npm run seed` after setting `MONGODB_URI` and `JWT_SECRET` in `.env.local`.

Demo accounts:
- Admin: `admin@example.com` / `Admin@123`
- Customer: `customer@example.com` / `Customer@123`

The `/admin` dashboard is server-protected and admin refund APIs also verify the admin role. Eligible refunds above `$500` are placed in a pending approval queue. Admins can approve (which marks the order refunded) or reject them. Customers cannot access admin approval APIs.
