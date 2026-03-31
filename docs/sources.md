# Research Sources — Civitas Layers / ExploreBarbizon

Last updated: 2026-03-31

This file is the canonical reference for approved research sources.
It is tied to the factual integrity policy in `brain/decisions.md`.

---

## Source Tiers

### Tier 1 — Primary institutional sources

These are authoritative. Claims from Tier 1 sources can be published directly,
with the source noted.

| Source | What it covers |
|---|---|
| Base Mérimée / POP | French heritage listings, listed building addresses, protection dates |
| Archives de Seine-et-Marne | Regional historical records, cadastral data, local documents |
| Gallica / BnF | Digitised books, periodicals, photographs, maps, archival documents |
| Musée d'Orsay collection | Painting records, artist attributions, acquisition histories |
| Musée des Peintres de Barbizon | Local artist records, exhibition history, place associations |
| ONF (Office national des forêts) | Forest trail data, protected zone boundaries, natural heritage |

### Tier 2 — Verified secondary sources

Acceptable when Tier 1 is unavailable. The named author and publication must be cited.

- Peer-reviewed academic publications
- Major exhibition catalogues from accredited institutions
- Established museum collection notes with named curators
- Documented scholarly attributions with traceable primary sources

### Tier 3 — Research starting points only

Useful for orientation and leads. Must be verified against Tier 1 or Tier 2
before any claim is published.

| Source | Notes |
|---|---|
| grappilles.fr | Valuable local archive — credited as research contribution, not primary authority |
| cpbarbizon.wordpress.com | Second site by the same author as grappilles.fr — same rules apply |
| Perplexity | Good for sourced research leads; citations must be traced to originals |
| GPT / Grok / Claude | Useful for orientation; never cite AI output as a source |
| Wikipedia | Useful for leads and context; never cite as primary source |
| Cirkwi / Balad'Nature / Decathlon Outdoor | Trail metadata and GPX files — verify coordinates against field observation |

---

## grappilles.fr — specific policy

grappilles.fr is the work of Luigi's father-in-law and represents years of local research.
It is formally credited on the platform and is a valuable starting point for many narratives.
- cpbarbizon.wordpress.com is a second site by the same author and is subject to identical policy

However:
- It is one person's research, not an institutional archive
- Claims must be cross-checked against Tier 1 sources before publication
- Where grappilles.fr is the only available source, this must be noted explicitly
  and the content flagged for future verification
- grappilles.fr is credited as "local historical research" in platform attribution,
  not as a primary authority

---

## Applying sources in practice

When drafting content in claude.ai:
1. Claude will flag any claim that needs source verification
2. Use Perplexity or Grok to find the Tier 1 record
3. If a Tier 1 source confirms: proceed to SQL generation
4. If unverifiable: either hold the content or note uncertainty in the editorial text

For geo_confidence on visual_work_locations:
- `exact` — requires a dated primary documentary source
- `approximate` — identifiable from a Tier 1 or Tier 2 record
- `interpretive` — inferred, no documentary source (note reasoning)
- `unknown` — no reliable basis; archived but not displayed as a map pin

---

## Attribution in platform copy

When platform text draws on a specific source, the source should be noted
in the `source` field of the relevant Supabase record, not necessarily in
the public-facing copy (unless it adds editorial value).

grappilles.fr is credited in the platform's About or colophon section.
```

---

After writing both files, commit with:
```
docs: rewrite AI operating system and sources policy

- Updated tool roles to reflect claude.ai → Claude Code → Cursor workflow
- Added Perplexity, Stitch, Grok to tool roster with clear role boundaries
- Introduced research source tier system (Tier 1/2/3)
- Clarified grappilles.fr policy: credited research starting point, not primary authority
- Removed Webflow references
- Added content validation rules alongside code validation

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>