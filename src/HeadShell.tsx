import { useMemo } from "react";
import * as THREE from "three";

/**
 * Illustrative, MNI-oriented head context surface (not an individual MRI).
 * MNI coordinates are in millimetres: +Y anterior, +Z superior.
 * Keep exactly the same transform as src/Scene.tsx.
 */
const SCALE = 0.052;
const inScene = (x:number,y:number,z:number):[number,number,number] =>
  [x*SCALE,z*SCALE,-y*SCALE];

type HeadProps = {
  center:THREE.Vector3;
  opacity:number;
  wireframe:boolean;
};

// z level, left/right half-width, anterior/posterior half-depth, depth offset.
// MNI y positive = anterior. Keep the lower posterior contour continuous:
// a gradual occipital-to-nuchal slope rather than the old abrupt bulge
// around z=-73 (which looked like an overhanging cerebellar hood).
// Lower anterior rings form a longer, rounded chin-to-neck transition.
// This remains a generic illustrative mask, NOT a subject-specific scalp.
const profile:ReadonlyArray<readonly [number,number,number,number]> = [
  [-145,33,37,-19],
  [-134,37,42,-18],
  [-124,39,47,-17],
  [-115,43,54,-14],
  [-105,47,62,-12],
  [-96,52,68,-10],
  [-86,59,77,-9],
  [-73,68,88,-12],
  [-55,75,100,-12],
  [-34,83,103,-13],
  [-9,85,102,-16],
  [18,85,102,-16],
  [47,83,96,-16],
  [76,66,81,-14],
  [90,50,64,-15],
  [100,24,36,-14],
  [105,0,0,-12]
];

function smoothProfile(z:number):[number,number,number]{
  let i=0;
  while(i<profile.length-2&&z>profile[i+1][0])i++;
  const a=profile[i],b=profile[i+1],span=b[0]-a[0];
  const u=THREE.MathUtils.clamp((z-a[0])/span,0,1);
  const u2=u*u,u3=u2*u;
  const h00=2*u3-3*u2+1,h10=u3-2*u2+u,h01=-2*u3+3*u2,h11=u3-u2;
  const prev=profile[Math.max(0,i-1)];
  const next=profile[Math.min(profile.length-1,i+2)];
  const result:[number,number,number]=[0,0,0];
  for(let k=1;k<=3;k++){
    const m0=i===0?0:(b[k]-prev[k])/(b[0]-prev[0]);
    const m1=i===profile.length-2?0:(next[k]-a[k])/(next[0]-a[0]);
    result[k-1]=h00*a[k]+h10*span*m0+h01*b[k]+h11*span*m1;
  }
  result[0]=Math.max(0,result[0]);
  result[1]=Math.max(0,result[1]);
  return result;
}

const gaussian=(v:number,width:number)=>Math.exp(-0.5*(v/width)**2);

function makeHeadGeometry():THREE.BufferGeometry {
  const rows=148,segments=144;
  const positions:number[]=[];
  const indices:number[]=[];
  for(let row=0;row<=rows;row++){
    const z=profile[0][0]+(profile[profile.length-1][0]-profile[0][0])*row/rows;
    const [radiusX,radiusY,offsetY]=smoothProfile(z);
    for(let col=0;col<=segments;col++){
      const theta=2*Math.PI*col/segments;
      const frontAngle=Math.atan2(Math.sin(theta),Math.cos(theta));
      const absAngle=Math.abs(frontAngle);
      const front=gaussian(frontAngle,.5);

      // Nose: a narrow bridge blended into a restrained rounded tip,
      // with subtle alar (nostril-side) contour. No single giant "beak" bump.
      const bridge=11*gaussian(frontAngle,.13)*gaussian(z-3,26);
      const tip=20*gaussian(frontAngle,.16)*gaussian(z+32,11);
      const nostrils=3.0*gaussian(absAngle-.17,.07)*gaussian(z+40,8);
      const subnasal=-3.5*gaussian(frontAngle,.25)*gaussian(z+47,6);

      // Eyes, brows and cheekbones are soft surface deformations rather
      // than separate geometric spheres or sharp ridges.
      const eyeSockets=-6*gaussian(absAngle-.27,.13)*gaussian(z+1,17);
      const brows=3.5*gaussian(absAngle-.29,.12)*gaussian(z-20,11);
      const cheeks=3.5*gaussian(absAngle-.39,.2)*gaussian(z+49,21);

      // Chin is broad/rounded and merges into a sloping lower jaw and neck.
      // Minor lip/philtrum shaping keeps the mouth from reading as a cone.
      const philtrum=-2*gaussian(frontAngle,.21)*gaussian(z+55,5);
      const upperLip=2.2*gaussian(frontAngle,.24)*gaussian(z+63,5);
      const lowerLip=2.5*gaussian(frontAngle,.25)*gaussian(z+72,5);
      const underLip=-2.2*gaussian(frontAngle,.28)*gaussian(z+79,5);
      // The chin's lower contour should extend BELOW the former short
      // mandible, while easing into the front of the neck without a point.
      const chin=22*gaussian(frontAngle,.37)*gaussian(z+104,21);
      const chinDrop=14*gaussian(frontAngle,.48)*gaussian(z+109,21);

      // Pull the low nuchal surface forward slightly. The upper occipital
      // shape is preserved to allow a loose envelope around the cerebellum.
      const backAngle=Math.PI-absAngle;
      const nuchalTuck=6*gaussian(backAngle,.52)*gaussian(z+81,19);
      const jawNarrowing=.11*front*gaussian(z+105,25);
      const x=radiusX*Math.sin(theta)*(1-jawNarrowing);
      const y=offsetY+radiusY*Math.cos(theta)
        +bridge+tip+nostrils+subnasal
        +eyeSockets+brows+cheeks
        +philtrum+upperLip+lowerLip+underLip+chin+nuchalTuck;
      const chinZ=z-chinDrop;
      positions.push(...inScene(x,y,chinZ));
    }
  }
  for(let row=0;row<rows;row++){
    for(let col=0;col<segments;col++){
      const a=row*(segments+1)+col,b=a+segments+1;
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
  const ears=useMemo(()=>[-1,1].map(side=>
    inScene(side*91,-21,-25)
  ),[]);
  return <group position={[-center.x,-center.y,-center.z]}>
    <mesh geometry={geometry} renderOrder={0}>
      <meshPhongMaterial
        color="#a8d9e4"
        specular="#89d9ed"
        shininess={30}
        transparent
        opacity={opacity}
        depthWrite={false}
        side={THREE.DoubleSide}
        wireframe={wireframe}
      />
    </mesh>
    {ears.map((pos,i)=><mesh key={i} position={pos} scale={[.42,.86,.32]} renderOrder={0}>
      <sphereGeometry args={[1,28,22]}/>
      <meshPhongMaterial color="#a8d9e4" transparent opacity={opacity} depthWrite={false} wireframe={wireframe} side={THREE.DoubleSide}/>
    </mesh>)}
  </group>;
}
