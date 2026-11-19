#!/usr/bin/env python3
"""List MAT variables and array shapes before attempting export."""
import argparse
from pathlib import Path
from scipy.io import loadmat
p=argparse.ArgumentParser();p.add_argument("path");a=p.parse_args()
try:
 d=loadmat(a.path)
 for k,v in d.items():
  if not k.startswith("__"):print(k, "shape:",getattr(v,"shape",None),"type:",getattr(v,"dtype",type(v).__name__))
except NotImplementedError:
 print("MAT v7.3/HDF5 detected. Inspect using h5py instead.")
