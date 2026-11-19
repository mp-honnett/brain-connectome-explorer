# Brain Connectome Explorer

Interactive Three.js functional connectome explorer intended for verified YaleNeuroConnect (OpenNeuro ds007286) Shen268 connectivity measurements.

**Data status:** No Yale matrices are bundled. The app presents an explicit import state and never fabricates neuroscience measurements.

## Run

```bash
npm install
npm run dev
```

To use, import a processed JSON file containing `nodes`, `conditions` and `metadata` (see `src/types.ts`). Atlas parcel IDs and matrix row order must be independently verified before presenting it as scientific output.

## Publish

Set Settings > Pages > Source to GitHub Actions. A workflow deploys `dist` from the `main` branch.

Dataset: https://openneuro.org/datasets/ds007286
Atlas: https://github.com/YaleMRRC/YaleNeuroConnect_FullPredictions

This is an educational software prototype; correlations are not physical tracts or evidence of causation.
## Anatomical context layer

The viewer now supports an independently toggled translucent, atlas-registered brain envelope, parcel-centre markers and functional-correlation lines. The mesh is reproducibly generated from the Shen268 label NIfTI by `scripts/prepare_brain_envelope.py` and stored at `public/assets/brain-envelope.glb`. It is a smoothed atlas outline, **not** a patient-specific anatomical MRI or a white-matter tract reconstruction. Change surface opacity in the sidebar to see internal nodes. Functional edges are correlations, **not** physical tracts.
