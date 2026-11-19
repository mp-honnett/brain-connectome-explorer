#!/usr/bin/env python3
"""Generate an explicitly provisional single-participant YaleNeuroConnect sample."""
import hashlib
import json
from pathlib import Path
from urllib.request import urlretrieve

import nibabel as nib
import numpy as np

RAW = Path("data/raw")
RAW.mkdir(parents=True, exist_ok=True)
prefix = "https://s3.amazonaws.com/openneuro.org/ds007286/derivatives/MC_Shen268/sub-pa0475/ses-01/func/"
files = {
    "Rest (run 01)": "sub-pa0475_ses-01_task-rest_run-01_atlas-shen268_desc-bis_matrix.tsv",
    "Working memory (n-back)": "sub-pa0475_ses-01_task-nBack_atlas-shen268_desc-bis_matrix.tsv",
}
atlas_url = "https://raw.githubusercontent.com/YaleMRRC/YaleNeuroConnect_FullPredictions/main/shen_2mm_268_parcellation_vol.nii"
atlas_path = RAW / "shen_2mm_268_parcellation_vol.nii"
urlretrieve(atlas_url, atlas_path)
img = nib.load(str(atlas_path))
labels = np.asanyarray(img.dataobj).astype(int)
ids = sorted(int(v) for v in np.unique(labels) if v > 0)
assert ids == list(range(1, 269)), "Unexpected atlas identifiers"
nodes = []
for region_id in ids:
    centroid = np.argwhere(labels == region_id).mean(axis=0)
    xyz = nib.affines.apply_affine(img.affine, centroid)
    nodes.append({
        "id": region_id,
        "label": f"Shen parcel {region_id}",
        "position_mm": [round(float(v), 3) for v in xyz],
    })
conditions = {}
hashes = {}
for name, file_name in files.items():
    path = RAW / file_name
    urlretrieve(prefix + file_name, path)
    hashes[file_name] = hashlib.sha256(path.read_bytes()).hexdigest()
    with path.open(encoding="utf-8") as handle:
        arr = np.loadtxt((line.rstrip() for line in handle), delimiter=chr(9))
    assert arr.shape == (268, 268), f"Shape mismatch: {name}"
    assert np.all(np.isfinite(arr)), f"Nonfinite matrix: {name}"
    assert np.allclose(arr, arr.T, atol=1e-5), f"Asymmetric matrix: {name}"
    assert np.allclose(np.diag(arr), 6.103, atol=0.002), f"Unexpected diagonal scale: {name}"
    corrs = np.tanh(arr)
    np.fill_diagonal(corrs, 1.0)
    assert np.max(np.abs(corrs)) <= 1.0
    conditions[name] = np.round(corrs, 6).tolist()
    print(name, "shape", arr.shape, "z range", float(arr.min()), float(arr.max()),
          "r off-diagonal range", float(np.min(corrs[~np.eye(268, dtype=bool)])),
          float(np.max(corrs[~np.eye(268, dtype=bool)])))
hashes["shen_2mm_268_parcellation_vol.nii"] = hashlib.sha256(atlas_path.read_bytes()).hexdigest()
doc = {
    "nodes": nodes,
    "conditions": conditions,
    "metadata": {
        "source": "YaleNeuroConnect / OpenNeuro ds007286; single anonymized participant sub-pa0475, session 01",
        "dataType": "Pearson correlation r (converted from Fisher z)",
        "transform": "tanh(Fisher z); diag=1",
        "participants": 1,
        "note": "Provisional educational visualization. Ascending atlas label ID mapped to ascending matrix row index; exact index correspondence has NOT yet been independently verified. Do not interpret as anatomical ground truth or group-level task effect.",
        "matrixOrderValidation": "provisional",
        "fileSHA256": hashes,
        "attribution": "OpenNeuro ds007286 / YaleNeuroConnect; Shen 268 atlas",
    }
}
target = Path("public/data/connectome.json")
target.parent.mkdir(parents=True, exist_ok=True)
target.write_text(json.dumps(doc, separators=(",", ":")), encoding="utf-8")
print("Created", target, "bytes", target.stat().st_size)
