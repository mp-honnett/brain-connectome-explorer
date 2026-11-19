# Credits, licences and provenance register

**Last reviewed:** 19 November 2026  
**Public credits page:** https://mp-honnett.github.io/brain-connectome-explorer/#credits

This register lists the content **actually incorporated** into Brain Connectome Explorer. Scientific citations, copyright licences, access rights and dataset/atlas validation are distinct questions. It is not legal advice or a blanket assertion that all rights are cleared.

## 1. YaleNeuroConnect data — in use

- **Source:** YaleNeuroConnect / OpenNeuro [ds007286](https://openneuro.org/datasets/ds007286).
- **Scientific source / data descriptor:** [Scientific Data DOI: 10.1038/s41597-026-08749-0](https://doi.org/10.1038/s41597-026-08749-0).
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

## 3. 3D outer head — in use; original procedural geometry

- **Source:** `src/HeadShell.tsx`, developed for this app using procedural geometric primitives. Not a third-party CT or scalp scan.
- **Licence of app-original code:** No explicit open-source licence has yet been selected by the repository owner. Do not assume that public GitHub hosting makes the source MIT-licensed, CC BY, or public domain.
- **Changes / description:** Generic illustrative head shell with adjustable opacity and optional wireframe; aligned to the visualisation's MNI-like axes.
- **Qualification:** Not a medically validated anatomical reconstruction.

## 4. External 3D skull models — NOT yet in use

**No external Sketchfab, Thingiverse or other downloadable skull model is in the current deployed site.** Candidate models are not credited as incorporated assets. If one is added, insert a record including:

- Exact creator's name/handle and preferred attribution text;
- Exact model title and canonical source URL;
- Original file version, download date and source licence (with a stable link to the licence);
- Whether redistribution and modification are permitted;
- List of modifications (decimation, scaling, orientation, registration, conversion to GLB, recolouring);
- Licence/NOTICE and original files that must accompany redistribution;
- Explicitly whether the licence has attribution, share-alike, non-commercial or no-derivatives conditions.

For CC BY 4.0 model use, see [licence text](https://creativecommons.org/licenses/by/4.0/). **Do not use a prospective model's attribution as a substitute for checking its actual licence.**

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
