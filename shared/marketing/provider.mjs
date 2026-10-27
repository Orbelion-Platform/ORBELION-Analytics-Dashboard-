import { demoFacts } from "../demo-data.mjs";
import { divide } from "../finops/provider.mjs";
const sum=(rows,key)=>rows.reduce((s,r)=>s+r[key],0);
const distinct=(rows,key)=>new Set(rows.map(r=>r[key])).size;
export function marketingFacts(client,units,from,to) {
 const ads=[],analytics=[],crm=[];
 for(const f of demoFacts(client,units,from,to)) {
  const day=Math.floor((Date.parse(f.date)-Date.parse("2026-01-01"))/86400000);
  for(const [i,c] of f.channels.entries()) {
   const campaign=["search","social","retargeting"][i],platform=i===0?"Google Ads":"Meta Ads";
   const common={date:f.date,unit:f.unit,client,campaign,platform,source:i===0?"google":"meta",channel:i===0?"paid_search":"paid_social"};
   const people=Array.from({length:60+i*20},(_,n)=>`${client}/${f.unit}/person/${(day*23+n*7+i*5)%5000}`);
   ads.push({...common,attribution_model:"last_touch_7d",touch_date:f.date,conversion_date:f.date,conversion_batch_id:`${client}/${f.unit}/${f.date}/${campaign}`,spend_cents:c.spend,impressions:c.impressions,clicks:c.clicks,conversions:c.conversions,attributed_revenue_cents:c.attributed,people});
   const pool=Math.min(1200,Math.max(3,day*3+3));
   const visitors=Array.from({length:Math.min(pool,8+i*3)},(_,n)=>n<2?pool-1-n:(day*7+n*11+i*5)%pool);
   for(const [j,n] of [...new Set(visitors)].entries()) {
    const sessions=2+(j%3),engaged=Math.max(1,sessions-1),country=["CR","MX","US"][n%3],device=["mobile","desktop","tablet"][n%3];
    analytics.push({...common,source:["google","meta","organic"][i],channel:["paid_search","paid_social","organic"][i],user_id:`${client}/${f.unit}/user/${n}`,first_seen:new Date(Date.parse("2026-01-01")+Math.floor(n/3)*86400000).toISOString().slice(0,10),sessions,engaged_sessions:engaged,sessions_with_key_event:j%5===0?1:0,key_events:j%5===0?2:0,country,device,content:["home","services","resources"][n%3]});
   }
   const count=Math.floor(c.clicks*0.05);
   for(let n=0;n<count;n++) {
    const lead_id=`${client}/${f.unit}/${f.date}/${campaign}/lead/${n}`;
    const dateAfter=d=>new Date(Date.parse(f.date)+d*86400000).toISOString().slice(0,10);
    crm.push({...common,lead_id,created_at:f.date,opportunity_id:n%3===1?lead_id+"/opportunity":null,won_at:n%3===1&&n%5!==0&&n%2===1?dateAfter(7):null,new_customer_id:n%3===1&&n%5!==0&&n%2===1?lead_id+"/new-customer":null,attributable:n%4!==0,qualified_at:n%3!==0?dateAfter(1):null,opened_at:n%3===1?dateAfter(3):null,closed_at:n%3===1&&n%5!==0?dateAfter(7):null,won:n%3===1&&n%5!==0&&n%2===1,value_cents:25000+(n%7)*3500,operations_cost_cents:25});
   }
  }
 }
 return {ads,analytics,crm};
}
export function computeMarketing(facts,{from,to,cutoff=to}={}) {
 const {ads,analytics,crm}=facts;
 const spend=sum(ads,"spend_cents")/100,revenue=sum(ads,"attributed_revenue_cents")/100,clicks=sum(ads,"clicks"),impressions=sum(ads,"impressions");
 const qualified=crm.filter(r=>r.qualified_at&&r.qualified_at<=cutoff),opps=crm.filter(r=>r.opened_at&&r.opened_at<=cutoff),closed=opps.filter(r=>r.closed_at&&r.closed_at<=cutoff),won=closed.filter(r=>r.won);
 const visitors=new Map(analytics.map(r=>[r.user_id,r.first_seen])),users=visitors.size,newUsers=[...visitors.values()].filter(date=>date>=from).length;
 const sessions=sum(analytics,"sessions"),engaged=sum(analytics,"engaged_sessions"),conversions=sum(ads,"conversions");
 const grouped=key=>[...new Set(analytics.map(r=>r[key]))].map(v=>analytics.filter(r=>r[key]===v));
 const result={investment:spend,attributed_revenue:revenue,roas:divide(revenue,spend),conversions,leads:distinct(crm,"lead_id"),cac:divide(spend+sum(crm,"operations_cost_cents")/100,won.length),users,sessions,engaged_sessions:engaged,engagement_rate:divide(engaged,sessions,100),organic_sessions:sum(analytics.filter(r=>r.channel==="organic"),"sessions"),traffic_conversion_rate:divide(sum(analytics,"sessions_with_key_event"),sessions,100),impressions,reach:new Set(ads.flatMap(r=>r.people)).size,clicks,ctr:divide(clicks,impressions,100),cpc:divide(spend,clicks),cpm:divide(spend,impressions,1000),cpl:divide(spend,distinct(crm.filter(r=>r.attributable),"lead_id")),qualified_leads:distinct(qualified,"lead_id"),opportunities:distinct(opps,"lead_id"),lead_opportunity_rate:divide(opps.length,crm.length,100),won_deals:won.length,pipeline_value:sum(opps.filter(r=>!r.closed_at||r.closed_at>cutoff),"value_cents")/100,win_rate:divide(won.length,closed.length,100),key_events:sum(analytics,"key_events"),conversion_rate:divide(conversions,clicks,100),cpa:divide(spend,conversions),assisted_conversions:null,new_users:newUsers,returning_users:users-newUsers,new_user_share:divide(newUsers,users,100),audience_engagement:divide(engaged,sessions,100),device_performance:analytics.length?Math.max(...grouped("device").map(rows=>divide(sum(rows,"engaged_sessions"),sum(rows,"sessions"),100))):null,geography_users:analytics.length?Math.max(...grouped("country").map(rows=>distinct(rows,"user_id"))):0,content_sessions:analytics.length?Math.max(...grouped("content").map(rows=>sum(rows,"sessions"))):0};
 return Object.fromEntries(Object.entries(result).map(([k,v])=>["marketing_"+k,v]));
}
export function filterMarketing(facts,predicate) {
 return Object.fromEntries(Object.entries(facts).map(([key,rows])=>[key,rows.filter(predicate)]));
}
