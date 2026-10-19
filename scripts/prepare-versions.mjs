import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
// Upstream CSV fields used here contain no embedded line breaks. Preserve quoted commas.
function csv(name){const lines=readFileSync(`data/version-cache/${name}.csv`,'utf8').trim().split(/\r?\n/);const split=line=>[...line.matchAll(/(?:^|,)("(?:[^"]|"")*"|[^,]*)/g)].map(m=>m[1].replace(/^"|"$/g,'').replaceAll('""','"'));const keys=split(lines.shift());return lines.map(line=>Object.fromEntries(split(line).map((v,i)=>[keys[i],v])));}
const index=rows=>Object.fromEntries(rows.map(r=>[r.id,r]));
const group=(rows,key)=>Object.groupBy(rows,r=>r[key]);
const allPokemon=csv('pokemon');
const pokemon=allPokemon.filter(p=>p.is_default==='1');
const stats=group(csv('pokemon_stats'),'pokemon_id'),pastStats=group(csv('pokemon_stats_past'),'pokemon_id');
const types=group(csv('pokemon_types'),'pokemon_id'),pastTypes=group(csv('pokemon_types_past'),'pokemon_id');
const abilities=group(csv('pokemon_abilities'),'pokemon_id'),pastAbilities=group(csv('pokemon_abilities_past'),'pokemon_id');
const statNames=index(csv('stats')),typeNames=index(csv('types')),abilityNames=index(csv('abilities'));
const dexNumbers=group(csv('pokemon_dex_numbers'),'pokedex_id');
const config=JSON.parse(readFileSync('data/games.json'));
const slots=index(csv('encounter_slots')),methods=index(csv('encounter_methods')),areas=index(csv('location_areas')),places=index(csv('locations')),regions=index(csv('regions'));
const names=Object.fromEntries(csv('location_names').filter(n=>n.local_language_id==='9').map(n=>[n.location_id,n.name]));
const versions=Object.fromEntries(csv('versions').map(v=>[v.identifier,v.id]));
const allEncounters=group(csv('encounters'),'version_id');
const species=index(csv('pokemon_species')),evolutions=csv('pokemon_evolution'),versionGroups=index(csv('version_groups'));
// Only encounters taking place in this cartridge count. External distributions are not catches.
const externalMethods=/colosseum|channel|ranger|battle-revolution|pokecenter|wish-eggs/;
function obtainability(version,info,encounters){
 const paths=new Map(),limit=id=>info.group==='letsgo'?id<=151:id<=info.count;
 const blocked=new Set(info.group==='frlg'?[196,197,251]:['heartgold','soulsilver'].includes(version)?[462,470,471,476,483,484,487,384]:[]);
 const put=(id,path)=>{if(!limit(id)||blocked.has(id)||paths.has(id))return false;paths.set(id,path);return true;};
 for(const e of encounters){const method=methods[slots[e.encounter_slot_id].encounter_method_id].identifier;if(externalMethods.test(method))continue;const area=areas[e.location_area_id],place=places[area.location_id];if(info.group==='frlg'&&place.identifier.includes('altering-cave')&&+e.pokemon_id!==41)continue;const event=info.group==='frlg'&&[249,250,386].includes(+e.pokemon_id);put(+e.pokemon_id,{method,source:names[place.id]||place.identifier,event,trade:false});}
 // Historical event items unlock encounters within these editions; external Pokémon do not.
 if(version==='crystal')put(251,{method:'event',source:'GS Ball: evento histórico japonês ou distribuição da versão Virtual Console',event:true,trade:false});
 if(['heartgold','soulsilver'].includes(version))put(version==='heartgold'?381:380,{method:'event',source:'Enigma Stone: evento histórico',event:true,trade:false});
 let changed=true;
 while(changed){changed=false;
  for(const s of Object.values(species)){const id=+s.id,parent=+s.evolves_from_species_id;if(!parent||!paths.has(parent)||paths.has(id)||!limit(id))continue;
   const rule=evolutions.find(e=>+e.evolved_species_id===id&&+versionGroups[e.version_group_id]?.generation_id<=info.generation&&(!e.evolved_pokemon_form_id||+e.evolved_pokemon_form_id===id)&&(!e.region_id||+e.region_id<=2));
   if(!rule)continue;const origin=paths.get(parent);changed=put(id,{method:'evolution',source:species[parent].identifier,event:origin.event,trade:origin.trade||rule.evolution_trigger_id==='2'})||changed;
  }
  if(info.generation>=2&&info.group!=='letsgo'&&paths.has(132))for(const s of Object.values(species)){
   const parent=+s.evolves_from_species_id;if(!parent||!paths.has(+s.id)||paths.has(parent)||s.is_baby==='1'||s.is_legendary==='1'||s.is_mythical==='1'||[30,31].includes(+s.id))continue;
   const origin=paths.get(+s.id);changed=put(parent,{method:'breeding',source:s.identifier,event:origin.event,trade:origin.trade})||changed;
  }
 }
 return paths;
}
const lg=JSON.parse(readFileSync('data/pokemon-letsgo.json'));
mkdirSync('data/versions',{recursive:true});
for(const [version,info] of Object.entries(config.versions)){
 const generation=info.generation,isLG=info.group==='letsgo';
 const encounters=allEncounters[versions[version==='green'?'blue':version]]||[];
 const availability=new Set(encounters.map(e=>+e.pokemon_id));
 const native=obtainability(version,info,encounters);
 const regional=new Map((dexNumbers[info.dex]||[]).map(p=>[+p.species_id,+p.pokedex_number]));
 const profiles=pokemon.filter(p=>isLG?(+p.id<=151||[808,809].includes(+p.id)):+p.id<=info.count).map(p=>{
  const id=+p.id;
  const form=info.group==='frlg'&&id===386?allPokemon.find(p=>p.identifier===`deoxys-${version==='firered'?'attack':'defense'}`):p;
  const profileId=+form.id;
  let values=structuredClone(stats[profileId]||[]);
  // Past rows apply through their stated generation. Earliest matching boundary wins.
  for(const s of [...(pastStats[profileId]||[])].sort((a,b)=>+b.generation_id-+a.generation_id))if(generation<=+s.generation_id){const old=values.find(v=>v.stat_id===s.stat_id);if(old)old.base_stat=s.base_stat;else values.push(s);}
  values=values.filter(s=>generation===1?!['4','5'].includes(s.stat_id):s.stat_id!=='9');
  let typeRows=types[id]||[];
  const previous=(pastTypes[id]||[]).filter(t=>generation<=+t.generation_id).sort((a,b)=>+a.generation_id-+b.generation_id);
  if(previous.length)typeRows=previous.filter(t=>t.generation_id===previous[0].generation_id);
  let abilityRows=structuredClone(abilities[id]||[]);
  for(const a of [...(pastAbilities[id]||[])].sort((a,b)=>+b.generation_id-+a.generation_id))if(generation<=+a.generation_id){abilityRows=abilityRows.filter(v=>v.slot!==a.slot);if(a.ability_id)abilityRows.push(a);}
  const item={id,name:p.identifier,types:typeRows.sort((a,b)=>+a.slot-+b.slot).map(t=>typeNames[t.type_id].identifier),height:+p.height/10,weight:+p.weight/10,
   abilities:generation<3||isLG?[]:abilityRows.filter(a=>a.is_hidden==='0').sort((a,b)=>+a.slot-+b.slot).map(a=>abilityNames[a.ability_id].identifier),
   stats:values.sort((a,b)=>+a.stat_id-+b.stat_id).map(s=>({name:statNames[s.stat_id].identifier,value:+s.base_stat})),
   image:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${profileId}.png`,
   reference:isLG?'letsgo':version,version,regional_number:regional.get(id)||null,
   availability:isLG?'Consulte os encontros e as condições de obtenção de Let’s Go.':availability.has(id)?'Possui registros de encontro nesta edição. Veja os locais no atlas.':'Sem encontro registrado nesta edição. Pode depender de evolução, troca, transferência, presente ou evento; presença no catálogo não significa captura disponível.'};
  if(form!==p){item.form_label=version==='firered'?'Forma Ataque (FireRed)':'Forma Defesa (LeafGreen)';}
  if(isLG){
   const existing=lg.find(x=>x.id===id);if(existing?.partner_stats)item.partner_stats=existing.partner_stats;
   item.forms=allPokemon.filter(f=>f.species_id===p.species_id&&(/-alola$|-mega(?:-x|-y)?$/.test(f.identifier))).map(f=>{
    const values=structuredClone(stats[f.id]);
    for(const s of [...(pastStats[f.id]||[])].sort((a,b)=>+b.generation_id-+a.generation_id))if(generation<=+s.generation_id){const old=values.find(v=>v.stat_id===s.stat_id);if(old)old.base_stat=s.base_stat;}
    return {name:f.identifier,types:(types[f.id]||[]).map(t=>typeNames[t.type_id].identifier),stats:values.map(s=>({name:statNames[s.stat_id].identifier,value:+s.base_stat})),image:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${f.id}.png`};
   });
   if(id===808)item.availability='Obtido em Pokémon GO e transferido para o GO Park. Não evolui dentro de Let’s Go.';
   if(id===809)item.availability='Evolua Meltan em Pokémon GO e transfira Melmetal para o GO Park.';
   if(id===151)item.availability='Presente da Poké Ball Plus, quando o Mew do acessório ainda não foi resgatado. Não é encontro selvagem.';
  }
  const path=native.get(id);
  item.obtainability={native:!!path,...(path||{})};
  if(path){const method=path.method==='evolution'?`Evolução de ${path.source}`:path.method==='breeding'?`Reprodução de ${path.source} com Ditto`:`Obtenção nesta edição: ${path.source}`;item.availability=method+'.'+(path.trade?' A evolução exige troca com outro jogador.':'')+(path.event?' Exige evento histórico; não está normalmente disponível hoje.':'')+' Pode depender de progresso, escolhas, horário ou condições específicas.';}
  else if(!isLG)item.availability='Sem caminho de obtenção interna identificado nesta edição. A Pokédex nacional inclui espécies compatíveis que podem exigir troca ou transferência de outro jogo; isso não indica encontro disponível.';
  return item;
 });
 if(profiles.length!==info.count)throw Error(`Catálogo incompleto: ${version} ${profiles.length}`);
 const byArea={};
 for(const e of encounters){if(+e.pokemon_id>info.count)continue;const area=areas[e.location_area_id],place=places[area.location_id];const key=area.id;byArea[key]??={id:key,name:names[place.id]||place.identifier,area:area.identifier,region:regions[place.region_id]?.identifier||'Outros',pokemon:{}};
 const entry=byArea[key].pokemon[e.pokemon_id]??={id:+e.pokemon_id,methods:[],min_level:+e.min_level,max_level:+e.max_level};
 entry.methods=[...new Set([...entry.methods,methods[slots[e.encounter_slot_id].encounter_method_id].identifier])];entry.min_level=Math.min(entry.min_level,+e.min_level);entry.max_level=Math.max(entry.max_level,+e.max_level);}
 const atlas={version,source:'https://github.com/PokeAPI/pokeapi/tree/master/data/v2/csv',note:version==='green'?'Green japonês: encontros usam a distribuição do Blue internacional, baseada em Green. Não corresponde ao Blue japonês.':'Registros de encontros da PokéAPI. Algumas aparições dependem de horário, rádio, enxames, eventos ou progresso. A lista não cobre todas as evoluções, presentes, trocas e transferências.',locations:Object.values(byArea).map(a=>({...a,pokemon:Object.values(a.pokemon)})).sort((a,b)=>a.name.localeCompare(b.name)||a.area.localeCompare(b.area))};
 writeFileSync(`data/versions/${version}.json`,JSON.stringify({profiles,atlas}));
 console.log(`${version}: ${profiles.length} Pokémon; ${atlas.locations.length} áreas de encontro.`);
}
