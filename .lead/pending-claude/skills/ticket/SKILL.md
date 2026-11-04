---
name: ticket
description: Turn the current conversation (or a described idea) into a ticket file for this project's hub board. Use when the owner says "make a ticket", "add this to the board", "ticket this", or when work is identified that should be done later.
---

1. Find the next id: highest `T-NNN` in `.lead/tickets/` + 1.
2. Copy `.lead/tickets/TEMPLATE.md` to `.lead/tickets/T-NNN.md`.
3. Fill frontmatter (`status: inbox`, today's date, priority, suggested effort) and the **Spec** from what was
   decided. Acceptance criteria must be checkable. Name files if known. State what is out of scope.
4. Write the **Summary** in the "Summary when a ticket is created" format of "The owner and how to write for him"
   (Need / Why it matters / Proposed / Size guess, at most ~60 words), so the owner understands the need at a glance.
5. If something is undecided, write it under **Questions** (Q1 format, recommended option first) instead of inventing it.
6. Reply with one line: `T-NNN — title (effort)`.

One ticket per independent piece of work. Do not write Plan or Technical plan (planning does).
