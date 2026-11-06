(()=>{
"use strict";
const DATA=JSON.parse(document.getElementById("publicData").textContent);
const $=id=>document.getElementById(id);
let index=0,mode="overview";
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x}
function line(parent,tag,cls,text){const x=el(tag,cls,text);parent.append(x);return x}
function renderSteps(){
 $("steps").replaceChildren();
 DATA.works.forEach((w,i)=>{const b=el("button");b.type="button";b.dataset.work=w.id;b.setAttribute("aria-current",String(index===i));b.append(el("strong",null,w.year+" · "+w.title),el("small",null,"Read this work"));b.addEventListener("click",()=>{index=i;mode="overview";render()});$("steps").append(b)});
}
function renderElements(){
 const holder=document.getElementById("elements");if(!holder)return;
 const w=DATA.works[index];holder.replaceChildren();
 holder.append(el("h3",null,"Research elements · "+w.elements.length));
 holder.append(el("p","muted","Original registered IDs retained; new D2 Elements are editorial derivatives. Source-level approval remains pending."));
 for(const x of w.elements){
  const d=el("details","element-detail");
  d.append(el("summary",null,x.type+" · "+x.title),el("p",null,x.summary),el("small",null,"Locator: "+x.locator+" · "+x.status));
  if(x.review_layers){
   const layers=x.review_layers;
   const box=el("div","review-layers");
   const fields=[["Earlier source account",layers.source_account],["Earlier evidence account",layers.evidence_account],["Editorial audit assessment",layers.audit_assessment],["Unresolved source check",layers.unresolved_check]];
   for(const [label,value] of fields){
    const group=el("div","review-layer");
    group.append(el("strong",null,label),el("p",null,value===null?"Not independently separated in the available earlier summary.":value));
    box.append(group);
   }
   box.append(el("small",null,"Prior review status: "+layers.source_review_status+" · No fresh primary-source verification or publication approval."));
   d.append(box);
  }
  holder.append(d);
 }
}
function renderSections(){
 const rows=DATA.works[index].reading[mode];
 const holder=$("sections");holder.replaceChildren();
 for(const b of rows){
  const article=line(holder,"article","section-card");
  if(b.label)line(article,"div","label",b.label);
  if(b.locator)line(article,"div","locator","Source locator: "+b.locator);
  line(article,"h3",null,b.heading||b.title);
  line(article,"p",null,b.summary||b.description);
 }
 document.querySelectorAll(".tabs button").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.mode===mode)));
}
function render(){
 const w=DATA.works[index];
 $("workYear").textContent=w.year;
 $("workTitle").textContent=w.title;
 $("workAuthors").textContent=w.authors;
 $("workVenue").textContent=w.venue;
 $("workDoi").href=w.source_url||"#";
 $("workDoi").hidden=!w.source_url;
 $("sourceNote").textContent=w.source_note;
 $("prev").disabled=index===0;$("next").disabled=index===DATA.works.length-1;
 renderSteps();renderSections();renderElements();
}
function renderEdges(){
 const root=$("connections");root.replaceChildren();
 for(const edge of DATA.relations){
  const div=line(root,"article","edge");
  const a=DATA.works.find(x=>x.id===edge.from),b=DATA.works.find(x=>x.id===edge.to);
  line(div,"strong",null,a.year+" → "+b.year+" · "+edge.label);
  line(div,"p",null,edge.status);
  const btn=line(div,"button",null,"Open later work");btn.type="button";btn.addEventListener("click",()=>{index=DATA.works.indexOf(b);mode="overview";render();$("workTitle").scrollIntoView({block:"start",behavior:"auto"})});
 }
}
document.querySelectorAll(".tabs button").forEach(b=>b.addEventListener("click",()=>{mode=b.dataset.mode;renderSections()}));
$("prev").addEventListener("click",()=>{if(index>0){index--;mode="overview";render()}});
$("next").addEventListener("click",()=>{if(index<DATA.works.length-1){index++;mode="overview";render()}});
$("disclaimer").textContent=DATA.disclaimer;
render();renderEdges();
})();

