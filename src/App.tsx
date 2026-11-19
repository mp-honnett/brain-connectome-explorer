import {useEffect,useMemo,useRef,useState} from "react";
import Scene, {type LayerSettings,type CameraSnap,type ViewDirection} from "./Scene";
import Credits from "./Credits";
import {type Dataset,validateData,edgesForNode} from "./types";
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
 const [threshold,setThreshold]=useState(.3);
 const [limit,setLimit]=useState(16);
 const [snap,setSnap]=useState<CameraSnap>({direction:"caudal",serial:0});
 const chooseView=(direction:ViewDirection)=>setSnap(prev=>({direction,serial:prev.serial+1}));
 const [layers,setLayers]=useState<LayerSettings>({head:true,headOpacity:.16,headWireframe:false,anatomy:true,parcels:true,connections:true,opacity:.22});
 const updateLayer=(part:Partial<LayerSettings>)=>setLayers(previous=>({...previous,...part}));
 const fileInput=useRef<HTMLInputElement>(null);
 const importData=(value:unknown)=>{const d=validateData(value);setData(d);setCondition(Object.keys(d.conditions)[0]);setSelected(0);setError("");};
 useEffect(()=>{fetch(import.meta.env.BASE_URL+"data/connectome.json").then(async r=>{if(!r.ok)throw Error("No processed data installed.");importData(await r.json())}).catch(e=>setError(String(e.message||e)))},[]);
 async function importFile(file?:File){if(!file)return;try{importData(JSON.parse(await file.text()))}catch(e){setError("Import failed: "+String(e))}}
 const matrix=data?.conditions[condition];
 const edges=useMemo(()=>matrix?edgesForNode(matrix,selected,threshold,limit):[],[matrix,selected,threshold,limit]);
 return <div className="app">
 <header><div><strong className="brand">BRAIN<span>CONNECT</span></strong><div className="caption">Functional network explorer</div></div><nav className="site-nav" aria-label="Site sections"><button type="button" className={tab==="explore"?"site-tab active":"site-tab"} aria-current={tab==="explore"?"page":undefined} onClick={()=>chooseTab("explore")}>Explorer</button><button type="button" className={tab==="credits"?"site-tab active":"site-tab"} aria-current={tab==="credits"?"page":undefined} onClick={()=>chooseTab("credits")}>Credits &amp; Licences</button></nav><div className="header-right"><span>{data?"● Data loaded":"○ Awaiting verified data"}</span><a href="https://openneuro.org/datasets/ds007286" target="_blank" rel="noreferrer">YaleNeuroConnect ↗</a></div></header>
 <main>{tab==="credits"?<Credits metadata={data?.metadata}/>:<><section className="visual"><div className="intro"><p className="eyebrow">INTERACTIVE CONNECTOME</p><h1>Explore the connected brain.</h1><p>Explore region-to-region functional correlations through a spatial 3D network.</p></div>
 <div className="stage">{data&&matrix?<Scene nodes={data.nodes} edges={edges} selected={selected} onSelect={setSelected} layers={layers} snap={snap}/>:<div className="empty"><div className="orb">◎</div><h2>Ready for real brain data</h2><p>YaleNeuroConnect measurements are not bundled. Import a validated connectome JSON to activate the 3D viewer. No synthetic connections are shown as real measurements.</p><button onClick={()=>fileInput.current?.click()}>Import connectome JSON</button><a href="https://openneuro.org/datasets/ds007286" target="_blank" rel="noreferrer">Explore source dataset ↗</a></div>}</div>
 <div className="note"><b>Interpretation</b><p>Connections show correlation between measured fMRI time series, not physical fibre tracts or causal communication. Display thresholds are not statistical significance tests.</p></div></section>
 <aside><div className="panel"><p className="eyebrow">CAMERA VIEWS</p>
 <div className="view-buttons">
 {([["rostral","Rostral · Front"],["caudal","Caudal · Back"],["top","Dorsal · Top"],["bottom","Ventral · Bottom"]] as const).map(([direction,label])=>
 <button key={direction} type="button" className={snap.direction===direction?"view-button active":"view-button"} onClick={()=>chooseView(direction)} aria-label={label} aria-pressed={snap.direction===direction}>{label}</button>)}
 </div>
 <p className="muted">Snap to a standard anatomical direction, then drag to rotate freely. Front and back refer to the brain's anatomical axes.</p></div>
 <div className="panel"><p className="eyebrow">ANATOMICAL LAYERS</p>
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
 <p className="muted">The translucent surface is a smoothed outline derived from the Shen268 atlas, not a detailed subject MRI. The connecting lines are statistical fMRI relationships, not axon pathways.</p></div>
 <div className="panel"><p className="eyebrow">CONDITIONS</p><label>Condition</label><select disabled={!data} value={condition} onChange={e=>setCondition(e.target.value)}>{Object.keys(data?.conditions||{}).map(k=><option value={k} key={k}>{k}</option>)}</select><label>Minimum absolute correlation <b>{threshold.toFixed(2)}</b></label><input type="range" min="0" max=".9" step=".05" value={threshold} onChange={e=>setThreshold(+e.target.value)}/><label>Maximum visible connections <b>{limit}</b></label><input type="range" min="5" max="40" value={limit} onChange={e=>setLimit(+e.target.value)}/><p className="muted">Showing {edges.length} connections from the selected region.</p></div>
 <div className="panel"><p className="eyebrow">REGION INSPECTOR</p><label>Selected region</label><select disabled={!data} value={selected} onChange={e=>setSelected(+e.target.value)}>{(data?.nodes||[]).map((n,i)=><option key={n.id} value={i}>{n.label}</option>)}</select><h2>{data?.nodes[selected]?.label||"No region selected"}</h2><p className="muted">{data?.nodes[selected]? "Atlas ID "+data.nodes[selected].id+" · "+data.nodes[selected].position_mm.map(x=>x.toFixed(1)).join(", ")+" mm":"Select a node after loading data."}</p>{edges.slice(0,8).map(e=><div className="connection" key={e.target}><span>{data?.nodes[e.target].label}</span><b className={e.value>=0?"positive":"negative"}>{e.value>=0?"+":""}{e.value.toFixed(3)}</b></div>)}</div>
 <div className="panel"><p className="eyebrow">DATA PROVENANCE</p><p>{data?.metadata.source||"YaleNeuroConnect (intended source)"}</p><p className="muted">{data?data.metadata.dataType+" · "+data.metadata.transform:"No source matrices have been installed or independently verified."}</p>{data?.metadata.note&&<p className="error">{data.metadata.note}</p>}<button className="secondary" onClick={()=>fileInput.current?.click()}>Import / replace JSON</button><input hidden type="file" accept=".json,application/json" ref={fileInput} onChange={e=>importFile(e.target.files?.[0])}/>{error&&<p className="error">{error}</p>}</div></aside></>}</main>
 <footer>Educational prototype · Not for diagnosis · <button type="button" className="footer-credits" onClick={()=>chooseTab("credits")}>Credits &amp; Licences</button> · <a href="https://www.nature.com/articles/s41597-026-08749-0" target="_blank" rel="noreferrer">Scientific source</a></footer>
 </div>;
}
