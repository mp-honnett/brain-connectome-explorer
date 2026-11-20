import { Html } from "@react-three/drei";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { LOBES, type LobeId, type LobeSelection } from "./lobePalette";

/**
 * Educational, not a registered anatomical segmentation.
 *
 * Adjacent guide volumes are generated from overlapping implicit ellipsoids.
 * In any shared area, the volume is assigned to the lobe with the strongest
 * local field value. The partition boundaries are therefore shared, with no
 * doubled translucent volume. This is NOT a mapped sulcal boundary.
 *
 * MNI +y is anterior and +z is superior; scene transforms to [x,z,-y].
 */
const SCALE = .052;
const STEP = 4; // millimetres: lightweight, smooth enough at overview scale
const OUTER = LOBES.filter(lobe=>lobe.id!=="insula");
type Profile = (typeof LOBES)[number];

function strength(lobe:Profile,x:number,y:number,z:number):number {
  const [cx,cy,cz]=lobe.center;
  const [rx,ry,rz]=lobe.radii;
  const dx=(x-cx)/rx,dy=(y-cy)/ry,dz=(z-cz)/rz;
  switch(lobe.id){
    case "frontal":
      // Subtler inferior taper and a slightly broader forward dome.
      return 1-dx*dx*(z<cz?1.12:1)-dy*dy*(y<cy?1.07:.94)-dz*dz;
    case "parietal":
      // Broad superior cap, flatter underside.
      return 1-dx*dx-dy*dy-dz*dz*(z<cz?1.22:.94);
    case "temporal":
      // Low and elongated almond, tapering laterally at its ends.
      return 1-dx*dx*(1+.22*dy*dy)-dy*dy-dz*dz*1.08;
    case "occipital":
      // Compact posterior wedge, with less bulk anteriorly.
      return 1-dx*dx*(y>cy?1.16:1)-dy*dy-dz*dz;
    case "insula":
      return 1-dx*dx*1.25-dy*dy-dz*dz*1.1;
  }
}

/** Positive exactly inside the part assigned to this lobe. */
function partitionField(lobe:Profile,x:number,y:number,z:number):number {
  const own=strength(lobe,x,y,z);
  if(lobe.id==="insula")return own; // deep lobe is isolated when selected
  let competing=-Infinity;
  for(const other of OUTER){
    if(other.id!==lobe.id)competing=Math.max(competing,strength(other,x,y,z));
  }
  // This field is nonpositive where another lobe has a greater claim;
  // zero crossings become touching partition surfaces, not intersections.
  return Math.min(own,(own-competing)*.5);
}

// Tetrahedral decomposition of a cube; no CSG dependency required.
const CUBE_TETS=[
  [0,5,1,6],[0,1,2,6],[0,2,3,6],
  [0,3,7,6],[0,7,4,6],[0,4,5,6]
] as const;
const CORNERS=[
  [0,0,0],[1,0,0],[1,1,0],[0,1,0],
  [0,0,1],[1,0,1],[1,1,1],[0,1,1]
] as const;
type Vec=[number,number,number];

