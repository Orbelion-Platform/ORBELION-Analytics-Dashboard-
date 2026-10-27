# Public publication boundary

Independent repository with no imported private Git history.

Allowed: selected synthetic aggregation modules, semantic catalogs, local tests, an offline report, documentation and validation tooling. Finance catalog provenance pointing to private implementation material was removed; its metric definitions remain intact. Copied module hashes are recorded in `PUBLIC_MODULES.json`.

Excluded: operational application code, real customer data, private identifiers/endpoints, environment files, credentials, sessions/authentication, database drivers, SQL migrations, bootstrap tools, logs, runtime configuration, deploy scripts and cloud bindings.

Generated `output/` stays untracked. Four user-supplied PNGs in `docs/Assets/` are explicitly approved visual evidence and remain unmodified. Their exact hashes are recorded in `PUBLIC_ASSETS.json`. Dashboard images show synthetic DEMO data; the workflow provides architectural context.

Do not deploy these trusted local fixture helpers as an analytics service. Input validation, authorization and operational controls are outside this public sample. Future additions require explicit file review and validation.
