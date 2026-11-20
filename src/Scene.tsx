import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, Line, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import * as THREE from "three";
import type { Node, Edge } from "./types";
import HeadShell from "./HeadShell";
import SkullLayer from "./SkullLayer";
import LobeOverlay from "./LobeOverlay";
import type { LobeSelection } from "./lobePalette";

const transform = (p:[number,number,number]):[number,number,number] => [p[0]*.052,p[2]*.052,-p[1]*.052];

export type ViewDirection = "rostral" | "caudal" | "top" | "bottom" | "left-lateral" | "right-lateral";
export type CameraSnap = {direction: ViewDirection; serial: number};

export type LayerSettings = {
  head:boolean;
  headOpacity:number;
  headWireframe:boolean;
  anatomy:boolean;
  parcels:boolean;
  connections:boolean;
  opacity:number;
  lobeGuides:boolean;
  lobeSelection:LobeSelection;
  skull:boolean;
  skullOpacity:number;
  skullWireframe:boolean;
  skullWireframeDetail:number;
  skullYaw:number;
};

function AnatomySurface({center,opacity}:{center:THREE.Vector3;opacity:number}){
  const {scene}=useGLTF(import.meta.env.BASE_URL+"assets/brain-envelope.glb");
  const model=useMemo(()=>{
    const clone=scene.clone(true);
    clone.traverse(obj=>{
      if(obj instanceof THREE.Mesh){
        obj.material = new THREE.MeshPhysicalMaterial({
          color:"#aec6d3",
          roughness:.6,
          metalness:0,
          side:THREE.DoubleSide,
          transparent:true,
          opacity,
          depthWrite:false,
          polygonOffset:true,
          polygonOffsetFactor:1
        });
        obj.renderOrder=1;
      }
    });
    return clone;
  },[scene,opacity]);
  return <primitive object={model} position={[-center.x,-center.y,-center.z]}/>;
}

