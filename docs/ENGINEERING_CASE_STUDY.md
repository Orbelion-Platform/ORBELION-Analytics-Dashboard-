# Engineering case study

## Problem

Financial performance, cloud operations and acquisition metrics have incompatible grains and denominators. A consistent visual interface can hide misleading sums of percentages, snapshots treated as flows or marketing attribution double counted as Finance revenue.

## Approach

Separate domain facts, semantic catalogs and presentation. Finance retains transaction and inventory semantics. FinOps separates billed costs, budgets and telemetry. Marketing separates advertising, traffic identities and CRM lifecycle events. The public package keeps these analytical distinctions executable without operational infrastructure.

| Failure mode | Synthetic behavior | Verification |
| --- | --- | --- |
| Cost allocation does not reconcile | Assigned plus unassigned cost equals billed cost | FinOps test |
| Average percentages distort results | Ratios use aggregate numerators and denominators | Finance and Marketing tests |
| Usage averages ignore observation duration | CPU is weighted by observed hours | FinOps test |
| Daily user sums inflate audience | Distinct synthetic identities over the interval | Marketing test |
| Filter changes regenerate facts | Absolute dates preserve overlapping values | Determinism test |
| Month shifts overflow February | Calendar-aware month ends | Leap-year test |
| Missing data looks like activity | Empty facts outside fixtures; undefined specialized ratios return null | Empty-scenario test |

## Tradeoffs and limits

Monetary base facts use integer cents, but aggregates and ratios use JavaScript numbers. This public engine does not guarantee arbitrary decimal precision or behavior beyond fixture scale. Specialized FinOps/Marketing division without a denominator returns null; historical overview helpers retain some zero defaults. There is no universal missing-data policy across every helper.

Finance comparisons shift calendar months; historical overview helpers use an equal-duration previous interval. FinOps forecast is a simple synthetic projection. Assisted conversions remain unavailable. Catalog definitions describe intended semantics; representative tests do not independently validate every formula.

These are trusted local helpers. Inputs are not a service security boundary: customer IDs do not establish authorization, and arbitrary dates or unbounded ranges require validation in a real API. Actual hosting, tenant isolation, identity, permissions, observability, provider mappings and deployment recovery need separate runtime evidence.

## Outcome

A reviewer can calculate three analytical domains from deterministic fictional facts, inspect the catalogs and verify representative invariants locally. No customer results, production SLA or commercial impact is claimed.
