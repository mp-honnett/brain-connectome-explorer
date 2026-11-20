# Credits, licences and provenance register

**Last reviewed:** 19 November 2026  
**Public credits page:** https://mp-honnett.github.io/brain-connectome-explorer/#credits

## Original software licensing

- **Licence:** [PolyForm Noncommercial 1.0.0](LICENSE.md) (SPDX: `PolyForm-Noncommercial-1.0.0`). The repository’s original code is provided for permitted noncommercial uses, including the organisational categories allowed in the actual licence text. Commercial use outside those permissions requires a separate licence from the correct copyright owner.
- **Scope and exclusions:** [LICENSING.md](LICENSING.md). Independent data, atlas and package rights do not become PolyForm-licensed because they are in this repository.
- **Copyright holder:** **Honnett Ltd** (identified by the project owner). Required notice: `Required Notice: Copyright (c) 2026 Honnett Ltd.`
- **Trademark:** **Tweenbrain is a trademark of Honnett Ltd** (identified by the project owner). Required notice: `Required Notice: Tweenbrain is a trademark of Honnett Ltd.` This does not claim trademark registration.
- **Notice file:** [NOTICE.txt](NOTICE.txt). Copies and permitted adaptations of the software must preserve the applicable PolyForm licence and required notices; the licence grants no brand endorsement rights.


This register lists the content **actually incorporated** into Brain Connectome Explorer. Scientific citations, copyright licences, access rights and dataset/atlas validation are distinct questions. It is not legal advice or a blanket assertion that all rights are cleared.

## 1. YaleNeuroConnect data — in use

