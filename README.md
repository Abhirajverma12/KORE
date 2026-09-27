# KORE — AI-Powered Mentorship Platform

> Match mentees to world-class mentors using LLM query understanding, real-time Socket.IO chat, and server-verified Razorpay payments.

---

## 🏛️ Architecture & Core Modules

1. **Query Enhancement Engine (`server/src/services/aiService.ts`)**:
   - Converts natural language problem descriptions into structured JSON intents (primary skills, seniority tier, problem category, domain context, urgency, and expected session outcomes).
   - Uses OpenAI API with structured outputs (`gpt-4o-mini`) + heuristic semantic fallback.

2. **Multi-Factor Mentor Matching (`server/src/services/matchingService.ts`)**:
   - Scores mentors on a weighted multi-factor formula:
     $$S = 0.45 \times S_{\text{skill}} + 0.25 \times S_{\text{seniority}} + 0.20 \times S_{\text{rating}} + 0.10 \times S_{\text{availability}}$$
   - Generates transparent match explanations for each mentor.

3. **Real-Time Sub-200ms Live Chat (`server/src/sockets/chatGateway.ts`)**:
   - Authenticated Socket.IO rooms (`session:${sessionId}`) with JWT handshake validation.
   - Live roundtrip latency telemetry, typing indicators, presence, and database message persistence via Prisma.

4. **Secure Access & RBAC (`server/src/middleware/auth.ts`)**:
   - Role-Based Access Control enforcing strict tenant separation across `mentee`, `mentor`, and `admin`.

5. **Server-Verified Razorpay Payments (`server/src/services/paymentService.ts`)**:
   - Order creation and HMAC-SHA256 signature verification.
   - Webhook processing (`payment.captured`, `order.paid`).
   - Gated session access: live chat rooms unlock strictly upon verified server payment.

---

## 🚀 Quick Start

### 1. Start Backend Server
```bash
cd server
npm install
npm run prisma:push
npm run prisma:seed
npm run dev
# Server listens on http://localhost:5001
```

### 2. Start Frontend Next.js Client
```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

### 3. Run Automated Backend Tests
```bash
cd server
npm test
```

---

## 👥 Demo Test Accounts

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Mentee** | `alex@example.com` | `password123` | Active user preparing for Staff System Design |
| **Mentor** | `vikram.m@kore.ai` | `password123` | Staff Engineer @ Uber (Kafka & Distributed Systems) |
| **Admin** | `admin@kore.ai` | `password123` | Platform Metrics & LLM Query Audit Logs |
