#!/usr/bin/env python3
"""Public staging smoke + constrained-data checks. NOT a scholarly or rights certification."""
from pathlib import Path
import json,re
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/"data.json").read_text(encoding="utf-8"))
html=(ROOT/"index.html").read_text(encoding="utf-8")
js=(ROOT/"app.js").read_text(encoding="utf-8")
css=(ROOT/"styles.css").read_text(encoding="utf-8")
assert data["release_status"]=="PUBLIC_STAGING_DRAFT_PENDING_OWNER_RELEASE_APPROVAL"
assert data["schema"]=="SCHOLARLY_WORK_EXPLORER_PUBLIC_D2_v0.1"
assert len(data["works"])==5
assert sum(len(w["elements"]) for w in data["works"])==48
assert len(data["element_maps"]["within_work"]["edges"])==45
assert len(data["element_trails"]["edges"])==4
assert len(data["relations"])==3
assert all(w["source_url"].startswith(("https://doi.org/","https://emmons.faculty.ucdavis.edu/publications/")) for w in data["works"])
assert all(w["reading"]["overview"] and w["reading"]["reading"] and w["reading"]["arguments"] for w in data["works"])
assert all(w["elements"] for w in data["works"])
assert '<script src="app.js"></script>' in html
assert '<script><script' not in html
assert '<link rel="stylesheet" href="styles.css">' in html
assert "<script type=\"application/json\" id=\"publicData\">" in html
assert len(re.findall(r'<script',html))==2
assert len(re.findall(r'</script>',html))==2
assert "filtered-out" in js and "graph-show-all" in js and "orthogonal-clearance-v1" in js
for content in (html,js,css,(ROOT/"data.json").read_text(encoding="utf-8")):
 for forbidden in ("source-pdfs/","github.com/jooyeolkim1990","work/element-lineage-20261029",
  "github_blob_sha","/mnt/data/","file:///","audit_overlay","source_reference",
  "private-repo","R3_EVIDENCE_TRACES","prior audit finding","earlier audit"):
  assert forbidden.casefold() not in content.casefold(),forbidden
assert set(p.name for p in ROOT.iterdir() if p.is_file())=={"index.html","app.js","styles.css","data.json","README.md"}, "Unexpected root artifact"
print("Staging allowlist and privacy-token checks: PASS")
count=0
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 for width in (390,800,1365):
  page=browser.new_page(viewport={"width":width,"height":850})
  errors=[]
  page.on("pageerror",lambda exc:errors.append(str(exc)))
  page.goto((ROOT/"index.html").as_uri())
  assert not errors,errors;count+=1
  assert page.locator("#steps button").count()==5;count+=1
  assert page.locator("#demo-graphs").count()==1;count+=1
  assert page.locator("#research-graph .graph-node").count()==5;count+=1
  assert page.locator("#research-graph .graph-edge").count()==3;count+=1
  assert page.locator("#research-graph").get_attribute("data-routing")=="orthogonal-clearance-v1";count+=1
  page.locator('[data-graph-node="GR-2008-ADOLESCENTS"]').click()
  assert page.locator("#graph-show-all").is_enabled();count+=1
  assert page.locator("#research-graph .graph-edge:not(.filtered-out)").count()==2;count+=1
  page.locator("#graph-show-all").click()
  assert page.locator("#research-graph .graph-edge:not(.filtered-out)").count()==3;count+=1
  page.locator('[data-graph-mode="elements"]').click()
  assert page.locator("#research-graph .graph-node").count()==12;count+=1
  assert page.locator("#research-graph .graph-edge").count()==13;count+=1
  page.locator('[data-graph-node="GR-2003-COUNTING:M01"]').click()
  assert page.locator("#research-graph .graph-edge:not(.filtered-out)").count()==5;count+=1
  page.locator("#graph-show-all").click()
  assert page.locator("#research-graph .graph-edge:not(.filtered-out)").count()==13;count+=1
  page.locator('[data-graph-mode="trails"]').click()
  assert page.locator("#research-graph .graph-node").count()==5;count+=1
  assert page.locator("#research-graph .graph-edge").count()==4;count+=1
  page.locator('[data-graph-node="GR-2011-12-WELLBEING:C02"]').focus()
  page.keyboard.press("Enter")
  assert page.locator("#research-graph .graph-edge:not(.filtered-out)").count()==2;count+=1
  page.locator("#graph-show-all").click()
  assert page.locator("#research-graph .graph-edge:not(.filtered-out)").count()==4;count+=1
  page.locator("#steps button").nth(1).click()
  assert "Early Adolescents" in page.locator("#workTitle").inner_text();count+=1
  page.locator('button[data-mode="reading"]').click()
  assert page.locator("#sections .section-card").count()>0;count+=1
  page.locator('button[data-mode="arguments"]').click()
  assert page.locator("#sections .section-card").count()>0;count+=1
  assert page.locator("#demo-trails .demo-lane").count()==2;count+=1
  assert page.locator("body").evaluate("(e)=>e.scrollWidth<=document.documentElement.clientWidth+4"),width;count+=1
  assert not errors,errors;count+=1
  page.close()
 browser.close()
print(f"Staging Chrome regression: {count}/{count} PASS")
