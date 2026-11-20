import { useEffect, useMemo } from "react";
import * as THREE from "three";

const MNI_SCALE = 0.052;

/**
 * Form a sparse, connected triangle cage from a high-resolution imported
 * surface by averaging vertices that fall in the same 3-D grid cell.
 * The model's original geometry is never changed or disposed.
 *
 * This is a VISUAL wireframe reference, not the original CT mesh topology.
 * It removes the dense triangles that previously obscured Shen markers.
 */
function sparseWireframeGeometry(original: THREE.BufferGeometry, detail: number): THREE.BufferGeometry {
  const positions = original.getAttribute("position");
  if (!positions || positions.count < 3) return new THREE.BufferGeometry();

  original.computeBoundingBox();
  const bounds = original.boundingBox!;
  const size = bounds.getSize(new THREE.Vector3());
  const cellSize = Math.max(Math.max(size.x, size.y, size.z) / detail, 1e-6);

  const vertexToCell = new Int32Array(positions.count);
  const cellIds = new Map<string, number>();
  const sums: Array<{x:number;y:number;z:number;n:number}> = [];
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i), y = positions.getY(i), z = positions.getZ(i);
    const key = [
      Math.floor((x - bounds.min.x) / cellSize),
      Math.floor((y - bounds.min.y) / cellSize),
      Math.floor((z - bounds.min.z) / cellSize)
    ].join(",");
    let id = cellIds.get(key);
    if (id === undefined) {
      id = sums.length;
      cellIds.set(key, id);
      sums.push({x:0,y:0,z:0,n:0});
    }
    vertexToCell[i] = id;
    const sum = sums[id];
    sum.x += x; sum.y += y; sum.z += z; sum.n++;
  }

  const vertices: number[] = [];
  for (const p of sums) vertices.push(p.x / p.n, p.y / p.n, p.z / p.n);

  const indices: number[] = [];
  const uniqueFaces = new Set<string>();
  const srcIndices = original.index;
  const triangleCount = Math.floor((srcIndices?.count ?? positions.count) / 3);
  for (let i = 0; i < triangleCount; i++) {
    const a = vertexToCell[srcIndices ? srcIndices.getX(i * 3) : i * 3];
    const b = vertexToCell[srcIndices ? srcIndices.getX(i * 3 + 1) : i * 3 + 1];
    const c = vertexToCell[srcIndices ? srcIndices.getX(i * 3 + 2) : i * 3 + 2];
    if (a === b || b === c || c === a) continue;
    const key = [a,b,c].sort((u,v)=>u-v).join(",");
    if (uniqueFaces.has(key)) continue;
    uniqueFaces.add(key);
    indices.push(a,b,c);
  }

  const result = new THREE.BufferGeometry();
  result.setAttribute("position", new THREE.Float32BufferAttribute(vertices,3));
  result.setIndex(indices);
  return result;
}

/**
 * Imported CT models are only approximate anatomical context and have not
 * been registered to Shen268. Skull wireframe must remain subordinate to
 * the functional-connectivity points and lines.
 */
export default function SkullLayer({
  source,
  center,
  opacity,
  wireframe,
  wireframeDetail,
  yawDegrees
}: {
  source: THREE.Group;
  center: THREE.Vector3;
  opacity: number;
  wireframe: boolean;
  wireframeDetail: number;
  yawDegrees: number;
}) {
  const clone = useMemo(() => {
    const model = source.clone(true);
    model.traverse(object => {
      if (object instanceof THREE.Points) {
        // Point clouds have no mesh edges. In this case 0% hides the points.
        object.material = new THREE.PointsMaterial({
          size: .055,
          sizeAttenuation: true,
          vertexColors: true,
          transparent: true,
          opacity: opacity * .5,
          depthWrite: false
        });
        object.renderOrder = -3;
        return;
      }
      if (!(object instanceof THREE.Mesh)) return;
      if (wireframe) {
        // Build a sparse cage in place of a full-resolution triangle wireframe.
        // Keep the original imported source geometry completely untouched.
        object.geometry = sparseWireframeGeometry(object.geometry, wireframeDetail);
        object.userData.headspinCoarseWireframe = true;
        object.material = new THREE.MeshBasicMaterial({
          color: "#9cbdcd",
          side: THREE.DoubleSide,
          transparent: true,
          opacity: .18,
          depthTest: true,
          depthWrite: false,
          wireframe: true
        });
      } else {
        object.material = new THREE.MeshStandardMaterial({
          color: "#e5d9c5",
          roughness: .86,
          metalness: 0,
          side: THREE.DoubleSide,
          transparent: true,
          opacity,
          depthWrite: false
        });
      }
      // Draw CT context first: neural markers/lines must stay dominant.
      object.renderOrder = -3;
    });
    return model;
  }, [source, opacity, wireframe, wireframeDetail]);

  useEffect(() => () => {
    clone.traverse(object => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
        (object.material as THREE.Material).dispose();
        if (object instanceof THREE.Mesh && object.userData.headspinCoarseWireframe) {
          object.geometry.dispose();
        }
      }
    });
  }, [clone]);

  const pivot = useMemo(() => {
    const bounds = new THREE.Box3().setFromObject(source);
    return bounds.getCenter(new THREE.Vector3()).multiplyScalar(MNI_SCALE * 1.18);
  }, [source]);
  const yaw = THREE.MathUtils.degToRad(yawDegrees);

  return <group position={[-center.x, -center.y + 15 * MNI_SCALE, -center.z]}>
    <group position={pivot.toArray()} rotation={[0, yaw, 0]}>
      <group position={[-pivot.x, -pivot.y, -pivot.z]}>
        <primitive object={clone} scale={MNI_SCALE * 1.18}/>
      </group>
    </group>
  </group>;
}
