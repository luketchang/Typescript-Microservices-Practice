# Ticketing Microservices System

## Overview

This project is a **scalable, event-driven ticketing platform** that enables users to:

- Sign up and authenticate (Auth Service)
- Create, update, and browse tickets (Tickets Service)
- Place and manage orders for tickets (Orders Service)
- Handle order expiration and cancellations (Expiration Service)
- Process payments securely (Payments Service)

Each service operates independently, communicating through **NATS Streaming**, an event bus that facilitates real-time event-driven communication between services. This ensures consistency and prevents direct dependencies between services.

---

## End-to-End Flow with Message Publishing and Handling

This system follows a **pub-sub (publish-subscribe)** pattern where services communicate through **events**. Below is a detailed breakdown of how messages flow across services to complete an order lifecycle.

### 1. User Signup and Authentication

- A user signs up via the **Auth Service** and receives a JSON Web Token (JWT).
- The JWT allows access to other services that require authentication.

### 2. Ticket Creation

- A user creates a ticket using the **Tickets Service**.
- The ticket is stored in MongoDB, and a `ticket:created` event is published to NATS.
- **Subscribers:**
  - **Orders Service** subscribes to `ticket:created` events to track available tickets.

### 3. Ordering a Ticket

- A user places an order for a ticket through the **Orders Service**.
- The Orders Service checks if the ticket is available and marks it as **reserved**.
- The order is stored in MongoDB, and an `order:created` event is published.
- **Subscribers:**
  - **Tickets Service** subscribes to `order:created` events and updates the ticket status.
  - **Expiration Service** subscribes to `order:created` events and starts a timer to cancel the order if unpaid.

### 4. Order Expiration Handling

- The **Expiration Service** sets a timer (e.g., 15 minutes) upon receiving `order:created`.
- If the order is not paid within the time limit, an `expiration:complete` event is published.
- **Subscribers:**
  - **Orders Service** listens for `expiration:complete` events and cancels the order if unpaid.
  - **Tickets Service** listens for `order:cancelled` events and updates the ticket to be available again.

### 5. Payment Processing

- The user completes the purchase through the **Payments Service**.
- The Payments Service processes the payment via Stripe and publishes a `payment:created` event.
- **Subscribers:**
  - **Orders Service** listens for `payment:created` events and marks the order as **complete**.

### 6. Real-Time Updates and System Consistency

- If an order is canceled (due to expiration or user action), the **Orders Service** publishes an `order:cancelled` event.
- **Subscribers:**
  - **Tickets Service** listens for `order:cancelled` and marks the ticket as available.
  - **Payments Service** could listen for `order:cancelled` and prevent further payments.

---

## Message Publishing and Subscription Overview

| Event                 | Published By       | Subscribed By                | Purpose                                               |
| --------------------- | ------------------ | ---------------------------- | ----------------------------------------------------- |
| `ticket:created`      | Tickets Service    | Orders Service               | Notifies other services about new tickets.            |
| `order:created`       | Orders Service     | Tickets, Expiration Services | Reserves a ticket and starts expiration timer.        |
| `expiration:complete` | Expiration Service | Orders Service               | Cancels unpaid orders.                                |
| `order:cancelled`     | Orders Service     | Tickets, Payments Services   | Updates the ticket availability and prevents payment. |
| `payment:created`     | Payments Service   | Orders Service               | Marks an order as complete after successful payment.  |

Each service contains **event handlers** that listen for relevant events and trigger necessary actions.

---

## Microservices Breakdown

| Service        | Responsibility                                                                                    |
| -------------- | ------------------------------------------------------------------------------------------------- |
| **Auth**       | Handles user authentication (signup, signin, signout). Issues JWTs.                               |
| **Tickets**    | Manages ticket creation, updates, and availability. Publishes `ticket:created`, `ticket:updated`. |
| **Orders**     | Handles placing and canceling orders. Publishes `order:created`, `order:cancelled`.               |
| **Payments**   | Processes payments through Stripe. Publishes `payment:created`.                                   |
| **Expiration** | Manages order expiration. Publishes `expiration:complete`.                                        |

Each service:

- Has its **own database** (MongoDB) to store relevant data.
- **Subscribes to and processes events** to maintain consistency.
- **Publishes events** to notify other services about state changes.
- Can be **deployed independently** for scalability and fault tolerance.

---
