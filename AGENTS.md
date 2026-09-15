# AGENTS.md

## Project Overview

This project is a web-based photo editing platform inspired by Lightroom.

The product has three core systems:

1. **Photo Editor** — client-side image editing and rendering.
2. **Preset System** — reusable collections of editing parameters.
3. **Guide System** — interactive educational workflows that modify the same editing state used by the editor.

The long-term goal is to combine professional photo editing with education: users can apply professional-looking presets and learn how those looks are created.

---

# Engineering Philosophy

## 1. Understand before optimizing

Do not introduce a technology simply because it is considered fast, scalable, or modern.

For performance-related decisions:

```text
Implement → Measure → Identify bottleneck → Optimize → Measure again
```

Do not assume:

* WASM is always faster than JavaScript.
* WebGPU is always better than CPU processing.
* Redis is always necessary.
* Microservices are more scalable for this project.
* More infrastructure means better architecture.

Every significant optimization should have a measurable reason.

---

## 2. Keep responsibilities separate

The project consists of separate concerns:

```text
Frontend
    ↓
Editor State
    ↓
Image Processing Engine
    ↓
Canvas / WebGPU / WASM

Frontend
    ↓ HTTPS
Backend API
    ↓
Database / Object Storage / Async Workers
```

The backend should not sit in the critical path of interactive image editing.

---

## 3. Prefer the simplest architecture that satisfies current requirements

Start with a modular architecture rather than prematurely building a distributed system.

Do not introduce:

* Microservices
* Kubernetes
* Redis
* Kafka
* Complex event-driven systems
* Multiple databases

unless a concrete requirement or measured bottleneck justifies them.

---

# Current Architecture

## Frontend

The frontend uses:

* Next.js
* React
* TypeScript
* Tailwind CSS

Next.js is responsible for the web application and user-facing product experience.

Potential responsibilities:

* Marketing pages
* Preset pages
* Guide pages
* Editor UI
* User dashboard
* Authentication integration
* API consumption

The editor itself should remain a highly client-side React application.

---

# Editor Architecture

The editor should follow this model:

```text
User Input
    ↓
React UI
    ↓
EditState
    ↓
Image Processing Engine
    ↓
Canvas
    ↓
Rendered Image
```

Example:

```ts
interface EditState {
  exposure: number;
  contrast: number;
  saturation: number;
  temperature: number;
}
```

`EditState` is the central representation of a user's edits.

The image should generally be treated as:

```text
Original Image + EditState = Rendered Image
```

rather than permanently modifying the original image.

---

# Non-Destructive Editing

Edits should be represented as data rather than only as rendered pixels.

Example:

```json
{
  "exposure": 0.4,
  "contrast": 15,
  "highlights": -25,
  "shadows": 10,
  "temperature": 7
}
```

This allows:

* Undo/redo
* Presets
* Guides
* Project persistence
* Sharing edits
* AI-generated edits
* Reapplying edits to the original image

The original image should remain unchanged.

---

# Client-Side Image Processing

Interactive image manipulation should happen primarily on the user's device.

Do **not** send an API request for every slider movement.

Avoid:

```text
Slider
  ↓
API
  ↓
Server Processing
  ↓
Response
  ↓
Browser
```

Prefer:

```text
Slider
  ↓
EditState
  ↓
Local Image Engine
  ↓
Canvas
```

Reasons:

* Low latency
* Better slider responsiveness
* Lower bandwidth usage
* Lower server compute cost
* Better scalability
* Better offline potential

---

# Image Processing Technology Progression

Do not start with Rust, WASM, or WebGPU.

Use the following progression:

### Stage 1

```text
TypeScript / JavaScript
+
Canvas
```

First establish correctness and the editing model.

### Stage 2

If processing blocks the UI:

```text
Main Thread
    ↓
Web Worker
    ↓
Image Engine
```

A Web Worker is primarily a concurrency mechanism. It prevents expensive computation from blocking the main UI thread.

It does not automatically make computation faster.

### Stage 3

If CPU-side processing becomes a measurable bottleneck:

```text
Web Worker
    ↓
WASM
```

Evaluate WebAssembly.

### Stage 4

If operations are highly parallel and suitable for GPU execution:

```text
WebGPU
    ↓
GPU
```

Evaluate GPU acceleration.

### Stage 5

If WASM is useful for CPU-side processing:

```text
Rust
  ↓
WASM
  ↓
Web Worker
```

Rust should only be introduced when there is a concrete reason to use it.

---

# Backend Architecture

The backend is a separate system from the frontend.

Preferred initial architecture:

