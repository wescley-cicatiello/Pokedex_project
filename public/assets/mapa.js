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
if (map.complete && map.naturalWidth === 0) showError();

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
  versionSelect.replaceChildren(new Option('Let’s Go, Pikachu!','lets-go-pikachu'),new Option('Let’s Go, Eevee!','lets-go-eevee'));
  versionSelect.value = `lets-go-${window.pokedexEdition || 'pikachu'}`;
  document.querySelector('.encounter-note').textContent = 'Encontros de Let’s Go · Fonte: Serebii Pokéarth. Inclui aparições raras e no céu; algumas dependem de Catch Combo ou do pós-jogo. Não inclui equipes de treinadores ou todas as formas de obtenção por presentes e trocas.';
}
const encounterList = document.getElementById('location-pokemon');
const encounterStatus = document.getElementById('encounter-status');
function renderEncounters() {
  encounterList.replaceChildren();
  if (!currentLocation || currentLocation.category === 'city' || currentLocation.id === 'league') return;
  if (encounterError) { encounterStatus.textContent = 'Não foi possível carregar os encontros. Recarregue a página para tentar novamente.'; return; }
  if (!encounterData) { encounterStatus.textContent = 'Carregando Pokémon…'; return; }
  const list = (encounterData[currentLocation.id] || []).filter(p => versionSelect.value === 'all' || p.versions.includes(versionSelect.value));
  encounterStatus.textContent = currentLocation.id === 'park' ? 'O GO Park recebe Pokémon transferidos de Pokémon GO, em vez de encontros selvagens comuns.' : list.length ? `${list.length} espécies registradas nesta seleção.` : 'Sem obtenções registradas nesta seleção. Pokémon de treinadores não estão incluídos.';
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
    detail.textContent = `#${String(p.id).padStart(3,'0')} · ${p.versions.map(v=>v==='lets-go-pikachu'?'LG Pikachu':v==='lets-go-eevee'?'LG Eevee':v[0].toUpperCase()+v.slice(1)).join(' / ')}`;
    const methods = document.createElement('small');
    const methodLabels = {walk:'Grama / caverna',surf:'Surf','old-rod':'Old Rod','good-rod':'Good Rod','super-rod':'Super Rod',gift:'Presente',static:'Encontro fixo','npc-trade':'Troca com NPC',pokeflute:'Poké Flute'};
    const lgMethods = {'Standard Walking':'Caminhando','In The Sky':'No céu','In The Sky - Special Spawns':'No céu · aparição especial','Special Spawns':'Aparição especial','Standard In Water':'Na água','In Water - Special Spawns':'Na água · aparição especial','Rare Spawns':'Aparição rara','Surfing':'Na água','Special':'Especial','Static Encounters':'Encontro fixo'};
    methods.textContent = p.methods.map(method=>lgMethods[method] || methodLabels[method] || method).join(' · ');
    link.append(image,text,detail,methods);
    encounterList.append(link);
  });
}
versionSelect.addEventListener('change',renderEncounters);
encounterRequest.then(renderEncounters);
function trainerHeading(name, id, description) {
  const header = document.createElement('div'); header.className = 'trainer-heading';
  const portrait = document.createElement('img'); portrait.className = 'trainer-portrait'; portrait.src = `/assets/trainers/${id}.png`; portrait.alt = name; portrait.loading = 'lazy';
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
  const note = document.createElement('p'); note.className = 'gym-reference'; note.textContent = 'Equipes do primeiro desafio em Pokémon: Let’s Go. As revanches possuem equipes diferentes. Artes: Bulbagarden Archives · © Pokémon.';
  const label = document.createElement('label'); label.className = 'league-version'; label.textContent = 'Versão do jogo ';
  const version = document.createElement('select'); version.add(new Option('Let’s Go, Pikachu!','pikachu')); version.add(new Option('Let’s Go, Eevee!','eevee')); label.append(version);
  version.value = window.pokedexEdition || 'pikachu';
  const trainers = document.createElement('div');
  function updateTeams() {
    trainers.replaceChildren();
    leagueTrainers.forEach(trainer => {
      const section = document.createElement('section'); section.className = 'league-trainer';
      section.append(trainerHeading(trainer.name,trainer.id,trainer.role));
      const members = trainer.team.map(member=>[...member]);
      if (trainer.alternate && version.value === 'eevee') members[members.length-1] = trainer.alternate;
      if (trainer.note) {const info=document.createElement('p');info.className='gym-reference';info.textContent=trainer.note;section.append(info);}
      section.append(pokemonTeam(members)); trainers.append(section);
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
  container.hidden = !isCity && !isLeague;
  document.querySelector('.location-encounters').hidden = isCity || isLeague;
  container.replaceChildren();
  if (isLeague) {renderLeague(container);return;}
  if (!isCity || !city) return;
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
  const leader = trainerHeading(gym.leader,portraitId,`Tipo ${gym.type}`);
  const badge = document.createElement('p'); badge.className = 'gym-reference'; badge.textContent = `Insígnia: ${gym.badge} · Primeira batalha em Let’s Go.`;
  const team = pokemonTeam(gym.team);
  container.append(gymTitle,leader,badge,team);
}
function openLocation(location, trigger) {
  lastTrigger = trigger;
  currentLocation = location;
  renderCity(location);
  renderEncounters();
  document.getElementById('location-category').textContent = {city:'CIDADE',route:'ROTA',place:'LOCAL DE INTERESSE'}[location.category];
  document.getElementById('location-name').textContent = location.name;
  document.getElementById('location-subtitle').textContent = location.subtitle;
  document.getElementById('location-description').textContent = location.description;
  const photo = document.getElementById('location-image');
  photo.hidden = false;
  photo.alt = `${location.name} em Pokémon: Let’s Go, Pikachu! e Let’s Go, Eevee!`;
  photo.src = `/assets/locations/${location.id}.png`;
  panel.showModal();
  select.value = location.id;
  markers.querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.id === location.id)));
  document.getElementById('location-name').focus({preventScroll:true});
}
function filterLocations(category) {
  document.querySelectorAll('[data-category]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.category === category)));
  select.replaceChildren(new Option('Ir para um local…',''));
  locations.forEach(location => {
    const visible = category === 'all' || location.category === category;
    document.getElementById(`marker-${location.id}`).hidden = !visible;
    if (visible) select.add(new Option(location.name,location.id));
  });
}
locations.forEach(location => {
  const marker = document.createElement('button');
  marker.id = `marker-${location.id}`;
  marker.dataset.id = location.id;
  marker.className = `map-marker marker-${location.category}`;
  marker.style.left = `${location.x}%`;
  marker.style.top = `${location.y}%`;
  marker.textContent = location.number || (location.category === 'city' ? '●' : '◆');
  marker.title = location.name;
  marker.setAttribute('aria-label',`Ver informações: ${location.name}`);
  marker.setAttribute('aria-pressed','false');
  marker.addEventListener('click',()=>openLocation(location,marker));
  markers.append(marker);
});
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
filterLocations('all');
