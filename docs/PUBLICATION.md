# Public publication boundary

Independent repository with no imported private Git history.

Allowed: selected synthetic aggregation modules, semantic catalogs, local tests, an offline report, documentation and validation tooling. Finance catalog provenance pointing to private implementation material was removed; its metric definitions remain intact. Copied module hashes are recorded in `PUBLIC_MODULES.json`.

Excluded: operational application code, real customer data, private identifiers/endpoints, environment files, credentials, sessions/authentication, database drivers, SQL migrations, bootstrap tools, logs, runtime configuration, deploy scripts and cloud bindings.

Generated `output/` stays untracked. No image assets were copied: the supplied screenshot identifies the destination repository and is not a dashboard asset.

Do not deploy these trusted local fixture helpers as an analytics service. Input validation, authorization and operational controls are outside this public sample. Future additions require explicit file review and validation.
