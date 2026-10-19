import {readFileSync,writeFileSync} from 'node:fs';
const sources=JSON.parse(readFileSync('public/assets/maps/sources.json'));
const layouts={};
const add=(id,label,points,width=100,height=100)=>layouts[id]={id,label,...sources[id],locations:points.map(([name,x,y,category='place'])=>({name,x:x/width*100,y:y/height*100,category}))};
const cityNames=['Pallet Town','Viridian City','Pewter City','Cerulean City','Vermilion City','Lavender Town','Celadon City','Saffron City','Fuchsia City','Cinnabar Island'];
function kantoPoints(cities,routes,places){return [...cities.map((p,i)=>[cityNames[i],...p,'city']),...routes.map((p,i)=>['Route '+(i+1),...p,'route']),...Object.entries(places).map(([n,p])=>[n,...p])];}
add('kanto-frlg','Kanto',kantoPoints(
 [[24,65],[24,49],[22,24],[68,19],[67,55],[85,39],[49,36],[68,36],[58,75],[24,89]],
 [[24,57],[24,35],[32,25],[54,20],[68,27],[67,45],[58,36],[77,38],[77,18],[86,28],[77,56],[86,54],[82,68],[76,72],[67,74],[38,37],[37,55],[43,74],[58,84],[40,91],[24,78],[15,48],[8,30],[68,11],[74,6]],
 {'Viridian Forest':[22,39],'Mt. Moon':[42,15],'Rock Tunnel':[86,23],'Kanto Power Plant':[87,33],'Seafoam Islands':[44,91],'Cerulean Cave':[64,13],'Victory Road':[8,23],'Indigo Plateau':[8,10],"Diglett's Cave":[29,46],'Safari Zone':[58,69],'Pokémon Tower':[89,37],'Pokémon Mansion':[26,86],'S.S. Anne':[67,60],'Kanto Underground Path':[72,44]}));
add('kanto-classics','Kanto',kantoPoints(
 [[36,92],[36,68],[36,28],[100,20],[100,76],[132,44],[76,44],[100,44],[84,108],[36,124]],
 [[36,80],[36,52],[52,20],[84,20],[100,32],[100,60],[88,44],[116,44],[116,20],[132,32],[116,76],[132,76],[124,96],[116,108],[100,108],[60,44],[52,76],[68,108],[84,120],[60,124],[36,108],[24,60],[20,40],[100,12],[116,4]],
 {'Viridian Forest':[36,44],'Mt. Moon':[68,20],'Rock Tunnel':[132,26],'Kanto Power Plant':[140,36],'Seafoam Islands':[52,124],'Cerulean Cave':[91,15],'Victory Road':[20,32],'Indigo Plateau':[20,20],"Diglett's Cave":[44,55],'Safari Zone':[84,100],'Pokémon Tower':[140,44],'Pokémon Mansion':[28,124],'Kanto Underground Path':[108,60]}),160,136);
const labels={NewBarkTown:'New Bark Town',CherrygroveCity:'Cherrygrove City',VioletCity:'Violet City',SproutTower:'Sprout Tower',RuinsOfAlph:'Ruins of Alph',UnionCave:'Union Cave',AzaleaTown:'Azalea Town',SlowpokeWell:'Slowpoke Well',IlexForest:'Ilex Forest',GoldenrodCity:'Goldenrod City',RadioTower:'Radio Tower',NationalPark:'National Park',EcruteakCity:'Ecruteak City',TinTower:'Bell Tower',BurnedTower:'Burned Tower',OlivineCity:'Olivine City',Lighthouse:'Olivine Lighthouse',BattleTower:'Battle Tower',WhirlIslands:'Whirl Islands',CianwoodCity:'Cianwood City',MtMortar:'Mt. Mortar',MahoganyTown:'Mahogany Town',LakeOfRage:'Lake of Rage',IcePath:'Ice Path',BlackthornCity:'Blackthorn City',DragonsDen:"Dragon's Den",DarkCave:'Dark Cave',SilverCave:'Mt. Silver',PalletTown:'Pallet Town',ViridianCity:'Viridian City',PewterCity:'Pewter City',MtMoon:'Mt. Moon',CeruleanCity:'Cerulean City',Underground:'Kanto Underground Path',VermilionCity:'Vermilion City',DiglettsCave:"Diglett's Cave",RockTunnel:'Rock Tunnel',PowerPlant:'Kanto Power Plant',LavenderTown:'Lavender Town',LavRadioTower:'Lavender Radio Tower',CeladonCity:'Celadon City',SaffronCity:'Saffron City',FuchsiaCity:'Fuchsia City',SeafoamIslands:'Seafoam Islands',CinnabarIsland:'Cinnabar Island',VictoryRoad:'Victory Road',IndigoPlateau:'Indigo Plateau',TohjoFalls:'Tohjo Falls'};
// Coordinate reference: pret/pokecrystal data/maps/landmarks.asm, cropped Town Map image origin.
const landmarks=readFileSync('data/map-cache/landmarks.txt','utf8');let region='johto';const johto=[],gscKanto=[];
for(const line of landmarks.split('\n')){if(line.includes('assert_table_length KANTO_LANDMARK'))region='kanto';const m=line.match(/landmark\s+(\d+),\s*(\d+),\s*(\w+)Name/);if(!m)continue;const raw=m[3];const name=labels[raw]||(/^Route\d+$/.test(raw)?raw.replace('Route','Route '):null);if(!name)continue;const category=/City|Town/.test(raw)?'city':raw.startsWith('Route')?'route':'place';(region==='johto'?johto:gscKanto).push([name,+m[1]-8,+m[2]-16,category]);}
// Crystal's Battle Tower is absent from Gold and Silver; filtered per version in the world builder.
add('johto-gsc','Johto',johto,144,120);add('kanto-gsc','Kanto',gscKanto,144,120);
add('johto-hgss','Johto',[
 ['New Bark Town',90,66,'city'],['Cherrygrove City',68,67,'city'],['Violet City',50,48,'city'],['Azalea Town',42,80,'city'],['Goldenrod City',37,63,'city'],['Ecruteak City',41,34,'city'],['Olivine City',28,48,'city'],['Cianwood City',20,62,'city'],['Mahogany Town',55,35,'city'],['Blackthorn City',68,34,'city'],
 ...[[29,78,66],[30,68,56],[31,61,48],[32,54,58],[33,52,73],[34,38,73],[35,37,51],[36,40,46],[37,41,41],[38,33,34],[39,28,39],[40,24,50],[41,22,57],[42,48,35],[43,55,29],[44,61,35],[45,67,47],[46,67,60],[47,10,61],[48,9,54]].map(([n,x,y])=>['Route '+n,x,y,'route']),
 ['Sprout Tower',50.5,42],['Ruins of Alph',46,50],['Union Cave',55,68],['Slowpoke Well',46,79],['Ilex Forest',38,77],['Radio Tower',34,62],['National Park',37,43],['Bell Tower',41,27],['Burned Tower',37,33],['Olivine Lighthouse',31,49],['Battle Frontier',24,39],['Whirl Islands',25,60],['Mt. Mortar',49,32],['Lake of Rage',54,17],['Ice Path',67,30],["Dragon's Den",70,29],['Dark Cave',60,48],['Mt. Silver',91,39],['Johto Safari Zone',9,51],['Safari Zone Gate',9,57],['Embedded Tower',8,63],['Cliff Cave',12,64],['Team Rocket HQ',57,36]
 ]);
