#!/usr/bin/env python3
"""Extract parcel centroids from a Shen atlas NIfTI; not proof of matrix ordering."""
import argparse, json
from pathlib import Path
import nibabel as nib
import numpy as np
p=argparse.ArgumentParser()
p.add_argument("--atlas",required=True)
p.add_argument("--out",default="data/processed/nodes.json")
a=p.parse_args()
img=nib.load(a.atlas)
labels=np.asarray(img.dataobj)
if not np.allclose(labels,np.rint(labels)):raise ValueError("Atlas has noninteger labels")
labels=labels.astype(int)
ids=sorted(int(v) for v in np.unique(labels) if v>0)
nodes=[]
for v in ids:
 xyz=nib.affines.apply_affine(img.affine,np.argwhere(labels==v).mean(axis=0))
 nodes.append(dict(id=v,label=f"Region {v}",position_mm=[float(x) for x in xyz]))
out=Path(a.out);out.parent.mkdir(parents=True,exist_ok=True)
out.write_text(json.dumps(nodes,indent=2))
print(f"Wrote {len(nodes)} nodes. Verify exact atlas version, orientation and matrix row order.")
