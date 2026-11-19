import { Html } from "@react-three/drei";
import { useState } from "react";
import * as THREE from "three";
import { LOBES, type LobeSelection } from "./lobePalette";

/**
 * Schematic, bilateral educational lobe guides.
 *
 * Locations and rounded shapes are manually chosen for visual orientation
 * in the project's MNI-like scene, NOT a validated segmentation, sulcal
 * boundary, label assignment or overlap of Shen268 with an anatomical atlas.
 * In particular, an insula guide sphere does not imply a cortical surface.
 */
export default function LobeOverlay({
  center,
  selection
}: {
  center: THREE.Vector3;
  selection: LobeSelection;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return <group>
    {LOBES.flatMap(lobe => ([-1, 1] as const).map(side => {
      const name = (side < 0 ? "Left" : "Right") + " " + lobe.name;
      const id = side + "-" + lobe.id;
      const focused = selection === lobe.id;
      const visible = selection === "all" || focused;
      // MNI x = left/right, y = anterior/posterior, z = superior/inferior.
      // Scene x = MNI x, scene y = MNI z, scene z = -MNI y.
      const position: [number, number, number] = [
        side * lobe.center[0] * .052 - center.x,
        lobe.center[2] * .052 - center.y,
        -lobe.center[1] * .052 - center.z
      ];
      const scale: [number, number, number] = [
        lobe.radii[0] * .052,
        lobe.radii[2] * .052,
        lobe.radii[1] * .052
      ];
      return <group key={id} position={position}>
        <mesh
          scale={scale}
          onPointerOver={e => { e.stopPropagation(); setHovered(id); }}
          onPointerOut={() => setHovered(null)}
        >
          <sphereGeometry args={[1, 24, 16]}/>
          <meshBasicMaterial
            color={lobe.color}
            side={THREE.DoubleSide}
            transparent
            opacity={focused ? .23 : visible ? .10 : .01}
            depthWrite={false}
          />
        </mesh>
        {visible && <mesh scale={scale}>
          <sphereGeometry args={[1.01, 16, 10]}/>
          <meshBasicMaterial
            color={lobe.color}
            wireframe
            transparent
            opacity={focused ? .27 : .085}
            depthWrite={false}
          />
        </mesh>}
        {visible && (hovered === id || focused) && <Html
          distanceFactor={10}
          center
          style={{pointerEvents:"none",whiteSpace:"nowrap"}}
        ><span className="lobe-label">{name} · schematic guide</span></Html>}
      </group>;
    }))}
  </group>;
}
