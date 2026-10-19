const atlasRoot=document.getElementById('atlas-locations');
const atlasStatus=document.getElementById('atlas-status');
const methodLabels={walk:'Grama / caverna',surf:'Surf','old-rod':'Old Rod','good-rod':'Good Rod','super-rod':'Super Rod','rock-smash':'Rock Smash',headbutt:'Headbutt','headbutt-low':'Headbutt','headbutt-normal':'Headbutt','headbutt-high':'Headbutt'};
const readable=s=>s.replaceAll('-',' ').replace(/(^|\s)(\p{L})/gu,(_,space,letter)=>space+letter.toUpperCase());
let atlas,profiles;
function renderAtlas(){
 const term=document.getElementById('atlas-search').value.trim().toLowerCase();
 const locations=atlas.locations.filter(l=>`${l.name} ${l.area} ${l.region} ${l.pokemon.map(p=>profiles.get(p.id)?.name||'').join(' ')}`.toLowerCase().includes(term));
 atlasStatus.textContent=`${locations.length} áreas de encontro · ${context.game.name}`;
 atlasRoot.replaceChildren(...locations.map(l=>{
  const details=document.createElement('details');details.className='atlas-location';
  const summary=document.createElement('summary');const title=document.createElement('strong');title.textContent=l.name;const info=document.createElement('span');info.textContent=`${readable(l.region)} · ${readable(l.area||'Área principal')} · ${l.pokemon.length} espécies`;summary.append(title,info);details.append(summary);
  details.addEventListener('toggle',()=>{if(!details.open||details.dataset.loaded)return;details.dataset.loaded='true';const grid=document.createElement('div');grid.className='encounter-grid';for(const entry of l.pokemon){const p=profiles.get(entry.id);if(!p)continue;const link=document.createElement('a');link.className='encounter-pokemon';link.href=window.gameUrl(`/pokedex.php?pokemon=${p.id}`);const image=document.createElement('img');image.src=p.image;image.alt='';image.loading='lazy';const name=document.createElement('span');name.textContent=`#${String(p.id).padStart(3,'0')} ${readable(p.name)}`;const note=document.createElement('small');note.textContent=`Níveis ${entry.min_level}–${entry.max_level} · ${entry.methods.map(m=>methodLabels[m]||readable(m)).join(' / ')}`;link.append(image,name,note);grid.append(link);}details.append(grid);});
  return details;
 }));
}
async function loadAtlas(){try{const responses=await Promise.all([fetch(window.gameUrl('/atlas-api.php')),fetch(window.gameUrl('/api.php'))]);if(responses.some(r=>!r.ok))throw Error();const [data,pokemon]=await Promise.all(responses.map(r=>r.json()));atlas=data;profiles=new Map(pokemon.map(p=>[p.id,p]));document.getElementById('atlas-note').textContent=atlas.note;renderAtlas();}catch{atlasStatus.textContent='Não foi possível carregar o atlas. Recarregue a página para tentar novamente.';}}
document.getElementById('atlas-search').addEventListener('input',()=>{if(atlas)renderAtlas();});
loadAtlas();
