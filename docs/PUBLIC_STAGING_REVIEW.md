# Public Demonstrator — staging review and release gates

**Status:** PUBLIC BRANCH STAGING — NOT A RELEASE APPROVAL (2026-11-06)

## What this branch is

This is a **standalone, static, limited editorial demonstrator** deliberately assembled from an allowlisted subset of a separate development project. It is not a copy of a private Git repository or its version history. The demo is intended to let readers explore how selected research reports structure their questions, concepts, methods, evidence, claims and boundaries, and compare a small number of selected questions across works.

This repository is **public**. Files on its working branch are publicly readable even before any pull request is merged; “staging” does **not** mean confidential or unpublished. It is **not yet a GitHub Pages website**, and `main` has not been modified.

## Content and scope

- Five published bibliographic works; 48 inherited editorial Element identities; 45 within-work directional argument-representation relations.
- Three **analyst-selected Work comparisons**, four **analyst-selected cross-work Element comparisons**, arranged in two routes. These are **not** presented as verified direct-citation genealogies or proven transmission/replication.
- Three reader modes: Overview, Read through, Arguments & limits. The element-relationship graphic supports node selection, incident-only arrows, relationship inspector, reset and keyboard activation.
- The other 22 editorially provisioned works and 154 tentative Elements, full source PDFs, private source paths, unpublished ledgers and private audit overlay are **not** copied.
- There is **no private source file or publisher PDF** in this repository. The site links to publishers' DOI resolvers or the author's publication record.

## Evidence and rights boundary

1. Bibliographic identifiers and attributions were checked against publisher or repository records. Selected examples include:
   - https://doi.org/10.1037/0022-3514.84.2.377
   - https://doi.org/10.1016/j.jsp.2007.03.005
   - https://doi.org/10.1093/acprof:oso/9780195373585.003.0016
   - https://emmons.faculty.ucdavis.edu/publications/
   - https://doi.org/10.1080/02796015.2014.12087440
2. Publisher metadata verification **does not validate each editorial Element or argument relation**. Passage-level source editions, causal and statistical interpretations, cross-publication citation paths and embedded interpretation boundaries remain open review items.
3. A University of Stirling repository record for the 2014 *Nice Thinking!* article describes its deposited publisher PDF as under permanent embargo. This demo **does not host that PDF**: https://dspace.stir.ac.uk/handle/1893/24866
4. The separately authored code and editorial annotations are not automatically evidence of permission to redistribute third-party full texts. **No license has been selected** for repository content; copyright and reuse terms remain for the owner to determine.
5. The broad public-data token and field allowlist is a safety check against *known* paths/fields. It is **not an exhaustive privacy, defamation, originality, scholarship, attribution, or copyright audit**.

## Hold points before owner-approved publication

- [ ] Read and visually inspect the actual `index.html` in an ordinary browser at mobile and desktop sizes, including awkward arrow routing and state changes.
- [ ] Recheck representative Element statements and the four selected inter-Element comparisons against exact source version and page/section.
- [ ] Confirm no unsupported verified-citation or historical-influence claim and no accidental attribution of analyst interpretation to the source authors.
- [ ] Complete editorial copyright, license, quotation and attribution assessment; decide whether to publish the independent editorial text.
- [ ] Review generated HTML and `data.json` directly for unexpected names, metadata, paths or assertions.
- [ ] Review browser / keyboard QA results; note that automated tests do not certify usability, full accessibility or evidential accuracy.
- [ ] Approve the precise release candidate **before** merge to `main` or enabling GitHub Pages.
- [ ] After deployment is approved, confirm the public URL from an unauthenticated browser (not only repository access).

## Reproducibility and provenance

The test `python tests/public_staging_qa.py` checks fixed counts, known forbidden fields/paths, linked files, selected arrow filtering and browser reading modes. The public branch contains only the independent display and sanitized data needed for that test. There is no synchronization or remote dependency on the private development project.

### Known limitations

- Selected relations are editorial representations and do not claim graph completeness.
- A work's Element classification can differ from another analyst's segmentation; the minimum Element boundary has not been settled.
- Relationship-first Element ontology and first-class Relation modeling remain independent experimental possibilities.
- This front end does not host an academic replication, full original-source audit or user-contributed corrections backend.
- Passing test counts do not establish the correctness of all data, author intent or historical transmissions.
