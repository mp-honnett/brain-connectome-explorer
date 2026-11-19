import { Canvas, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, Line, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, type ComponentRef } from "react";
import * as THREE from "three";
import type { Node, Edge } from "./types";

const transform = (p:[number,number,number]):[number,number,number] => [p[0]*.052,p[2]*.052,-p[1]*.052];

export type ViewDirection = "rostral" | "caudal" | "top" | "bottom";
export type CameraSnap = {direction: ViewDirection; serial: number};

export type LayerSettings = {
  anatomy:boolean;
  parcels:boolean;
  connections:boolean;
  opacity:number;
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

function Network({nodes,edges,selected,onSelect,layers}:{nodes:Node[];edges:Edge[];selected:number;onSelect:(i:number)=>void;layers:LayerSettings}){
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
 return <group>
  {layers.anatomy&&<Suspense fallback={null}><AnatomySurface center={center} opacity={layers.opacity}/></Suspense>}
  {layers.connections&&edges.map(e=><Line key={e.target} points={[coords(e.source),coords(e.target)]} color={e.value>=0?"#5fd4ff":"#ff9fbb"} lineWidth={Math.max(1,Math.abs(e.value)*3)} transparent opacity={.4+Math.abs(e.value)*.5}/>)}
  {layers.parcels&&nodes.map((n,i)=><mesh key={n.id} position={coords(i)} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();onSelect(i)}} onPointerOver={(e:ThreeEvent<PointerEvent>)=>{e.stopPropagation();setHover(i)}} onPointerOut={()=>setHover(null)}>
   <sphereGeometry args={[i===selected?.14:.075,12,10]}/>
   <meshStandardMaterial color={i===selected?"#ffc06a":neighbours.has(i)?"#76dbff":"#68839b"} emissive={i===selected?"#ad6529":"#263b5b"} emissiveIntensity={.35} transparent opacity={neighbours.has(i)?1:.6} depthTest={false}/>
   {(hover===i||selected===i)&&<Html distanceFactor={10} style={{pointerEvents:"none",whiteSpace:"nowrap"}}><span className="node-label">{n.label}</span></Html>}
  </mesh>)}
 </group>;
}
function CameraController({snap}:{snap:CameraSnap}){
 const {camera}=useThree();
 const controls=useRef<ComponentRef<typeof OrbitControls>>(null);
 useEffect(()=>{
   // Anatomical MNI y (rostral/anterior) maps to scene -z.
   // Anatomical MNI z (superior) maps to scene +y.
   const directions:Record<ViewDirection,[number,number,number]>={
     rostral:[0,0,-1],
     caudal:[0,0,1],
     top:[0,1,0],
     bottom:[0,-1,0]
   };
   const [x,y,z]=directions[snap.direction];
   const distance=Math.max(9,camera.position.length());
   camera.position.set(x*distance,y*distance,z*distance);
   camera.up.set(0,Math.abs(y)>0?0:1,Math.abs(y)>0?-1:0);
   camera.lookAt(0,0,0);
   controls.current?.target.set(0,0,0);
   controls.current?.update();
 },[camera,snap.direction,snap.serial]);
 return <OrbitControls ref={controls} makeDefault enablePan enableZoom minDistance={3} maxDistance={30}/>;
}
export default function Scene(props:{nodes:Node[];edges:Edge[];selected:number;onSelect:(i:number)=>void;layers:LayerSettings;snap:CameraSnap}){
 return <Canvas camera={{position:[0,0,12],fov:45}} gl={{antialias:true}} dpr={[1,2]}>
  <color attach="background" args={["#091426"]}/><ambientLight intensity={1.3}/><pointLight position={[10,10,10]} intensity={60}/>
  <Network {...props}/><CameraController snap={props.snap}/>
 </Canvas>;
}
