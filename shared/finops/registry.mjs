import catalog from "./catalog.json" with { type: "json" };
export const finopsCatalog = catalog;
export const finopsPages = Object.freeze([
  {
    "id": "overview",
    "label": "Resumen",
    "names": {
      "es": "Resumen",
      "en": "Overview"
    },
    "description": "Resumen: perspectiva especializada de eficiencia y gobierno cloud.",
    "metrics": [
      "finops_cloud_cost",
      "finops_budget",
      "finops_savings",
      "finops_variance",
      "finops_forecast",
      "finops_monthly_variation"
    ],
    "primary": "finops_cloud_cost",
    "secondary": "finops_budget",
    "unit": "CRC",
    "aggregation": "sum",
    "allocation": "provider",
    "detail": "service",
    "icon": "overview"
  },
  {
    "id": "costs",
    "label": "Costos",
    "names": {
      "es": "Costos",
      "en": "Costs"
    },
    "description": "Costos: perspectiva especializada de eficiencia y gobierno cloud.",
    "metrics": [
      "finops_provider_cost",
      "finops_service_cost",
      "finops_resource_cost",
      "finops_region_cost",
      "finops_monthly_variation",
      "finops_avg_resource_cost"
    ],
    "primary": "finops_cloud_cost",
    "secondary": "finops_budget",
    "unit": "CRC",
    "aggregation": "sum",
    "allocation": "region",
    "detail": "resource",
    "icon": "costs"
  },
  {
    "id": "usage",
    "label": "Consumo",
    "names": {
      "es": "Consumo",
      "en": "Usage"
    },
    "description": "Consumo: perspectiva especializada de eficiencia y gobierno cloud.",
    "metrics": [
      "finops_cpu",
      "finops_memory",
      "finops_storage",
      "finops_egress",
      "finops_compute_hours",
      "finops_requests"
    ],
    "primary": "finops_cpu",
    "secondary": "finops_memory",
    "unit": "percent",
    "aggregation": "weighted_mean",
    "allocation": "service",
    "detail": "resource",
    "icon": "usage"
  },
  {
    "id": "budgets",
    "label": "Presupuestos",
    "names": {
      "es": "Presupuestos",
      "en": "Budgets"
    },
    "description": "Presupuestos: perspectiva especializada de eficiencia y gobierno cloud.",
    "metrics": [
      "finops_budget",
      "finops_cloud_cost",
      "finops_remaining",
      "finops_utilization",
      "finops_forecast",
      "finops_overrun"
    ],
    "primary": "finops_cloud_cost",
    "secondary": "finops_budget",
    "unit": "CRC",
    "aggregation": "cumulative",
    "allocation": "unit",
    "detail": "unit",
    "icon": "budgets"
  },
  {
    "id": "optimization",
    "label": "Optimización",
    "names": {
      "es": "Optimización",
      "en": "Optimization"
    },
    "description": "Optimización: perspectiva especializada de eficiencia y gobierno cloud.",
    "metrics": [
      "finops_idle_resources",
      "finops_idle_cost",
      "finops_saving_opportunities",
      "finops_savings",
      "finops_optimized_percent",
      "finops_reduction_percent"
    ],
    "primary": "finops_savings",
    "secondary": "finops_saving_opportunities",
    "unit": "CRC",
    "aggregation": "sum",
    "allocation": "service",
    "detail": "resource",
    "icon": "optimization"
  },
  {
    "id": "allocation",
    "label": "Asignación",
    "names": {
      "es": "Asignación",
      "en": "Allocation"
    },
    "description": "Asignación: perspectiva especializada de eficiencia y gobierno cloud.",
    "metrics": [
      "finops_assigned_cost",
      "finops_unassigned_cost",
      "finops_allocation_coverage",
      "finops_client_cost",
      "finops_project_cost",
      "finops_department_cost"
    ],
    "primary": "finops_assigned_cost",
    "secondary": "finops_unassigned_cost",
    "unit": "CRC",
    "aggregation": "sum",
    "allocation": "department",
    "detail": "project",
    "icon": "allocation"
  }
]);
