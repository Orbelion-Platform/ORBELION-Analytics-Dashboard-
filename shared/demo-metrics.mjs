import { domainModules } from "./domains/registry.mjs";
export const demoMetricDefinitions = {
  finance: [
    ["revenue", "Ingresos", "CRC", "up"],
    ["expense", "Gastos operativos", "CRC", "down"],
    ["result", "Resultado operativo", "CRC", "up"],
    ["margin", "Margen operativo", "percent", "up"],
  ],
  // Legacy four-measure endpoints retain their order and IDs.
  ...Object.fromEntries(Object.entries({finops:["cloud_cost","budget","variance","daily_cost"],marketing:["investment","conversions","cpa","roas"]}).map(([module,ids])=>[module,ids.map(id=>{
    const m=domainModules[module].catalog.metrics.find(m=>m.id===module+"_"+id);
    return [id,m.label,m.unit,m.preferred];
  })])),
};
