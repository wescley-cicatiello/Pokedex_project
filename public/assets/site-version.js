let mode = 'letsgo';
try { if (localStorage.getItem('pokedex-mode') === 'legacy') mode = 'legacy'; } catch {}
window.pokedexMode = mode;
document.addEventListener('DOMContentLoaded', () => {
  const bar = document.createElement('div'); bar.className = 'site-version';
  const label = document.createElement('label'); label.textContent = 'Referência dos dados ';
  const select = document.createElement('select'); select.setAttribute('aria-label','Referência dos dados do site');
  select.add(new Option('Pokémon Let’s Go (padrão)','letsgo')); select.add(new Option('Dados anteriores / clássicos','legacy')); select.value = mode;
  select.addEventListener('change',()=>{try{localStorage.setItem('pokedex-mode',select.value);}catch{} window.location.reload();});
  label.append(select);bar.append(label);document.querySelector('main').prepend(bar);
});
