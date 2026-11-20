import type { Dataset, Node } from "./types";

/**
 * Educational coordinate annotation for the Shen268 display.
 *
 * This is not a parcel-to-gyrus crosswalk. Shen parcels are functional
 * regions, and the exact matrix-row ↔ parcel-ID pairing in this sample
 * is still provisional. We use the atlas centroid's MNI-style X/Y/Z
 * plus a published broad Shen268 territory grouping to give an
 * orientation *estimate*. A structural atlas overlap is needed before
 * assigning a definitive anatomical area or gyrus name.
 *
 * Territory ranges: Z. Wan (2021), University of Warwick PhD thesis,
 * "Analysis of Neuroimaging with Big Data to Understand Brain Systems
 * Involved in Emotion", Appendix A1 (Shen atlas, 268 nodes).
 * https://wrap.warwick.ac.uk/166793/
 */

export type LocationDescription = {
  scientificTerm: string;
  plainEnglish: string;
  position: string;
  source: "indicative-territory" | "coordinates-only";
  hemisphere: string;
  coordinate: [number, number, number];
};

type Territory =
  | "prefrontal" | "motor" | "insula" | "parietal" | "temporal"
  | "occipital" | "limbic" | "cerebellar" | "basal" | "brainstem";

const GROUPS: ReadonlyArray<{name:Territory; ranges: readonly [number,number][]}> = [
  {name:"prefrontal",ranges:[[1,22],[134,157]]},
  {name:"motor",ranges:[[23,33],[158,167]]},
  {name:"insula",ranges:[[34,37],[168,170]]},
  {name:"parietal",ranges:[[38,50],[171,184]]},
  {name:"temporal",ranges:[[51,71],[185,202]]},
  {name:"occipital",ranges:[[72,82],[203,216]]},
  {name:"limbic",ranges:[[83,99],[217,235]]},
  {name:"cerebellar",ranges:[[100,119],[236,256]]},
  {name:"basal",ranges:[[120,128],[257,264]]},
  {name:"brainstem",ranges:[[129,133],[265,268]]}
];

function territoryFor(id:number):Territory|undefined {
  return GROUPS.find(group=>group.ranges.some(([first,last])=>id>=first&&id<=last))?.name;
}

/** Only interpret Shen-specific numbering for the expected 268-node atlas. */
function canUseTerritoryRanges(dataset:Dataset):boolean {
  return dataset.nodes.length===268
    && dataset.nodes[0]?.id===1
    && dataset.nodes[267]?.id===268
    && dataset.nodes.every((node,index)=>node.id===index+1)
    && /shen\s*268|yale\s*neuro\s*connect/i.test(dataset.metadata.source);
}

export function describeNodeLocation(node:Node,dataset:Dataset):LocationDescription {
  const coordinate=node.position_mm;
  const [x,y,z]=coordinate;
  const hemisphere=x>3?"Right":x< -3?"Left":"Midline";
  const horizontal=y>30?"anterior":y< -45?"posterior":"central";
  const vertical=z>45?"superior":z<0?"inferior":"middle";
  const medial=Math.abs(x)<26?"medial":Math.abs(x)>52?"lateral":"intermediate";
  const position=[hemisphere,horizontal,vertical,medial].join(" · ");

  const prefix=hemisphere==="Midline"?"Midline":hemisphere;
  const group=canUseTerritoryRanges(dataset)?territoryFor(node.id):undefined;
  let scientificTerm="Anatomical region not assigned";
  let plainEnglish="The coordinate locates this point in the brain, but an independently checked anatomical label is not available.";

  switch(group){
    case "prefrontal":
      if(y>36&&z<0){
        scientificTerm=prefix+" orbitofrontal region (ventral prefrontal cortex)";
        plainEnglish="On the underside of the frontal lobe, above and behind the eye socket.";
      }else{
        scientificTerm=prefix+" prefrontal cortex";
        plainEnglish="Toward the front of the brain, behind the forehead.";
      }
      break;
    case "motor":
      scientificTerm=prefix+" peri-Rolandic / sensorimotor region";
      plainEnglish="In the upper middle part of the brain, near the groove separating frontal and parietal areas.";
      break;
    case "insula":
      scientificTerm=prefix+" insular cortex";
      plainEnglish="Deep inside the side of the brain, concealed beneath the outer cortical folds.";
      break;
    case "parietal":
      scientificTerm=prefix+" parietal cortex";
      plainEnglish="Toward the upper back part of the brain.";
      break;
    case "temporal":
      scientificTerm=prefix+" temporal cortex";
      plainEnglish="Along the lower side of the brain, roughly above the ear.";
      break;
    case "occipital":
      scientificTerm=prefix+" occipital cortex";
      plainEnglish="Toward the back of the brain.";
      break;
    case "limbic":
      scientificTerm=prefix+" limbic-associated region";
      plainEnglish="Toward the brain's inner surface or deeper temporal areas; the precise structure needs atlas verification.";
      break;
    case "cerebellar":
      scientificTerm=prefix+" cerebellar region";
      plainEnglish="In the cerebellum, underneath the rear of the larger brain.";
      break;
    case "basal":
      scientificTerm=prefix+" basal / subcortical region";
      plainEnglish="Deep inside the brain, below the outer cerebral cortex.";
      break;
    case "brainstem":
      scientificTerm="Brainstem region";
      plainEnglish="At the base of the brain, near the connection with the spinal cord.";
      break;
  }

  return {
    scientificTerm,
    plainEnglish,
    position,
    source:group?"indicative-territory":"coordinates-only",
    hemisphere,
    coordinate
  };
}

/** Coordinates are mm in atlas/MNI-like space, not screen coordinates. */
export function formatMniCoordinate(value:number):string {
  return (value>=0?"+":"−")+Math.abs(value).toFixed(1);
}