function createVolume(lobe:Profile):THREE.BufferGeometry {
  const [cx,cy,cz]=lobe.center;
  const [rx,ry,rz]=lobe.radii;
  const min:[number,number,number]=[
    Math.max(0,Math.floor((cx-rx-STEP*2)/STEP)*STEP),
    Math.floor((cy-ry-STEP*2)/STEP)*STEP,
    Math.floor((cz-rz-STEP*2)/STEP)*STEP
  ];
  const count:[number,number,number]=[
    Math.ceil((cx+rx+STEP*2-min[0])/STEP),
    Math.ceil((cy+ry+STEP*2-min[1])/STEP),
    Math.ceil((cz+rz+STEP*2-min[2])/STEP)
  ];
  const [nx,ny,nz]=count;
  const sx=nx+1,sy=ny+1;
  const idx=(i:number,j:number,k:number)=>i+sx*(j+sy*k);
  const samples=new Float32Array(sx*sy*(nz+1));
  for(let k=0;k<=nz;k++)for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
    samples[idx(i,j,k)]=partitionField(lobe,min[0]+i*STEP,min[1]+j*STEP,min[2]+k*STEP);
  }

  const vertices:number[]=[];
  const push=(p:Vec)=>vertices.push(p[0]*SCALE,p[2]*SCALE,-p[1]*SCALE);
  const interp=(a:Vec,b:Vec,va:number,vb:number):Vec=>{
    const t=Math.max(0,Math.min(1,va/(va-vb)));
    return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
  };
  const triangle=(a:Vec,b:Vec,c:Vec)=>{push(a);push(b);push(c)};
  for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
    const positions=CORNERS.map(([di,dj,dk])=>[
      min[0]+(i+di)*STEP,min[1]+(j+dj)*STEP,min[2]+(k+dk)*STEP
    ] as Vec);
    const vals=CORNERS.map(([di,dj,dk])=>samples[idx(i+di,j+dj,k+dk)]);
    const mn=Math.min(...vals),mx=Math.max(...vals);
    if(mn>=0||mx<0)continue;
    for(const tet of CUBE_TETS){
      const inside=tet.filter(t=>vals[t]>=0);
      const outside=tet.filter(t=>vals[t]<0);
      if(!inside.length||!outside.length)continue;
      const cut=(a:number,b:number)=>interp(positions[a],positions[b],vals[a],vals[b]);
      if(inside.length===1){
        const v=inside[0];
        triangle(cut(v,outside[0]),cut(v,outside[1]),cut(v,outside[2]));
      }else if(inside.length===3){
        const v=outside[0];
        triangle(cut(v,inside[0]),cut(v,inside[2]),cut(v,inside[1]));
      }else{
        const [a,b]=inside,[c,d]=outside;
        const ac=cut(a,c),ad=cut(a,d),bc=cut(b,c),bd=cut(b,d);
        triangle(ac,ad,bc);triangle(ad,bd,bc);
      }
    }
  }
  const geom=new THREE.BufferGeometry();
  geom.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));
  // Smooth gradients from the implicit field give soft, non-faceted shading
  // despite non-indexed marching-tetrahedron surfaces.
  const normals:number[]=[];
  const delta=1.2;
  for(let i=0;i<vertices.length;i+=3){
    const x=vertices[i]/SCALE,y=-vertices[i+2]/SCALE,z=vertices[i+1]/SCALE;
    const gx=partitionField(lobe,x+delta,y,z)-partitionField(lobe,x-delta,y,z);
    const gy=partitionField(lobe,x,y+delta,z)-partitionField(lobe,x,y-delta,z);
    const gz=partitionField(lobe,x,y,z+delta)-partitionField(lobe,x,y,z-delta);
    const len=Math.hypot(gx,gy,gz)||1;
    normals.push(-gx/len,-gz/len,gy/len);
  }
  geom.setAttribute("normal",new THREE.Float32BufferAttribute(normals,3));
  geom.computeBoundingSphere();
  return geom;
}

export default function LobeOverlay({center,selection}:{
  center:THREE.Vector3;
  selection:LobeSelection;
}){
  const [hovered,setHovered]=useState<string|null>(null);
  const geometries=useMemo(()=>Object.fromEntries(
    LOBES.map(lobe=>[lobe.id,createVolume(lobe)])
  ) as Record<LobeId,THREE.BufferGeometry>,[]);
  useEffect(()=>()=>Object.values(geometries).forEach(g=>g.dispose()),[geometries]);

  return <group position={[-center.x,-center.y,-center.z]}>
    {LOBES.flatMap(lobe=>([-1,1] as const).map(side=>{
      const focused=selection===lobe.id;
      if(lobe.id==="insula"&&!focused)return null;
      if(selection!=="all"&&!focused)return null;
      const id=side+"-"+lobe.id;
      const name=(side<0?"Left":"Right")+" "+lobe.name;
      const pos:[number,number,number]=[
        side*lobe.center[0]*SCALE,lobe.center[2]*SCALE,-lobe.center[1]*SCALE
      ];
      return <group key={id} scale={[side,1,1]}>
        <mesh geometry={geometries[lobe.id]}
          onPointerOver={e=>{e.stopPropagation();setHovered(id)}}
          onPointerOut={()=>setHovered(null)}>
          <meshPhongMaterial color={lobe.color} side={THREE.DoubleSide}
            shininess={12} specular="#334958" transparent
            opacity={focused?.27:.15} depthWrite={false}/>
        </mesh>
        {(focused||hovered===id)&&<Html position={[side*pos[0],pos[1],pos[2]]}
          distanceFactor={10} center style={{pointerEvents:"none",whiteSpace:"nowrap"}}>
          <span className="lobe-label">{name} · partitioned schematic guide</span>
        </Html>}
      </group>;
    }))}
  </group>;
}
