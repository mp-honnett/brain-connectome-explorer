import type { Dataset } from "./types";

/**
 * Curated attributions for assets currently included in the deployed explorer.
 * Keep this page in sync with CREDITS.md and the generated npm notices.
 * Merely citing a scientific paper does not itself establish reuse permissions.
 */
export default function Credits({metadata}:{metadata?:Dataset["metadata"]}){
  const notices=import.meta.env.BASE_URL+"legal/third-party-notices.txt";
  const softwareLicense=import.meta.env.BASE_URL+"legal/software-license.md";
  return <div className="credits-page">
    <div className="credits-intro">
      <p className="eyebrow">PROVENANCE · ATTRIBUTION · REUSE RIGHTS</p>
      <h1>Headspin · Credits &amp; Licences</h1>
      <p>This explorer combines published neuroscience research, openly distributed data, an atlas-derived anatomical surface, original visualisation code, and open-source software. Scientific credit and legal reuse permissions are documented separately.</p>
      <div className="credits-alert" role="note"><strong>Rights still to verify:</strong> The exact Shen268 atlas NIfTI’s redistribution terms have not been independently confirmed. Honnett Ltd’s noncommercial software licence does not override third-party rights.</div>
    </div>

    <section className="credit-section" aria-labelledby="credit-code">
      <h2 id="credit-code">Original explorer software licence</h2>
      <div className="credit-entry">
        <div className="credit-entry-head"><h3>PolyForm Noncommercial License 1.0.0</h3><span className="credit-status">Noncommercial</span></div>
        <p>The original application and processing code in this repository is published under PolyForm Noncommercial 1.0.0, subject to the copyright holder having authority to grant these rights. The licence permits personal, educational, research and other specified noncommercial uses, changes, and permitted redistribution, provided its terms and required notices accompany copies.</p>
        <p><strong>Commercial use:</strong> Commercial uses beyond the licence's exceptions require a separate licence from the person or entity holding the relevant software copyright. A public GitHub repository does not itself grant commercial permission.</p>
        <p><strong>What this does not cover:</strong> Independently licensed React/Three.js dependencies, YaleNeuroConnect data, Shen268 atlas materials, the derived brain mesh, and any future third-party 3D models retain their own terms. This is source-available, not OSI-approved open-source software.</p>
        <p><strong>Copyright holder:</strong> <a href="https://www.honnett.com" target="_blank" rel="noopener noreferrer">Honnett Ltd ↗</a>. Required notice: <code>Copyright (c) 2026 Honnett Ltd.</code></p>
        <p><strong>Trademark:</strong> Tweenbrain is a trademark of Honnett Ltd. The software licence does not grant a right to use the trademark to suggest endorsement. No claim of registered-trademark status is made.</p>
        <p>These notices must accompany copies and permitted adaptations of the original software, together with the licence text or its official URL.</p>
        <div className="credit-links">
          <a href={softwareLicense} target="_blank" rel="noreferrer">Full software licence text ↗</a>
          <a href={import.meta.env.BASE_URL+"legal/notice.txt"} target="_blank" rel="noreferrer">Honnett Ltd copyright &amp; trademark notice ↗</a>
          <a href="https://polyformproject.org/licenses/noncommercial/1.0.0/" target="_blank" rel="noreferrer">Official PolyForm licence ↗</a>
          <a href="https://github.com/mp-honnett/brain-connectome-explorer/blob/main/LICENSING.md" target="_blank" rel="noreferrer">Scope and third-party exceptions ↗</a>
        </div>
      </div>
    </section>

    <section className="credit-section" aria-labelledby="credit-data">
      <h2 id="credit-data">Research data</h2>
      <div className="credit-entry">
        <div className="credit-entry-head"><h3>YaleNeuroConnect / OpenNeuro ds007286</h3><span className="credit-status">CC0 reported</span></div>
        <p>Functional connectivity matrices for rest and an n-back working-memory task, derived from one anonymised participant's session. This visualisation does not represent an average across participants.</p>
        <p><strong>Provider / credit:</strong> Yale Magnetic Resonance Research Center / YaleNeuroConnect contributors; distributed through OpenNeuro.</p>
        <p><strong>Scientific paper:</strong> Samardzija, A., Shen, X., Greene, A. S., et al. (2026), <em>A Transdiagnostic fMRI Dataset With 400+ Deeply Phenotyped Participants Across Resting and Task States.</em> Scientific Data, DOI: 10.1038/s41597-026-08749-0.</p>
        <p><strong>Different rights for the paper:</strong> The journal article is CC BY-NC-ND 4.0, which is separate from the OpenNeuro dataset’s reported CC0 status. This app links to the paper but does not reproduce or adapt its text or figures.</p>
        <p><strong>Reported dataset licence:</strong> Creative Commons CC0 1.0 Universal, per dataset metadata reported for OpenNeuro ds007286. Confirm the licence for the version and derivative actually reused.</p>
        <p><strong>Changes in this application:</strong> Source matrices are converted from Fisher z to Pearson correlation r using tanh; the sample is reduced to a browser-viewable JSON file. Region-to-matrix index correspondence is still provisional.</p>
        {metadata?.source&&<p><strong>Loaded data source:</strong> {metadata.source}</p>}
        {metadata?.note&&<p className="credit-caution"><strong>Dataset caution:</strong> {metadata.note}</p>}
        <div className="credit-links">
          <a href="https://openneuro.org/datasets/ds007286" target="_blank" rel="noreferrer">OpenNeuro dataset ↗</a>
          <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noreferrer">CC0 1.0 text ↗</a>
          <a href="https://doi.org/10.1038/s41597-026-08749-0" target="_blank" rel="noreferrer">YaleNeuroConnect data descriptor ↗</a>
        </div>
      </div>
    </section>

    <section className="credit-section" aria-labelledby="credit-atlas">
      <h2 id="credit-atlas">Brain atlas &amp; derived mesh</h2>
      <div className="credit-entry">
        <div className="credit-entry-head"><h3>Shen268 functional parcellation</h3><span className="credit-status needs-review">Terms to verify</span></div>
        <p><strong>Scientific attribution:</strong> Shen, X., Tokoglu, F., Papademetris, X. &amp; Constable, R. T. (2013). <em>Groupwise whole-brain parcellation from resting-state fMRI data for network node identification.</em> NeuroImage, 82, 403–415. DOI: 10.1016/j.neuroimage.2013.05.081.</p>
        <p><strong>Exact source file:</strong> <code>shen_2mm_268_parcellation_vol.nii</code>, publicly hosted in the YaleMRRC/YaleNeuroConnect_FullPredictions repository.</p>
        <p><strong>Derived asset:</strong> <code>public/assets/brain-envelope.glb</code> is a smoothed, atlas-aligned mesh generated by our own script from this NIfTI. Parcel centres are also computed from the atlas.</p>
        <p className="credit-caution"><strong>Licensing status:</strong> The atlas source repository does not display an unambiguous licence for this specific file in its root listing. Public access and scholarly citation do not, by themselves, establish redistribution permission. Verify the atlas rights before treating this asset as cleared for wider reuse.</p>
        <div className="credit-links">
          <a href="https://doi.org/10.1016/j.neuroimage.2013.05.081" target="_blank" rel="noreferrer">Shen et al. paper ↗</a>
          <a href="https://github.com/YaleMRRC/YaleNeuroConnect_FullPredictions/blob/main/shen_2mm_268_parcellation_vol.nii" target="_blank" rel="noreferrer">Atlas source file ↗</a>
          <a href="https://github.com/mp-honnett/brain-connectome-explorer/blob/main/scripts/prepare_brain_envelope.py" target="_blank" rel="noreferrer">Mesh generation ↗</a>
        </div>
      </div>
    </section>

    <section className="credit-section" aria-labelledby="credit-lobes">
      <h2 id="credit-lobes">Tweenbrain anatomical teaching palette</h2>
      <div className="credit-entry">
        <div className="credit-entry-head"><h3>Lobe colours &amp; schematic guide volumes</h3><span className="credit-status">Original visual design</span></div>
        <p>The lobe colours are an original Tweenbrain design convention, not a universally accepted anatomical colour standard. The current transparent bilateral volumes are approximate educational orientation guides, not MRI-derived lobe segmentations, sulcal boundaries or clinically validated landmarks.</p>
        <p><strong>Palette:</strong> frontal <code>#E8A24B</code>; parietal <code>#55B8E7</code>; temporal <code>#B598EC</code>; occipital <code>#61CDA7</code>; insula <code>#EB91A0</code>; mixed / unclassified <code>#8793A3</code>.</p>
        <p className="credit-caution"><strong>Scientific limitation:</strong> No validated Shen268-to-anatomical-lobe lookup is supplied. Parcels and functional-correlation edges retain their existing connectivity styling; selecting a lobe highlights only the illustrative guide volumes, not a verified set of parcels. True lobe boundaries and sulci require a rights-cleared, spatially registered anatomical annotation atlas.</p>
        <p><strong>Source:</strong> Original viewer code in <code>src/lobePalette.ts</code> and <code>src/LobeOverlay.tsx</code>, attributed to Honnett Ltd and covered by the project's PolyForm Noncommercial software terms.</p>
      </div>
    </section>

    <section className="credit-section" aria-labelledby="credit-models">
      <h2 id="credit-models">3D models &amp; visuals</h2>
      <div className="credit-entry">
        <div className="credit-entry-head"><h3>Transparent outer head</h3><span className="credit-status">Original procedural geometry</span></div>
        <p>Generated programmatically inside this project's <code>src/HeadShell.tsx</code>. It is an illustrative generic head, not a downloaded CT scan, a subject-specific medical reconstruction, or a claim of medical precision.</p>
        <p><strong>External 3D-model credit:</strong> None for the current outer head mesh. The Shen268-derived brain envelope is credited separately above.</p>
        <p><strong>Project code licence:</strong> PolyForm Noncommercial 1.0.0 applies to original procedural geometry and app code owned by Honnett Ltd; see the software licence section above.</p>
      </div>
      <div className="credit-entry">
        <div className="credit-entry-head"><h3>Human skull SU39 from CT scan</h3><span className="credit-status">CC BY 4.0 · User-imported</span></div>
        <p><strong>Creator:</strong> SusanElaineJones. <strong>Model:</strong> <a href="https://sketchfab.com/3d-models/human-skull-su39-from-ct-scan-e375b7b910d14547854ac7d1b2a5e1ed" target="_blank" rel="noopener noreferrer">Human skull SU39 from CT scan</a>.</p>
        <p><strong>Original model licence:</strong> <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">Creative Commons Attribution 4.0 International</a>, as stated in the user's downloaded Sketchfab ZIP. Copyright and model attribution remain with the original creator; the model is not relicensed under Honnett Ltd's PolyForm terms.</p>
        <p><strong>Required attribution:</strong> This work is based on <a href="https://sketchfab.com/3d-models/human-skull-su39-from-ct-scan-e375b7b910d14547854ac7d1b2a5e1ed" target="_blank" rel="noopener noreferrer">"Human skull SU39 from CT scan"</a> by <a href="https://sketchfab.com/SusanElaineJones" target="_blank" rel="noopener noreferrer">SusanElaineJones</a>, licensed under CC BY 4.0.</p>
        <p><strong>Changes for browser use:</strong> The optional prepared GLB merges the source's three scene meshes, reduces triangles via approximately 1.5 mm vertex clustering, and replaces the original vertex colours with a neutral bone material. The application applies approximate scale and translation for a visual fit.</p>
        <p><strong>Distribution:</strong> The viewer accepts the original Sketchfab ZIP or a prepared GLB as a local browser import. The GitHub Pages deployment does not bundle the skull asset; the user loads it into their browser, where it may be saved for subsequent visits. A prepared copy can be downloaded from the model-processing handoff, with the original licence text alongside it.</p>
        <p className="credit-caution"><strong>Registration limitation:</strong> SU39 is a different CT individual, not the YaleNeuroConnect participant or Shen268 atlas source. Its fit in the explorer is a nonvalidated educational illustration; it is not an anatomical registration or a patient-specific combined scan.</p>
        <div className="credit-links">
          <a href="https://sketchfab.com/SusanElaineJones" target="_blank" rel="noopener noreferrer">Creator profile ↗</a>
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0 terms ↗</a>
        </div>
      </div>
    </section>

    <section className="credit-section" aria-labelledby="credit-software">
      <h2 id="credit-software">Software &amp; source code</h2>
      <div className="credit-entry">
        <div className="credit-entry-head"><h3>React, Three.js &amp; supporting libraries</h3><span className="credit-status">Third-party notices</span></div>
        <p>The viewer uses React, React DOM, Three.js, React Three Fiber and Drei, with Vite and TypeScript for development. Key libraries are MIT-licensed, but each installed package must be treated under its own terms.</p>
        <p>The site's build creates a downloadable notice file from the installed npm dependency tree, listing package versions, declared licence identifiers and available full licence/NOTICE text, including transitive dependencies. This is an audit aid, not a guarantee that every upstream notice has been supplied.</p>
        <div className="credit-links">
          <a href={notices} target="_blank" rel="noreferrer">View complete generated npm notices ↗</a>
          <a href="https://github.com/mp-honnett/brain-connectome-explorer" target="_blank" rel="noreferrer">Explorer source repository ↗</a>
        </div>
      </div>
    </section>

    <section className="credit-section" aria-labelledby="credit-practice">
      <h2 id="credit-practice">Interpretation &amp; legal notes</h2>
      <div className="credit-entry">
        <p>Connections are fMRI functional correlations, not physical nerve fibres, anatomical tract reconstructions or demonstrations of causation. The current example is a single-participant educational visualisation, and the exact atlas-to-matrix index matching remains provisional.</p>
        <p>References to external research do not imply endorsement by Yale University, OpenNeuro, the atlas authors, or any third-party asset creator.</p>
        <p>The credits inventory should be reviewed every time research data, a mesh, a font, a library, or another external asset is added. Honnett Ltd is identified as the copyright holder of the original software under PolyForm Noncommercial 1.0.0; Tweenbrain is identified as its trademark. The atlas's file-level reuse terms still need independent confirmation.</p>
        <div className="credit-links">
          <a href="https://github.com/mp-honnett/brain-connectome-explorer/blob/main/CREDITS.md" target="_blank" rel="noreferrer">Repository attribution register ↗</a>
        </div>
      </div>
    </section>
    <p className="credits-footnote">Attribution record reviewed 19 November 2026. Educational information, not legal advice.</p>
  </div>;
}
