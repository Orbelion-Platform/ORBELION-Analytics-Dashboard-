import { demoCurrencyUnit } from "../demo-currency.mjs";
import {
  financeCatalog,
  financePages,
  pendingFinanceMetrics,
} from "./registry.mjs";
const DAY = 86400000,
  START = "2025-01-01",
  END = "2026-12-31";
export const financeProducts = Array.from({ length: 12 }, (_, i) => ({
  id: `P${String(i + 1).padStart(3, "0")}`,
  label: [
    "Aurora",
    "Prisma",
    "Vector",
    "Nexo",
    "Órbita",
    "Lumen",
    "Atlas",
    "Cobalto",
    "Norte",
    "Pulso",
    "Nova",
    "Esfera",
  ][i],
  category: ["Tecnología", "Accesorios", "Hogar"][i % 3],
  cost: 1800 + i * 750,
  price: 4200 + i * 1350,
}));
const date = (t) => new Date(t).toISOString().slice(0, 10);
export function shiftFinanceRange(from, to, months) {
  const shift = (value) => {
    const d = new Date(value + "T00:00:00Z");
    const day = d.getUTCDate();
    d.setUTCDate(1);
    d.setUTCMonth(d.getUTCMonth() + months);
    const last = new Date(
      Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0),
    ).getUTCDate();
    d.setUTCDate(Math.min(day, last));
    return date(d.getTime());
  };
  const start = shift(from);
  let end = shift(to);
  const original = new Date(to + "T00:00:00Z");
  const isLast =
    original.getUTCDate() ===
    new Date(
      Date.UTC(original.getUTCFullYear(), original.getUTCMonth() + 1, 0),
    ).getUTCDate();
  if (isLast && Date.parse(to) - Date.parse(from) >= DAY) {
    const d = new Date(end + "T00:00:00Z");
    end = date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
  }
  return { from: start, to: end };
}
export function financeFacts(client, units, from, to) {
  const seed = [...client].reduce((n, c) => n + c.charCodeAt(0), 0);
  const sales = [],
    purchases = [],
    expenses = [],
    snapshots = [];
  for (
    let time = Math.max(Date.parse(from), Date.parse(START));
    time <= Math.min(Date.parse(to), Date.parse(END));
    time += DAY
  ) {
    const day = date(time),
      index = Math.floor((time - Date.parse(START)) / DAY),
      year = new Date(time).getUTCFullYear() - 2025;
    for (const unit of units) {
      const scale = unit === "central" ? 1 : 0.65;
      let dailySales = 0;
      for (const [i, p] of financeProducts.entries()) {
        const quantity = Math.max(
          1,
          Math.round(
            (3 + ((index + i + seed) % 7)) * (1 + year * 0.12) * scale,
          ),
        );
        const price = Math.round(p.price * (1 + year * 0.035));
        const unitCost = Math.round(p.cost * (1 + year * 0.025));
        const subtotal = quantity * price,
          discount = Math.round(subtotal * ((index + i) % 5) * 0.0125),
          total = subtotal - discount;
        sales.push({
          date: day,
          unit,
          product: p.id,
          label: p.label,
          category: p.category,
          customer: `C${(index + i * 3 + seed) % 31}`,
          transaction: `${day}-${unit}-${i % 6}`,
          quantity,
          subtotal,
          discount,
          total,
          cost: quantity * unitCost,
        });
        dailySales += total;
        const incoming = quantity + (index % 7 === 0 ? 6 : -1);
        const purchasedCost = Math.round(
          unitCost * (1 + (((index + i) % 5) - 2) * 0.005),
        );
        purchases.push({
          date: day,
          unit,
          product: p.id,
          category: p.category,
          supplier: `S${(index + i) % 7}`,
          transaction: `${day}-${unit}-${i % 4}`,
          quantity: incoming,
          amount: incoming * purchasedCost,
        });
        // Six extra units once a week offset six days with one fewer inbound unit.
        const stock = Math.round((230 + i * 13) * scale) + 6 - (index % 7);
        snapshots.push({
          date: day,
          unit,
          product: p.id,
          label: p.label,
          category: p.category,
          quantity: stock,
          incoming,
          outgoing: quantity,
          moved: incoming + quantity,
          cost: stock * unitCost,
          sale: stock * price,
        });
      }
      for (const [i, category] of [
        "Personal",
        "Servicios",
        "Logística",
        "Administración",
      ].entries())
        expenses.push({
          date: day,
          unit,
          category,
          id: `G-${day}-${unit}-${i}`,
          amount: Math.round(dailySales * [0.065, 0.025, 0.035, 0.018][i]),
        });
    }
  }
  return { sales, purchases, expenses, snapshots };
}
const sum = (rows, key) => rows.reduce((n, r) => n + r[key], 0),
  unique = (rows, key) => new Set(rows.map((r) => r[key])).size;
