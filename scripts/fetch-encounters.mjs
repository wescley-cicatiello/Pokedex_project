import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { locations } from '../public/assets/kanto-locations.js';
const pokemon = JSON.parse(await readFile(new URL('../data/pokemon.json',import.meta.url)));
const versions = ['red','blue','yellow'];
const names = {pallet:'pallet-town',viridian:'viridian-city',pewter:'pewter-city',cerulean:'cerulean-city',vermilion:'vermilion-city',lavender:'lavender-town',celadon:'celadon-city',saffron:'saffron-city',fuchsia:'fuchsia-city',cinnabar:'cinnabar-island',forest:'viridian-forest',moon:'mt-moon',rock:'rock-tunnel',power:'power-plant',seafoam:'seafoam-islands',cave:'cerulean-cave',victory:'victory-road',league:'indigo-plateau',diglett:'digletts-cave'};
const output = Object.fromEntries(locations.map(location=>[location.id,[]]));
const cache = new URL('../data/encounter-cache/',import.meta.url);
await mkdir(cache,{recursive:true});
for(let start=0;start<pokemon.length;start+=8) {
  await Promise.all(pokemon.slice(start,start+8).map(async p=>{
    const file = new URL(`${p.id}.json`,cache);
    let areas;
    try { areas=JSON.parse(await readFile(file)); } catch {
      const response=await fetch(`https://pokeapi.co/api/v2/pokemon/${p.id}/encounters`,{signal:AbortSignal.timeout(30000)});
      if(!response.ok) throw Error(`PokéAPI HTTP ${response.status}`);
      areas=await response.json(); await writeFile(file,JSON.stringify(areas));
    }
    for(const location of locations) {
      const prefix=location.number?`kanto-${location.number>=19&&location.number<=21?'sea-':''}route-${location.number}`:location.id==='power'?'kanto-power-plant':location.id==='victory'?'kanto-victory-road-2':names[location.id];
      if(!prefix) continue;
      const encounters=areas.filter(area=>area.location_area.name===prefix || area.location_area.name.startsWith(prefix+'-')).flatMap(area=>area.version_details).filter(detail=>versions.includes(detail.version.name));
      if(!encounters.length) continue;
      output[location.id].push({id:p.id,name:p.name,image:p.image,versions:versions.filter(version=>encounters.some(detail=>detail.version.name===version)),methods:[...new Set(encounters.flatMap(detail=>detail.encounter_details.map(encounter=>encounter.method.name)))]});
    }
  }));
}
Object.values(output).forEach(list=>list.sort((a,b)=>a.id-b.id));
await writeFile(new URL('../public/assets/location-encounters.json',import.meta.url),JSON.stringify({reference:'red-blue-yellow',source:'https://pokeapi.co/docs/v2#pokemon-location-areas',locations:output},null,2)+'\n');
console.log(Object.fromEntries(Object.entries(output).map(([id,list])=>[id,list.length])));
