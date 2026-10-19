import {mkdirSync,existsSync,writeFileSync} from 'node:fs';
const root='data/version-cache';mkdirSync(root,{recursive:true});
const files=['pokemon','pokemon_species','pokemon_evolution','pokemon_stats','pokemon_stats_past','stats','pokemon_types','pokemon_types_past','types','pokemon_abilities','pokemon_abilities_past','abilities','versions','version_groups','encounters','encounter_slots','encounter_methods','location_areas','locations','location_names','regions','pokemon_dex_numbers','pokedexes'];
for(let i=0;i<files.length;i+=4)await Promise.all(files.slice(i,i+4).map(async name=>{
 const path=`${root}/${name}.csv`;if(existsSync(path))return;
 const response=await fetch(`https://raw.githubusercontent.com/PokeAPI/pokeapi/master/data/v2/csv/${name}.csv`);
 if(!response.ok)throw Error(`${name}: HTTP ${response.status}`);
 writeFileSync(path,await response.text());console.log(`Fonte importada: ${name}`);
}));
