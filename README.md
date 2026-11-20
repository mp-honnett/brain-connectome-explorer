# HeadSpin

**HeadSpin** is an interactive 3D visualisation application. Rotate a transparent head, view the CT-derived skull as an optional user-imported layer, explore schematic brain lobes and inspect functional connectivity.

The GitHub repository is deliberately still named `brain-connectome-explorer` to preserve the existing project URL and deployment configuration. The public-facing product name is **HeadSpin**.

The React/Three.js visualisation is intended for verified YaleNeuroConnect (OpenNeuro ds007286) Shen268 connectivity measurements.

**Data status:** The app bundles a **provisional, real single-participant** YaleNeuroConnect sample in `public/data/connectome.json` (rest and n-back). The exact atlas parcel ID to matrix row correspondence has not been independently validated. Importing a different validated JSON is also supported. No synthetic neuroscience measurements are presented as real.

## Run

```bash
npm install
npm run dev
```

The bundled sample loads automatically. To compare other data, import a processed JSON file containing `nodes`, `conditions` and `metadata` (see `src/types.ts`). Atlas parcel IDs and matrix row order must be independently verified before presenting it as scientific output.

## Publish

Set Settings > Pages > Source to GitHub Actions. A workflow deploys `dist` from the `main` branch.

Dataset: https://openneuro.org/datasets/ds007286
Atlas: https://github.com/YaleMRRC/YaleNeuroConnect_FullPredictions

This is an educational software prototype; correlations are not physical tracts or evidence of causation.
## Anatomical context layer

The viewer now supports an independently toggled translucent, atlas-registered brain envelope, parcel-centre markers and functional-correlation lines. The mesh is reproducibly generated from the Shen268 label NIfTI by `scripts/prepare_brain_envelope.py` and stored at `public/assets/brain-envelope.glb`. It is a smoothed atlas outline, **not** a patient-specific anatomical MRI or a white-matter tract reconstruction. Change surface opacity in the sidebar to see internal nodes. Functional edges are correlations, **not** physical tracts.

## Head context layer

The optional **transparent human head** is a lightweight parametric, generic shape generated at runtime (`src/HeadShell.tsx`). It is positioned in the same MNI-like coordinate frame as the atlas-derived brain envelope and parcels. It includes simplified facial landmarks to orient rostral/caudal views; it is **not** a patient-specific scalp scan, anatomical segmentation or ground-truth cranial surface. The sidebar offers visibility, opacity and wireframe controls. Brain surfaces and connectivity are separate, independently controllable layers.

## Anatomical camera presets and lobe guide

The camera has six snap views: rostral (front), caudal (back), dorsal (top), ventral (bottom), **left lateral** and **right lateral**, using the subject's anatomical directions.

The new **Anatomy guide · schematic** sidebar panel shows translucent bilateral lobe orientation volumes with a selectable Tweenbrain colour legend:

| Lobe | Colour |
| --- | --- |
| Frontal | `#E8A24B` |
| Parietal | `#55B8E7` |
| Temporal | `#B598EC` |
| Occipital | `#61CDA7` |
| Insula | `#EB91A0` |
| Mixed / unclassified | `#8793A3` |

These are project visualisation colours, **not** a neurological colour standard. The guide volumes are approximate manual ellipsoids, **not** measured lobe boundaries or sulci. The Shen268 functional atlas is **not independently mapped to anatomical lobes**, so no parcel is presented as belonging to a lobe; the separate parcel/connection colours retain their existing meaning. An atlas-based crosswalk and a suitably licensed, registered cortical surface are needed before showing anatomical segmentations or true sulcal lines.

## Credits, licences and rights checks

