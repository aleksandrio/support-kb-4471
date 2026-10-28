// How #4471 splits into problems. The page says it in words; this is what runs, over the same
// export the desk's own CauseTable reads, so the numbers on the page are never typed.
import { causeOf, groupByCause, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day-move';
export const PROBLEMS: readonly Problem[] = ['parser', 'hint', 'one-day-move'];

export type ProblemRow = {
  problem: Problem;
  reports: Report[];
  channels: Record<string, number>;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  // Reports whose intake tag disagrees with the cause the tenant directory gives.
  mistagged: number;
};

export type Split = {
  rowsInExport: number; // rows in the export, overlapping pages included
  merged: number; // distinct reports merged into the ticket
  rows: ProblemRow[];
  // Reports the desk read as a one-day move (desk-notes.json): a different bug, whatever the tenant says.
  oneDayMove: readonly string[];
};

const counts = (rs: Report[], key: (r: Report) => string) =>
  rs.reduce<Record<string, number>>((n, r) => ({ ...n, [key(r)]: (n[key(r)] ?? 0) + 1 }), {});

function row(problem: Problem, rs: Report[], tenantOf: (r: Report) => Tenant | undefined): ProblemRow {
  const days = rs.map((r) => r.receivedAt.slice(0, 10)).sort();
  return {
    problem,
    reports: rs,
    channels: counts(rs, (r) => r.channel),
    tenants: new Set(rs.map((r) => r.tenant)).size,
    firstSeen: days[0],
    lastSeen: days[days.length - 1],
    mistagged: rs.filter((r) => r.meta.intakeTag !== causeOf(r, tenantOf(r))).length,
  };
}

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): Split {
  // Counted as the desk counts: by tenant, the one-day moves inside the parser row where they are
  // filed. Then the moves get a row of their own, as the footnote made visible.
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  const byCause = new Map(groupByCause(merged, tenantOf).map((g) => [g.cause, g.reports] as const));
  const rows = [
    row('parser', byCause.get('parser') ?? [], tenantOf),
    row('hint', byCause.get('hint') ?? [], tenantOf),
    row('one-day-move', moved, tenantOf),
  ];
  return { rowsInExport: all.length, merged: merged.length, rows, oneDayMove };
}

// The by-tenant rows cover every merged report once; the one-day moves are a subset of parser.
export function addsUp(s: Split): boolean {
  const byTenant = s.rows.filter((r) => r.problem !== 'one-day-move').reduce((n, r) => n + r.reports.length, 0);
  return byTenant === s.merged;
}
