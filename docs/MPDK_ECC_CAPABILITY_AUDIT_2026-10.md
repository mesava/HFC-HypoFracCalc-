# MPDK v0.1 — ECC capability inventory and adaptation (11 October 2026)

Upstream: https://github.com/affaan-m/ECC (MIT; upstream copyright must be preserved for copied portions).
Review method: inspected root layout, agents, skills, commands, rules, hooks, scripts, runtime adapters, upstream governance and installation architecture; directly read a targeted subset of upstream SKILL.md and policy files. **NOT a line-by-line review of all 311 skills, 71 agents and 97 commands**. Counts are upstream's stated live AGENTS.md values, not independently audited historical release metrics.

## Highest priority: adapt now (concept, not verbatim content)
| ECC source | MPDK equivalent | Rationale |
|---|---|---|
| scientific-thinking-literature-review, scientific-thinking-scholar-evaluation | scientific-review, evidence-curation | source/extraction vs independent fit verification |
| healthcare-eval-harness, healthcare-cdss-patterns | release-gate, independent-calculation | risk-oriented QA; adapt medicine examples to radiotherapy |
| change-impact, module-regression, verification-loop | regression-review | blast radius and runnable acceptance commands |
| tdd-workflow, ai-regression-testing, test-collaboration | regression-review + independent-calculation | test-first anchors and defect regression |
| architecture-decision-records, context-and-decisions, docs-governance | existing docs + MPDK decision notes | no duplicate status/ADR ledger |
| security-review, healthcare-phi-compliance | AGENTS.md privacy and security rules | prevent patient data, keys, and unsafe clinical outputs |
| skill-host-compat, skill-stocktake | project-scoped SKILL.md files | code-agent portability |

## Consider for v0.2–v1.0
| ECC source | Potential adaptation | Limitation |
|---|---|---|
| unified-memory, continuous-learning-v2 | version-controlled context handoffs | ECC memory runtime is a separate installation; no fake persistent ChatGPT hooks |
| gateguard, delivery-gate, release-approval-gate | deterministic scientific CI guards | existing hooks are harness-dependent; need GitHub-native enforcement |
| agent-eval, healthcare-eval-harness, eval-harness | masked/held-out validation harness for MP benchmarking | no patient data, no circular test oracle |
| scientific-db-pubmed-database, deep-research, iterative-retrieval | PubMed provenance/DOI lookup | source availability and access controls; citations independently checked |
| csharp-testing, dotnet-patterns | BioRT adapter | HFC is TypeScript, not C# |
| github-ops, opensource-pipeline, docs-governance | publication and reproducibility workflow | reuse existing GitHub workflow |

## Exclude by default
- Universal agent orchestration, execution loops, speculative self-healing and broad auto-modifying hooks: too much autonomy for clinical-science repositories without approval.
- Non-medical domain packs (trading, marketing, network devices, web animation, etc.): out of scope.
- Whole-repository ECC vendor runtime/plugin installation: unnecessary attack surface and configuration coupling.
- Literal reuse of healthcare CDSS dosage examples, HIPAA-specific legal claims or arbitrary 80% coverage as proof of clinical safety.
- Copying 311 skills into every project: conflicts with narrow, auditable policies.

## Design conclusions
1. Use stable human-readable AGENTS.md and portable local SKILL.md workflows.
2. Use separate deterministic executable checks for guardrails; never rely only on agent promises.
3. Science must be traceable and independently testable with explicit model/clinical validation levels.
4. GitHub CI checks presence of evidence/tests, NOT their scientific truth.
5. MPDK is an independent project inspired by ECC, not affiliated with or endorsed by ECC.
6. No ECC source text is vendored in this pilot; ideas adapted and upstream linked.

## Outstanding ECC audit scope
Inspect all relevant nested references, hooks runtime implementation, installation threat model, licensing of individual contributed skills, CI proofs, benchmark quality and change history before any direct reuse or broad production rollout. Continue the inventory by category rather than claim exhaustive verification.

