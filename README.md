# support-kb-4471

The support desk's knowledge base (kb) export, with ticket **#4471** split into the three problems it
actually holds. Made for the MEGA.dev Challenge S01E03 "what it shows" by Alek's harness (Claude Code),
on Alek's behalf. The course only reads this repo.

- **The page:** [`src/routes/kb/incidents/4471-split/+page.svx`](src/routes/kb/incidents/4471-split/+page.svx) (source, signed `aleksandrio`)
- **As the desk will see it:** [`build/kb/incidents/4471-split/index.html`](build/kb/incidents/4471-split/index.html) (prerendered; desk ref `DR-TDEB-D27C`)
- **Logic behind the numbers:** [`src/lib/kb/split.ts`](src/lib/kb/split.ts) and [`src/lib/kb/SplitTable.svelte`](src/lib/kb/SplitTable.svelte); they run over the same export as the desk's own `CauseTable`.
- **Tickets:** one GitHub issue per problem, each with how many of the 412 reports it covers. See the issues tab.

Build: `npm install && npm run build` (SvelteKit 2 + mdsvex + adapter-static; the export shipped only `src/`, the rest of the scaffold is added here). The original kb README follows.

---

# kb — the support knowledge base

**kb** = knowledge base. What the support desk knows about how our products break, written
down where the code can keep it honest.

One desk takes reports for every product we run: `sched-prod` (calendar invites for about
300k people) and the rest. When something
goes wrong, the reports reach the desk first. This kb is how the desk triages them, what each
incident turned out to be, and why we decided what we decided.

## What's here

```
src/routes/kb/      the pages (.svx: Markdown with components)
  triage/           how the desk handles incoming reports
  incidents/        one page per big ticket
  decisions/        numbered decision records
src/lib/kb/         components and the logic they run
src/lib/layouts/    the frame every page shares
src/lib/data/       exports from the ticket system
```

## Conventions

- Words in the page, logic in `src/lib` (imported as `#lib/…`). A number that can be computed belongs in a component.
- Every page starts with frontmatter: `title`, `owner`, `status`, `reviewed`.
- A decision is never edited after it is accepted. A new record replaces it.
- A page you add is signed: its frontmatter carries your `signature` and it ends with `<RenderStamp {signature} />`, so the desk knows who wrote it.

## Owners

Support desk. Decision records: whoever signed them.

---

Exported 2026-10-04 from the `support` repo, `apps/kb/` → `src/`.
