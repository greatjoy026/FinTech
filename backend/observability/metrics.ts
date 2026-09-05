type CounterName = 'http_requests_total' | 'http_errors_total' | 'auth_failures_total' | 'authorization_denials_total' | 'rate_limit_responses_total' | 'audit_failures_total' | 'security_events_total';

const counters = new Map<CounterName, number>();
const startedAt = Date.now();

export function increment(name: CounterName, value = 1): void {
  counters.set(name, (counters.get(name) ?? 0) + value);
}

export function snapshotMetrics(): Record<string, number> {
  return Object.fromEntries(counters.entries());
}

function escapeLabel(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

export function prometheusMetrics(): string {
  const lines = [
    '# HELP fintech_process_uptime_seconds Process uptime in seconds.',
    '# TYPE fintech_process_uptime_seconds gauge',
    `fintech_process_uptime_seconds ${(Date.now() - startedAt) / 1000}`,
    '# HELP fintech_process_memory_bytes Node.js heap and resident memory.',
    '# TYPE fintech_process_memory_bytes gauge',
  ];
  const memory = process.memoryUsage();
  for (const [name, value] of Object.entries(memory)) lines.push(`fintech_process_memory_bytes{type="${escapeLabel(name)}"} ${value}`);
  for (const [name, value] of counters.entries()) {
    lines.push(`# HELP fintech_${name} FinTech operational/security counter.`);
    lines.push(`# TYPE fintech_${name} counter`);
    lines.push(`fintech_${name} ${value}`);
  }
  return `${lines.join('\n')}\n`;
}
