import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
const cities=JSON.parse(readFileSync('data/map-cities.json')),leagues=JSON.parse(readFileSync('data/map-leagues.json'));
const urls=[...new Set([...Object.values(cities).flatMap(c=>Object.values(c).map(c=>c.gym?.portrait)),...Object.values(leagues).flatMap(t=>t.map(t=>t.portrait))].filter(Boolean))];
mkdirSync('public/assets/trainers/maps',{recursive:true});const manifest={};
for(let i=0;i<urls.length;i+=4)await Promise.all(urls.slice(i,i+4).map(async url=>{const ext=new URL(url).pathname.endsWith('.gif')?'gif':'png';const filename=`${createHash('sha256').update(url).digest('hex').slice(0,16)}.${ext}`;const path=`public/assets/trainers/maps/${filename}`;if(!existsSync(path)){const r=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!r.ok||!r.headers.get('content-type')?.startsWith('image/'))throw Error(url+': '+r.status);writeFileSync(path,Buffer.from(await r.arrayBuffer()));}manifest[url]=`/assets/trainers/maps/${filename}`;}));
writeFileSync('public/assets/trainers/maps/sources.json',JSON.stringify(manifest,null,2)+'\n');console.log(`${urls.length} retratos/sprites de treinadores salvos para seus respectivos jogos.`);
