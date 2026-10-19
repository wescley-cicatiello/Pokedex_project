import {readFileSync,writeFileSync} from 'node:fs';
import {locations} from '../public/assets/kanto-locations.js';
import {cityInfo} from '../public/assets/kanto-cities.js';
import {letsgoGyms,letsgoPoints} from '../public/assets/letsgo-gyms.js';
import {leagueTrainers} from '../public/assets/kanto-league.js';
const catalog=JSON.parse(readFileSync('data/pokemon.json'));
const profiles=catalog.map(p=>{
 const item={...p,abilities:[],reference:'letsgo'};
 if([25,133].includes(p.id)){const values=p.id===25?[45,80,50,75,60,120]:[65,75,70,65,85,75];item.partner_stats=p.stats.map((s,i)=>({name:s.name,value:values[i]}));}
 return item;
});
const cities=structuredClone(cityInfo);
for(const [id,city] of Object.entries(cities)){
 city.points=(letsgoPoints[id]||city.points).map(p=>p.replace('Game Corner','Game Corner (sem jogos de aposta)'));
 if(city.gym)city.gym.team=letsgoGyms[id];
}
const world={reference:'letsgo',locations,cities,league:leagueTrainers,encounters:JSON.parse(readFileSync('public/assets/letsgo-encounters.json')).locations};
writeFileSync('data/pokemon-letsgo.json',JSON.stringify(profiles,null,2)+'\n');
writeFileSync('data/world-letsgo.json',JSON.stringify(world,null,2)+'\n');
console.log('Let’s Go: 151 perfis, 45 locais, 8 ginásios e 5 treinadores da Liga preparados.');
