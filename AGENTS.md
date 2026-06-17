<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Architecture & conventions

This codebase enforces its own discipline through the compiler, ESLint, tests,
and CI. Before changing layering, design tokens, or the UI primitives, read
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — it is the human-readable mirror of
those gates. If you change a convention, change the gate that enforces it.
