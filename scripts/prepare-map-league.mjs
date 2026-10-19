import {readFileSync,writeFileSync} from 'node:fs';
const profiles=JSON.parse(readFileSync('data/versions/heartgold.json')).profiles;
const names=new Map(profiles.map(p=>[p.id,p.name[0].toUpperCase()+p.name.slice(1)]));
function tableAt(html,start){let depth=0;for(const m of html.slice(start).matchAll(/<\/?table\b[^>]*>/gi)){depth+=m[0].startsWith('</')?-1:1;if(!depth)return html.slice(start,start+m.index+m[0].length);}throw Error('Tabela incompleta');}
const leagues={};
for(const [group,folder] of Object.entries({red:'rb',yellow:'yellow',frlg:'fireredleafgreen',gsc:'gs',hgss:'heartgoldsoulsilver'})){
 const html=readFileSync(`data/map-cache/league_${folder}.txt`,'utf8');const trainers=[];
 const pattern=group==='hgss'?/<table width="400" border="1" align="center">/g:/<table class="trainer"/g;
 for(const match of html.matchAll(pattern)){
  const t=tableAt(html,match.index),rows=t.split('</tr>');let ids,levels,name,portrait;
  if(group==='hgss'){
   ids=[...rows[0].matchAll(/src="\/heartgoldsoulsilver\/pokemon\/(\d+)[^"]*"/g)].map(m=>+m[1]);if(!ids.length)continue;
   const cells=[...rows[1].matchAll(/<td class="cen">([\s\S]*?)<\/td>/g)].map(m=>m[1]);name=cells[0]?.trim();levels=cells.slice(1).map(c=>+c.match(/Lv\.\s*(\d+)/)?.[1]);portrait=rows[0].match(/src="(elite\/[^" ]+)"/)?.[1];
  }else{
   ids=[...rows[0].matchAll(/href="\/pokedex[^/]*\/(\d+)\.shtml"/g)].map(m=>+m[1]);levels=[...t.matchAll(/class="level"[^>]*>Level (\d+)/g)].map(m=>+m[1]);name=t.match(/(?:Elite(?: Four)?|Champion)\s+([^<]+)/)?.[1].trim();portrait=rows[0].match(/src="([^"]*trainers[^" ]+)"/)?.[1];
  }
  if(!name||!ids.length||ids.length!==levels.length||levels.some(n=>!n))throw Error('Equipe inválida: '+group+' '+name);
  const isChampion=group==='hgss'?name==='Lance':t.includes('Champion '+name);
  const displayName=name==='Green'?'Blue':name;
  trainers.push({name:displayName,id:displayName.toLowerCase().replaceAll(' ','-'),role:isChampion?'Campeão':'Elite Four',portrait:portrait?new URL(portrait,`https://www.serebii.net/${folder}/`).href:null,team:ids.map((id,i)=>[id,names.get(id),levels[i]])});
  if(group==='hgss'&&trainers.length===5)break;
  if(group==='frlg'&&trainers.length===7)break;
 }
 if(![5,7].includes(trainers.length))throw Error('Liga incompleta: '+group+' '+trainers.length);
 // Champion teams are alternative outcomes, never three consecutive champion battles.
 if(trainers.length===7){const variants=trainers.splice(4);const champion=variants[0];champion.variants=variants.map((trainer,i)=>({label:group==='yellow'?`Equipe com ${trainer.team.find(p=>[134,135,136].includes(p[0]))?.[1]||('variação '+(i+1))}`:`Rival com ${trainer.team.find(p=>[3,6,9].includes(p[0]))?.[1]||('variação '+(i+1))}`,team:trainer.team}));champion.note=group==='yellow'?'A evolução de Eevee do rival depende dos resultados das primeiras batalhas. Escolha a equipe correspondente.':'A equipe do rival depende do Pokémon inicial escolhido. Escolha o inicial que o rival usa.';trainers.push(champion);}
 leagues[group]=trainers;console.log(group+': '+trainers.length+' treinadores da Liga');
}
leagues.blue=leagues.red;leagues.green=leagues.red;writeFileSync('data/map-leagues.json',JSON.stringify(leagues,null,2)+'\n');
