import { useEffect, useMemo } from "react";
import * as THREE from "three";

const MNI_SCALE = 0.052;

/**
 * The uploaded SU39 CT model is not from the Shen268 participant or template.
 * Its glTF scene already bakes the Sketchfab Y-up orientation.
 * The SU39 default yaw is 180 degrees: its originally imported nose faced\n * posterior instead of anterior. This rotation and placement are an\n * APPROXIMATE visual fit only.
 * There is no MRI-based anatomical registration.
 */
export default function SkullLayer({
  source,
  center,
  opacity,
  wireframe,
  yawDegrees
}: {
  source: THREE.Group;
  center: THREE.Vector3;
  opacity: number;
  wireframe: boolean;
  yawDegrees: number;
}) {
  const clone = useMemo(() => {
    const model = source.clone(true);
    model.traverse(object => {
      if (!(object instanceof THREE.Mesh)) return;
      object.material = new THREE.MeshStandardMaterial({
        color: "#e5d9c5",
        roughness: .86,
        metalness: 0,
        side: THREE.DoubleSide,
        transparent: true,
        opacity,
        depthWrite: false,
        wireframe
      });
      object.renderOrder = 2;
    });
    return model;
  }, [source, opacity, wireframe]);

  useEffect(() => {
    return () => {
      clone.traverse(object => {
        if (object instanceof THREE.Mesh) {
          (object.material as THREE.Material).dispose();
        }
      });
    };
  }, [clone]);

  // Rotate about the model's bounds centre, not the original glTF origin.
  // This prevents the skull swinging away from the brain as yaw changes.
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
