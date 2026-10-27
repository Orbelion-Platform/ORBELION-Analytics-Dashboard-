# Evidence and limitations

Reviewed 2026-10-27. Public sample validation is separate from private runtime verification.

| Artifact | Evidence |
| --- | --- |
| `shared/finance/` | Synthetic Finance provider and 43 metric definitions |
| `shared/finops/` | Synthetic billing/telemetry engine and 32 definitions |
| `shared/marketing/` | Synthetic advertising/traffic/CRM engine and 36 definitions |
| `tests/analytics.test.mjs` | Representative reconciliation, ratios, distinct users, fixtures and calendar boundaries |
| `demo/report.mjs` | Generated HTML/JSON report of selected measures |
| `PUBLIC_MODULES.json` | SHA-256 manifest of curated analytical modules |

Run `npm test`, `npm run validate`, `npm run demo`. The validator checks a strict file allowlist, module hashes, selected sensitive patterns and relative Markdown links. It does not establish that arbitrary future text is safe; changes require review.

Provider names and conceptual schema fields describe synthetic scenarios, not working integrations. No production, provider-runtime or private authentication validation is claimed. Remote CI must be verified separately for the published commit.
