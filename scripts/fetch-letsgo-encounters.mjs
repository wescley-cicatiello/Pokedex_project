import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {locations} from '../public/assets/kanto-locations.js';
const catalog=JSON.parse(await readFile(new URL('../data/pokemon.json',import.meta.url)));
const aliases={forest:'viridianforest',moon:'mt.moon',rock:'rocktunnel',power:'powerplant',seafoam:'seafoamislands',cave:'ceruleancave',victory:'victoryroad',league:'indigoplateau',diglett:'diglettscave',park:'gopark'};
const cache=new URL('../data/letsgo-cache/',import.meta.url);await mkdir(cache,{recursive:true});
const result={reference:'lets-go',locations:{},sources:{}};
for(const location of locations){
 if(location.id==='park'){result.locations.park=[];continue;}
 const slug=location.number?`route${location.number}`:aliases[location.id]||location.name.toLowerCase().replaceAll(' ','');
 const url=`https://www.serebii.net/pokearth/kanto/${location.id==='diglett'?"diglett'scave":slug}.shtml`;
 let html;const file=new URL(`${slug}.html`,cache);
 try{html=await readFile(file,'utf8');}catch{const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error(`${slug}: HTTP ${response.status}`);html=await response.text();await writeFile(file,html);}
 const start=html.search(/<a name="pokemon"/i);
 const end=html.search(/<a name="trainers"/i);
 const section=html.slice(start<0?html.indexOf('Game Anchors'):start,end<0?html.length:end);
 const entries=new Map();let method='Encontro';
 for(const match of section.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)){
  const table=match[0];
  const heading=table.match(/<a name="([^"]+)"[^>]*>([^<]+)<\/a>/i);
  if(heading)method=heading[2].trim().replace(/^Interactable.*$/,'Static Encounters');
  const version=table.includes('class="lgpika"')?'lets-go-pikachu':table.includes('class="lgeevee"')?'lets-go-eevee':null;
  if(!version)continue;
  const ids=[...new Set([...table.matchAll(/\/letsgopikachueevee\/pokemon\/(\d{3})\.png/g)].map(m=>Number(m[1])))];
  for(const id of ids){const p=catalog.find(p=>p.id===id);if(!p)continue;const entry=entries.get(id)||{id,name:p.name,image:p.image,versions:[],methods:[]};if(!entry.versions.includes(version))entry.versions.push(version);if(!entry.methods.includes(method))entry.methods.push(method);entries.set(id,entry);}
 }
 result.locations[location.id]=[...entries.values()].sort((a,b)=>a.id-b.id);result.sources[location.id]=url;
 console.log(`${location.id}: ${entries.size}`);
}
if(!result.locations['route-1'].some(p=>p.id===43&&p.versions.includes('lets-go-pikachu')))throw Error('Falha na leitura da Rota 1');
await writeFile(new URL('../public/assets/letsgo-encounters.json',import.meta.url),JSON.stringify(result,null,2));

