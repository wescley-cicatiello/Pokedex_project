import { writeFile } from 'node:fs/promises';
const results = [];
for (let start = 1; start <= 151; start += 10) {
  results.push(...await Promise.all(Array.from({length: Math.min(10, 152-start)}, async (_, i) => {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${start+i}`);
    if (!response.ok) throw new Error(`PokéAPI: ${response.status}`);
    const p = await response.json();
    return {id:p.id, name:p.name, types:p.types.map(t=>t.type.name), height:p.height/10, weight:p.weight/10, abilities:p.abilities.map(a=>a.ability.name), stats:p.stats.map(s=>({name:s.stat.name,value:s.base_stat})), image:`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`};
  })));
}
await writeFile(new URL('../data/pokemon.json',import.meta.url), JSON.stringify(results,null,2)+'\n');
console.log(`${results.length} Pokémon salvos.`);
