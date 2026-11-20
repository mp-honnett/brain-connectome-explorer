import {useEffect,useMemo,useRef,useState, type ReactNode} from "react";
import type * as THREE from "three";
import { loadSkullModel, readSavedSkull, removeSavedSkull, saveSkullLocally } from "./skullLoader";
import Scene, {type LayerSettings,type CameraSnap,type ViewDirection} from "./Scene";
import Credits from "./Credits";
import { LOBES, UNCLASSIFIED_LOBE } from "./lobePalette";
import {type Dataset,validateData,edgesForNode} from "./types";
type SidebarSection = "camera" | "anatomy" | "skull" | "lobes" | "conditions" | "inspector" | "provenance";

/** Single-open sidebar accordion. All sections begin collapsed. */
function AccordionPanel({section,title,open,onToggle,children,className=""}:{
  section:SidebarSection;
  title:string;
  open:boolean;
  onToggle:()=>void;
  children:ReactNode;
  className?:string;
}){
  const headingId=`sidebar-${section}-heading`;
  const contentId=`sidebar-${section}-content`;
  return <section className={`panel accordion-panel ${className}`.trim()}>
    <h2 className="accordion-heading">
      <button type="button" id={headingId} aria-expanded={open} aria-controls={contentId} onClick={onToggle}>
        <span>{title}</span><span className="accordion-chevron" aria-hidden="true"/>
      </button>
    </h2>
    <div id={contentId} className="accordion-body" role="region" aria-labelledby={headingId} hidden={!open}>
      {children}
    </div>
  </section>;
}

