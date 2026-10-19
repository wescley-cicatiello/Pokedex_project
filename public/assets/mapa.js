let world;
try {
  const response = await fetch(window.gameUrl('/world.php'));
  if (!response.ok) throw new Error('Falha ao carregar os dados do mapa');
  world = await response.json();
} catch (error) {
  const message = document.getElementById('map-error');
  message.hidden = false; message.textContent = 'Não foi possível carregar os dados do mapa. Recarregue a página para tentar novamente.';
  throw error;
}
const locations = world.locations;
const cityInfo = world.cities;
const leagueTrainers = world.league;
const isLetsGo=world.reference==='letsgo';
const regionSelect=document.getElementById('map-region');
let activeMap;
let categoryFilter='all';
const search=document.getElementById('map-search');
const readable=text=>text.replaceAll('-',' ').replace(/(^|\s)(\p{L})/gu,(_,space,letter)=>space+letter.toUpperCase());
// Files are served locally; source URLs remain in the manifest for provenance.
const map = document.getElementById('kanto-map');
const viewport = document.getElementById('map-viewport');
const stage = document.getElementById('map-stage');
let zoom = 100;
function setZoom(value) {
  zoom = Math.max(100, Math.min(300, value));
  stage.style.width = `${zoom}%`;
  viewport.classList.toggle('is-zoomed', zoom > 100);
  document.getElementById('zoom-level').textContent = `${zoom}%`;
  document.getElementById('zoom-out').disabled = zoom === 100;
  document.getElementById('zoom-in').disabled = zoom === 300;
  if (zoom === 100) viewport.scrollTo(0, 0);
}
document.getElementById('zoom-in').addEventListener('click', () => setZoom(zoom + 25));
document.getElementById('zoom-out').addEventListener('click', () => setZoom(zoom - 25));
document.getElementById('zoom-reset').addEventListener('click', () => setZoom(100));
function showError() {
  map.hidden = true;
  document.getElementById('map-error').hidden = false;
  document.querySelectorAll('.map-controls button').forEach(button => button.disabled = true);
}
map.addEventListener('error', showError);

