const labels = {normal:'Normal',fire:'Fogo',water:'Água',electric:'Elétrico',grass:'Planta',ice:'Gelo',fighting:'Lutador',poison:'Veneno',ground:'Terra',flying:'Voador',psychic:'Psíquico',bug:'Inseto',rock:'Pedra',ghost:'Fantasma',dragon:'Dragão',dark:'Sombrio',steel:'Aço',fairy:'Fada'};
const statLabels = {'hp':'HP','attack':'Ataque','defense':'Defesa','special-attack':'Atq. especial','special-defense':'Def. especial','speed':'Velocidade','special':'Especial'};
const $ = id => document.getElementById(id);
let pokemon = [];
const nameOf = p => ({'nidoran-f':'Nidoran ♀','nidoran-m':'Nidoran ♂','mr-mime':'Mr. Mime','farfetchd':"Farfetch’d"}[p.name] || p.name.charAt(0).toUpperCase()+p.name.slice(1));
const numberOf = p => '#'+String(p.id).padStart(3,'0');
function badges(p) { return p.types.map(type=>`<span class="badge ${type}">${labels[type]}</span>`).join(''); }
function render() {
  const term = $('search').value.trim().toLowerCase().replace(/^#/, '');
  const type = $('type').value;
  const scope=$('dex-scope').value;
  const catalog=pokemon.filter(p=>scope!=='regional'||p.regional_number!==null);
  const list = catalog.filter(p=>(nameOf(p).toLowerCase().includes(term) || String(p.id).padStart(3,'0').includes(term)) && (!type || p.types.includes(type)));
  list.sort((a,b)=>$('sort').value==='name' ? nameOf(a).localeCompare(nameOf(b),'pt-BR') : $('sort').value==='reverse' ? b.id-a.id : a.id-b.id);
  $('grid').replaceChildren(...list.map(p=>{
    const button = document.createElement('button');
    button.className = `card ${p.types[0]}-card`;
    button.setAttribute('aria-label',`Ver detalhes de ${nameOf(p)}`);
    button.innerHTML = `<div class="card-top"><span>${numberOf(p)}</span><span class="card-arrow">↗</span></div><div class="pokemon-art"><img loading="lazy" src="${p.image}" alt="${nameOf(p)}"></div><h3>${nameOf(p)}</h3><div class="badges">${badges(p)}</div>`;
    button.addEventListener('click',()=>openDetails(p));
    return button;
  }));
  $('count').textContent = `${list.length} de ${catalog.length} Pokémon`;
  $('clear').hidden = !term && !type;
  $('empty').hidden = list.length>0;
}
function openDetails(p) {
  $('detail-content').innerHTML = `<div class="detail-art ${p.types[0]}-card"><span>${numberOf(p)} · KANTO</span><img src="${p.image}" alt="${nameOf(p)}"></div><div class="detail-body"><h2 id="detail-title">${nameOf(p)}</h2><div class="badges">${badges(p)}</div><div class="measurements"><div><small>ALTURA</small><strong>${Number(p.height).toLocaleString('pt-BR')} m</strong></div><div><small>PESO</small><strong>${Number(p.weight).toLocaleString('pt-BR')} kg</strong></div></div><h3>Habilidades</h3><p class="abilities">${p.abilities.join(' · ')}</p><h3>Estatísticas base</h3>${p.stats.map(s=>`<div class="stat"><span>${statLabels[s.name]}</span><b>${s.value}</b><meter min="0" max="255" value="${s.value}" aria-label="${statLabels[s.name]}: ${s.value}"></meter></div>`).join('')}</div>`;
  $('details').setAttribute('aria-labelledby','detail-title');
  document.querySelector('.detail-art > span').textContent=`${numberOf(p)} · ${context.game.name}`;
  if(!p.abilities.length && p.reference!=='letsgo')document.querySelector('#detail-content .abilities').textContent='Esta geração não utiliza habilidades.';
  const availability=document.createElement('p');availability.className='availability-note';availability.textContent=p.availability;document.querySelector('.detail-body').append(availability);
  if(p.form_label){const form=document.createElement('p');form.textContent=p.form_label;document.querySelector('.detail-body').append(form);}
  if(p.forms?.length){
    const forms=document.createElement('details');forms.className='legacy-details';const summary=document.createElement('summary');summary.textContent='Formas de Alola e Mega Evoluções desta edição';forms.append(summary);
    for(const form of p.forms){const section=document.createElement('section');const title=document.createElement('h3');title.textContent=form.name.replaceAll('-',' ');const image=document.createElement('img');image.src=form.image;image.alt=form.name;image.loading='lazy';image.width=100;const description=document.createElement('p');description.textContent=form.types.map(t=>labels[t]).join(' / ')+' · '+form.stats.map(s=>`${statLabels[s.name]} ${s.value}`).join(' · ');section.append(title,image,description);forms.append(section);}
    document.querySelector('.detail-body').append(forms);
  }
  if (p.reference === 'letsgo') {
    document.querySelector('#detail-content .abilities').textContent = 'Let’s Go não utiliza habilidades. Estatísticas abaixo: forma comum, sem bônus de doces ou amizade.';
    if (p.partner_stats) {
      const partner=document.createElement('details');partner.className='legacy-details';
      const title=document.createElement('summary');title.textContent='Ver estatísticas do parceiro inicial de Let’s Go';partner.append(title);
      const note=document.createElement('p');note.textContent='O parceiro inicial tem estatísticas próprias e não evolui. A forma comum acima permanece disponível.';partner.append(note);
      p.partner_stats.forEach(stat=>{const line=document.createElement('p');line.textContent=`${statLabels[stat.name]}: ${stat.value}`;partner.append(line);});
      document.querySelector('#detail-content .detail-body').append(partner);
    }
  }
  $('details').showModal();
}
async function load() {
  $('error').hidden=true; $('grid').setAttribute('aria-busy','true');
  $('count').textContent='Carregando Pokémon…';
  try {
    const response=await fetch(window.gameUrl('/api.php'));
    const data=await response.json();
    if (!response.ok) throw new Error(data.error || 'Falha ao carregar os dados.');
    if (!Array.isArray(data) || data.length!==context.game.count) throw new Error('Catálogo desta edição incompleto. Execute a importação.');
    pokemon=data;
    const availableTypes=new Set(pokemon.flatMap(p=>p.types));
    [...$('type').options].forEach(option=>{if(option.value&&!availableTypes.has(option.value))option.remove();});
    render();
    const selectedId = Number(new URLSearchParams(window.location.search).get('pokemon'));
    const selectedPokemon = pokemon.find(p => p.id === selectedId);
    if (selectedPokemon) openDetails(selectedPokemon);
  } catch(error) {
    $('error').hidden=false; $('error-message').textContent=error.message; $('count').textContent='Catálogo indisponível';
  } finally { $('grid').setAttribute('aria-busy','false'); }
}
Object.entries(labels).sort((a,b)=>a[1].localeCompare(b[1],'pt-BR')).forEach(([value,label])=>$('type').add(new Option(label,value)));
const initialType = new URLSearchParams(window.location.search).get('type');
if (Object.hasOwn(labels, initialType)) $('type').value = initialType;
['search','type','sort','dex-scope'].forEach(id=>$(id).addEventListener(id==='search'?'input':'change',render));
$('clear').addEventListener('click',()=>{ $('search').value=''; $('type').value=''; render(); });
$('close').addEventListener('click',()=>$('details').close());
$('details').addEventListener('click',event=>{if(event.target===$('details')) {const r=$('details').getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom) $('details').close();}});
$('retry').addEventListener('click',load);
document.addEventListener('keydown',event=>{if(event.key==='/' && !['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName) && !$('details').open){event.preventDefault();$('search').focus();}});
load();