add('kanto-hgss','Kanto',kantoPoints(
 [[41,63],[41,46],[43,20],[74,26],[74,54],[87,43],[63,44],[74,41],[65,72],[41,85]],
 [[41,56],[41,31],[50,23],[60,23],[74,33],[74,48],[68,45],[81,43],[80,26],[87,33],[81,54],[88,59],[85,65],[80,69],[73,72],[55,45],[53,62],[58,74],[65,79],[52,85],[41,75],[32,47],[25,33],[76,18],[82,13]],
 {'Viridian Forest':[40,36],'Mt. Moon':[56,22],'Rock Tunnel':[87,29],'Kanto Power Plant':[88,34],'Seafoam Islands':[51,85],'Cerulean Cave':[73,22],'Victory Road':[25,37],'Indigo Plateau':[25,41],"Diglett's Cave":[47,30],'Pal Park':[65,67],'Lavender Radio Tower':[89,43],'Kanto Underground Path':[76,49]}));
layouts['kanto-hgss'].locations.push(...[['Route 26',25,57,'route'],['Route 27',13,69,'route'],['Route 28',18,47,'route'],['Tohjo Falls',5,68]].map(([name,x,y,category='place'])=>({name,x,y,category})));
// Town Map positions: original 192 × 144 screenshots, pixel coordinates.
add('sevii-123','Sevii · Ilhas 1–3',[
 ['One Island',20,82,'city'],['Kindle Road',29,65,'route'],['Mt. Ember',28,44],['Treasure Beach',20,104,'route'],['Two Island',84,92,'city'],['Cape Brink',84,83,'route'],['Three Island',156,117,'city'],['Three Isle Port',157,124],['Bond Bridge',139,115,'route'],['Berry Forest',121,114]
 ],192,144);
add('sevii-45','Sevii · Ilhas 4–5',[
 ['Four Island',36,52,'city'],['Icefall Cave',42,49],['Five Island',140,108,'city'],['Five Isle Meadow',147,112,'route'],['Water Labyrinth',124,101,'route'],['Resort Gorgeous',140,91,'route'],['Lost Cave',156,92],['Memorial Pillar',149,128],['Rocket Warehouse',152,117]
 ],192,144);
add('sevii-67','Sevii · Ilhas 6–7',[
 ['Six Island',147,55,'city'],['Water Path',148,69,'route'],['Green Path',146,47,'route'],['Pattern Bush',141,42],['Outcast Island',132,23],['Altering Cave',135,16],['Ruin Valley',148,88,'route'],['Dotted Hole',154,95],['Seven Island',44,78,'city'],['Trainer Tower',44,64],['Canyon Entrance',44,86,'route'],['Sevault Canyon',49,98,'route'],['Tanoby Ruins',44,117]
 ],192,144);
writeFileSync('data/map-layouts.json',JSON.stringify(layouts,null,2)+'\n');console.log('9 mapas preparados com cidades, rotas e locais.');
