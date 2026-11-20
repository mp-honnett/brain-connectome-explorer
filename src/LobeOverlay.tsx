import { Html } from "@react-three/drei";
import { useMemo, useState } from "react";
import * as THREE from "three";
import { LOBES, type LobeId, type LobeSelection } from "./lobePalette";

/**
 * Gently deformed orientation guides, NOT cortical anatomical segmentation.
 * The template is a unit sphere; individual deformation rules avoid
 * the original perfectly round bubble appearance without introducing
 * false claims about gyri, sulci, or atlas-derived lobe boundaries.
 *
 * Local coordinates: x lateral, y superior, z posterior.
 * Deformations are applied before bilateral mirroring in Scene x.
 */
function makeGuide(id:LobeId):THREE.BufferGeometry {
  const geom=new THREE.SphereGeometry(1,36,24);
  const pos=geom.getAttribute("position") as THREE.BufferAttribute;
  const v=new THREE.Vector3();
  for(let i=0;i<pos.count;i++){
    v.fromBufferAttribute(pos,i);
    const x=v.x,y=v.y,z=v.z;
    switch(id){
      case "frontal": {
        // Posterior edge is flatter; taper gently toward lower frontal face.
        const rear=z>0?1-.22*Math.pow(z,2):1;
        const low=y<0?1+.10*y:1;
        v.set(x*rear*low,y*(y>0?.93:1),z*rear);
        break;
      }
      case "parietal": {
        // Superior dome with a softened inferior face, not a ball.
        const lower=y<0?1+.30*y:1;
        v.set(x*(1+.08*y),y<0?y*.60:y*.95,z*lower);
        break;
      }
      case "temporal": {
        // Low almond: fuller anterior-midsection, taper at both ends.
        const endTaper=1-.28*Math.pow(Math.abs(z),1.6);
        v.set(x*endTaper,y*endTaper + .08*z,z);
        break;
      }
      case "occipital": {
        // Rounded posterior wedge with a shallow, flatter anterior surface.
        const front=z<0?1+.24*z:1;
        const inferior=y<0?1+.18*y:1;
        v.set(x*front*inferior,y*front,z*.97);
        break;
      }
      case "insula": {
        // Internal narrow leaf-shaped guide, hidden in overview.
        const ends=1-.24*Math.abs(z);
        v.set(x*.85*ends,y*.86*ends,z);
        break;
      }
    }
    pos.setXYZ(i,v.x,v.y,v.z);
  }
  geom.computeVertexNormals();
  return geom;
}

export default function LobeOverlay({
  center,
  selection
}: {
  center: THREE.Vector3;
  selection: LobeSelection;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const geometries=useMemo(() => Object.fromEntries(
    LOBES.map(lobe=>[lobe.id,makeGuide(lobe.id)])
  ) as Record<LobeId,THREE.BufferGeometry>,[]);

  return <group>
    {LOBES.flatMap(lobe => ([-1,1] as const).map(side => {
      const id=side+"-"+lobe.id;
      const focused=selection===lobe.id;
      // Insula is a hidden deep structure; show only when selected.
      if(lobe.id==="insula"&&!focused) return null;
      const visible=selection==="all"||focused;
      const position:[number,number,number]=[
        side*lobe.center[0]*.052-center.x,
        lobe.center[2]*.052-center.y,
        -lobe.center[1]*.052-center.z
      ];
      const scale:[number,number,number]=[
        lobe.radii[0]*.052,
        lobe.radii[2]*.052,
        lobe.radii[1]*.052
      ];
      const geometry=geometries[lobe.id];
      return <group key={id} position={position} rotation={[0,side*(lobe.id==="temporal"?-.12:lobe.id==="parietal"?.10:-.06),0]}>
        <mesh geometry={geometry} scale={scale}
          onPointerOver={e=>{e.stopPropagation();setHovered(id)}}
          onPointerOut={()=>setHovered(null)}>
          <meshBasicMaterial color={lobe.color} side={THREE.DoubleSide}
            transparent opacity={focused?.22:visible?.085:.007} depthWrite={false}/>
        </mesh>
        {visible&&<mesh geometry={geometry} scale={scale.map(v=>v*1.012) as [number,number,number]}>
          <meshBasicMaterial color={lobe.color} wireframe transparent
            opacity={focused?.25:.07} depthWrite={false}/>
        </mesh>}
        {visible&&(hovered===id||focused)&&<Html distanceFactor={10} center
          style={{pointerEvents:"none",whiteSpace:"nowrap"}}>
          <span className="lobe-label">{side<0?"Left":"Right"} {lobe.name} · schematic guide</span>
        </Html>}
      </group>;
    }))}
  </group>;
}
