import { demoCurrencyUnit } from "./demo-currency.mjs";
import { demoMetricDefinitions } from "./demo-metrics.mjs";
export { demoMetricDefinitions } from "./demo-metrics.mjs";
export const demoClients = Object.freeze([
  {
    id: "demo",
    label: "Nébula Retail",
    sector: "Retail & commerce",
    modules: ["finance", "finops", "marketing"],
    units: ["central", "regional"],
    initials: "NR",
  },
  {
    id: "verde",
    label: "Verde Studio",
    sector: "Professional services",
    modules: ["finance", "marketing"],
    units: ["central"],
    initials: "VS",
  },
  {
    id: "atlas",
    label: "Atlas Cloud",
    sector: "Digital infrastructure",
    modules: ["finops"],
    units: ["central", "regional"],
    initials: "AC",
  },
]);
export const DEMO_PERIOD = { from: "2026-01-01", to: "2026-12-31" };
const day = 86400000;
const sum = (rows, key) => rows.reduce((total, row) => total + row[key], 0);
const money = (cents) => cents / 100;
const percent = (value, base) => (base === 0 ? 0 : (value / base) * 100);
const delta = (value, previous) =>
  previous === 0 ? null : ((value - previous) / Math.abs(previous)) * 100;
const unitLabel = (unit) =>
  unit === "central" ? "Operación central" : "Operación regional";
// Synthetic fixtures only. Absolute dates make overlapping queries reproducible.
export function demoFacts(client, units, from, to) {
  const seed = [...client].reduce((n, c) => n + c.charCodeAt(0), 0);
  const rows = [];
  for (
    let timestamp = Date.parse(from);
    timestamp <= Date.parse(to);
    timestamp += day
  ) {
    const date = new Date(timestamp).toISOString().slice(0, 10);
    if (date < DEMO_PERIOD.from || date > DEMO_PERIOD.to) continue;
    const index = Math.floor(timestamp / day);
    for (const unit of units) {
      const scale = unit === "central" ? 1 : 0.68;
      const wave = 1 + Math.sin((index + seed) * 0.43) * 0.09;
      const revenue = Math.round(
        (390000 + (index % 7) * 17000 + (seed % 23) * 1300) * scale * wave,
      );
      const expense = Math.round(
        revenue * (0.64 + ((index + seed) % 5) * 0.013),
      );
      const compute = Math.round((6500 + (index % 11) * 170) * scale * wave);
      const storage = Math.round((2300 + (index % 5) * 95) * scale);
      const network = Math.round((1300 + (index % 7) * 110) * scale);
      const budget = Math.round(11200 * scale);
      const channels = ["Google Ads", "Meta Ads", "Email"].map((label, i) => {
        const impressions = Math.round(
          (1900 + i * 850 + (index % 9) * 105) * scale * wave,
        );
        const clicks = Math.round(impressions * [0.041, 0.026, 0.063][i]);
        const conversions = Math.floor(clicks * [0.075, 0.058, 0.11][i]);
        const spend = Math.round(clicks * [132, 94, 21][i]);
        return {
          label,
          impressions,
          clicks,
          conversions,
          spend,
          attributed: conversions * 3500,
        };
      });
      rows.push({
        date,
        unit: demoCurrencyUnit(unit),
        revenue,
        expense,
        compute,
        storage,
        network,
        budget,
        channels,
      });
    }
  }
  return rows;
}
function totals(module, facts) {
  if (module === "finance") {
    const revenue = sum(facts, "revenue"),
      expense = sum(facts, "expense");
    return [
      money(revenue),
      money(expense),
      money(revenue - expense),
      percent(revenue - expense, revenue),
    ];
  }
  if (module === "finops") {
    const cost =
      sum(facts, "compute") + sum(facts, "storage") + sum(facts, "network");
    const budget = sum(facts, "budget"),
      days = new Set(facts.map((f) => f.date)).size;
    return [
      money(cost),
      money(budget),
      percent(cost - budget, budget),
      days ? money(cost) / days : 0,
    ];
  }
  const channels = facts.flatMap((f) => f.channels),
    spend = sum(channels, "spend"),
    conversions = sum(channels, "conversions"),
    attributed = sum(channels, "attributed");
  return [
    money(spend),
    conversions,
    conversions ? money(spend) / conversions : 0,
    spend ? attributed / spend : 0,
  ];
}