- **Source:** YaleNeuroConnect / OpenNeuro [ds007286](https://openneuro.org/datasets/ds007286).
- **Scientific source / data descriptor:** Samardzija, A., Shen, X., Greene, A. S., et al. (2026), *A Transdiagnostic fMRI Dataset With 400+ Deeply Phenotyped Participants Across Resting and Task States*. [Scientific Data DOI: 10.1038/s41597-026-08749-0](https://doi.org/10.1038/s41597-026-08749-0).
- **Journal article rights (different from dataset rights):** The published article is under [CC BY-NC-ND 4.0](https://creativecommons.org/licenses/by-nc-nd/4.0/). The explorer links to this article but does not republish any of its text or illustrations. These restrictions do **not** automatically apply to the separately released OpenNeuro dataset.
- **Current sample:** One anonymous source participant `sub-pa0475`, session `ses-01`; resting-state run 01 and n-back task matrices from `derivatives/MC_Shen268/`.
- **Legal basis:** OpenNeuro describes released datasets as CC0, subject to the terms of the deposited dataset version. See the [OpenNeuro FAQ](https://docs.openneuro.org/faq) and [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/). Verify the exact source dataset version and derivative file terms before wider reuse.
- **Modification:** Fisher-z matrices converted to Pearson correlations using `tanh`; compiled to `public/data/connectome.json`. Parcels are displayed from a transformed atlas coordinate system.
- **Scientific qualification:** The ascending atlas label ↔ matrix row correspondence has **not** been independently confirmed. No group-level inference is intended.
- **Data preparation script:** [`scripts/prepare_yale_sample.py`](https://github.com/mp-honnett/brain-connectome-explorer/blob/main/scripts/prepare_yale_sample.py).

## 2. Shen268 atlas — in use; exact asset licence needs confirmation

- **Scientific citation:** Shen, X., Tokoglu, F., Papademetris, X., & Constable, R. T. (2013). *Groupwise whole-brain parcellation from resting-state fMRI data for network node identification.* NeuroImage, 82, 403–415. [https://doi.org/10.1016/j.neuroimage.2013.05.081](https://doi.org/10.1016/j.neuroimage.2013.05.081).
- **Exact atlas file:** `shen_2mm_268_parcellation_vol.nii` from the [YaleMRRC / YaleNeuroConnect_FullPredictions](https://github.com/YaleMRRC/YaleNeuroConnect_FullPredictions/blob/main/shen_2mm_268_parcellation_vol.nii) repository.
- **Derivative used:** `public/assets/brain-envelope.glb`, a smoothed 3D exterior reconstructed from the labelled atlas using `scripts/prepare_brain_envelope.py`. Node centres are also computed from this atlas.
- **Rights review required:** An explicit file-level or repository-level reuse licence for the exact distributed atlas NIfTI has **not yet been independently verified**. A public GitHub repository and a publication citation do not automatically grant redistribution rights. Confirm with the rightsholder or identify authoritative upstream terms, then update this section with the permission or licence record. Be prepared to replace the distributed asset if rights cannot be confirmed.

## 2a. Lobe orientation colours — in use; original schematic teaching overlay

- **Purpose:** Visual orientation and teaching, not anatomical parcel classification or scientific measurement.
- **Origin:** Original Honnett Ltd Tweenbrain design convention (`src/lobePalette.ts`) and transparent illustrative lobe volumes (`src/LobeOverlay.tsx`). These are not a standard neurological colour code.
- **Palette:** frontal `#E8A24B`; parietal `#55B8E7`; temporal `#B598EC`; occipital `#61CDA7`; insula `#EB91A0`; mixed/unclassified `#8793A3`.
- **Anatomical method:** Hand-chosen approximate bilateral positions and simple ellipsoidal shapes in MNI-like scene coordinates. The shapes are **not** voxel-validated anatomical segmentations, sulcal or gyral outlines, subject MRI, or a registered reference atlas. Selection highlights these schematic guides only.
- **Shen268 caveat:** There is **no verified parcel-to-lobe crosswalk** in the bundled data. Parcel markers remain styled by the connectivity explorer; individual parcels are not assigned to lobes. A future data-driven classification requires an appropriately licensed anatomy atlas, spatial registration, overlaps and quality control, including a mixed/unclassified outcome.
- **Rights:** Original software visuals and code owned by Honnett Ltd under [PolyForm Noncommercial 1.0.0](LICENSE.md); atlas-derived underlying assets and research data retain their separate status.

## 3. 3D outer head — in use; original procedural geometry

- **Source:** `src/HeadShell.tsx`, developed for this app using procedural geometric primitives. Not a third-party CT or scalp scan.
- **Licence of app-original code:** [PolyForm Noncommercial 1.0.0](LICENSE.md) for original authored software owned by Honnett Ltd. This is a source-available, commercial-use-restricted licence, **not** an OSI-approved open-source licence.
- **Changes / description:** Generic illustrative head shell with adjustable opacity and optional wireframe; aligned to the visualisation's MNI-like axes.
- **Qualification:** Not a medically validated anatomical reconstruction.

## 4. CT-derived skull — user-imported; CC BY 4.0 (not bundled on GitHub Pages)

- **Title:** [Human skull SU39 from CT scan](https://sketchfab.com/3d-models/human-skull-su39-from-ct-scan-e375b7b910d14547854ac7d1b2a5e1ed).
- **Creator:** [SusanElaineJones](https://sketchfab.com/SusanElaineJones).
- **Licence:** [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/), explicitly supplied in `license.txt` in the user-uploaded original Sketchfab ZIP.
- **Creator's requested credit:** This work is based on "Human skull SU39 from CT scan" (https://sketchfab.com/3d-models/human-skull-su39-from-ct-scan-e375b7b910d14547854ac7d1b2a5e1ed) by SusanElaineJones (https://sketchfab.com/SusanElaineJones) licensed under CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/).
- **Actual viewer integration:** Viewer accepts the model locally as original Sketchfab ZIP or processed GLB; transparency, wireframe and visibility independently controlled. The user can save their local imported file in IndexedDB where available. **The deployed website does not include a binary skull model**, and users must import it.
- **Prepared model changes:** Three source meshes merged into one GLB; mesh vertices clustered on a 1.5-mm grid to reduce geometry from 245,158 to 147,582 triangles; model colours replaced with a neutral bone-tone material. Source glTF Y-up scene orientation is baked into the prepared model. The optional handoff ZIP includes the source `license.txt` and a processing README.
- **Approximate placement:** Scale factor `0.052 * 1.18` and vertical translation of `15 * 0.052` in the viewer's scene coordinate frame, then subtract the existing atlas node-centre transform. This is a visual fit only, **not** an independently validated atlas/CT registration.
- **Rights distinction:** Source skull and derivatives remain **CC BY 4.0**. Software authored by Honnett Ltd remains **PolyForm Noncommercial 1.0.0**. There is no transfer of copyright to Honnett Ltd and no implied affiliation with the Sketchfab creator.
- **Scientific limitation:** The skull CT is from a different individual than the YaleNeuroConnect sample; showing both together is educational, not a combined subject MRI/CT reconstruction.

### Full CT Head Point Cloud—Visible Human Female (optional user-imported asset)

- **Title:** [Full CT Head Point Cloud—Visible Human Female](https://sketchfab.com/3d-models/full-ct-head-point-cloud-visible-human-female-76115e69f3304172835cfce7cc6714a8).
- **Creator:** [Terrie](https://sketchfab.com/terrielsimmons).
- **Licence:** [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/), recorded in the uploaded `license.txt`.
- **Attribution:** This work is based on "Full CT Head Point Cloud--Visible Human Female" (https://sketchfab.com/3d-models/full-ct-head-point-cloud-visible-human-female-76115e69f3304172835cfce7cc6714a8) by Terrie (https://sketchfab.com/terrielsimmons), licensed under CC BY 4.0 (http://creativecommons.org/licenses/by/4.0/).
- **Original data:** ~7.43 million points; ZIP ~20.7 MB; `scene.bin` expanded size 208,042,240 bytes.
- **Prepared handoff:** 323,121 points (~5.2 MB GLB), deterministic every-23rd-point sampling, root glTF Y-up transform applied, model recentered for approximate rendering, original point RGB retained, original per-point alpha changed to opaque; overall model opacity remains adjustable.
- **Runtime support:** Three.js `Points` materials, not a polygon mesh. This third-party model is **not bundled** in the deployed site, and the user must import the reduced GLB.
- **Scientific limitation:** Source CT is not registered to Shen268 or YaleNeuroConnect and does not depict the same participant. The output is a visual teaching aid, not a diagnostic or anatomically registered combination.
- **Rights:** CC BY 4.0 applies to source and derivative; original Honnett Ltd software remains PolyForm Noncommercial 1.0.0.

## 5. NPM libraries — in use

Software packages used in this project include React, React DOM, Three.js, React Three Fiber, Drei, Vite, TypeScript and their transitive dependencies. Package terms vary and should be checked individually. The project's GitHub Pages build generates `/legal/third-party-notices.txt` from the actual installed npm package tree and includes licence texts/NOTICE files where present:

**https://mp-honnett.github.io/brain-connectome-explorer/legal/third-party-notices.txt**

This is an audit aid. Any package without a readable licence file is flagged for follow-up, and generated notices should be inspected as part of release compliance.

## 6. Python processing / development tools — not served as front-end libraries

Atlas mesh and connectivity preparation scripts rely on NumPy, SciPy, nibabel, scikit-image and trimesh. They run during asset preparation; they are not themselves browser-distributed JS libraries. These projects have separate upstream licence terms; consult their source repositories for exact versions and obligations.

## 7. General rules

- Check rights and add a line item **before** publishing any new image, 3D mesh, diagram, audio, font, dataset or other external asset.
- Retain licence and attribution information with model files where the applicable licence requires it.
- Record creator, source, date, copyright holder, licence, version, modifications, and any special conditions.
- A scientific citation is not necessarily permission to copy or redistribute a source atlas.
- Nothing in this application implies endorsement by Yale, OpenNeuro, the atlas authors or model creators.
- Visualised functional connectivity shows statistical fMRI correlations, **not** physical axonal tracts or causal mechanisms.