```text
Next.js Frontend
       │
       │ HTTPS
       ▼
Backend API
       │
       ├── Auth
       ├── Users
       ├── Projects
       ├── Presets
       ├── Guides
       └── Billing
              │
              ▼
          PostgreSQL
```

The backend should handle SaaS concerns rather than interactive pixel processing.

---

# Backend Technology

Initial backend preference:

* Node.js
* TypeScript
* PostgreSQL
* REST or similarly simple HTTP API

The backend should initially be a **modular monolith**.

Organize code by domain:

```text
api/
└── src/
    ├── modules/
    │   ├── auth/
    │   ├── users/
    │   ├── projects/
    │   ├── presets/
    │   ├── guides/
    │   └── billing/
    │
    ├── db/
    ├── middleware/
    └── server.ts
```

Do not split these modules into separate services unless there is a clear reason.

---

# Database

Use PostgreSQL for structured application data.

Potential entities:

```text
users
projects
presets
guides
subscriptions
```

Do not store large image binaries directly in PostgreSQL.

Use object storage for large files:

```text
Browser
   ↓
Object Storage
   ↓
image file

PostgreSQL
   ↓
metadata + references
```

---

# Object Storage

Large assets should use object storage such as:

* S3
* Cloudflare R2
* Similar object storage

Examples:

* Original images
* Generated thumbnails
* Preset preview images
* Guide media
* Other large assets

PostgreSQL should store references and metadata rather than large binary objects.

---

# Presets

Presets are data.

A preset should represent editing parameters rather than a pre-rendered image.

Example:

```json
{
  "name": "Moody",
  "edits": {
    "exposure": -0.2,
    "contrast": 20,
    "highlights": -30,
    "shadows": 10,
    "temperature": -5,
    "saturation": -10
  }
}
```

The flow is:

```text
Preset
   ↓
EditState
   ↓
Image Engine
   ↓
Rendered Image
```

This keeps presets compatible with the same rendering system as manual editing.

---

# Guides

Guides are interactive learning experiences.

A guide should not have a separate image-processing system.

Instead:

```text
Guide Step
    ↓
EditState Change
    ↓
Image Engine
    ↓
Rendered Result
```

Example:

```text
Step 1
Increase exposure

Step 2
Reduce highlights

Step 3
Increase temperature

Step 4
Adjust color grading
```

The guide and editor must operate on the same underlying `EditState`.

This is an important product and architectural principle.

---

# AI

AI should eventually integrate with the editing system through structured editing parameters where possible.

Prefer:

```text
User Prompt
    ↓
AI
    ↓
EditState
    ↓
Local Image Engine
    ↓
Image
```

over:

```text
User Image
    ↓
AI Server
    ↓
Completely Rendered Image
    ↓
Browser
```

Returning structured edits allows the user to inspect, modify, undo, save, and learn from the AI's recommendations.

AI architecture should be added only after the core editor works.

---

# Authentication and Authorization

Authentication answers:

> Who is this user?

Authorization answers:

> What is this user allowed to access?

Premium guides and other paid functionality must be protected by backend authorization.

Do not rely on:

```text
if (user.isPremium) {
    showContent();
}
```

in the frontend as the security boundary.

The frontend may hide or disable UI, but the backend must enforce access.

---

# Payments

Subscriptions and payment state should be handled by the backend.

The browser should never be treated as the source of truth for:

* Subscription status
* Premium access
* Payment state
* Ownership

The backend should verify subscription/access state before returning protected resources.

---

# Async Processing

Some future workloads may be expensive or long-running:

* Thumbnail generation
* AI processing
* Server-side RAW processing
* Asset conversion
* Batch processing

These should not necessarily run inside a normal synchronous API request.

Eventually:

```text
API
 ↓
Queue
 ↓
Worker
 ↓
Processing
 ↓
Storage / Database
```

Do not introduce a queue until there is an actual asynchronous workload that benefits from it.

---

# Caching

Redis or another cache may be introduced later.

Potential candidates:

* Frequently requested presets
* Public guide metadata
* Sessions
* Rate limiting
* Expensive computed results

Do not add Redis simply because the application has a backend.

Start with:

```text
API → PostgreSQL
```

Then measure.

---

# Frontend / Backend Boundary

The following should generally stay client-side:

* Slider interactions
* EditState manipulation
* Preview rendering
* Pixel transformations
* Interactive image editing

The following belong to the backend:

* Authentication
* Authorization
* User accounts
* Project persistence
* Preset catalog
* Guide catalog
* Subscription state
* Billing
* Metadata
* Async processing orchestration