export async function readDemo(module, scope) {
  const { client, units, filters } = scope;
  const facts = demoFacts(client, units, filters.from, filters.to);
  const count = (Date.parse(filters.to) - Date.parse(filters.from)) / day + 1;
  const previousTo = new Date(Date.parse(filters.from) - day)
    .toISOString()
    .slice(0, 10);
  const previousFrom = new Date(Date.parse(filters.from) - count * day)
    .toISOString()
    .slice(0, 10);
  const previous = demoFacts(client, units, previousFrom, previousTo);
  const values = totals(module, facts),
    before = totals(module, previous);
  const metrics = demoMetricDefinitions[module].map(
    ([id, label, unit, preferred], i) => ({
      id: `${module}_${id}`,
      label,
      unit: demoCurrencyUnit(unit),
      preferred,
      value: values[i],
      previous: before[i],
      variation:
        previous.length && facts.length ? delta(values[i], before[i]) : null,
    }),
  );
  const dates = [...new Set(facts.map((f) => f.date))];
  const histories = dates.map((date) =>
    totals(
      module,
      facts.filter((f) => f.date === date),
    ),
  );
  const chartMetrics = metrics.map((metric, i) => ({
    ...metric,
    history: histories.map((values) => values[i]),
  }));
  const series = dates.map((date) => {
    const daily = facts.filter((f) => f.date === date),
      total = totals(module, daily);
    const secondary =
      module === "marketing"
        ? money(
            sum(
              daily.flatMap((f) => f.channels),
              "attributed",
            ),
          )
        : total[1];
    return { date, value: total[0], secondary };
  });
  let rows;
  if (module === "finance")
    rows = units
      .filter((unit) => facts.some((f) => f.unit === unit))
      .map((unit) => {
        const [revenue, expense, result] = totals(
          module,
          facts.filter((f) => f.unit === unit),
        );
        return {
          id: unit,
          label: unitLabel(unit),
          value: revenue,
          secondary: expense,
          detail: result,
          status: result >= 0 ? "Positivo" : "Revisar",
        };
      });
  else if (module === "finops")
    rows = facts.length
      ? ["compute", "storage", "network"].map((key, i) => ({
          id: key,
          label: ["Compute", "Storage", "Network"][i],
          value: money(sum(facts, key)),
          secondary: null,
          detail: percent(sum(facts, key), Math.round(values[0] * 100)),
          status: "Monitorizado",
        }))
      : [];
  else
    rows = facts.length
      ? ["Google Ads", "Meta Ads", "Email"].map((label, i) => {
          const channels = facts
              .flatMap((f) => f.channels)
              .filter((c) => c.label === label),
            spend = sum(channels, "spend");
          return {
            id: `channel_${i}`,
            label,
            value: money(spend),
            secondary: sum(channels, "conversions"),
            detail: spend ? sum(channels, "attributed") / spend : 0,
            status: "Activo",
          };
        })
      : [];
  const insights =
    module === "finance"
      ? [
          {
            severity: "positive",
            title: "Resultado operativo positivo",
            text: `El resultado representa el ${values[3].toFixed(1)}% de los ingresos del período.`,
          },
          {
            severity: "info",
            title: "Costos bajo seguimiento",
            text: "Ingresos y gastos concilian con el detalle por unidad de negocio.",
          },
        ]
      : module === "finops"
        ? [
            {
              severity: values[2] > 0 ? "warning" : "positive",
              title:
                values[2] > 0
                  ? "Presupuesto superado"
                  : "Dentro del presupuesto",
              text: `El gasto está ${Math.abs(values[2]).toFixed(1)}% ${values[2] > 0 ? "por encima" : "por debajo"} del presupuesto diario acumulado.`,
            },
            {
              severity: "info",
              title: "Asignación completa",
              text: "Compute, Storage y Network representan el 100% del gasto cloud demo.",
            },
          ]
        : [
            {
              severity: values[3] < 2 ? "warning" : "positive",
              title: "Eficiencia de adquisición",
              text: `Cada USD invertido registra ${values[3].toFixed(2)} USD de ingresos atribuidos en el escenario demo.`,
            },
            {
              severity: "info",
              title: "Atribución de demostración",
              text: "Las conversiones se asignan una sola vez a su canal. No representan resultados reales.",
            },
          ];
  return {
    schemaVersion: "1.0",
    module,
    source: "mock",
    generatedAt: new Date().toISOString(),
    filters,
    metrics: chartMetrics,
    series,
    rows,
    insights: facts.length ? insights.map((i) => `${i.title}: ${i.text}`) : [],
    alerts: facts.length ? insights : [],
    comparison: { from: previousFrom, to: previousTo },
    seriesLabels:
      module === "finance"
        ? ["Ingresos", "Gastos"]
        : module === "finops"
          ? ["Gasto cloud", "Presupuesto"]
          : ["Inversión", "Ingresos atribuidos"],
    empty: !facts.length,
  };
}
