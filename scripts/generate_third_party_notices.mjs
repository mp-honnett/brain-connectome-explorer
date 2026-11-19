/**
 * Generate an auditable THIRD-PARTY-NOTICES file from the installed npm tree.
 * This records full discovered licence/NOTICE texts where locally provided.
 * It is not a replacement for an independent legal inventory or permissions review.
 */
import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const lockPath=path.join(root,"node_modules",".package-lock.json");
const output=path.join(root,"dist","legal","third-party-notices.txt");
if(!fs.existsSync(lockPath)){
  throw new Error("npm installed-package lock file missing: "+lockPath);
}
const lock=JSON.parse(fs.readFileSync(lockPath,"utf8"));
const packages=Object.keys(lock.packages||{}).filter(p=>p.startsWith("node_modules/")).sort();
const parts=[
  "BRAIN CONNECTOME EXPLORER — INSTALLED THIRD-PARTY SOFTWARE NOTICES",
  "Automatically generated during the website build from npm's installed package tree.",
  "Packages can carry different copyright and licensing obligations.",
  "This file reproduces discovered package-level licence/NOTICE texts where present.",
  "Review the actual upstream terms before redistribution. No licence is implied for",
  "this explorer's original code, its research data or anatomical assets.",
  "See /#credits and CREDITS.md for science and 3D model attribution.",
  ""
];
let included=0, missing=0;
for(const rel of packages){
  const dir=path.join(root,rel);
  const pkgPath=path.join(dir,"package.json");
  if(!fs.existsSync(pkgPath))continue;
  let pkg;
  try{pkg=JSON.parse(fs.readFileSync(pkgPath,"utf8"))}catch{continue}
  const name=pkg.name||rel.split("node_modules/").at(-1)||rel;
  const licence=typeof pkg.license==="string"?pkg.license:
    pkg.license?JSON.stringify(pkg.license):"NOT DECLARED IN package.json — REVIEW REQUIRED";
  const homepage=typeof pkg.homepage==="string"?pkg.homepage:"https://www.npmjs.com/package/"+encodeURIComponent(name);
  const heading=name+"@"+(pkg.version||"unknown");
  parts.push("=".repeat(78),heading,"Declared licence: "+licence,"Project: "+homepage,"Installed directory: "+rel);
  let files=[];
  try{
    files=fs.readdirSync(dir).filter(file=>/^(?:licen[cs]e|copying|copyright|notice|third[-_. ]?party[-_. ]?notices?)(?:[.\-_ ].*)?$/i.test(file));
  }catch{}
  let seen=false;
  for(const file of files.sort()){
    const source=path.join(dir,file);
    let stat;
    try{stat=fs.statSync(source)}catch{continue}
    if(!stat.isFile()||stat.size>512*1024)continue;
    const bytes=fs.readFileSync(source);
    if(bytes.includes(0))continue;
    const body=bytes.toString("utf8");
    if(!body.trim())continue;
    parts.push("--- "+file+" ---",body.trim(),"");
    seen=true;
  }
  if(!seen){
    missing++;
    parts.push("No top-level licence/NOTICE text was found in this installed package.","Consult the listed upstream project and inspect bundled distribution files.","");
  }
  included++;
}
parts.splice(7,0,"Installed packages inventoried: "+included,"Packages missing readable top-level licence/NOTICE: "+missing);
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,parts.join("\n")+"\n","utf8");
console.log("Wrote "+output+" ("+included+" installed packages, "+missing+" missing standalone notice files)");
