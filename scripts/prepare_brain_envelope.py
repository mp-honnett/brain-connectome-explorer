#!/usr/bin/env python3
"""Generate a transparent anatomical context surface from the exact Shen268 NIfTI atlas.

This is a smoothed atlas-derived outer envelope, NOT a subject-specific MRI,
cortical surface reconstruction, white-matter tract or anatomical tractogram.
All vertices use the same MNI-mm -> React Three Fiber transform as the parcel nodes.
"""
from pathlib import Path
from urllib.request import urlretrieve
import nibabel as nib
import numpy as np
from scipy.ndimage import binary_closing, binary_fill_holes, binary_dilation, gaussian_filter, label
from skimage.measure import marching_cubes
import trimesh

atlas = Path("data/raw/shen_2mm_268_parcellation_vol.nii")
atlas.parent.mkdir(parents=True, exist_ok=True)
urlretrieve(
 "https://raw.githubusercontent.com/YaleMRRC/YaleNeuroConnect_FullPredictions/main/shen_2mm_268_parcellation_vol.nii",
 atlas
)
img = nib.load(str(atlas))
vox = np.asarray(img.dataobj) > 0
# Fill parcel-sized gaps, then smooth to give a coherent exterior envelope.
mask = binary_dilation(vox, iterations=2)
mask = binary_closing(mask, iterations=3)
mask = binary_fill_holes(mask)
components, n = label(mask)
counts = np.bincount(components.ravel())
counts[0] = 0
# Keep larger disconnected structures including cerebellum; remove tiny specks.
mask = (components > 0) & (counts[components] > 180)
field = gaussian_filter(mask.astype(np.float32), sigma=1.45)
field = np.pad(field, 2, constant_values=0)
vertices, faces, _, _ = marching_cubes(field, level=0.45, step_size=1)
vertices -= 2.0
mm = nib.affines.apply_affine(img.affine, vertices)
positions = np.column_stack([mm[:,0], mm[:,2], -mm[:,1]]) * 0.052
mesh = trimesh.Trimesh(vertices=positions, faces=faces, process=False)
# Affine transform may flip handedness; doublesided rendering handles winding.
out = Path("public/assets/brain-envelope.glb")
out.parent.mkdir(parents=True, exist_ok=True)
out.write_bytes(trimesh.Scene(mesh).export(file_type="glb"))
print("Atlas-derived envelope:", len(positions), "vertices,", len(faces), "faces,", out.stat().st_size, "bytes")
