import {mkdirSync,existsSync,writeFileSync} from 'node:fs';
mkdirSync('data/map-cache',{recursive:true});
const sources={landmarks:'https://raw.githubusercontent.com/pret/pokecrystal/master/data/maps/landmarks.asm',gyms_gs:'https://www.serebii.net/gs/gyms.shtml',gyms_yellow:'https://www.serebii.net/yellow/gyms.shtml',gyms_frlg:'https://www.serebii.net/fireredleafgreen/gyms.shtml',gyms_hgss:'https://www.serebii.net/heartgoldsoulsilver/gym.shtml'};
for(const group of ['rb','yellow','fireredleafgreen','gs','heartgoldsoulsilver'])sources[`league_${group}`]=`https://www.serebii.net/${group}/elitefour.shtml`;
const entries=Object.entries(sources);
for(let i=0;i<entries.length;i+=4)await Promise.all(entries.slice(i,i+4).map(async([name,url])=>{const path=`data/map-cache/${name}.txt`;if(existsSync(path))return;const response=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error(`${name}: HTTP ${response.status}`);writeFileSync(path,await response.text());console.log(`Referência importada: ${name}`);}));
