<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { addsUp, splitTicket, type Problem } from '#lib/kb/split';

  // `issues` maps each problem to the ticket that now owns it: "owner/name#n".
  let { ticket, issues }: { ticket: number; issues: Record<Problem, string> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const ok = $derived(addsUp(split));
  const mistagged = $derived(split.rows.reduce((n, r) => n + r.mistagged, 0));

  const LABEL: Record<Problem, string> = {
    parser: 'shared parser reads dates month-first',
    hint: 'booking-v3 hint says MM/DD, form reads day-first',
    'one-day-move': 'date moves by one day, month intact',
  };
  const channels = (c: Record<string, number>) =>
    Object.entries(c)
      .sort((a, b) => b[1] - a[1])
      .map(([k, n]) => `${k} ×${n}`)
      .join(' · ');
  const href = (ref: string) => `https://github.com/${ref.replace('#', '/issues/')}`;
</script>

<p class="sum">
  <strong>{split.rowsInExport}</strong> rows in the export ·
  <strong>{split.merged}</strong> distinct reports merged into #{ticket} ·
  <strong>{split.rows.length}</strong> problems
  {#if !ok}<span class="bad">· rows do not add up</span>{/if}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>channels</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each split.rows as r (r.problem)}
      <tr>
        <td><code>{r.problem}</code><br /><span class="what">{LABEL[r.problem]}</span></td>
        <td>{r.reports.length}</td>
        <td class="tags">{channels(r.channels)}</td>
        <td>{r.tenants}</td>
        <td>{r.firstSeen} → {r.lastSeen}</td>
        <td><a href={href(issues[r.problem])}>{issues[r.problem]}</a></td>
      </tr>
    {/each}
  </tbody>
</table>

<p class="note">
  Intake's tag disagrees with the tenant-based cause on <strong>{mistagged}</strong> reports; the tag is a guess from
  the reporter's browser. The one-day moves are the reports in <code>desk-notes.json</code>
  ({split.oneDayMove.join(', ')}), read by the desk, filed by tenant.
</p>

<style>
  .sum { font-size: 1.1rem; }
  .what { color: var(--muted); font-size: 0.85em; }
  .tags, .note { color: var(--muted); font-size: 0.85em; }
  .bad { color: var(--warn); font-weight: 600; }
</style>
