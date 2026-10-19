import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const config=JSON.parse(readFileSync('data/games.json'));
const data=Object.fromEntries(Object.keys(config.versions).map(v=>[v,JSON.parse(readFileSync(`data/versions/${v}.json`))]));
for(const [v,info] of Object.entries(config.versions)){
 const {profiles,atlas}=data[v];assert.equal(profiles.length,info.count,v);assert.equal(new Set(profiles.map(p=>p.id)).size,info.count);assert.equal(profiles.filter(p=>p.regional_number!==null).length,info.regional,`${v}: regional`);
 for(const p of profiles){assert.ok(p.types.length&&p.stats.length&&p.image);assert.equal(p.stats.length,info.generation===1?5:6);assert.ok(p.stats.every(s=>s.value>0));if(info.generation<3||info.group==='letsgo')assert.deepEqual(p.abilities,[]);if(info.generation<6)assert.ok(!p.types.includes('fairy'));}
 const ids=new Set(profiles.map(p=>p.id));assert.ok(atlas.locations.length);for(const l of atlas.locations)for(const p of l.pokemon)assert.ok(ids.has(p.id),`${v}: encontro fora do catálogo`);
}
const pokemon=(v,id)=>data[v].profiles.find(p=>p.id===id);
for(const [version,{profiles}] of Object.entries(data)){
 assert.ok(profiles.some(p=>p.obtainability.native),version);
 for(const p of profiles)assert.equal(typeof p.obtainability.native,'boolean');
}
const native=(v,id)=>pokemon(v,id).obtainability.native;
assert.equal(native('firered',380),false);assert.equal(native('firered',381),false);
assert.equal(native('firered',196),false);assert.equal(native('firered',251),false);
assert.equal(native('firered',3),true);assert.equal(native('firered',65),true);
assert.equal(pokemon('firered',65).obtainability.trade,true);
assert.equal(native('heartgold',380),true);assert.equal(native('soulsilver',381),true);
assert.equal(native('heartgold',462),false);assert.equal(native('heartgold',483),false);
assert.equal(native('lets-go-pikachu',52),false);assert.equal(native('lets-go-pikachu',53),true);
assert.equal(native('lets-go-eevee',58),false);assert.equal(native('lets-go-eevee',59),true);
for(const v of ['lets-go-pikachu','lets-go-eevee'])for(const id of [151,808,809])assert.equal(native(v,id),false);
console.log('FILTROS OK: obtenção por edição, evoluções, trocas, exclusividades, presentes e dependências externas validados.');
assert.deepEqual(pokemon('red',81).types,['electric']);assert.deepEqual(pokemon('gold',81).types,['electric','steel']);
assert.deepEqual(pokemon('heartgold',35).types,['normal']);assert.deepEqual(pokemon('lets-go-pikachu',35).types,['fairy']);
assert.equal(pokemon('red',1).stats.find(s=>s.name==='special').value,65);
assert.equal(pokemon('firered',25).stats.find(s=>s.name==='defense').value,30);assert.equal(pokemon('lets-go-pikachu',25).stats.find(s=>s.name==='defense').value,40);
assert.equal(pokemon('firered',386).stats.find(s=>s.name==='attack').value,180);assert.equal(pokemon('leafgreen',386).stats.find(s=>s.name==='defense').value,160);
assert.deepEqual(pokemon('firered',94).abilities,['levitate']);assert.ok(!pokemon('firered',16).abilities.includes('tangled-feet'));
assert.ok(pokemon('lets-go-pikachu',25).forms.some(p=>p.name==='pikachu-alola')===false);assert.ok(pokemon('lets-go-pikachu',26).forms.some(p=>p.name==='raichu-alola'));
assert.ok(pokemon('lets-go-eevee',809));assert.equal(pokemon('gold',493),undefined);
console.log('DADOS OK: 13 edições; catálogos e Pokédex regionais completos; tipos, Especial da geração I, atributos históricos, habilidades e formas de Deoxys validados.');
