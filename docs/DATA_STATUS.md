# Data and validation status

This repository currently contains **no YaleNeuroConnect participant matrices or Shen268 atlas files**.

The 3D viewer requires a JSON object with `nodes`, `conditions`, and `metadata`. No synthetic measurements are rendered as Yale results.

For real data:
1. Retrieve the precise Shen268 atlas used to construct the connectivity matrices.
2. Verify atlas labels match matrix row/column order; never assume ascending labels without checking metadata.
3. Inspect matched resting-state and working-memory derivative matrices and document their participant, task and session.
4. Check whether matrices contain Pearson r or Fisher z before using the provided conversion script.
5. Confirm MRI orientation/laterality, usage rights and quality-control flags.
6. Copy the validated result into `public/data/connectome.json` and commit only data you're licensed to redistribute.

The starter scripts perform structural checks, **not scientific validation**. Public comparisons require appropriate quality controls and methodology.
