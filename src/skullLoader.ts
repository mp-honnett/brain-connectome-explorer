import { unzipSync, strFromU8 } from "fflate";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from "three";

const DB_NAME = "tweenbrain-local-anatomy";
const STORE = "skull-models";
const KEY = "su39-skull";
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/** Read the user's original Sketchfab ZIP or an optimized GLB. */
export async function loadSkullModel(blob: Blob, name: string): Promise<THREE.Group> {
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error("Choose a ZIP or GLB smaller than 20 MB.");
  const lower = name.toLowerCase();
  const loader = new GLTFLoader();

  if (lower.endsWith(".glb")) {
    return (await loader.parseAsync(await blob.arrayBuffer(), "")).scene;
  }
  if (!lower.endsWith(".zip")) throw new Error("Skull file must be a Sketchfab ZIP or a GLB.");

  const files = unzipSync(new Uint8Array(await blob.arrayBuffer()), {
    filter: entry => entry.originalSize < 64 * 1024 * 1024
  });
  const gltfPath = Object.keys(files).find(key => key.toLowerCase().endsWith(".gltf"));
  if (!gltfPath) throw new Error("No glTF scene was found inside the ZIP.");
  const gltf = JSON.parse(strFromU8(files[gltfPath])) as {
    buffers?: Array<{ uri?: string; byteLength?: number }>;
  };
  const bufferPath = gltf.buffers?.[0]?.uri;
  if (!bufferPath || /^https?:|^data:/i.test(bufferPath))
    throw new Error("This ZIP needs a single embedded scene.bin buffer.");

  const folder = gltfPath.includes("/") ? gltfPath.slice(0, gltfPath.lastIndexOf("/") + 1) : "";
  const binary = files[folder + bufferPath] ?? files[bufferPath];
  if (!binary) throw new Error("The glTF binary buffer is missing from the ZIP.");

  // Let Three.js resolve the original relative scene.bin URI through a
  // temporary local object URL; nothing is uploaded to a server.
  const bufferURL = URL.createObjectURL(
    new Blob([Uint8Array.from(binary).buffer], { type: "application/octet-stream" })
  );
  const manager = new THREE.LoadingManager();
  manager.setURLModifier(url => {
    if (url.endsWith(bufferPath)) return bufferURL;
    return url;
  });
  try {
    return (await new GLTFLoader(manager).parseAsync(
      JSON.stringify(gltf), ""
    )).scene;
  } finally {
    URL.revokeObjectURL(bufferURL);
  }
}

type StoredSkull = { blob: Blob; name: string };

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Local browser storage is not available."));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveSkullLocally(file: File): Promise<void> {
  const db = await openDB();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({ name: file.name, blob: file }, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export async function readSavedSkull(): Promise<StoredSkull | null> {
  const db = await openDB();
  try {
    return await new Promise<StoredSkull | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve((req.result as StoredSkull | undefined) ?? null);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export async function removeSavedSkull(): Promise<void> {
  const db = await openDB();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