function Network({nodes,edges,selected,onSelect,layers,skullModel,highlightedTarget,soloFocus}:{nodes:Node[];edges:Edge[];selected:number;onSelect:(i:number)=>void;layers:LayerSettings;skullModel:THREE.Group|null;highlightedTarget:number|null;soloFocus:boolean}){
 const [hover,setHover]=useState<number|null>(null);
 const center=useMemo(()=>{
   const v=new THREE.Vector3();
   nodes.forEach(n=>v.add(new THREE.Vector3(...transform(n.position_mm))));
   return v.multiplyScalar(1/nodes.length);
 },[nodes]);
 const coords=(i:number):[number,number,number]=>{
   const p=transform(nodes[i].position_mm);
   return [p[0]-center.x,p[1]-center.y,p[2]-center.z];
 };
 const neighbours=new Set([selected,...edges.map(e=>e.target)]);
 const focusedEdge=edges.find(e=>e.target===highlightedTarget);
 const inFocus=Boolean(focusedEdge);
 const hideOthers=inFocus&&soloFocus;
 return <group>
  {layers.head&&<HeadShell center={center} opacity={inFocus?Math.min(layers.headOpacity,.045):layers.headOpacity} wireframe={layers.headWireframe}/>}
  {layers.skull&&skullModel&&!hideOthers&&<SkullLayer source={skullModel} center={center} opacity={inFocus?Math.min(layers.skullOpacity,.09):layers.skullOpacity} wireframe={layers.skullWireframe} wireframeDetail={layers.skullWireframeDetail} yawDegrees={layers.skullYaw}/>}
  {layers.anatomy&&<Suspense fallback={null}><AnatomySurface center={center} opacity={inFocus?Math.min(layers.opacity,.045):layers.opacity}/></Suspense>}
  {layers.lobeGuides&&!inFocus&&<LobeOverlay center={center} selection={layers.lobeSelection}/>}
  {layers.connections&&edges.filter(e=>!hideOthers||e.target===highlightedTarget).map(e=><Line
    key={e.target} points={[coords(e.source),coords(e.target)]}
    color={inFocus?(e.target===highlightedTarget?"#ffdb6b":e.value>=0?"#5fd4ff":"#ff9fbb"):e.value>=0?"#5fd4ff":"#ff9fbb"}
    lineWidth={inFocus?(e.target===highlightedTarget?6:1):Math.max(1,Math.abs(e.value)*3)}
    transparent opacity={inFocus?(e.target===highlightedTarget?1:.07):.4+Math.abs(e.value)*.5}
    depthTest={!inFocus||e.target!==highlightedTarget}/>)}
  {focusedEdge&&<Line key={"focus-"+focusedEdge.target} points={[coords(focusedEdge.source),coords(focusedEdge.target)]}
    color="#fff3b6" lineWidth={3.5} transparent opacity={1} depthTest={false}/>}
  {focusedEdge&&[focusedEdge.source,focusedEdge.target].map((i,index)=><group key={"focus-node-"+i} position={coords(i)}>
    <mesh renderOrder={25}>
      <sphereGeometry args={[.18,24,16]}/>
      <meshBasicMaterial color={index===0?"#fff0af":"#ffcc5d"} depthTest={false}/>
    </mesh>
    <mesh renderOrder={24}>
      <sphereGeometry args={[.29,20,12]}/>
      <meshBasicMaterial color="#ffdf81" transparent opacity={.24} depthTest={false} depthWrite={false}/>
    </mesh>
    <Html distanceFactor={10} center zIndexRange={[100,0]} style={{pointerEvents:"none",whiteSpace:"nowrap"}}>
      <span className="focus-node-label">{index===0?"FROM":"TO"} · {nodes[i].label}</span>
    </Html>
  </group>)}
  {layers.parcels&&nodes.map((n,i)=><mesh key={n.id} position={coords(i)} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();onSelect(i)}} onPointerOver={(e:ThreeEvent<PointerEvent>)=>{e.stopPropagation();setHover(i)}} onPointerOut={()=>setHover(null)}>
   <sphereGeometry args={[i===selected?.14:.075,12,10]}/>
   <meshStandardMaterial color={focusedEdge&&(i===selected||i===highlightedTarget)?"#ffe783":i===selected?"#ffc06a":neighbours.has(i)?"#76dbff":"#68839b"} emissive={i===selected?"#ad6529":"#263b5b"} emissiveIntensity={.35} transparent opacity={inFocus&&(i!==selected&&i!==highlightedTarget)?(hideOthers?.025:.13):neighbours.has(i)?1:.6} depthTest={false}/>
   {!inFocus&&(hover===i||selected===i)&&<Html distanceFactor={10} style={{pointerEvents:"none",whiteSpace:"nowrap"}}><span className="node-label">{n.label}</span></Html>}
  </mesh>)}
 </group>;
}
function CameraController({snap,focusCameraSerial,focusedPair}:{snap:CameraSnap;focusCameraSerial:number;focusedPair:[number,number,number]|null}){
 const {camera}=useThree();
 const controls=useRef<ComponentRef<typeof OrbitControls>>(null);
 useEffect(()=>{
   // Anatomical MNI y (rostral/anterior) maps to scene -z.
   // Anatomical MNI z (superior) maps to scene +y.
   const directions:Record<ViewDirection,[number,number,number]>={
     rostral:[0,0,-1],
     caudal:[0,0,1],
     top:[0,1,0],
     bottom:[0,-1,0],
     "left-lateral":[-1,0,0],
     "right-lateral":[1,0,0]
   };
   const [x,y,z]=directions[snap.direction];
   const distance=Math.max(9,camera.position.length());
   camera.position.set(x*distance,y*distance,z*distance);
   camera.up.set(0,Math.abs(y)>0?0:1,Math.abs(y)>0?-1:0);
   camera.lookAt(0,0,0);
   controls.current?.target.set(0,0,0);
   controls.current?.update();
 },[camera,snap.direction,snap.serial]);
 useEffect(()=>{
   if(focusCameraSerial===0||!focusedPair)return;
   // Preserve the viewing direction; bring the selected pair near the
   // centre of the orbit rather than snapping to a different anatomical view.
   const target=new THREE.Vector3(...focusedPair);
   const offset=camera.position.clone().sub(controls.current?.target??new THREE.Vector3());
   camera.position.copy(target).add(offset);
   controls.current?.target.copy(target);
   controls.current?.update();
 },[camera,focusCameraSerial,focusedPair?.[0],focusedPair?.[1],focusedPair?.[2]]);
 return <OrbitControls ref={controls} makeDefault enablePan enableZoom minDistance={3} maxDistance={30}/>;
}
export default function Scene(props:{nodes:Node[];edges:Edge[];selected:number;onSelect:(i:number)=>void;layers:LayerSettings;snap:CameraSnap;skullModel:THREE.Group|null;highlightedTarget:number|null;soloFocus:boolean;focusCameraSerial:number}){
 const focusedPair=useMemo(()=>{
   if(props.highlightedTarget===null||!props.nodes[props.selected]||!props.nodes[props.highlightedTarget])return null;
   const a=transform(props.nodes[props.selected].position_mm),b=transform(props.nodes[props.highlightedTarget].position_mm);
   const center=[0,0,0];
   props.nodes.forEach(n=>{const p=transform(n.position_mm);center[0]+=p[0];center[1]+=p[1];center[2]+=p[2]});
   center.forEach((_,i)=>{center[i]/=props.nodes.length});
   return [(a[0]+b[0])/2-center[0],(a[1]+b[1])/2-center[1],(a[2]+b[2])/2-center[2]] as [number,number,number];
 },[props.nodes,props.selected,props.highlightedTarget]);
 return <Canvas camera={{position:[0,0,12],fov:45}} gl={{antialias:true}} dpr={[1,2]}>
  <color attach="background" args={["#091426"]}/><ambientLight intensity={1.3}/><pointLight position={[10,10,10]} intensity={60}/>
  <Network {...props}/><CameraController snap={props.snap} focusedPair={focusedPair} focusCameraSerial={props.focusCameraSerial}/>
 </Canvas>;
}
