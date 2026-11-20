/**
 * Tweenbrain anatomical teaching palette.
 *
 * These colours are a project convention, not a neurological standard.
 * Lobe guide locations in LobeOverlay.tsx are schematic: Shen268 is a
 * functional atlas and is not independently mapped to anatomical lobes.
 */
export const LOBES = [
  {
    id: "frontal",
    name: "Frontal",
    color: "#E8A24B",
    description: "Planning, decision-making and voluntary movement",
    short: "Executive and motor functions",
    center: [40, 47, 34] as const,
    radii: [33, 44, 32] as const
  },
  {
    id: "parietal",
    name: "Parietal",
    color: "#55B8E7",
    description: "Somatosensory processing and spatial attention",
    short: "Sensation and spatial attention",
    center: [39, -37, 43] as const,
    radii: [36, 48, 36] as const
  },
  {
    id: "temporal",
    name: "Temporal",
    color: "#B598EC",
    description: "Auditory processing, language and memory",
    short: "Auditory, language and memory",
    center: [47, -22, -13] as const,
    radii: [27, 51, 28] as const
  },
  {
    id: "occipital",
    name: "Occipital",
    color: "#61CDA7",
    description: "Visual processing",
    short: "Visual processing",
    center: [32, -88, 24] as const,
    radii: [29, 31, 28] as const
  },
  {
    id: "insula",
    name: "Insula",
    color: "#EB91A0",
    description: "Interoception and integration of sensory and emotional information",
    short: "Interoception and integration",
    center: [26, 5, 5] as const,
    radii: [12, 19, 16] as const
  }
] as const;

export type LobeId = (typeof LOBES)[number]["id"];
export type LobeSelection = "all" | LobeId;

export const UNCLASSIFIED_LOBE = {
  id: "unclassified",
  name: "Mixed / unclassified",
  color: "#8793A3",
  description: "Parcels without a reliable anatomical lobe assignment"
} as const;