export default function App(){
 const [tab,setTab]=useState<"explore"|"credits">(()=>typeof window!=="undefined"&&window.location.hash==="#credits"?"credits":"explore");
 useEffect(()=>{
  const sync=()=>setTab(window.location.hash==="#credits"?"credits":"explore");
  window.addEventListener("hashchange",sync);window.addEventListener("popstate",sync);
  return ()=>{window.removeEventListener("hashchange",sync);window.removeEventListener("popstate",sync)};
 },[]);
 const chooseTab=(next:"explore"|"credits")=>{setTab(next);window.history.pushState(null,"",next==="credits"?"#credits":"#explore");};
 const [data,setData]=useState<Dataset|null>(null);
 const [error,setError]=useState("");
 const [condition,setCondition]=useState("");
 const [selected,setSelected]=useState(0);
 const [highlightedTarget,setHighlightedTarget]=useState<number|null>(null);
 const [soloFocus,setSoloFocus]=useState(true);
 const [focusCameraSerial,setFocusCameraSerial]=useState(0);
 const chooseRegion=(region:number)=>{setSelected(region);setHighlightedTarget(null)};
 const [threshold,setThreshold]=useState(.3);
 const [limit,setLimit]=useState(16);
 const [snap,setSnap]=useState<CameraSnap>({direction:"caudal",serial:0});
 const [activeSection,setActiveSection]=useState<SidebarSection|null>(null);
 const toggleSection=(section:SidebarSection)=>setActiveSection(previous=>previous===section?null:section);
 const chooseView=(direction:ViewDirection)=>setSnap(prev=>({direction,serial:prev.serial+1}));
 const [layers,setLayers]=useState<LayerSettings>({head:true,headOpacity:.16,headWireframe:false,anatomy:true,parcels:true,connections:true,opacity:.22,lobeGuides:true,lobeSelection:"all",skull:false,skullOpacity:.32,skullWireframe:false,skullYaw:(()=>{try{const saved=window.localStorage.getItem("tweenbrain-skull-yaw-v1");return saved===null?180:Math.max(0,Math.min(360,Number(saved)||0))}catch{return 180}})()});
 const updateLayer=(part:Partial<LayerSettings>)=>setLayers(previous=>({...previous,...part}));
 useEffect(()=>{try{window.localStorage.setItem("tweenbrain-skull-yaw-v1",String(layers.skullYaw))}catch{/* Optional preference */}},[layers.skullYaw]);
 const fileInput=useRef<HTMLInputElement>(null);
 const skullInput=useRef<HTMLInputElement>(null);
 const [skullModel,setSkullModel]=useState<THREE.Group|null>(null);
 const [skullName,setSkullName]=useState("");
 const [skullBusy,setSkullBusy]=useState(false);
 const [skullError,setSkullError]=useState("");
 const [skullSaved,setSkullSaved]=useState(false);
 useEffect(()=>{
   let active=true;
   readSavedSkull().then(async stored=>{
     if(!stored)return;
     const model=await loadSkullModel(stored.blob,stored.name);
     if(active){
       setSkullModel(model);
       setSkullName(stored.name);
       setSkullSaved(true);
       setLayers(previous=>({...previous,skull:true}));
     }
   }).catch(()=>{ /* local storage is optional: file selection still works */ });
   return ()=>{ active=false; };
 },[]);
 async function importSkull(file?:File){
   if(!file)return;
   setSkullBusy(true);
   setSkullError("");
   try {
     const model=await loadSkullModel(file,file.name);
     setSkullModel(model);
     setSkullName(file.name);
     setLayers(previous=>({...previous,skull:true}));
     try {
       await saveSkullLocally(file);
       setSkullSaved(true);
     }catch{
       setSkullSaved(false);
       setSkullError("Model loaded for this session. This browser could not save it for next time; re-import after a reload.");
     }
   }catch(e){
     setSkullError("Skull import failed: "+String(e instanceof Error?e.message:e));
   }finally{
     setSkullBusy(false);
     if(skullInput.current)skullInput.current.value="";
   }
 }
 async function clearSkull(){
   try{await removeSavedSkull();}catch{/* browser storage is optional */}
   setSkullSaved(false);
   setSkullModel(null);
   setSkullName("");
   setSkullError("");
   setLayers(previous=>({...previous,skull:false}));
 }
 const importData=(value:unknown)=>{const d=validateData(value);setData(d);setCondition(Object.keys(d.conditions)[0]);setSelected(0);setHighlightedTarget(null);setError("");};
 useEffect(()=>{fetch(import.meta.env.BASE_URL+"data/connectome.json").then(async r=>{if(!r.ok)throw Error("No processed data installed.");importData(await r.json())}).catch(e=>setError(String(e.message||e)))},[]);
 async function importFile(file?:File){if(!file)return;try{importData(JSON.parse(await file.text()))}catch(e){setError("Import failed: "+String(e))}}
 const matrix=data?.conditions[condition];
 const edges=useMemo(()=>matrix?edgesForNode(matrix,selected,threshold,limit):[],[matrix,selected,threshold,limit]);
 const focusedEdge=edges.find(e=>e.target===highlightedTarget)??null;
 const chooseCorrelation=(target:number)=>{
   setHighlightedTarget(previous=>{
     if(previous===target)return null;
     setFocusCameraSerial(serial=>serial+1);
     return target;
   });
 };
 useEffect(()=>{if(highlightedTarget!==null&&!edges.some(e=>e.target===highlightedTarget))setHighlightedTarget(null)},[edges,highlightedTarget]);
 return <div className="app">
 <header><div className="brand-lockup"><img className="brand-logo" src={"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAsHCAoIBwsKCQoMDAsNEBsSEA8PECEYGRQbJyMpKScjJiUsMT81LC47LyUmNko3O0FDRkdGKjRNUkxEUj9FRkP/2wBDAQwMDBAOECASEiBDLSYtQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0NDQ0P/wAARCABIAEgDASIAAhEBAxEB/8QAGgABAAMBAQEAAAAAAAAAAAAAAAIFBgQDAf/EAC8QAAICAgEDAwMDAgcAAAAAAAECAAMEEQUSITFBUWEGExQycYEiI0JSYpGx0eH/xAAaAQACAwEBAAAAAAAAAAAAAAAAAwECBAUG/8QAJBEAAgICAQMEAwAAAAAAAAAAAAECAxESBCExQRMyUYEU0fH/2gAMAwEAAhEDEQA/APOIkq62tsVK1LMx0APWLPZN4IxL3G+nQVBybTv/ACp6fzPS76dqK/2bnU/6u4mf8qrOMmV82lPGTPRPbLxbcO013Lo+QR4I+J14XDZOUoc6qQ+C3k/xHOyCWzfQfK2EY7N9CuiXV307YqbqvV29mXW5UW1vVYa7FKsvkGRC2FntZFd1dntZCIiMGiWf04FPI/1a2EJX95WTo49chstDiqWsU7Ht/PxF2rMGhVy2rayX3NchZhW4wr/SSSw9x7SHJc1XXQv4jq9j99630j5+ZL6ioWzBW1iFesjXzvyJV8ZxiZ2Pa5tKuh0FA+PWYaoVOtTl4ObTXS6lOfgvfsU8jVi32DfSOsD0PxOHkucFTmrEAZh2LnwP2nNi8g541MKgMchiUGvQe84M3DswbRXaVJI2Cplq6Fvif0i9PHi54s8dkarjbLLcKmy4guy7JA1K36mxlNKZAGmU9LfIM4eJGXlWJQllgoRgzaPYfE7vqbJUUpjg/wBTHqI9gPEoq3XekmUjU6uSlF/wz8RE6Z1xNHx5r43hvyWXbOOo/O/Amcml4PIqysEY1gVmrGireomXl50XxnqYubnRfGepSX3ZXI2FyHs1/hUdlnvxFVxW+7HvWpq17qw31D5mlC141LfbRURQTpRqZ7juJszN3WsaqW2e3lh/1FRvjKDXZITDkRnXJY1SPuDYlFr24NT5FhrBO+3QfWevFZFOXlXPnfbNp10dfgD2G50txBxgbePuZbQPDHYYTOurdZDg9W9HfvLQULs4f7LwjC/bV/fk2qBBWRT0Aa7dI7TJ8pj5FGU35LdbP3D+jSy4njs7Ey1ZtLSf1afYP8T1+qOn8anf6uvt/tFUv07dU85EUNU36p5TM7EROkdcSVbtW4etirDwQfEjEjuQ1kuuK5l/ulM20Gsr2YjwfmS5XmFtT8fEJ03Zn8dvYSjkkbodW1vpIOoh8aG2xmfEr33x9eC/v5D8DlSlmzSa1Da9D7yebxdHJMMjHtVWYdyO4b/2UWdlNm5LXMoUkAaE8kdkO0Zl/Y6lFx2kpReGLjxZJKUXiWDYK6YOIgvtGkUAs3rMzyuec7I6gCK17ID/AMzld2c7dmY/J3IyaeMq3s3llqOIqpbN5YiImo2CIiACIiACIiACIiACIiAH/9k="} width="52" height="52" alt="HeadSpin logo"/><strong className="brand product-name">HeadSpin</strong></div><nav className="site-nav" aria-label="Site sections"><button type="button" className={tab==="explore"?"site-tab active":"site-tab"} aria-current={tab==="explore"?"page":undefined} onClick={()=>chooseTab("explore")}>Explorer</button><button type="button" className={tab==="credits"?"site-tab active":"site-tab"} aria-current={tab==="credits"?"page":undefined} onClick={()=>chooseTab("credits")}>Credits &amp; Licences</button></nav><div className="header-right"><span>{data?"● Data loaded":"○ Awaiting verified data"}</span><a href="https://openneuro.org/datasets/ds007286" target="_blank" rel="noreferrer">YaleNeuroConnect ↗</a></div></header>
 <main>{tab==="credits"?<Credits metadata={data?.metadata}/>:<><section className="visual"><div className="intro"><h1>HeadSpin</h1><p>Explore region-to-region functional correlations through a spatial 3D network.</p></div>
 <div className="stage">{data&&matrix?<Scene nodes={data.nodes} edges={edges} selected={selected} onSelect={chooseRegion} layers={layers} snap={snap} skullModel={skullModel} highlightedTarget={highlightedTarget} soloFocus={soloFocus} focusCameraSerial={focusCameraSerial}/>:<div className="empty"><div className="orb">◎</div><h2>Ready for real brain data</h2><p>YaleNeuroConnect measurements are not bundled. Import a validated connectome JSON to activate the 3D viewer. No synthetic connections are shown as real measurements.</p><button onClick={()=>fileInput.current?.click()}>Import connectome JSON</button><a href="https://openneuro.org/datasets/ds007286" target="_blank" rel="noreferrer">Explore source dataset ↗</a></div>}
 {focusedEdge&&data&&<div className="focus-hud" role="status" aria-live="polite">
   <div className="focus-hud-head"><span className="focus-hud-indicator" aria-hidden="true"/> <span>SELECTED CORRELATION</span></div>
   <div className="focus-hud-nodes"><strong>{data.nodes[focusedEdge.source].label}</strong><span aria-hidden="true"> ↔ </span><strong>{data.nodes[focusedEdge.target].label}</strong></div>
   <div className="focus-hud-bottom"><span className="focus-hud-score">r = {focusedEdge.value>=0?"+":""}{focusedEdge.value.toFixed(3)}</span>
   <span className="focus-hud-sign">{focusedEdge.value>=0?"Positive":"Negative"} functional correlation</span></div>
   <div className="focus-hud-actions">
     <button type="button" onClick={()=>setFocusCameraSerial(v=>v+1)} title="Move the camera to the selected connection">Centre on pair</button>
     <button type="button" onClick={()=>setHighlightedTarget(null)}>Clear focus</button>
   </div>
 </div>}</div>
 <div className="note"><b>Interpretation</b><p>Connections show correlation between measured fMRI time series, not physical fibre tracts or causal communication. Display thresholds are not statistical significance tests.</p></div></section>
 <aside aria-label="Explorer controls">
 <AccordionPanel section="camera" title="CAMERA VIEWS" open={activeSection==="camera"} onToggle={()=>toggleSection("camera")}>
 <div className="view-buttons">
 {([["rostral","Rostral · Front"],["caudal","Caudal · Back"],["top","Dorsal · Top"],["bottom","Ventral · Bottom"],["left-lateral","Left Lateral · Left Side"],["right-lateral","Right Lateral · Right Side"]] as const).map(([direction,label])=>
 <button key={direction} type="button" className={snap.direction===direction?"view-button active":"view-button"} onClick={()=>chooseView(direction)} aria-label={label} aria-pressed={snap.direction===direction}>{label}</button>)}
 </div>
 <p className="muted">Snap to a standard anatomical direction, then drag to rotate freely. Left and right lateral views are from the subject's left and right, respectively.</p></AccordionPanel>
 <AccordionPanel section="anatomy" title="ANATOMICAL LAYERS" open={activeSection==="anatomy"} onToggle={()=>toggleSection("anatomy")}>
 <label className="layer-toggle"><span><input type="checkbox" checked={layers.head} onChange={e=>updateLayer({head:e.target.checked})}/> Transparent human head</span></label>
 <label>Head opacity <b>{Math.round(layers.headOpacity*100)}%</b></label>
 <input type="range" min="0.02" max="0.65" step="0.01" disabled={!layers.head} value={layers.headOpacity} onChange={e=>updateLayer({headOpacity:Number(e.target.value)})}/>
 <label className="layer-toggle"><span><input type="checkbox" disabled={!layers.head} checked={layers.headWireframe} onChange={e=>updateLayer({headWireframe:e.target.checked})}/> Head wireframe</span></label>
 <p className="muted">Illustrative anatomical head shell for orientation. Not a subject-specific Yale MRI reconstruction.</p>
 <div className="layer-divider" aria-hidden="true"></div>
 <label className="layer-toggle"><span><input type="checkbox" checked={layers.anatomy} onChange={e=>updateLayer({anatomy:e.target.checked})}/> Brain atlas envelope</span></label>
 <label className="layer-toggle"><span><input type="checkbox" checked={layers.parcels} onChange={e=>updateLayer({parcels:e.target.checked})}/> Shen268 parcel centres</span></label>
 <label className="layer-toggle"><span><input type="checkbox" checked={layers.connections} onChange={e=>updateLayer({connections:e.target.checked})}/> Functional correlations</span></label>
 <label>Brain transparency <b>{Math.round((1-layers.opacity)*100)}%</b></label>
 <input type="range" min="0.05" max="0.8" step="0.05" disabled={!layers.anatomy} value={layers.opacity} onChange={e=>updateLayer({opacity:Number(e.target.value)})}/>
 <p className="muted">The translucent surface is a smoothed outline derived from the Shen268 atlas, not a detailed subject MRI. The connecting lines are statistical fMRI relationships, not axon pathways.</p></AccordionPanel>
 <AccordionPanel section="skull" title="CT HEAD / SKULL · OPTIONAL LAYER" className="skull-panel" open={activeSection==="skull"} onToggle={()=>toggleSection("skull")}>
 <label className="layer-toggle"><span><input type="checkbox" checked={layers.skull} disabled={!skullModel} onChange={e=>updateLayer({skull:e.target.checked})}/> Show imported CT model</span></label>
 <p className="muted">Import a browser-sized GLB or Sketchfab ZIP. Large CT point clouds (including the Visible Human Female scan) require a reduced GLB; original multi-million-point ZIPs are too large to render reliably. The file stays in your browser.</p>
 <button type="button" className="secondary" disabled={skullBusy} onClick={()=>skullInput.current?.click()}>{skullBusy?"Loading skull…":skullModel?"Replace CT model":"Import CT model ZIP / GLB"}</button>
 <input hidden type="file" accept=".zip,.glb,application/zip,model/gltf-binary" ref={skullInput} onChange={e=>importSkull(e.target.files?.[0])}/>
 {skullModel&&<p className="muted"><strong>Loaded:</strong> {skullName} {skullSaved?"· Saved in this browser":"· This session only"}</p>}
 {skullModel&&<button type="button" className="skull-remove" onClick={clearSkull}>Remove imported skull</button>}
 <label>Skull opacity <b>{Math.round(layers.skullOpacity*100)}%</b></label>
 <input type="range" min="0.05" max="1" step="0.05" disabled={!layers.skull||!skullModel} value={layers.skullOpacity} onChange={e=>updateLayer({skullOpacity:Number(e.target.value)})}/>
 <label className="layer-toggle"><span><input type="checkbox" checked={layers.skullWireframe} disabled={!layers.skull||!skullModel} onChange={e=>updateLayer({skullWireframe:e.target.checked})}/> Skull wireframe</span></label>
 <label htmlFor="skull-yaw">Skull horizontal rotation <b>{layers.skullYaw}°</b></label>
 <input id="skull-yaw" aria-label="Skull horizontal rotation in degrees" type="range" min="0" max="360" step="5" disabled={!skullModel} value={layers.skullYaw} onChange={e=>updateLayer({skullYaw:Number(e.target.value)})}/>
 <button type="button" className="skull-reset" disabled={!skullModel||layers.skullYaw===180} onClick={()=>updateLayer({skullYaw:180})}>Reset to corrected 180°</button>
 <p className="muted">The SU39 skull needed a 180° yaw adjustment. A different CT model may face another direction; use the slider to align it. The rotation affects only the imported model.</p>
 {skullError&&<p className="error" role="status">{skullError}</p>}
 <p className="muted">Approximate visual alignment only. Imported CT scans are not registered to Shen268 or YaleNeuroConnect and may have different scale and orientation.</p>
 <p className="skull-attribution">Model credits: <a href="https://sketchfab.com/3d-models/human-skull-su39-from-ct-scan-e375b7b910d14547854ac7d1b2a5e1ed" target="_blank" rel="noopener noreferrer">SU39 skull</a> by SusanElaineJones; <a href="https://sketchfab.com/3d-models/full-ct-head-point-cloud-visible-human-female-76115e69f3304172835cfce7cc6714a8" target="_blank" rel="noopener noreferrer">Visible Human Female CT point cloud</a> by Terrie. Both under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> and separate from the application software licence. See Credits &amp; Licences for model-specific attribution and modifications.</p>
 </AccordionPanel>
 <AccordionPanel section="lobes" title="ANATOMY GUIDE · SCHEMATIC" className="lobe-panel" open={activeSection==="lobes"} onToggle={()=>toggleSection("lobes")}>
 <label className="layer-toggle"><span><input type="checkbox" checked={layers.lobeGuides} onChange={e=>updateLayer({lobeGuides:e.target.checked})}/> Show coloured lobe guides</span></label>
 <p className="muted">The coloured guides now meet at shared, non-overlapping boundaries rather than intersecting translucent blobs. Their shapes and dividing lines are illustrative, not measured cortical boundaries or validated Shen268 classifications.</p>
 <div className="lobe-legend" role="group" aria-label="Select a lobe to highlight">
  <button type="button" disabled={!layers.lobeGuides} className={layers.lobeSelection==="all"?"lobe-choice active":"lobe-choice"} aria-pressed={layers.lobeSelection==="all"} onClick={()=>updateLayer({lobeSelection:"all"})}>
    <span className="lobe-swatch all-swatches" aria-hidden="true">●</span><span>All lobes</span>
  </button>
  {LOBES.map(lobe=><button type="button" key={lobe.id} disabled={!layers.lobeGuides} className={layers.lobeSelection===lobe.id?"lobe-choice active":"lobe-choice"} aria-pressed={layers.lobeSelection===lobe.id} onClick={()=>updateLayer({lobeSelection:lobe.id})}>
    <span className="lobe-swatch" style={{backgroundColor:lobe.color}} aria-hidden="true"/><span>{lobe.name}</span>
  </button>)}
  <div className="lobe-key-unclassified"><span className="lobe-swatch" style={{backgroundColor:UNCLASSIFIED_LOBE.color}} aria-hidden="true"/><span>{UNCLASSIFIED_LOBE.name}</span></div>
 </div>
 {layers.lobeSelection!=="all"&&<p className="muted lobe-description"><strong>{LOBES.find(l=>l.id===layers.lobeSelection)?.name}:</strong> {LOBES.find(l=>l.id===layers.lobeSelection)?.description}</p>}
 <p className="muted lobe-disclaimer">Tweenbrain visualisation palette, not standard neurological colour coding. Shen268 parcels remain unclassified pending a verified anatomical atlas mapping. Click a coloured legend item to highlight its bilateral guides.</p>
 </AccordionPanel>
 <AccordionPanel section="conditions" title="CONDITIONS" open={activeSection==="conditions"} onToggle={()=>toggleSection("conditions")}><label>Condition</label><select disabled={!data} value={condition} onChange={e=>setCondition(e.target.value)}>{Object.keys(data?.conditions||{}).map(k=><option value={k} key={k}>{k}</option>)}</select><label>Minimum absolute correlation <b>{threshold.toFixed(2)}</b></label><input type="range" min="0" max=".9" step=".05" value={threshold} onChange={e=>setThreshold(+e.target.value)}/><label>Maximum visible connections <b>{limit}</b></label><input type="range" min="5" max="40" value={limit} onChange={e=>setLimit(+e.target.value)}/><p className="muted">Showing {edges.length} connections from the selected region.</p></AccordionPanel>
 <AccordionPanel section="inspector" title="REGION INSPECTOR" open={activeSection==="inspector"} onToggle={()=>toggleSection("inspector")}><label>Selected region</label><select disabled={!data} value={selected} onChange={e=>chooseRegion(+e.target.value)}>{(data?.nodes||[]).map((n,i)=><option key={n.id} value={i}>{n.label}</option>)}</select><h2>{data?.nodes[selected]?.label||"No region selected"}</h2><p className="muted">{data?.nodes[selected]? "Atlas ID "+data.nodes[selected].id+" · "+data.nodes[selected].position_mm.map(x=>x.toFixed(1)).join(", ")+" mm":"Select a node after loading data."}</p><p className="muted">Select a correlation below to isolate its two endpoints and connection in the 3D view. The selected pair and correlation value also appear on the diagram.</p>
 {edges.length>0&&<div className="correlation-list" role="group" aria-label="Correlations for selected region">
 {edges.map(e=><button type="button" key={e.target} className={highlightedTarget===e.target?"connection correlation-choice active":"connection correlation-choice"}
 aria-pressed={highlightedTarget===e.target}
 onClick={()=>chooseCorrelation(e.target)}>
 <span className="correlation-label">{data?.nodes[e.target].label}</span>
 <b className={highlightedTarget===e.target?"highlighted-value":e.value>=0?"positive":"negative"}>{e.value>=0?"+":""}{e.value.toFixed(3)}</b>
 </button>)}</div>}
 {focusedEdge&&<div className="focus-inspector-controls">
   <label className="layer-toggle"><span><input type="checkbox" checked={soloFocus} onChange={e=>setSoloFocus(e.target.checked)}/> Hide other connections while focused</span></label>
   <button type="button" className="clear-highlight" onClick={()=>setHighlightedTarget(null)}>Clear highlighted connection</button>
 </div>}</AccordionPanel>
 <AccordionPanel section="provenance" title="DATA PROVENANCE" open={activeSection==="provenance"} onToggle={()=>toggleSection("provenance")}><p>{data?.metadata.source||"YaleNeuroConnect (intended source)"}</p><p className="muted">{data?data.metadata.dataType+" · "+data.metadata.transform:"No source matrices have been installed or independently verified."}</p>{data?.metadata.note&&<p className="error">{data.metadata.note}</p>}<button className="secondary" onClick={()=>fileInput.current?.click()}>Import / replace JSON</button><input hidden type="file" accept=".json,application/json" ref={fileInput} onChange={e=>importFile(e.target.files?.[0])}/>{error&&<p className="error">{error}</p>}</AccordionPanel></aside></>}</main>
 <footer>Educational prototype · Not for diagnosis · <button type="button" className="footer-credits" onClick={()=>chooseTab("credits")}>Credits &amp; Licences</button> · <a href="https://www.nature.com/articles/s41597-026-08749-0" target="_blank" rel="noreferrer">Scientific source</a></footer>
 </div>;
}
