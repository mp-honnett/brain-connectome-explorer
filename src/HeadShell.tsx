import { useMemo } from "react";
import * as THREE from "three";

/**
 * A generic, smoothly parameterised head shell in MNI-like millimetre space.
 * This is an ILLUSTRATIVE reference shape, not an MRI scalp segmentation.
 *
 * Coordinate mapping matches Scene.tsx and the Shen268 anatomical envelope:
 *   x = left/right, y = superior/inferior, z = posterior/anterior reversed.
 * The frontal face / nose protrudes towards MNI +Y (scene -Z).
 */
const SCALE = 0.052;
const inScene = (x:number,y:number,z:number):[number,number,number] =>
  [x*SCALE,z*SCALE,-y*SCALE];

type HeadProps = {
  center:THREE.Vector3;
  opacity:number;
  wireframe:boolean;
};

const profile:[number,number,number,number][] = [
  // MNI Z mm, left/right radius, front/back radius, front/back centre
  [-120, 0, 0, 64],
  [-110, 23, 26, 65],
  [-95, 42, 51, 51],
  [-75, 60, 74, 26],
  [-50, 75, 90, 7],
  [-24, 86, 102, -1],
  [5, 94, 111, -3],
  [35, 97, 109, -7],
  [65, 88, 98, -10],
  [92, 66, 76, -11],
  [110, 37, 43, -10],
  [122, 0, 0, -10]
];

function smoothProfile(z:number):[number,number,number] {
  let i=0;
  while(i<profile.length-2 && z>profile[i+1][0]) i++;
  const a=profile[i],b=profile[i+1];
  const u=THREE.MathUtils.clamp((z-a[0])/(b[0]-a[0]),0,1);
  const t=u*u*(3-2*u);
  return [
    THREE.MathUtils.lerp(a[1],b[1],t),
    THREE.MathUtils.lerp(a[2],b[2],t),
    THREE.MathUtils.lerp(a[3],b[3],t)
  ];
}

function makeHeadGeometry(){
  const rings=100;
  const segments=112;
  const positions:number[]=[];
  const indices:number[]=[];

  for(let row=0;row<=rings;row++){
    const z=-120+242*row/rings;
    const [radiusX,radiusY,offsetY]=smoothProfile(z);
    for(let col=0;col<=segments;col++){
      const angle=2*Math.PI*col/segments;
      const signedAngle=Math.atan2(Math.sin(angle),Math.cos(angle));
      const gaussian=(distance:number,sigma:number)=>
        Math.exp(-0.5*(distance/sigma)**2);

      // A gentle brow ridge, paired eye hollows, cheekbones, and a central nose.
      // These features provide orientation without suggesting subject-specific anatomy.
      const nose=27*gaussian(signedAngle,.16)*gaussian(z+27,24);
      const noseBridge=9*gaussian(signedAngle,.14)*gaussian(z-7,24);
      const brows=4*gaussian(Math.abs(signedAngle)-.31,.12)*gaussian(z-24,11);
      const eyes=-4*gaussian(Math.abs(signedAngle)-.34,.13)*gaussian(z-2,15);
      const cheeks=4*gaussian(Math.abs(signedAngle)-.43,.17)*gaussian(z+40,23);
      const x=radiusX*Math.sin(angle);
      const y=offsetY+radiusY*Math.cos(angle)+nose+noseBridge+brows+eyes+cheeks;
      positions.push(...inScene(x,y,z));
    }
  }

  for(let row=0;row<rings;row++){
    for(let col=0;col<segments;col++){
      const a=row*(segments+1)+col;
      const b=a+segments+1;
      indices.push(a,b,a+1,b,b+1,a+1);
    }
  }

  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.Float32BufferAttribute(positions,3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export default function HeadShell({center,opacity,wireframe}:HeadProps){
  const geometry=useMemo(()=>makeHeadGeometry(),[]);
  const ears=useMemo(()=>[-1,1].map(side=>{
    const [x,y,z]=inScene(side*99,-14,-26);
    return [x,y,z] as [number,number,number];
  }),[]);
  return <group position={[-center.x,-center.y,-center.z]}>
    <mesh geometry={geometry} renderOrder={0}>
      <meshPhongMaterial
        color="#a8d9e4"
        specular="#89d9ed"
        shininess={42}
        transparent
        opacity={opacity}
        depthWrite={false}
        side={THREE.DoubleSide}
        wireframe={wireframe}
      />
    </mesh>
    {ears.map((pos,i)=><mesh key={i} position={pos} scale={[.24,.36,.14]} renderOrder={0}>
      <sphereGeometry args={[1,20,16]}/>
      <meshPhongMaterial color="#a8d9e4" transparent opacity={opacity} depthWrite={false} wireframe={wireframe} side={THREE.DoubleSide}/>
    </mesh>)}
  </group>;
}
