#!/usr/bin/env python3
"""Prepare a matched-pair connectome. Requires explicit atlas/matrix-order validation."""
import argparse, json
from pathlib import Path
import numpy as np
from scipy.io import loadmat
p=argparse.ArgumentParser()
p.add_argument("--nodes",required=True)
p.add_argument("--rest",required=True)
p.add_argument("--task",required=True)
p.add_argument("--mat-variable",required=True)
p.add_argument("--matrix-statistic",choices=["pearson-r","fisher-z"],required=True)
p.add_argument("--matrix-order",choices=["ascending-atlas-label"],required=True)
p.add_argument("--subject-description",required=True)
p.add_argument("--source-version",required=True)
p.add_argument("--out",default="public/data/connectome.json")
a=p.parse_args()
nodes=json.loads(Path(a.nodes).read_text());n=len(nodes)
if [v["id"] for v in nodes]!=sorted(v["id"] for v in nodes):raise ValueError("Nodes must be ascending")
def read(path):
 d=loadmat(path);arr=np.asarray(d[a.mat_variable],dtype=float)
 if arr.shape!=(n,n):raise ValueError(f"{path}: expected {n}x{n}, got {arr.shape}")
 if not np.isfinite(arr).all():raise ValueError("Nonfinite values")
 if not np.allclose(arr,arr.T,atol=1e-5):raise ValueError("Not symmetric: check input")
 if a.matrix_statistic=="fisher-z":arr=np.tanh(arr)
 if np.max(np.abs(arr))>1.000001:raise ValueError("Values outside [-1,1]")
 return arr.tolist()
result={"nodes":nodes,"conditions":{"Rest":read(a.rest),"Task":read(a.task)},"metadata":{"source":"YaleNeuroConnect / OpenNeuro ds007286; "+a.subject_description,"dataType":"Pearson r","transform":"Converted from "+a.matrix_statistic,"note":"Atlas/matrix label order must be independently verified. Dataset version: "+a.source_version}}
out=Path(a.out);out.parent.mkdir(parents=True,exist_ok=True);out.write_text(json.dumps(result))
print("Wrote",out,"(confirm atlas and matrix order separately)")
