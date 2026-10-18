import { mkdir, writeFile, access } from 'node:fs/promises';
import { locations } from '../public/assets/kanto-locations.js';
const overrides = {forest:'Viridian Forest',moon:'Mt. Moon',rock:'Rock Tunnel',power:'Power Plant',seafoam:'Seafoam Islands',cave:'Cerulean Cave',victory:'Victory Road',league:'Indigo Plateau',diglett:"Diglett's Cave",park:'GO Park'};
const files = locations.map(location=>({id:location.id,title:`File:${location.number ? `Kanto Route ${location.number}` : overrides[location.id] || location.name} PE.png`}));
files.find(file=>file.id==='cave').title='File:Cerulean Cave Exterior LGPE.png';
files.find(file=>file.id==='park').title='File:GO Park Exterior LGPE.png';
const url = new URL('https://archives.bulbagarden.net/w/api.php');
url.search = new URLSearchParams({action:'query',titles:files.map(f=>f.title).join('|'),prop:'imageinfo',iiprop:'url',format:'json'});
const response = await fetch(url,{signal:AbortSignal.timeout(30000)});
if(!response.ok) throw new Error(`Archive HTTP ${response.status}`);
const metadata = await response.json();
const pages = Object.values(metadata.query.pages);
const directory = new URL('../public/assets/locations/',import.meta.url);
await mkdir(directory,{recursive:true});
const manifest = {};
for(let index=0;index<files.length;index+=3) {
  await Promise.all(files.slice(index,index+3).map(async file=>{
    const page = pages.find(page=>page.title===file.title);
    const info = page?.imageinfo?.[0];
    if(!info) { console.log(`Não encontrada: ${file.id}`); return; }
    const target = new URL(`${file.id}.png`,directory);
    const exists = await access(target).then(()=>true,()=>false);
    if (!exists) {
      const image = await fetch(info.url,{signal:AbortSignal.timeout(30000)});
      if(!image.ok || !image.headers.get('content-type')?.startsWith('image/')) throw new Error(`Imagem inválida: ${file.id}`);
      await writeFile(target,Buffer.from(await image.arrayBuffer()));
    }
    manifest[file.id] = {image:`/assets/locations/${file.id}.png`,source:info.descriptionurl};
  }));
}
await writeFile(new URL('../public/assets/location-images.json',import.meta.url),JSON.stringify(manifest,null,2)+'\n');
console.log(`${Object.keys(manifest).length} imagens salvas.`);
