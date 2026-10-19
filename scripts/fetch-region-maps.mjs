import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
const files={
 'kanto-classics':'Kanto Town Map RBY.png','kanto-frlg':'FRLG Kanto.png',
 'johto-gsc':'Johto Town Map GSC.png','kanto-gsc':'Kanto Town Map GSC.png',
 'johto-hgss':'JohtoMap.png','kanto-hgss':'HGSS Kanto.png',
 'sevii-123':'Sevii Islands 1 2 and 3 Town Map.png','sevii-45':'Sevii Islands 4 and 5 Town Map.png','sevii-67':'Sevii Islands 6 and 7 Town Map.png'
};
const url=new URL('https://archives.bulbagarden.net/w/api.php');url.search=new URLSearchParams({action:'query',titles:Object.values(files).map(n=>'File:'+n).join('|'),prop:'imageinfo',iiprop:'url|size',format:'json'});
const response=await fetch(url,{signal:AbortSignal.timeout(45000)});if(!response.ok)throw Error(`HTTP ${response.status}`);
const pages=Object.values((await response.json()).query.pages);const manifest={};mkdirSync('public/assets/maps',{recursive:true});
for(const [id,name] of Object.entries(files)){
 const info=pages.find(p=>p.title==='File:'+name)?.imageinfo?.[0];if(!info)throw Error('Mapa não encontrado: '+name);
 const path=`public/assets/maps/${id}.png`;
 if(!existsSync(path)){const image=await fetch(info.url,{signal:AbortSignal.timeout(45000)});if(!image.ok||!image.headers.get('content-type')?.startsWith('image/'))throw Error('Imagem inválida: '+id);writeFileSync(path,Buffer.from(await image.arrayBuffer()));}
 manifest[id]={image:`/assets/maps/${id}.png`,width:info.width,height:info.height,source:info.descriptionurl,title:name,pixelated:info.width<500};console.log(`${id}: ${info.width} × ${info.height}`);
}
writeFileSync('public/assets/maps/sources.json',JSON.stringify(manifest,null,2)+'\n');