const markers = document.getElementById('map-markers');
const select = document.getElementById('location-select');
const panel = document.getElementById('location-panel');
let lastTrigger;
let currentLocation;
let encounterData;
let encounterError = false;
const encounterRequest = Promise.resolve().then(() => { encounterData = world.encounters; });
const versionSelect = document.getElementById('encounter-version');
{
  const group=context.catalog.groups.find(g=>g.id===context.game.group);
  versionSelect.replaceChildren(...(isLetsGo?group.versions:[context.version]).map(v=>new Option(context.catalog.versions[v].name,v)));
  versionSelect.value=context.version;
  versionSelect.hidden=!isLetsGo;
  document.querySelector('.encounter-note').textContent = isLetsGo?'Encontros de Let’s Go · Fonte: Serebii Pokéarth. Inclui aparições raras e no céu; algumas dependem de Catch Combo ou do pós-jogo. Não inclui equipes de treinadores ou todas as formas de obtenção por presentes e trocas.':world.note;
}
const areaSelect=document.getElementById('encounter-area');
const encounterList = document.getElementById('location-pokemon');
const encounterStatus = document.getElementById('encounter-status');
function renderEncounters() {
  encounterList.replaceChildren();
  if (!currentLocation || currentLocation.category === 'city' || currentLocation.id === 'league') return;
  if (encounterError) { encounterStatus.textContent = 'Não foi possível carregar os encontros. Recarregue a página para tentar novamente.'; return; }
  if (!encounterData) { encounterStatus.textContent = 'Carregando Pokémon…'; return; }
  const area=currentLocation.areas?.find(a=>a.id===areaSelect.value);
  const list = (area?area.pokemon:encounterData[currentLocation.id] || []).filter(p => p.versions.includes(versionSelect.value));
  encounterStatus.textContent = isLetsGo&&currentLocation.id === 'park' ? 'O GO Park recebe Pokémon transferidos de Pokémon GO, em vez de encontros selvagens comuns.' : list.length ? `${list.length} espécies registradas nesta seleção.` : 'Sem obtenções registradas nesta seleção. Pokémon de treinadores não estão incluídos.';
  list.forEach(p => {
    const link = document.createElement('a');
    link.className = 'encounter-pokemon';
    link.href = window.gameUrl(`/pokedex.php?pokemon=${p.id}`);
    const image = document.createElement('img');
    image.src = p.image; image.alt = ''; image.loading = 'lazy';
    const text = document.createElement('span');
    const name = {'nidoran-f':'Nidoran ♀','nidoran-m':'Nidoran ♂','mr-mime':'Mr. Mime',farfetchd:'Farfetch’d'}[p.name] || p.name[0].toUpperCase()+p.name.slice(1);
    text.textContent = name;
    const detail = document.createElement('small');
    detail.textContent = `#${String(p.id).padStart(3,'0')} · ${isLetsGo?p.versions.map(v=>context.catalog.versions[v]?.name||v).join(' / '):`Nível ${p.min_level}–${p.max_level}`}`;
    const methods = document.createElement('small');
    const methodLabels = {walk:'Grama / caverna',surf:'Surf','old-rod':'Old Rod','good-rod':'Good Rod','super-rod':'Super Rod',gift:'Presente',static:'Encontro fixo','npc-trade':'Troca com NPC',pokeflute:'Poké Flute','rock-smash':'Rock Smash',headbutt:'Headbutt','headbutt-low':'Headbutt','headbutt-normal':'Headbutt','headbutt-high':'Headbutt'};
    const lgMethods = {'Standard Walking':'Caminhando','In The Sky':'No céu','In The Sky - Special Spawns':'No céu · aparição especial','Special Spawns':'Aparição especial','Standard In Water':'Na água','In Water - Special Spawns':'Na água · aparição especial','Rare Spawns':'Aparição rara','Surfing':'Na água','Special':'Especial','Static Encounters':'Encontro fixo'};
    methods.textContent = [...new Set(p.methods.map(method=>lgMethods[method] || methodLabels[method] || method))].join(' · ');
    link.append(image,text,detail,methods);
    encounterList.append(link);
  });
}
versionSelect.addEventListener('change',renderEncounters);
areaSelect.addEventListener('change',renderEncounters);
encounterRequest.then(renderEncounters);
function trainerHeading(name, id, description, image) {
  const header = document.createElement('div'); header.className = 'trainer-heading';
  const portrait = document.createElement('img'); portrait.className = 'trainer-portrait'; portrait.alt = name; portrait.loading = 'lazy';
  if(image||isLetsGo){portrait.src=image||`/assets/trainers/${id}.png`;portrait.addEventListener('error',()=>portrait.hidden=true);}else portrait.hidden=true;
  const text = document.createElement('div');
  const title = document.createElement('h4'); title.textContent = name;
  const subtitle = document.createElement('p'); subtitle.textContent = description;
  text.append(title,subtitle); header.append(portrait,text); return header;
}
function pokemonTeam(members) {
  const team = document.createElement('div'); team.className = 'encounter-grid';
  members.forEach(([id,name,level]) => {
    const link = document.createElement('a'); link.href = window.gameUrl(`/pokedex.php?pokemon=${id}`); link.className = 'encounter-pokemon';
    const image = document.createElement('img'); image.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`; image.alt = ''; image.loading = 'lazy';
    const label = document.createElement('span'); label.textContent = name;
    const detail = document.createElement('small'); detail.textContent = `Nível ${level} · #${String(id).padStart(3,'0')}`;
    link.append(image,label,detail); team.append(link);
  });
  return team;
}
function renderLeague(container) {
  const heading = document.createElement('h3'); heading.textContent = 'Liga Pokémon · Indigo Plateau';
  const note = document.createElement('p'); note.className = 'gym-reference'; note.textContent = `Equipes do primeiro desafio em ${context.game.name}. As revanches possuem equipes diferentes. ${!leagueTrainers.length?'A Elite Four e o Campeão são desafiados neste local.':''}`;
  const label = document.createElement('label'); label.className = 'league-version'; label.textContent = 'Versão do jogo ';
  const version = document.createElement('select'); version.add(new Option('Let’s Go, Pikachu!','pikachu')); version.add(new Option('Let’s Go, Eevee!','eevee')); label.append(version);
  version.value = window.pokedexEdition || 'pikachu';label.hidden=!isLetsGo;
  const trainers = document.createElement('div');
  function updateTeams() {
    trainers.replaceChildren();
    leagueTrainers.forEach(trainer => {
      const section = document.createElement('section'); section.className = 'league-trainer';
      section.append(trainerHeading(trainer.name,trainer.id,trainer.role,trainer.portrait));
      const members = trainer.team.map(member=>[...member]);
      if (trainer.alternate && version.value === 'eevee') members[members.length-1] = trainer.alternate;
      if (trainer.note) {const info=document.createElement('p');info.className='gym-reference';info.textContent=trainer.note;section.append(info);}
      if(trainer.variants?.length){
        const choice=document.createElement('select');choice.setAttribute('aria-label',`Equipe de ${trainer.name}`);trainer.variants.forEach((v,i)=>choice.add(new Option(v.label,String(i))));
        const variantTeam=document.createElement('div');variantTeam.append(pokemonTeam(trainer.variants[0].team));choice.addEventListener('change',()=>variantTeam.replaceChildren(pokemonTeam(trainer.variants[Number(choice.value)].team)));section.append(choice,variantTeam);
      }else section.append(pokemonTeam(members));
      trainers.append(section);
    });
  }
  version.addEventListener('change',updateTeams);updateTeams();
  container.append(heading,note,label,trainers);
}
function renderCity(location) {
  const city = cityInfo[location.id];
  const container = document.getElementById('city-info');
  const isCity = location.category === 'city';
  const isLeague = location.id === 'league';
  container.hidden = !isCity && !isLeague && !city;
  document.querySelector('.location-encounters').hidden = isCity || isLeague;
  container.replaceChildren();
  if (isLeague) {renderLeague(container);return;}
  if (!city) return;
  const title = document.createElement('h3'); title.textContent = 'Pontos de interesse';
  const list = document.createElement('ul'); list.className = 'city-points';
  city.points.forEach(point => {const item = document.createElement('li'); item.textContent = point; list.append(item);});
  container.append(title,list);
  if (!city.gym) {
    const note = document.createElement('p'); note.textContent = city.note; container.append(note); return;
  }
  const gym = city.gym;
  const gymTitle = document.createElement('h3'); gymTitle.textContent = 'Líder de ginásio';
  const portraitId = gym.leader === 'Lt. Surge' ? 'lt-surge' : gym.leader.toLowerCase();
  const leader = trainerHeading(gym.leader,portraitId,`Tipo ${gym.type}`,gym.portrait);
  const badge = document.createElement('p'); badge.className = 'gym-reference'; badge.textContent = `Insígnia: ${gym.badge} · Primeira batalha em ${context.game.name}.`;
  const team = pokemonTeam(gym.team);
  container.append(gymTitle,leader,badge,team);
}
function openLocation(location, trigger) {
  lastTrigger = trigger;
  currentLocation = location;
  areaSelect.replaceChildren(new Option('Todas as áreas','all'),...(location.areas||[]).map(a=>new Option(readable(a.area||'Área principal'),a.id)));
  document.querySelector('.encounter-area').hidden=!location.areas?.length;
  renderCity(location);
  renderEncounters();
  document.getElementById('location-category').textContent = {city:'CIDADE',route:'ROTA',place:'LOCAL DE INTERESSE'}[location.category];
  document.getElementById('location-name').textContent = location.name;
  document.getElementById('location-subtitle').textContent = location.subtitle;
  document.getElementById('location-description').textContent = location.description;
  const photo = document.getElementById('location-image');
  photo.hidden = !location.image;
  photo.alt = `${location.name} · Pokémon ${context.game.name}`;
  if(location.image)photo.src=location.image;else photo.removeAttribute('src');
  document.getElementById('location-reference').textContent=`Pokémon ${context.game.name} · Encontros: ${isLetsGo?'Serebii':'PokéAPI'} · Dados da edição selecionada.`;
  panel.showModal();
  select.value = location.id;
  markers.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.id === location.id)));
  document.getElementById('location-name').focus({preventScroll:true});
}
function filterLocations(category) {
  categoryFilter=category;
  document.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.category === category)));
  select.replaceChildren(new Option('Ir para um local…',''));
  let visibleCount=0;let specialCount=0;
  const term=search.value.trim().toLocaleLowerCase('pt-BR');
  locations.forEach(location => {
    const visible = (location.mapId===activeMap.id||location.mapId==='special')&&(category === 'all' || location.category === category)&&`${location.name} ${location.id}`.toLocaleLowerCase('pt-BR').includes(term);
    const marker=document.getElementById(`marker-${location.id}`);if(marker)marker.hidden=!visible;
    if (visible){select.add(new Option(location.name,location.id));visibleCount++;if(location.mapId==='special')specialCount++;}
  });
  document.getElementById('special-locations').hidden=!specialCount;
  document.getElementById('map-empty').hidden=visibleCount>0;
  document.getElementById('map-summary').textContent=`${visibleCount-specialCount} locais no mapa · ${context.game.name}`;
}
locations.forEach(location => {
  const marker = document.createElement('button');
  marker.id = `marker-${location.id}`;
  marker.dataset.id = location.id;
  marker.className = location.mapId==='special'?'special-location-button':`map-marker marker-${location.category}`;
  marker.style.left = `${location.x}%`;
  marker.style.top = `${location.y}%`;
  marker.textContent = location.mapId==='special'?location.name:location.number || location.name.match(/^Route (\d+)$/)?.[1] || (location.category === 'city' ? '●' : '◆');
  marker.title = location.name;
  marker.setAttribute('aria-label',`Ver informações: ${location.name}`);
  marker.setAttribute('aria-pressed','false');
  marker.addEventListener('click',()=>openLocation(location,marker));
  (location.mapId==='special'?document.getElementById('special-buttons'):markers).append(marker);
});
regionSelect.replaceChildren(...world.maps.map(m=>new Option(m.label,m.id)));regionSelect.disabled=false;select.disabled=false;
function changeRegion(id){
 activeMap=world.maps.find(m=>m.id===id)||world.maps[0];regionSelect.value=activeMap.id;
 map.src=activeMap.image;map.alt=`Mapa de ${activeMap.label} · Pokémon ${context.game.name}`;map.hidden=false;map.classList.toggle('pixel-map',!!activeMap.pixelated);
 document.getElementById('map-title').textContent=activeMap.label.toUpperCase();
 document.getElementById('map-error').hidden=true;
 document.querySelectorAll('.map-controls button').forEach(button=>button.disabled=false);setZoom(100);
 const source=document.getElementById('map-source');source.href=activeMap.source;source.textContent='Mapa · © Pokémon / '+(isLetsGo?'Nintendo':'Bulbagarden Archives')+' ↗';
 filterLocations(categoryFilter);
}
regionSelect.addEventListener('change',()=>{changeRegion(regionSelect.value);const url=new URL(location.href);url.searchParams.set('region',activeMap.id);url.searchParams.delete('local');history.replaceState(null,'',url);});
search.addEventListener('input',()=>filterLocations(categoryFilter));
document.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click',()=>filterLocations(button.dataset.category)));
select.addEventListener('change',()=>{ const location = locations.find(item=>item.id===select.value); if(location) openLocation(location,select); });
function closePanel() {
  panel.close();
}
panel.addEventListener('close', () => {
  select.value = '';
  markers.querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed','false'));
  if (lastTrigger && !lastTrigger.hidden) lastTrigger.focus({preventScroll:true});
});
document.getElementById('location-close').addEventListener('click',closePanel);
document.getElementById('location-image').addEventListener('error', event => { event.target.hidden = true; });
panel.addEventListener('click', event => {
  if (event.target !== panel) return;
  const bounds = panel.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closePanel();
});
const params=new URLSearchParams(location.search);const initialLocation=locations.find(l=>l.id===params.get('local'));
changeRegion(initialLocation&&initialLocation.mapId!=='special'?initialLocation.mapId:params.get('region'));
if(initialLocation)openLocation(initialLocation,select);
