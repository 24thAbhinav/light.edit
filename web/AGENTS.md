<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project specifics

- Scripts: only `dev`, `build`, `start` in `web/package.json`. There is **no lint or test script** and no eslint config. Typecheck with `npx tsc --noEmit`.
- Tailwind v4 is configured purely in CSS: `app/globals.css` (`@import "tailwindcss"`, `@theme inline`). There is no `tailwind.config.*`.
- Fonts are Geist via `next/font/google`, exposed as `--font-geist-sans` / `--font-geist-mono` CSS vars (wired in `app/layout.tsx`).
- tsconfig maps `@/*` to the `web/` root.
- zustand (`^5`) is a dependency; the app itself is still the create-next-app boilerplate.
