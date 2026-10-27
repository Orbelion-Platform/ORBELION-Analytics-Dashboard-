import { finopsCatalog, finopsPages } from "../finops/registry.mjs";
import { marketingCatalog, marketingPages } from "../marketing/registry.mjs";
export const domainModules = Object.freeze({
  finops: { catalog: finopsCatalog, pages: finopsPages },
  marketing: { catalog: marketingCatalog, pages: marketingPages },
});
export function readDashboardRoute(hash) {
  const [module, requested] = hash.replace(/^#/, "").split("/");
  if (module === "overview") return { module, page: "overview" };
  if (domainModules[module]) return { module, page: domainModules[module].pages.some(p => p.id === requested) ? requested : "overview" };
  return { module: "finance", page: requested ?? "overview" };
}