/* Separate editorial Element-trail view. No modification of the original D2 reader. */
(()=>{
"use strict";
const DATA=JSON.parse(document.getElementById("publicData").textContent);
const trails=DATA.element_trails;
if(!trails || trails.schema!=="EXPLORER_PUBLIC_ELEMENT_TRAILS_PREVIEW_v0.1")return;
const works=new Map(DATA.works.map(w=>[w.id,w]));
const elements=new Map(DATA.works.flatMap(w=>w.elements.map(e=>[e.id,{...e,work:w}])));
const edges=new Map(trails.edges.map(e=>[e.id,e]));
const main=document.getElementById("reader");
const connections=document.getElementById("connections")?.closest("aside");
if(!main||!connections)throw Error("Missing D2 reader structure");
const section=document.createElement("section");
section.className="demo-trails";section.id="demo-trails";section.setAttribute("aria-label","Selected Element relationships");
const head=document.createElement("h2");head.textContent="Explore selected intellectual relationships";section.append(head);
const notice=document.createElement("p");notice.className="demo-intro";notice.textContent=trails.notice;section.append(notice);
const inspector=document.createElement("div");inspector.className="demo-inspector";inspector.id="demo-trail-inspector";inspector.setAttribute("aria-live","polite");
const el=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=String(txt);return e};
function pick(button,selector){
 section.querySelectorAll(selector).forEach(x=>x.setAttribute("aria-pressed",String(x===button)));
}
function field(name,value){
 const p=el("p"),strong=el("strong",null,name+": ");
 p.append(strong,document.createTextNode(value||"Not established"));inspector.append(p);
}
function inspectElement(id,button){
 const e=elements.get(id);if(!e)throw Error("Unknown Element "+id);
 pick(button,".demo-node");
 inspector.replaceChildren();
 inspector.append(el("h3",null,"Selected Element"));
 field("Identity",id);
 field("Work",e.work.year+" · "+e.work.title);
 field("Type and title",e.type+" · "+e.title);
 field("Editorial summary",e.summary);
 field("Reported locator",e.locator);
 field("Evidence status",e.status);
 field("Boundary","This is an inherited editorial representation, not a new original-source re-audit.");
 const open=el("button",null,"Read this work in the existing D2 reader");
 open.type="button";
 open.addEventListener("click",()=>{
  const btn=[...document.querySelectorAll("#steps button")].find(b=>b.dataset.work===e.work.id);
  if(!btn)throw Error("Work missing in existing reader "+e.work.id);
  btn.click();
  document.getElementById("workTitle").scrollIntoView({block:"start",behavior:"auto"});
 });inspector.append(open);
}
function inspectEdge(id,button){
 const edge=edges.get(id);if(!edge)throw Error("Unknown relation "+id);
 pick(button,".demo-edge");
 const from=elements.get(edge.from),to=elements.get(edge.to);
 if(!from||!to)throw Error("Unresolved endpoints "+id);
 inspector.replaceChildren();
 inspector.append(el("h3",null,"Selected relation · "+id));
 field("Connection",from.title+" → "+to.title);
 field("Relation function",edge.function);
 field("Evidence classification",edge.evidence_state);
 field("Public source anchors",edge.source_hint);
 field("Interpretation boundary",edge.caution);
 const a=el("button",null,"Read earlier work"),b=el("button",null,"Read later work");
 for(const [btn,work] of [[a,from.work],[b,to.work]]){
  btn.type="button";
  btn.addEventListener("click",()=>{
   const workButton=[...document.querySelectorAll("#steps button")].find(x=>x.dataset.work===work.id);
   if(!workButton)throw Error("Missing work "+work.id);
   workButton.click();
   document.getElementById("workTitle").scrollIntoView({block:"start",behavior:"auto"});
  });
  inspector.append(btn);
 }
}
for(const lane of trails.lanes){
 const part=el("div","demo-lane");
 part.append(el("h3",null,lane.title),el("p",null,lane.description));
 const nodes=el("div","demo-nodes");
 for(const id of lane.node_ids){
  const e=elements.get(id);if(!e)throw Error("Trail element not in D2 "+id);
  const b=el("button","demo-node",e.work.year+" · "+e.title);
  b.type="button";b.dataset.element=id;b.setAttribute("aria-pressed","false");
  b.addEventListener("click",()=>inspectElement(id,b));nodes.append(b);
 }
 part.append(nodes);
 const links=el("div","demo-links");
 for(const id of lane.relation_ids){
  const rel=edges.get(id);if(!rel)throw Error("Missing trail edge "+id);
  const b=el("button","demo-edge","↗ "+rel.label);
  b.type="button";b.dataset.relation=id;b.setAttribute("aria-pressed","false");
  b.addEventListener("click",()=>inspectEdge(id,b));links.append(b);
 }
 part.append(links);section.append(part);
}
section.append(inspector);
section.append(el("p","demo-caution","Public staging prototype. The route shows selected cross-study intellectual comparisons, not a proven citation genealogy or causal influence. Original paper and rights review must precede publication."));
connections.after(section);
const first=section.querySelector(".demo-edge");
if(first)inspectEdge(first.dataset.relation,first);
})();