The public viewer has a [Credits & Licences tab](https://mp-honnett.github.io/brain-connectome-explorer/#credits) listing research sources, source data permissions, atlas attribution, current 3D geometry, pending rights checks, and software libraries. [CREDITS.md](CREDITS.md) maintains the more detailed record.

The GitHub Pages build also creates [`/legal/third-party-notices.txt`](https://mp-honnett.github.io/brain-connectome-explorer/legal/third-party-notices.txt), an inventory of installed npm packages and the licence/NOTICE texts included with those packages. Verify upstream terms if any notices are missing.

**Software licence:** The original software is offered under the [PolyForm Noncommercial License 1.0.0](LICENSE.md) ([scope and exceptions](LICENSING.md)). This allows specified personal, educational, public research and other permitted noncommercial uses but does not grant general commercial rights. It is **source-available, not OSI-approved open source**. External datasets, atlas meshes and software dependencies retain their own permissions.

**Copyright & trademarks:** Copyright (c) 2026 Honnett Ltd. Tweenbrain is a trademark of Honnett Ltd. See the required [NOTICE.txt](NOTICE.txt) and [licensing scope](LICENSING.md). The software licence does not grant independent rights to use the Honnett Ltd or Tweenbrain marks.

**Outstanding items:** The reuse licence for the exact Shen268 atlas NIfTI needs authoritative confirmation. The CT-derived SU39 skull is optionally user-imported (not bundled or scientifically registered).

## Optional real CT-derived skull layer

The optional **Human skull SU39 from CT scan** layer can be imported directly in the explorer's **REAL CT SKULL · OPTIONAL LAYER** sidebar panel. It accepts either the original Sketchfab `scene.gltf` + `scene.bin` ZIP (as downloaded from the source) or an optimized GLB. The browser can remember the imported file locally when storage permits; no server upload is performed. The layer is independently toggleable with opacity, wireframe and a skull-only horizontal rotation slider alongside the existing procedural outer head and atlas envelope. The imported SU39 mesh originally faced backwards relative to the anatomical camera presets; the application now defaults to 180° yaw around the skull's own bounds centre. The adjustment is saved in the browser, and can be reset to 180°.

**Model attribution:** [Human skull SU39 from CT scan](https://sketchfab.com/3d-models/human-skull-su39-from-ct-scan-e375b7b910d14547854ac7d1b2a5e1ed), [SusanElaineJones](https://sketchfab.com/SusanElaineJones), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The supplied original `license.txt` is preserved in the prepared-model handoff ZIP. The optional optimized GLB merges the three original meshes, reduces geometry and changes the material to a neutral bone colour.

**Not anatomically registered:** The source CT comes from a different individual, and alignment to the Shen268/YaleNeuroConnect scene is an approximate scale/translation for educational orientation only. It must not be interpreted as patient-specific anatomy or a medically validated registration. The skull retains its **CC BY 4.0** rights separately from Honnett Ltd's PolyForm-licensed application code.



## Optional Visible Human Female CT point cloud

HeadSpin can now render an imported point-cloud `GLB` (glTF primitive mode `POINTS`) with per-point RGB colours, global opacity and yaw adjustment. It is distinct from the SU39 polygonal skull model.

The user-provided original [Full CT Head Point Cloud—Visible Human Female](https://sketchfab.com/3d-models/full-ct-head-point-cloud-visible-human-female-76115e69f3304172835cfce7cc6714a8) by [Terrie](https://sketchfab.com/terrielsimmons), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), contains ~7.43 million points. Its roughly 20.7 MB ZIP expands to ~208 MB of source binary, which is not suitable for direct browser import. The optimized handoff GLB reduces the model to 323,121 points (~5.2 MB), preserves RGB and recenters the geometry in a visual approximation of HeadSpin's scene frame. Import **the GLB**, not the original large ZIP. Point cloud colors are rendered opaque prior to applying the app's overall opacity slider.

The original source, reduced model and other imported third-party data have independent CC BY terms. The converted CT represents a different individual and has **not been registered** to the Shen268 brain atlas. The app does not bundle the CT point cloud; users import the model locally.

## Correlation endpoint anatomy cards

Selecting a correlation in **Region Inspector** displays an anatomical card for **both endpoints**, including the Shen268 parcel ID, atlas centroid `(X,Y,Z)` in MNI-style millimetres, hemisphere, a broad scientific location term, and a plain-English anatomical description. The selected Pearson `r` remains visible in the focus display.

**Scientific qualification:** These descriptive region names are **approximate spatial interpretations of centroid coordinates**, not validated Shen268-to-structural-atlas parcel labels. The deterministic heuristics in `src/anatomyLocation.ts` deliberately avoid asserting precise gyri, cortical networks, or functions; imported non-Shen datasets receive coordinates only. The existing ascending-Shen-ID to connectivity-matrix-row relationship remains **provisional**. A verified atlas crosswalk/voxel-overlap analysis is needed before claiming authoritative anatomical assignments.
