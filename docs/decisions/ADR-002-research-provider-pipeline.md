# ADR-002: Research provider pipeline

- Date: 2026-11-17
- Status: Accepted
- Scope: Living Atlas project research workflow only

## Decision

Use a complementary research pipeline:
- **RAG Atlas:** pinned, locally indexed engineering references.
- **Context7:** current version-sensitive library and framework documentation.
- **Exa:** semantic web discovery and broad source search.
- **Firecrawl:** targeted scraping, crawling, structured extraction, and developer-source search.
- **TinyFish:** JavaScript-rendered pages, interactive browser extraction, and cross-checks when browser behavior matters.

Do not use Parallel in future Living Atlas research tasks. Its general web-discovery role is redundant with Exa for this workflow.

## Operating rule

Do not call every provider mechanically. Select the smallest combination that adds distinct evidence. Exa discovers; Firecrawl extracts/crawls; TinyFish handles dynamic/interactive pages or a meaningful independent check. Cite primary sources and preserve source provenance.

## Consequences

- Fewer overlapping search calls and less duplicated output.
- Clear division of responsibility between discovery, scraping, browser interaction, local RAG, and current documentation.
- Historical use of Parallel in the initial research session remains in the research log for provenance; it is not a future dependency.

## Related non-negotiables

This decision does not alter product constraints: no API keys, no hosted AI/LLM, deterministic authored NPC logic, no required backend, local-first persistence, standalone project, original IP, low-end hardware target, localhost visual QA, and no unapproved destructive or remote actions.
