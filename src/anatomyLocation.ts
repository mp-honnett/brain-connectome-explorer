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
 */

export type LocationDescription = {
  scientificTerm: string;
  plainEnglish: string;
  position: string;
  source: "indicative-territory" | "coordinates-only";
  hemisphere: string;
  coordinate: [number, number, number];
};

/**
 * Only broad coordinate orientation is inferred. Never infer a definitive
 * parcel-to-anatomical label from numeric Shen ID without a verified
 * atlas crosswalk. No speculative label-number ranges are used.
 */
export function describeNodeLocation(node:Node,dataset:Dataset):LocationDescription {
  const coordinate=node.position_mm;
  const [x,y,z]=coordinate;
  const hemisphere=x>3?"Right":x< -3?"Left":"Midline";
  const horizontal=y>30?"anterior":y< -45?"posterior":"central";
  const vertical=z>45?"superior":z<0?"inferior":"middle";
  const medial=Math.abs(x)<26?"medial":Math.abs(x)>52?"lateral":"intermediate";
  const position=[hemisphere,horizontal,vertical,medial].join(" · ");

  const prefix=hemisphere==="Midline"?"Midline":hemisphere;
  const isShen=dataset.nodes.length===268 && dataset.nodes.some(n=>n.id===node.id) && /shen|yale/i.test(dataset.metadata.source);
  let scientificTerm="Anatomical region not assigned";
  let plainEnglish="The coordinate locates this point in the brain, but an independently checked anatomical label is not available.";

  // A centroid alone cannot establish a cortical gyrus. These terms are
  // indicative coordinate territories, NOT verified parcel assignments.
  if(isShen){
    if(y>32 && z<3 && Math.abs(x)<42){
      scientificTerm=prefix+" orbitofrontal / ventral prefrontal vicinity";
      plainEnglish="Low in the front of the brain, approximately above and behind the eye socket.";
    }else if(y>32 && z>=3){
      scientificTerm=prefix+" anterior frontal vicinity";
      plainEnglish="Toward the front of the brain, roughly behind the forehead.";
    }else if(y< -70 && z> -12 && Math.abs(x)>18){
      scientificTerm=prefix+" posterior occipital vicinity";
      plainEnglish="Near the back of the brain, where visual-processing regions are found.";
    }else if(y< -35 && z>38){
      scientificTerm=prefix+" dorsal parietal vicinity";
      plainEnglish="Toward the upper-back portion of the brain.";
    }else if(y> -48 && y<35 && z>39){
      scientificTerm=prefix+" dorsal frontoparietal vicinity";
      plainEnglish="Near the upper central surface of the brain.";
    }else if(Math.abs(x)>36 && z< -2 && y> -82 && y<37){
      scientificTerm=prefix+" lateral inferior temporal vicinity";
      plainEnglish="Toward the lower side of the brain, approximately above the ear.";
    }else if(Math.abs(x)<22 && z< -18 && y< -22){
      scientificTerm=prefix+" inferior midline / posterior-fossa vicinity";
      plainEnglish="Near deeper, lower structures. A precise region cannot be inferred from this coordinate alone.";
    }else{
      scientificTerm=prefix+" cerebral or subcortical vicinity";
      plainEnglish="Broad location inferred from the three coordinate axes; a precise anatomical area needs a validated atlas lookup.";
    }
  }

  return {
    scientificTerm,
    plainEnglish,
    position,
    source:isShen?"indicative-territory":"coordinates-only",
    hemisphere,
    coordinate
  };
}

/** Coordinates are mm in atlas/MNI-like space, not screen coordinates. */
export function formatMniCoordinate(value:number):string {
  return (value>=0?"+":"−")+Math.abs(value).toFixed(1);
}
