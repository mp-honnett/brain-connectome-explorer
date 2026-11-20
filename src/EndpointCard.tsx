import type { Dataset, Node } from "./types";
import { describeNodeLocation, formatMniCoordinate } from "./anatomyLocation";

export function EndpointCard({node,dataset,role}:{
  node:Node;
  dataset:Dataset;
  role:"From"|"To";
}){
  const location=describeNodeLocation(node,dataset);
  const [x,y,z]=location.coordinate;
  return <article className="endpoint-card">
    <div className="endpoint-card-heading">
      <span className="endpoint-role">{role} endpoint</span>
      <strong>{node.label}</strong>
    </div>
    <div className="endpoint-area">
      <span className="endpoint-overline">Approximate anatomical vicinity</span>
      <strong>{location.scientificTerm}</strong>
      <p>{location.plainEnglish}</p>
      {location.candidateSubregion&&<div className="endpoint-candidate">
        <span className="endpoint-overline">Candidate prefrontal subregion · unverified</span>
        <strong>{location.candidateSubregion}</strong>
      </div>}
    </div>
    <div className="endpoint-coordinates">
      <span className="endpoint-overline">Atlas centroid · MNI-style (mm)</span>
      <div className="endpoint-axes">
        <span><b>X</b> {formatMniCoordinate(x)}</span>
        <span><b>Y</b> {formatMniCoordinate(y)}</span>
        <span><b>Z</b> {formatMniCoordinate(z)}</span>
      </div>
      <small>{location.hemisphere} hemisphere · X left/right, Y back/front, Z lower/upper</small>
      <div className="endpoint-brodmann"><span className="endpoint-overline">Brodmann area (BA)</span><span>{location.brodmannStatus}</span></div>
    </div>
    <p className="endpoint-confidence">{location.source==="indicative-territory"
      ?"Coordinate-based orientation only; exact gyrus and Shen268 anatomical label not verified."
      :"No verified anatomical mapping is available for this imported parcel."}</p>
  </article>;
}
