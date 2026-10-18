import {mkdir,writeFile} from 'node:fs/promises';
const names=['Brock','Misty','Lt Surge','Erika','Sabrina','Koga','Blaine','Giovanni','Lorelei','Bruno','Agatha','Lance','Trace'];
const url=new URL('https://archives.bulbagarden.net/w/api.php');
url.search=new URLSearchParams({action:'query',titles:names.map(name=>`File:Lets Go Pikachu Eevee ${name}.png`).join('|'),prop:'imageinfo',iiprop:'url',iiurlwidth:'200',format:'json'});
const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
if(!response.ok) throw Error(`HTTP ${response.status}`);
const pages=Object.values((await response.json()).query.pages);
await mkdir(new URL('../public/assets/trainers/',import.meta.url),{recursive:true});
const manifest={};
for(const name of names){
 const page=pages.find(page=>page.title===`File:Lets Go Pikachu Eevee ${name}.png`);
 const info=page?.imageinfo?.[0]; if(!info) throw Error(`Imagem ausente: ${name}`);
 const image=await fetch(info.thumburl||info.url,{signal:AbortSignal.timeout(30000)});
 if(!image.ok||!image.headers.get('content-type')?.startsWith('image/'))throw Error(`Falha: ${name}`);
 const id=name.toLowerCase().replaceAll(' ','-');
 await writeFile(new URL(`../public/assets/trainers/${id}.png`,import.meta.url),Buffer.from(await image.arrayBuffer()));
 manifest[id]={source:info.descriptionurl,image:`/assets/trainers/${id}.png`};
}
await writeFile(new URL('../public/assets/trainers/sources.json',import.meta.url),JSON.stringify(manifest,null,2));
console.log('13 retratos de Let’s Go salvos.');
