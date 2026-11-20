import { useEffect, useMemo } from "react";
import * as THREE from "three";

const MNI_SCALE = 0.052;

/**
 * The uploaded SU39 CT model is not from the Shen268 participant or template.
 * Its glTF scene already bakes the Sketchfab Y-up orientation.
 * Scale and translation below are an APPROXIMATE visual fit only.
 * There is no MRI-based anatomical registration.
 */
export default function SkullLayer({
  source,
  center,
  opacity,
  wireframe
}: {
  source: THREE.Group;
  center: THREE.Vector3;
  opacity: number;
  wireframe: boolean;
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

  return <group position={[-center.x, -center.y + 15 * MNI_SCALE, -center.z]}>
    <primitive object={clone} scale={MNI_SCALE * 1.18}/>
  </group>;
}
