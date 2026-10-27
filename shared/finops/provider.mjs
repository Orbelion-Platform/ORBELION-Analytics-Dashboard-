import { demoFacts } from "../demo-data.mjs";
const sum=(rows,key)=>rows.reduce((s,r)=>s+r[key],0);
export const divide=(a,b,scale=1)=>b===0?null:a/b*scale;
export function finopsFacts(client,units,from,to) {
 const billing=[],budgets=[],telemetry=[];
 for(const f of demoFacts(client,units,from,to)) {
  budgets.push({date:f.date,unit:f.unit,approved_cents:f.budget});
  for(const [service,total] of [["compute",f.compute],["storage",f.storage],["network",f.network]]) {
   let allocated=0;
   for(let i=0;i<3;i++) {
    const cost=i===2?total-allocated:Math.floor(total*[0.5,0.3][i]);allocated+=cost;
    const resource_id=`${client}/${f.unit}/${service}/${i}`;
    const realized=i===0, savings=realized?Math.round(cost*0.12):0;
    billing.push({date:f.date,client,unit:f.unit,resource_id,provider:["Azure","AWS","Google Cloud"][i],service,region:["us-west","us-east","europe"][i],cost_cents:cost,baseline_cents:cost+savings,realized,savings_cents:savings,potential_saving_cents:realized?0:Math.round(cost*(service==="compute"&&i===2?0.35:0.08)),project:i===2?null:["commerce","platform"][i],department:i===2?null:["product","operations"][i]});
    const tick=Math.floor(Date.parse(f.date)/86400000);
    if(service==="compute")telemetry.push({date:f.date,unit:f.unit,resource_id,service,cpu_percent:i===2?5:38+(tick%13)+i*14,memory_percent:i===2?12:49+(tick%9)+i*10,observed_hours:24,compute_hours:24,storage_gb:0,egress_gb:0,requests:1000+(tick%17)*50+i*200});
    if(service==="storage")telemetry.push({date:f.date,unit:f.unit,resource_id,service,cpu_percent:null,memory_percent:null,observed_hours:0,compute_hours:0,storage_gb:120+i*35+(tick%37),egress_gb:0,requests:0});
    if(service==="network")telemetry.push({date:f.date,unit:f.unit,resource_id,service,cpu_percent:null,memory_percent:null,observed_hours:0,compute_hours:0,storage_gb:0,egress_gb:4+i+(tick%5)/10,requests:0});
   }
  }
 }
 return {billing,budgets,telemetry};
}
export function computeFinops(facts,{from,to,priorCost=null}={}) {
 const {billing,budgets,telemetry}=facts, cost=sum(billing,"cost_cents")/100,budget=sum(budgets,"approved_cents")/100;
 const resourceIds=new Set(billing.map(r=>r.resource_id)),last=new Map();for(const r of telemetry)last.set(r.resource_id,r);
 const idle=new Set([...last.values()].filter(r=>r.cpu_percent!==null&&r.cpu_percent<10&&r.memory_percent<20).map(r=>r.resource_id));
 const groupMax=key=>{const map=new Map();for(const r of billing)map.set(r[key]??"unclassified",(map.get(r[key]??"unclassified")??0)+r.cost_cents);return map.size?Math.max(...map.values())/100:0;};
 const savings=sum(billing,"savings_cents")/100,assigned=sum(billing.filter(r=>r.project&&r.department),"cost_cents")/100;
 const days=new Set(billing.map(r=>r.date)).size;
 const remainingDays=to?new Date(Date.UTC(Number(to.slice(0,4)),Number(to.slice(5,7)),0)).getUTCDate()-Number(to.slice(8)):0;
 const hours=sum(telemetry,"observed_hours");
 const result={cloud_cost:cost,budget,savings,variance:divide(cost-budget,budget,100),forecast:days&&billing.at(-1)?.date===to?cost*(days+remainingDays)/days:null,monthly_variation:days===0||priorCost===null?null:divide(cost-priorCost,priorCost,100),provider_cost:groupMax("provider"),service_cost:groupMax("service"),resource_cost:groupMax("resource_id"),region_cost:groupMax("region"),avg_resource_cost:divide(cost,resourceIds.size),cpu:divide(telemetry.reduce((s,r)=>s+(r.cpu_percent??0)*r.observed_hours,0),hours),memory:divide(telemetry.reduce((s,r)=>s+(r.memory_percent??0)*r.observed_hours,0),hours),storage:sum([...last.values()],"storage_gb"),egress:sum(telemetry,"egress_gb"),compute_hours:sum(telemetry,"compute_hours"),requests:sum(telemetry,"requests"),remaining:budget-cost,utilization:divide(cost,budget,100),overrun:Math.max(cost-budget,0),idle_resources:idle.size,idle_cost:sum(billing.filter(r=>idle.has(r.resource_id)),"cost_cents")/100,saving_opportunities:sum(billing,"potential_saving_cents")/100,optimized_percent:divide(new Set(billing.filter(r=>r.realized).map(r=>r.resource_id)).size,resourceIds.size,100),reduction_percent:divide(savings,cost+savings,100),assigned_cost:assigned,unassigned_cost:cost-assigned,allocation_coverage:divide(assigned,cost,100),client_cost:cost,project_cost:groupMax("project"),department_cost:groupMax("department"),daily_cost:divide(cost,days)};
 void from;
 return Object.fromEntries(Object.entries(result).map(([k,v])=>["finops_"+k,v]));
}
export function filterFinops(facts,predicate) {
 const billing=facts.billing.filter(predicate),keys=new Set(billing.map(r=>r.date+"/"+r.resource_id));
 return {billing,budgets:facts.budgets.filter(predicate),telemetry:facts.telemetry.filter(r=>keys.has(r.date+"/"+r.resource_id))};
}