/* Read-only SVG maps for the D2 preview, derived exclusively from allowlisted diagram records. */
(()=>{
"use strict";
const DATA=JSON.parse(document.getElementById("publicData").textContent);
const map=DATA.element_maps;
if(!map || map.schema!=="EXPLORER_D2_SELECTED_DIAGRAMS_v0.1")return;
const trails=DATA.element_trails;
const byWork=new Map(DATA.works.map(w=>[w.id,w]));
const byElement=new Map(DATA.works.flatMap(w=>w.elements.map(e=>[e.id,{...e,work:w}])));
const trailEdges=new Map(trails.edges.map(e=>[e.id,e]));
const intraworkEdges=new Map(map.within_work.edges.map(e=>[e.id,e]));
const ns="http://www.w3.org/2000/svg";
const make=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=String(text);return x};
const svg=(tag,attrs={},text)=>{
 const x=document.createElementNS(ns,tag);
 for(const [k,v] of Object.entries(attrs))x.setAttribute(k,String(v));
 if(text!==undefined)x.textContent=String(text);
 return x;
};
const main=document.getElementById("reader"),aside=document.getElementById("connections")?.closest("aside");
if(!main||!aside)throw Error("Reader layout missing for graphical maps");
const section=make("section","demo-graph-section");
section.id="demo-graphs";
section.append(make("h2",null,"Research maps · interactive graph explorer"));
section.append(make("p","graph-disclosure",map.notice));
const controls=make("div","graph-controls");
const tabs=make("div","graph-tabs");
tabs.setAttribute("role","tablist");tabs.setAttribute("aria-label","Graph type");
const modes=[
 ["works","Research lineage map"],
 ["elements","Within-paper argument map"],
 ["trails","Selected Element genealogy"]
];
let active="works",currentWork="GR-2003-COUNTING";
const workSelect=make("select","graph-work-picker");
workSelect.id="graph-work-picker";
workSelect.setAttribute("aria-label","Select a paper for its argument map");
for(const w of map.within_work.available_works){
 const opt=make("option",null,w.year+" · "+w.title);opt.value=w.id;workSelect.append(opt);
}
workSelect.value=currentWork;
workSelect.addEventListener("change",()=>{currentWork=workSelect.value;render()});
const pickerLabel=make("label","graph-picker-label","Paper");
pickerLabel.append(workSelect);
for(const [id,label] of modes){
 const button=make("button","graph-tab",label);
 button.type="button";button.dataset.graphMode=id;button.setAttribute("role","tab");
 button.setAttribute("aria-selected",String(id===active));
 button.addEventListener("click",()=>{active=id;render()});
 tabs.append(button);
}
const showAll=make("button","graph-show-all","Show all arrows");
showAll.type="button";showAll.id="graph-show-all";
showAll.disabled=true;
let clearNodeFocus=()=>{};
showAll.addEventListener("click",()=>clearNodeFocus());
controls.append(tabs,pickerLabel,showAll);section.append(controls);
const summary=make("p","graph-disclosure");summary.id="graph-status";section.append(summary);
const viewport=make("div","graph-viewport");viewport.id="graph-viewport";
const drawing=svg("svg",{"role":"img","aria-label":"Interactive scholarly relations graph"});
drawing.id="research-graph";viewport.append(drawing);section.append(viewport);
const details=make("div","graph-details");details.id="graph-details";
details.setAttribute("aria-live","polite");section.append(details);
const publication=document.querySelector(".publication");
if(!publication)throw Error("Publication panel missing");
main.insertBefore(section,main.firstElementChild);
function detailLine(label,value){
 const p=make("p");const strong=make("strong",null,label+": ");
 p.append(strong,document.createTextNode(String(value||"Not established")));details.append(p);
}
function navigateWork(id){
 const b=[...document.querySelectorAll("#steps button")].find(x=>x.dataset.work===id);
 if(!b)throw Error("Unknown work in reader: "+id);
 b.click();document.getElementById("workTitle").scrollIntoView({block:"start",behavior:"auto"});
}
function inspectNode(node){
 details.replaceChildren(make("h3",null,"Selected node"));
 detailLine("Identity",node.id);
 if(byWork.has(node.id)){
  const w=byWork.get(node.id);
  detailLine("Work",w.year+" · "+w.title);
  detailLine("Source",w.source_note);
  const btn=make("button",null,"Open work in reader");btn.type="button";
  btn.addEventListener("click",()=>navigateWork(node.id));details.append(btn);
 }else{
  const el=byElement.get(node.id);
  if(!el)throw Error("Unknown graph element "+node.id);
  detailLine("Work",el.work.year+" · "+el.work.title);
  detailLine("Type",el.type);detailLine("Element",el.title);
  detailLine("Editorial meaning",el.summary);
  detailLine("Source locator",el.locator);
  detailLine("Review status",el.status);
  const btn=make("button",null,"Read original work");btn.type="button";
  btn.addEventListener("click",()=>navigateWork(el.work.id));details.append(btn);
 }
}
function inspectEdge(edge){
 details.replaceChildren(make("h3",null,"Selected arrow · "+edge.id));
 const start=byElement.get(edge.from)||byWork.get(edge.from);
 const end=byElement.get(edge.to)||byWork.get(edge.to);
 detailLine("From",start?.title||edge.from);
 detailLine("To",end?.title||edge.to);
 detailLine("Relation",edge.function||edge.relation_type||edge.label);
 detailLine("Evidence status",edge.evidence_state||edge.status);
 detailLine("Source location",edge.source_hint||"Source locators are shown on the connected Elements.");
 detailLine("Interpretation limit",edge.caution||map.notice);
}
function short(s,len=31){
 const arr=Array.from(String(s));return arr.length>len?arr.slice(0,len-1).join("")+"…":arr.join("");
}
function labelOf(n){
 if(n.type)return n.id.split(":").pop()+" · "+n.type;
 return String(n.year||"")+" · "+short(n.title,24);
}
/* Restored v0.3.5/v0.4 design requirements: orthogonal obstacle-safe
   routing, per-relation ports, semantic role colors, source/target highlights.
   The historical renderer is NOT copied: only its verified design rules
   are applied to allowlisted D2 records. */
const roles={
 QUESTION:["#8656a8","#f4edfa"],AGENDA:["#655a9a","#f2effa"],
 CONCEPT:["#795a9f","#f4f0fc"],THEORY:["#7159aa","#f5effa"],
 METHOD:["#168068","#eaf8f3"],EVIDENCE:["#286ca6","#eaf3fc"],
 CLAIM:["#197d83","#e6f7f6"],BOUNDARY:["#b87429","#fff4e8"],
 IMPLICATION:["#b77a30","#fff6e8"]
};
const NODE_W=190,NODE_H=84,COL_STEP=265,ROW_STEP=116;
function buildCoordinates(nodes,edges,kind){
 const positions=new Map(),columns=[],headings=[];
 if(kind==="elements"){
  headings.push("Question · concept · theory","Method","Evidence","Claim","Boundary · implication");
  const bands=[
   ["QUESTION","AGENDA","CONCEPT","THEORY"],["METHOD"],
   ["EVIDENCE"],["CLAIM"],["BOUNDARY","IMPLICATION"]
  ];
  bands.forEach(()=>columns.push([]));
  nodes.forEach(n=>{const col=bands.findIndex(b=>b.includes(n.type));columns[col<0?4:col].push(n)});
 }else{
  const ids=new Set(nodes.map(n=>n.id));
  const incoming=new Map(nodes.map(n=>[n.id,0]));
  edges.forEach(e=>{if(ids.has(e.to))incoming.set(e.to,incoming.get(e.to)+1)});
  const rank=new Map();
  nodes.forEach(n=>{if(incoming.get(n.id)===0)rank.set(n.id,0)});
  // This display is a curated, acyclic set; no forced transitive citation inference.
  for(let i=0;i<nodes.length;i++){
   let changed=false;
   for(const e of edges){
    if(rank.has(e.from)&&ids.has(e.to)){
     const next=rank.get(e.from)+1;
     if(!rank.has(e.to)||next>rank.get(e.to)){rank.set(e.to,next);changed=true}
    }
   }
   if(!changed)break;
  }
  const maxRank=Math.max(0,...nodes.map(n=>rank.get(n.id)||0));
  for(let i=0;i<=maxRank;i++)columns.push([]);
  nodes.forEach(n=>columns[Math.min(maxRank,rank.get(n.id)||0)].push(n));
  columns.forEach((_,i)=>headings.push("Stage "+(i+1)));
 }
 const TOP=88+edges.length*9;
 const maxN=Math.max(1,...columns.map(col=>col.length));
 const W=100+columns.length*COL_STEP;
 const H=TOP+maxN*ROW_STEP+125;
 columns.forEach((col,j)=>col.forEach((n,i)=>{
  positions.set(n.id,{x:50+j*COL_STEP,y:TOP+i*ROW_STEP+25});
 }));
 return{positions,W,H,TOP,columns,headings};
}
function renderSvg(nodes,edges,kind){
 drawing.replaceChildren();
 showAll.disabled=true; // A view switch starts with all arrows; no stale filter state.
 const {positions,W,H,TOP,columns,headings}=buildCoordinates(nodes,edges,kind);
 drawing.setAttribute("viewBox","0 0 "+W+" "+H);
 drawing.setAttribute("width",String(W));drawing.setAttribute("height",String(H));
 drawing.setAttribute("data-routing","orthogonal-clearance-v1");
 const defs=svg("defs");
 const marker=svg("marker",{id:"demo-arrow-tip",viewBox:"0 0 10 10",refX:"8",refY:"5",
  markerUnits:"userSpaceOnUse",markerWidth:"10",markerHeight:"10",orient:"auto"});
 marker.append(svg("path",{d:"M 0 0 L 10 5 L 0 10 z",fill:"#5c7e95"}));
 defs.append(marker);drawing.append(defs);
 columns.forEach((col,j)=>{
  const tint=kind==="elements"?["#f8f4fc","#effbf7","#f2f6fc","#eff9f7","#fff7ee"][j]:"#f3f7fa";
  drawing.append(svg("rect",{x:36+j*COL_STEP,y:TOP-17,width:COL_STEP-12,
    height:H-TOP-34,rx:11,fill:tint,stroke:"#dbe4ed"}));
  drawing.append(svg("text",{x:51+j*COL_STEP,y:TOP-29,class:"graph-column-title"},headings[j]));
 });
 const outbound=new Map(),inbound=new Map();
 for(const e of edges){
  if(!outbound.has(e.from))outbound.set(e.from,[]);
  if(!inbound.has(e.to))inbound.set(e.to,[]);
  outbound.get(e.from).push(e.id);inbound.get(e.to).push(e.id);
 }
 let outside=0;
 const edgeGroups=[];
 for(const edge of edges){
  const a=positions.get(edge.from),b=positions.get(edge.to);
  if(!a||!b)throw Error("Unresolved graphic edge "+edge.id);
  const outs=outbound.get(edge.from),ins=inbound.get(edge.to);
  const sy=a.y+12+(outs.indexOf(edge.id)+1)*(NODE_H-24)/(outs.length+1);
  const ty=b.y+12+(ins.indexOf(edge.id)+1)*(NODE_H-24)/(ins.length+1);
  const sx=a.x+NODE_W,tx=b.x-7;
  const sGutter=sx+30,tGutter=b.x-29;
  let d;
  if(b.x>a.x&&b.x-a.x<=COL_STEP+1){
   // Adjacent columns: only the empty intercolumn gutter is crossed.
   d="M "+sx+" "+sy+" H "+sGutter+" V "+ty+" H "+tx;
  }else{
   // Distant / backward / same-column: route above all nodes,
   // with vertical portions entirely in the column gutters.
   const corridorY=25+(outside++*9);
   if(corridorY>=TOP-35)throw Error("Insufficient outer routing corridor");
   d="M "+sx+" "+sy+" H "+sGutter+" V "+corridorY+
     " H "+tGutter+" V "+ty+" H "+tx;
  }
  const analyst=kind!=="elements";
  const group=svg("g",{class:"graph-edge",role:"button",tabindex:"0",
   "aria-label":edge.id+" · "+(edge.relation_type||edge.label||edge.function),
   "aria-pressed":"false"});
  group.dataset.graphEdge=edge.id;
  const line=svg("path",{d,fill:"none",stroke:analyst?"#8794a3":"#537d9a",
    "stroke-width":"2.8","stroke-linejoin":"round","stroke-linecap":"round",
    "marker-end":"url(#demo-arrow-tip)"});
  if(analyst)line.setAttribute("stroke-dasharray","7 5");
  group.append(line,svg("path",{d,fill:"none",stroke:"transparent","stroke-width":"17",
    class:"graph-edge-hit"}),svg("title",{},edge.id+" · "+(edge.relation_type||edge.label||edge.function)));
  const action=()=>{
   drawing.querySelectorAll(".graph-edge,.graph-node").forEach(x=>{
    x.classList.remove("selected");x.removeAttribute("data-endpoint");
    if(x.classList.contains("graph-edge"))x.setAttribute("aria-pressed","false");
   });
   group.classList.add("selected");group.setAttribute("aria-pressed","true");
   const start=drawing.querySelector('[data-graph-node="'+edge.from+'"]');
   const end=drawing.querySelector('[data-graph-node="'+edge.to+'"]');
   if(start)start.setAttribute("data-endpoint","start");
   if(end)end.setAttribute("data-endpoint","end");
   inspectEdge(edge);
  };
  group.addEventListener("click",action);
  group.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();action()}});
  edgeGroups.push(group);
 }
 drawing.append(...edgeGroups);
 // The legacy v0.3.5 renderer filtered nonincident arrows when an Element
 // was selected (is-dim opacity). In this isolated D2 preview we hide them
 // entirely to make the selected relationships unambiguous; no data is lost.
 let focusedNode=null;
 const count=edges.length;
 const clearVisualSelection=()=>{
   drawing.querySelectorAll(".graph-edge,.graph-node").forEach(x=>{
     x.classList.remove("selected");x.removeAttribute("data-endpoint");
     if(x.classList.contains("graph-edge"))x.setAttribute("aria-pressed","false");
   });
 };
 function focusNode(id){
   focusedNode=id;
   clearVisualSelection();
   const incident=new Set(id===null?[]:edges.filter(e=>e.from===id||e.to===id).map(e=>e.id));
   const neighbors=new Set([id]);
   if(id!==null)for(const e of edges)if(incident.has(e.id)){neighbors.add(e.from);neighbors.add(e.to)}
   for(const group of edgeGroups){
     const hidden=id!==null&&!incident.has(group.dataset.graphEdge);
     group.classList.toggle("filtered-out",hidden);
     group.setAttribute("aria-hidden",String(hidden));
     group.tabIndex=hidden?-1:0;
   }
   for(const node of drawing.querySelectorAll(".graph-node")){
     const isCurrent=id!==null&&node.dataset.graphNode===id;
     node.classList.toggle("selected",isCurrent);
     node.classList.toggle("node-muted",id!==null&&!neighbors.has(node.dataset.graphNode));
     node.classList.toggle("node-related",id!==null&&!isCurrent&&neighbors.has(node.dataset.graphNode));
     node.setAttribute("aria-pressed",String(isCurrent));
   }
   showAll.disabled=id===null;
   const visible=id===null?count:incident.size;
   summary.textContent=nodes.length+" nodes · "+visible+" of "+count+" arrows shown · "+
     (id===null?"All registered connections":"Only links to selected node "+id);
 }
 clearNodeFocus=()=>{
   focusNode(null);
   details.replaceChildren(make("p",null,
     "All registered arrows restored. Select a node to isolate its links; select an arrow to inspect its provenance."));
 };
 for(const n of nodes){
  const p=positions.get(n.id),tone=roles[n.type]||["#587e9a","#f0f6fa"];
  const group=svg("g",{class:"graph-node",tabindex:"0",role:"button",
    "aria-label":n.title||n.id,"aria-pressed":"false"});
  group.dataset.graphNode=n.id;
  group.setAttribute("transform","translate("+p.x+" "+p.y+")");
  group.dataset.role=n.type||"WORK";
  group.append(svg("rect",{x:0,y:0,width:NODE_W,height:NODE_H,rx:10,ry:10,
    fill:tone[1],stroke:tone[0],"stroke-width":2}));
  group.append(svg("text",{x:12,y:18,class:"graph-small"},kind==="works"?
    (n.year+" · WORK"):(n.id.split(":").pop()+" · "+(n.type||"ELEMENT"))));
  const full=String(n.title||n.id);
  const title=svg("text",{x:12,y:43,class:"graph-node-title","aria-label":full});
  group.append(title,svg("title",{},full));
  drawing.append(group);
  // Retain v0.4.2's measured two-line node label rather than a single truncated row.
  const glyphs=Array.from(full),maxWidth=NODE_W-24;
  const createLine=(text,y)=>{
   const span=svg("tspan",{x:12,y},text);title.append(span);return span;
  };
  const first=createLine("",43),second=createLine("",61);
  let index=0;
  for(;index<glyphs.length;index++){
   first.textContent+=glyphs[index];
   if(first.getComputedTextLength()>maxWidth){first.textContent=first.textContent.slice(0,-glyphs[index].length);break}
  }
  let remaining=glyphs.slice(index);
  for(const char of remaining){
   second.textContent+=char;
   if(second.getComputedTextLength()>maxWidth){
    second.textContent=second.textContent.slice(0,-char.length)+"…";
    while(second.getComputedTextLength()>maxWidth&&second.textContent.length>2){
     const chars=Array.from(second.textContent);chars.splice(-2,1);second.textContent=chars.join("");
    }
    break;
   }
  }
  const action=()=>{
   if(focusedNode===n.id){clearNodeFocus();return}
   focusNode(n.id);
   inspectNode(n);
  };
  group.addEventListener("click",action);
  group.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();action()}});
 }
}
function render(){
 tabs.querySelectorAll("button").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.graphMode===active)));
 pickerLabel.hidden=active!=="elements";
 let nodes=[],edges=[],kind=active;
 if(active==="works"){
  nodes=map.work_graph.nodes;
  edges=map.work_graph.edges;
 }else if(active==="elements"){
  nodes=map.within_work.nodes.filter(n=>n.work_id===currentWork);
  edges=map.within_work.edges.filter(e=>e.work_id===currentWork);
 }else{
  const ordered=[...new Set(trails.lanes.flatMap(x=>x.node_ids))];
  nodes=ordered.map(id=>{const e=byElement.get(id);return{id,title:e.title,type:e.type}});
  edges=trails.edges.map(x=>({id:x.id,from:x.from,to:x.to,function:x.function,evidence_state:x.evidence_state,source_hint:x.source_hint,caution:x.caution}));
 }
 summary.textContent=nodes.length+" visible nodes · "+edges.length+" labeled arrows · "+(active==="works"?"selected work-level comparisons":active==="elements"?"inherited intrawork structures":"analyst-selected Element comparisons");
 renderSvg(nodes,edges,kind);
 details.replaceChildren(make("p",null,"Select a node or an arrow to inspect its identity, interpretation and source boundary. Keyboard: Tab, Enter."));
}
render();
})();