---

# API Design Principles

APIs should represent business resources rather than frontend implementation details.

Examples:

```text
GET    /presets
GET    /presets/:id

GET    /guides
GET    /guides/:id

GET    /projects
POST   /projects
GET    /projects/:id
PATCH  /projects/:id
DELETE /projects/:id
```

Avoid APIs that exist only because a React component happens to need a particular piece of state.

---

# Project Persistence

A project should primarily save:

```text
Original Image Reference
+
EditState
+
Project Metadata
```

Example:

```json
{
  "name": "Sunset",
  "imageId": "image_123",
  "editState": {
    "exposure": 0.4,
    "contrast": 15,
    "highlights": -25,
    "shadows": 10,
    "temperature": 7
  }
}
```

This enables non-destructive editing.

---

# Performance Rules

Performance work should follow:

```text
Measure
   ↓
Find bottleneck
   ↓
Form hypothesis
   ↓
Implement change
   ↓
Measure again
```

When optimizing the editor, consider:

1. Main-thread blocking
2. Image resolution
3. Number of pixel operations
4. Memory usage
5. Canvas rendering cost
6. Worker communication overhead
7. WASM boundary overhead
8. GPU transfer overhead

Do not optimize based solely on theoretical throughput.

---

# Error Handling

Failures should be handled at the appropriate boundary.

Frontend:

* Invalid files
* Unsupported formats
* Rendering failures
* Network errors

Backend:

* Authentication failures
* Authorization failures
* Validation failures
* Database failures
* Storage failures
* External service failures

Never expose sensitive backend implementation details to clients.

---

# Security Principles

Never trust client input.

Validate on the backend:

* User-controlled IDs
* Project ownership
* Preset access
* Guide access
* Subscription status
* Uploaded file metadata
* API parameters

The frontend is a client, not a trusted environment.

---

# Development Strategy

Build vertically rather than building infrastructure first.

## Milestone 1 — Basic Editor

```text
Next.js
+
React
+
TypeScript
+
Canvas
```

Features:

* Upload JPEG/PNG/WebP
* Display image
* Exposure
* Contrast
* Saturation
* Temperature
* Export

No backend.

---

## Milestone 2 — EditState

Formalize the editing model.

```text
UI
 ↓
EditState
 ↓
Image Engine
 ↓
Canvas
```

---

## Milestone 3 — Presets

Implement presets using `EditState`.

---

## Milestone 4 — Guides

Implement interactive guides that manipulate `EditState`.

---

## Milestone 5 — Backend

Introduce:

```text
Backend API
+
PostgreSQL
+
Object Storage
```

Add:

* Authentication
* Projects
* Presets
* Guides

---

## Milestone 6 — Performance

Profile the editor.

Only then consider:

* Web Workers
* WASM
* Rust
* WebGPU

---

## Milestone 7 — SaaS Features

Add:

* Billing
* Premium guides
* User libraries
* Sharing
* Cloud synchronization

---

## Milestone 8 — Advanced Processing

Potential future features:

* RAW
* Advanced masking
* AI editing
* Batch processing
* Server-side processing where appropriate

---

# Architecture Decision Records

For every significant architectural decision, document:

```text
Context
Problem
Options considered
Decision
Why
Tradeoffs
What would make us reconsider
```

Example:

## Decision: Client-Side Image Processing

### Context

Slider interactions require continuous image updates.

### Options

1. Server-side processing
2. Client-side JavaScript
3. Web Workers
4. WASM
5. WebGPU

### Initial Decision

Use client-side JavaScript + Canvas.

### Reason

It provides the simplest implementation for validating the editing model and product experience.

### Tradeoff

CPU-intensive processing may eventually affect responsiveness.

### Reconsider When

Profiling shows that image processing causes unacceptable frame drops or UI blocking.

---

# Interview Philosophy

Architecture should be explainable as a sequence of engineering decisions.

Do not say:

> "I used WebGPU because it is faster."

Instead explain:

```text
Requirement
    ↓
Constraints
    ↓
Options
    ↓
Tradeoffs
    ↓
Decision
    ↓
Measurement
    ↓
Future evolution
```

The project should demonstrate that architectural complexity was introduced because of actual requirements or bottlenecks.

---

# Current Priority

The immediate priority is **not** backend infrastructure.

Build this first:

```text
Next.js
   ↓
/editor
   ↓
React Editor
   ↓
EditState
   ↓
Canvas
```

First milestone:

> Upload an image, modify basic editing parameters, see the result, and export it.

Everything else should come after this core loop works.
