export type Node = { id:number; label:string; position_mm:[number,number,number]; network?:string };
export type Dataset = {nodes:Node[]; conditions:Record<string,number[][]>; metadata:{source:string;dataType:string;transform:string;participants?:number;note?:string}};
export type Edge = {source:number;target:number;value:number};
export function validateData(value:unknown):Dataset {
 if(!value||typeof value!=="object") throw Error("Expected JSON object.");
 const d=value as Dataset;
 if(!Array.isArray(d.nodes)||d.nodes.length<2||d.nodes.length>1000) throw Error("Invalid node list.");
 if(!d.metadata||typeof d.metadata.source!=="string"||!d.conditions||typeof d.conditions!=="object") throw Error("Missing provenance or conditions.");
 const ids=new Set<number>();
 for(const n of d.nodes){if(!Number.isInteger(n.id)||ids.has(n.id)||typeof n.label!=="string"||!Array.isArray(n.position_mm)||n.position_mm.length!==3||!n.position_mm.every(Number.isFinite))throw Error("Invalid node positions or IDs.");ids.add(n.id);}
 if(!Object.keys(d.conditions).length)throw Error("No conditions.");
 for(const [name,m] of Object.entries(d.conditions)){if(!Array.isArray(m)||m.length!==d.nodes.length||m.some(r=>!Array.isArray(r)||r.length!==d.nodes.length||r.some(v=>typeof v!=="number"||!Number.isFinite(v)||Math.abs(v)>1.000001)))throw Error("Invalid matrix "+name+": expected correlations in [-1,1].");}
 return d;
}
export function edgesForNode(matrix:number[][],selected:number,threshold:number,limit:number):Edge[]{
 return matrix[selected].map((value,target)=>({source:selected,target,value})).filter(e=>e.target!==selected&&Math.abs(e.value)>=threshold).sort((a,b)=>Math.abs(b.value)-Math.abs(a.value)).slice(0,limit);
}
