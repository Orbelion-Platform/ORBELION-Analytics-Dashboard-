import test from 'node:test';
import assert from 'node:assert/strict';
import {demoFacts} from '../shared/demo-data.mjs';
import {computeFinance,shiftFinanceRange} from '../shared/finance/provider.mjs';
import {financeCatalog,financePages} from '../shared/finance/registry.mjs';
import {domainModules} from '../shared/domains/registry.mjs';
import {finopsFacts,computeFinops,divide} from '../shared/finops/provider.mjs';
import {marketingFacts,computeMarketing} from '../shared/marketing/provider.mjs';
const from='2026-09-16',to='2026-10-15',units=['central','regional'];
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-7,`${a} != ${b}`);
test('Finance reconciles profit, weighted margins, distinct customers and additive units',()=>{
const {values:v,facts}=computeFinance('demo',units,from,to);
near(v.gross_profit,v.net_sales-v.cogs);near(v.operating_profit,v.net_sales-v.cogs-v.total_expenses);near(v.gross_margin,v.gross_profit/v.net_sales*100);near(v.avg_ticket,v.net_sales/v.transactions);
assert.equal(v.active_customers,new Set(facts.sales.map(r=>r.customer)).size);
near(v.net_sales,units.reduce((s,u)=>s+computeFinance('demo',[u],from,to).values.net_sales,0));
});
test('Overlapping date windows preserve deterministic synthetic facts',()=>{
const all=demoFacts('demo',units,from,to);assert.deepEqual(all,demoFacts('demo',units,from,to));assert.deepEqual(demoFacts('demo',units,'2026-10-01',to),all.filter(r=>r.date>='2026-10-01'));
});
test('FinOps allocation reconciles and CPU is weighted by observed hours',()=>{
const f=finopsFacts('demo',units,from,to),v=computeFinops(f,{from,to});
near(v.finops_cloud_cost,f.billing.reduce((s,r)=>s+r.cost_cents,0)/100);near(v.finops_cloud_cost,v.finops_assigned_cost+v.finops_unassigned_cost);near(v.finops_allocation_coverage,v.finops_assigned_cost/v.finops_cloud_cost*100);near(v.finops_cpu,f.telemetry.reduce((s,r)=>s+(r.cpu_percent??0)*r.observed_hours,0)/f.telemetry.reduce((s,r)=>s+r.observed_hours,0));
});
test('Marketing recomputes ROAS, CPA, distinct identities and valid funnel counts',()=>{
const f=marketingFacts('demo',units,from,to),v=computeMarketing(f,{from,to});near(v.marketing_roas,v.marketing_attributed_revenue/v.marketing_investment);near(v.marketing_cpa,v.marketing_investment/v.marketing_conversions);assert.equal(v.marketing_users,new Set(f.analytics.map(r=>r.user_id)).size);assert.equal(v.marketing_new_users+v.marketing_returning_users,v.marketing_users);for(const r of f.ads)assert.ok(r.conversions<=r.clicks&&r.clicks<=r.impressions);assert.equal(v.marketing_assisted_conversions,null);
});
test('Missing denominators stay null and out-of-range facts remain empty',()=>{
assert.equal(divide(1,0),null);const from='2027-01-01',to='2027-01-07';assert.deepEqual(demoFacts('demo',units,from,to),[]);const f=computeFinops(finopsFacts('demo',units,from,to),{from,to});assert.equal(f.finops_cloud_cost,0);assert.equal(f.finops_allocation_coverage,null);const m=computeMarketing(marketingFacts('demo',units,from,to),{from,to});assert.equal(m.marketing_investment,0);assert.equal(m.marketing_roas,null);
});
test('111 unique domain metric definitions cover 18 page definitions',()=>{
const domains=[{catalog:financeCatalog,pages:financePages},...Object.values(domainModules)];assert.deepEqual(domains.map(d=>d.catalog.metrics.length),[43,32,36]);const all=new Set();for(const {catalog,pages} of domains){assert.equal(pages.length,6);const ids=new Set(catalog.metrics.map(m=>m.id));assert.equal(ids.size,catalog.metrics.length);for(const id of ids){assert.ok(!all.has(id));all.add(id);}for(const p of pages)for(const id of p.metrics)assert.ok(ids.has(id));}for(const {catalog} of Object.values(domainModules))assert.equal(catalog.liveReady,false);
});
test('Calendar shifts preserve month ends including leap years',()=>{
assert.deepEqual(shiftFinanceRange('2026-03-01','2026-03-31',-1),{from:'2026-02-01',to:'2026-02-28'});assert.deepEqual(shiftFinanceRange('2024-03-01','2024-03-31',-1),{from:'2024-02-01',to:'2024-02-29'});
});
