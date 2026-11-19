# Brain Connectome Explorer

Interactive Three.js functional connectome explorer intended for verified YaleNeuroConnect (OpenNeuro ds007286) Shen268 connectivity measurements.

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

## Credits, licences and rights checks

The public viewer has a [Credits & Licences tab](https://mp-honnett.github.io/brain-connectome-explorer/#credits) listing research sources, source data permissions, atlas attribution, current 3D geometry, pending rights checks, and software libraries. [CREDITS.md](CREDITS.md) maintains the more detailed record.

The GitHub Pages build also creates [`/legal/third-party-notices.txt`](https://mp-honnett.github.io/brain-connectome-explorer/legal/third-party-notices.txt), an inventory of installed npm packages and the licence/NOTICE texts included with those packages. Verify upstream terms if any notices are missing.

**Software licence:** The original software is offered under the [PolyForm Noncommercial License 1.0.0](LICENSE.md) ([scope and exceptions](LICENSING.md)). This allows specified personal, educational, public research and other permitted noncommercial uses but does not grant general commercial rights. It is **source-available, not OSI-approved open source**. External datasets, atlas meshes and software dependencies retain their own permissions.

**Outstanding items:** The reuse licence for the exact Shen268 atlas NIfTI needs authoritative confirmation, and the correct copyright holder for the original project code must be identified for the required attribution notice. No external Sketchfab or Thingiverse skull model has been incorporated.
