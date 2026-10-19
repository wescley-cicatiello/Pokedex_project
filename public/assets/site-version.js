const context=window.gameContext;
window.pokedexMode=context.game.group;
window.pokedexEdition=context.version==='lets-go-eevee'?'eevee':'pikachu';
window.gameUrl=(path)=>{const url=new URL(path,location.origin);url.searchParams.set('version',context.version);return url.pathname+url.search;};
document.addEventListener('DOMContentLoaded',()=>{
 const bar=document.createElement('div');bar.className='site-version';
 const label=document.createElement('label');label.textContent='Sua edição · ';
 const select=document.createElement('select');select.setAttribute('aria-label','Edição de Pokémon');
 for(const group of context.catalog.groups){const options=document.createElement('optgroup');options.label=group.name;for(const id of group.versions)options.append(new Option(context.catalog.versions[id].name,id));select.append(options);}
 select.value=context.version;
 select.addEventListener('change',()=>{const url=new URL(location.href);url.searchParams.set('version',select.value);url.searchParams.delete('pokemon');url.searchParams.delete('type');location.assign(url);});
 const change=document.createElement('a');change.href='/';change.textContent='← Trocar aventura';
 label.append(select);bar.append(label,change);document.querySelector('main').prepend(bar);
 document.querySelectorAll('a[href]').forEach(link=>{const url=new URL(link.href,location.origin);if(url.origin===location.origin&&/^\/(inicio|pokedex|tipos|mapa)\.php$/.test(url.pathname)){url.searchParams.set('version',context.version);link.href=url.pathname+url.search+url.hash;}});
});
