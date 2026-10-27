import catalog from "./catalog.json" with { type: "json" };
export const marketingCatalog = catalog;
export const marketingPages = Object.freeze([
  {
    "id": "overview",
    "label": "Resumen",
    "names": {
      "es": "Resumen",
      "en": "Overview"
    },
    "description": "Resumen: perspectiva especializada de adquisición y rendimiento comercial.",
    "metrics": [
      "marketing_investment",
      "marketing_attributed_revenue",
      "marketing_roas",
      "marketing_conversions",
      "marketing_leads",
      "marketing_cac"
    ],
    "primary": "marketing_investment",
    "secondary": "marketing_attributed_revenue",
    "unit": "CRC",
    "aggregation": "sum",
    "allocation": "platform",
    "detail": "campaign",
    "icon": "overview"
  },
  {
    "id": "traffic",
    "label": "Tráfico",
    "names": {
      "es": "Tráfico",
      "en": "Traffic"
    },
    "description": "Tráfico: perspectiva especializada de adquisición y rendimiento comercial.",
    "metrics": [
      "marketing_users",
      "marketing_sessions",
      "marketing_engaged_sessions",
      "marketing_engagement_rate",
      "marketing_organic_sessions",
      "marketing_traffic_conversion_rate"
    ],
    "primary": "marketing_sessions",
    "secondary": "marketing_engaged_sessions",
    "unit": "number",
    "aggregation": "sum",
    "allocation": "channel",
    "detail": "source",
    "icon": "traffic"
  },
  {
    "id": "campaigns",
    "label": "Campañas",
    "names": {
      "es": "Campañas",
      "en": "Campaigns"
    },
    "description": "Campañas: perspectiva especializada de adquisición y rendimiento comercial.",
    "metrics": [
      "marketing_impressions",
      "marketing_reach",
      "marketing_clicks",
      "marketing_ctr",
      "marketing_cpc",
      "marketing_cpm",
      "marketing_investment"
    ],
    "primary": "marketing_impressions",
    "secondary": "marketing_clicks",
    "unit": "number",
    "aggregation": "sum",
    "allocation": "platform",
    "detail": "campaign",
    "icon": "campaigns"
  },
  {
    "id": "leads",
    "label": "Leads y CRM",
    "names": {
      "es": "Leads y CRM",
      "en": "Leads & CRM"
    },
    "description": "Leads y CRM: perspectiva especializada de adquisición y rendimiento comercial.",
    "metrics": [
      "marketing_leads",
      "marketing_cpl",
      "marketing_qualified_leads",
      "marketing_opportunities",
      "marketing_lead_opportunity_rate",
      "marketing_won_deals",
      "marketing_pipeline_value",
      "marketing_win_rate"
    ],
    "primary": "marketing_leads",
    "secondary": "marketing_opportunities",
    "unit": "number",
    "aggregation": "sum",
    "allocation": "source",
    "detail": "campaign",
    "icon": "leads"
  },
  {
    "id": "conversions",
    "label": "Conversiones",
    "names": {
      "es": "Conversiones",
      "en": "Conversions"
    },
    "description": "Conversiones: perspectiva especializada de adquisición y rendimiento comercial.",
    "metrics": [
      "marketing_key_events",
      "marketing_conversion_rate",
      "marketing_cpa",
      "marketing_cac",
      "marketing_attributed_revenue",
      "marketing_roas",
      "marketing_assisted_conversions"
    ],
    "primary": "marketing_conversions",
    "secondary": "marketing_key_events",
    "unit": "number",
    "aggregation": "sum",
    "allocation": "platform",
    "detail": "channel",
    "icon": "conversions"
  },
  {
    "id": "audiences",
    "label": "Audiencias",
    "names": {
      "es": "Audiencias",
      "en": "Audiences"
    },
    "description": "Audiencias: perspectiva especializada de adquisición y rendimiento comercial.",
    "metrics": [
      "marketing_new_users",
      "marketing_returning_users",
      "marketing_new_user_share",
      "marketing_audience_engagement",
      "marketing_device_performance",
      "marketing_geography_users",
      "marketing_content_sessions"
    ],
    "primary": "marketing_new_users",
    "secondary": "marketing_returning_users",
    "unit": "number",
    "aggregation": "distinct",
    "allocation": "country",
    "detail": "content",
    "icon": "audiences"
  }
]);
