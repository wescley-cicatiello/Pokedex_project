window.pokedexMode = 'letsgo';
window.pokedexEdition = 'pikachu';
try { if(localStorage.getItem('letsgo-edition') === 'eevee') window.pokedexEdition='eevee'; } catch {}
document.addEventListener('DOMContentLoaded',()=>{
 const bar=document.createElement('div');bar.className='site-version';
 const label=document.createElement('label');label.textContent='Pokémon Let’s Go · ';
 const select=document.createElement('select');select.setAttribute('aria-label','Edição de Pokémon Let’s Go');
 select.add(new Option('Pikachu!','pikachu'));select.add(new Option('Eevee!','eevee'));select.value=window.pokedexEdition;
 select.addEventListener('change',()=>{try{localStorage.setItem('letsgo-edition',select.value);}catch{}location.reload();});
 label.append(select);bar.append(label);document.querySelector('main').prepend(bar);
});
