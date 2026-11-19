import { Canvas, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, Line } from "@react-three/drei";
import { useMemo, useState } from "react";
import * as THREE from "three";
import type { Node, Edge } from "./types";
const transform=(p:[number,number,number]):[number,number,number]=>[p[0]*.052,p[2]*.052,-p[1]*.052];
function Network({nodes,edges,selected,onSelect}:{nodes:Node[];edges:Edge[];selected:number;onSelect:(i:number)=>void}){
 const [hover,setHover]=useState<number|null>(null);
 const center=useMemo(()=>{const v=new THREE.Vector3();nodes.forEach(n=>v.add(new THREE.Vector3(...transform(n.position_mm))));return v.multiplyScalar(1/nodes.length)},[nodes]);
 const coords=(i:number):[number,number,number]=>{const p=transform(nodes[i].position_mm);return [p[0]-center.x,p[1]-center.y,p[2]-center.z]};
 const neighbours=new Set([selected,...edges.map(e=>e.target)]);
 return <group>
  {edges.map(e=><Line key={e.target} points={[coords(e.source),coords(e.target)]} color={e.value>=0?"#5fd4ff":"#ff9fbb"} lineWidth={Math.max(1,Math.abs(e.value)*3)} transparent opacity={.4+Math.abs(e.value)*.5}/>)}
  {nodes.map((n,i)=><mesh key={n.id} position={coords(i)} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();onSelect(i)}} onPointerOver={(e:ThreeEvent<PointerEvent>)=>{e.stopPropagation();setHover(i)}} onPointerOut={()=>setHover(null)}>
   <sphereGeometry args={[i===selected?.14:.075,12,10]}/>
   <meshStandardMaterial color={i===selected?"#ffc06a":neighbours.has(i)?"#76dbff":"#68839b"} emissive={i===selected?"#ad6529":"#263b5b"} emissiveIntensity={.35} transparent opacity={neighbours.has(i)?1:.6}/>
   {(hover===i||selected===i)&&<Html distanceFactor={10} style={{pointerEvents:"none",whiteSpace:"nowrap"}}><span className="node-label">{n.label}</span></Html>}
  </mesh>)}
 </group>;
}
export default function Scene(props:{nodes:Node[];edges:Edge[];selected:number;onSelect:(i:number)=>void}){
 return <Canvas camera={{position:[0,0,12],fov:45}} gl={{antialias:true}} dpr={[1,2]}>
  <color attach="background" args={["#091426"]}/><ambientLight intensity={1.3}/><pointLight position={[10,10,10]} intensity={60}/>
  <Network {...props}/><OrbitControls makeDefault enablePan enableZoom minDistance={3} maxDistance={30}/>
 </Canvas>;
}