const divide = (a, b) => (b === 0 ? null : a / b);
function base(facts) {
  const net = sum(facts.sales, "total") / 100,
    cost = sum(facts.sales, "cost") / 100,
    gross = net - cost,
    expense = sum(facts.expenses, "amount") / 100,
    purchase = sum(facts.purchases, "amount") / 100;
  const last = facts.snapshots.at(-1)?.date,
    current = facts.snapshots.filter((r) => r.date === last);
  const stock = sum(current, "quantity"),
    invCost = sum(current, "cost") / 100,
    invSale = sum(current, "sale") / 100;
  return {
    net_sales: net,
    cogs: cost,
    gross_profit: gross,
    gross_margin: divide(gross * 100, net),
    total_expenses: expense,
    operating_profit: gross - expense,
    inventory_value: invCost,
    avg_ticket: divide(net, unique(facts.sales, "transaction")),
    sold_quantity: sum(facts.sales, "quantity"),
    active_customers: unique(facts.sales, "customer"),
    sold_products: unique(facts.sales, "product"),
    avg_sales_customer: divide(net, unique(facts.sales, "customer")),
    total_discount: sum(facts.sales, "discount") / 100,
    discount_rate: divide(
      sum(facts.sales, "discount") * 100,
      sum(facts.sales, "subtotal"),
    ),
    avg_price: divide(
      sum(facts.sales, "subtotal") / 100,
      sum(facts.sales, "quantity"),
    ),
    transactions: unique(facts.sales, "transaction"),
    avg_expense: divide(expense, unique(facts.expenses, "id")),
    expense_sales_ratio: divide(expense * 100, net),
    total_purchases: purchase,
    purchased_quantity: sum(facts.purchases, "quantity"),
    avg_purchase: divide(purchase, unique(facts.purchases, "transaction")),
    avg_unit_cost: divide(purchase, sum(facts.purchases, "quantity")),
    active_suppliers: unique(facts.purchases, "supplier"),
    purchased_products: unique(facts.purchases, "product"),
    moved_quantity: sum(facts.snapshots, "moved"),
    avg_inventory_cost: divide(invCost, stock),
    current_stock: stock,
    operating_in: sum(facts.snapshots, "incoming"),
    operating_out: sum(facts.snapshots, "outgoing"),
    inventory_cost: invCost,
    inventory_sale: invSale,
    inventory_cost_history: sum(facts.snapshots, "cost") / 100,
    inventory_sale_history: sum(facts.snapshots, "sale") / 100,
  };
}
export function computeFinance(client, units, from, to) {
  const facts = financeFacts(client, units, from, to),
    now = base(facts);
  const previous = shiftFinanceRange(from, to, -1),
    year = shiftFinanceRange(from, to, -12);
  const prev = base(financeFacts(client, units, previous.from, previous.to)),
    prevYear = base(financeFacts(client, units, year.from, year.to));
  const change = (a, b) => (b === 0 ? null : ((a - b) / Math.abs(b)) * 100);
  const values = {
    ...now,
    sales_prev_month: prev.net_sales,
    sales_prev_year: prevYear.net_sales,
    sales_change: change(now.net_sales, prev.net_sales),
    sales_growth: change(now.net_sales, prev.net_sales),
    expenses_prev_month: prev.total_expenses,
    expenses_change: change(now.total_expenses, prev.total_expenses),
    purchases_prev_month: prev.total_purchases,
    purchases_change: change(now.total_purchases, prev.total_purchases),
    sales_mtd: base(financeFacts(client, units, to.slice(0, 7) + "-01", to))
      .net_sales,
    sales_ytd: base(financeFacts(client, units, to.slice(0, 4) + "-01-01", to))
      .net_sales,
  };
  return { values, previous, prev, prevYear, facts };
}
export async function readFinancePage(pageId, scope) {
  const page = financePages.find((p) => p.id === pageId);
  if (!page) throw new Error("Unknown finance page");
  const { client, units, filters } = scope;
  const result = computeFinance(client, units, filters.from, filters.to),
    { values, facts } = result;
  const dates = [...new Set(facts.sales.map((r) => r.date))];
  const daily = dates.map((day) => ({
    date: day,
    values: base({
      sales: facts.sales.filter((r) => r.date === day),
      purchases: facts.purchases.filter((r) => r.date === day),
      expenses: facts.expenses.filter((r) => r.date === day),
      snapshots: facts.snapshots.filter((r) => r.date === day),
    }),
  }));
  const definitions = page.metrics.map((id) =>
    financeCatalog.metrics.find((m) => m.id === id),
  );
  const metrics = definitions.map((def) => ({
    id: def.id,
    label: def.label,
    unit: demoCurrencyUnit(def.unit),
    value: values[def.id],
    variation:
      result.prev[def.id] === undefined ||
      result.prev[def.id] === null ||
      result.prev[def.id] === 0 ||
      values[def.id] === null
        ? null
        : ((values[def.id] - result.prev[def.id]) /
            Math.abs(result.prev[def.id])) *
          100,
    preferred: [
      "cogs",
      "total_expenses",
      "avg_expense",
      "expense_sales_ratio",
    ].includes(def.id)
      ? "down"
      : "up",
    history: daily.map((d) => d.values[def.id] ?? null),
    status: def.status,
    formula: def.formula,
  }));
  const shiftDay = (day, months) => shiftFinanceRange(day, day, months).from;
  const series = daily.map((d) => ({
    date: d.date,
    value: d.values[page.primary] ?? 0,
    secondary:
      pageId === "expenses" || pageId === "purchases"
        ? (base(
            financeFacts(
              client,
              units,
              shiftDay(d.date, -1),
              shiftDay(d.date, -1),
            ),
          )[page.primary] ?? 0)
        : pageId === "insights"
          ? base(
              financeFacts(
                client,
                units,
                shiftDay(d.date, -12),
                shiftDay(d.date, -12),
              ),
            ).net_sales
          : (d.values[page.secondary] ?? 0),
  }));
  const sourceRows =
    pageId === "expenses"
      ? facts.expenses
      : pageId === "purchases"
        ? facts.purchases
        : pageId === "inventory"
          ? facts.snapshots.filter(
              (r) => r.date === facts.snapshots.at(-1)?.date,
            )
          : facts.sales;
  const rows = [...new Set(sourceRows.map((r) => r.category))].map(
    (label, i) => {
      const records = sourceRows.filter((r) => r.category === label);
      return {
        id: `category_${i}`,
        label,
        value:
          sum(
            records,
            pageId === "expenses" || pageId === "purchases"
              ? "amount"
              : pageId === "inventory"
                ? "cost"
                : "total",
          ) / 100,
        secondary:
          sum(
            records,
            pageId === "inventory"
              ? "quantity"
              : pageId === "expenses"
                ? "amount"
                : pageId === "purchases"
                  ? "quantity"
                  : "cost",
          ) /
          (pageId === "expenses" || !["inventory", "purchases"].includes(pageId)
            ? 100
            : 1),
        detail: records.length,
        status: "DEMO",
      };
    },
  );
  const contextMetrics = [
    "net_sales",
    "cogs",
    "operating_profit",
    "sold_quantity",
    "total_expenses",
    "purchased_quantity",
    "operating_in",
  ].map((id) => {
    const def = financeCatalog.metrics.find((m) => m.id === id);
    return {
      id,
      label: def.label,
      unit: demoCurrencyUnit(def.unit),
      value: values[id] ?? 0,
      variation: null,
      history: daily.map((d) => d.values[id] ?? 0),
    };
  });
  const tableRows = []; // Tables are aggregated below; raw customer records never leave this provider.
  for (const label of [...new Set(sourceRows.map((r) => r.category))]) {
    const records = sourceRows.filter((r) => r.category === label);
    tableRows.push({
      label,
      amount:
        sum(
          records,
          pageId === "expenses" || pageId === "purchases"
            ? "amount"
            : pageId === "inventory"
              ? "cost"
              : "total",
        ) / 100,
      quantity:
        pageId === "expenses" ? records.length : sum(records, "quantity"),
      aux:
        pageId === "inventory"
          ? sum(records, "sale") / 100
          : pageId === "expenses"
            ? divide(sum(records, "amount") / 100, records.length)
            : pageId === "purchases"
              ? divide(sum(records, "amount") / 100, sum(records, "quantity"))
              : (sum(records, "total") - sum(records, "cost")) / 100,
    });
  }
  return {
    schemaVersion: "1.0",
    module: "finance",
    page: pageId,
    source: "mock",
    generatedAt: new Date().toISOString(),
    filters,
    metrics,
    series,
    rows,
    insights: [],
    alerts: [],
    seriesLabels: page.seriesLabels,
    comparison: result.previous,
    empty: !dates.length,
    contextMetrics,
    tableRows,
    pending: pendingFinanceMetrics.filter((m) => m.page === pageId),
    coverage: { verified: 43, pending: pendingFinanceMetrics.length },
    chartTitle:
      pageId === "overview" || pageId === "sales"
        ? "Ventas y costo de ventas"
        : pageId === "expenses"
          ? "Evolución de gastos"
          : pageId === "purchases"
            ? "Evolución de compras"
            : pageId === "inventory"
              ? "Valoración del inventario"
              : "Ventas: actual vs año anterior",
  };
}
