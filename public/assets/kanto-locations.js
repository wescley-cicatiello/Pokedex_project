// Coordinates are percentages of the original Let's Go artwork.
const cities = [
 ['pallet','Pallet Town',24,66,'O ponto de partida da jornada, onde fica o laboratório do Professor Oak.'],
 ['viridian','Viridian City',25,46,'Cidade entre Pallet e a floresta de Viridian. Seu ginásio é associado a Giovanni.'],
 ['pewter','Pewter City',25,21,'Lar do ginásio de Brock e do museu de ciências.'],
 ['cerulean','Cerulean City',65,19,'Cidade do ginásio de Misty, próxima à Ponte Nugget.'],
 ['vermilion','Vermilion City',64,56,'Cidade portuária com o ginásio de Lt. Surge e o cais do S.S. Anne.'],
 ['lavender','Lavender Town',88,36,'Vila conhecida pela Pokémon Tower e pela memória dos Pokémon.'],
 ['celadon','Celadon City',48,35,'Centro comercial de Kanto e cidade do ginásio de Erika.'],
 ['saffron','Saffron City',65,35,'Cidade central que abriga a Silph Co. e o ginásio de Sabrina.'],
 ['fuchsia','Fuchsia City',49,79,'Cidade ao sul de Kanto e sede do ginásio de Koga.'],
 ['cinnabar','Cinnabar Island',24,92,'Ilha com o laboratório de pesquisas e o ginásio de Blaine.']
];
const routes = [
 [1,24,56,'Pallet Town ↔ Viridian City'],[2,25,27,'Viridian City ↔ Pewter City, pela floresta'],
 [3,34,22,'Pewter City ↔ Mt. Moon'],[4,53,17,'Mt. Moon ↔ Cerulean City'],
 [5,65,26,'Cerulean City ↔ Saffron City'],[6,65,45,'Saffron City ↔ Vermilion City'],
 [7,57,34,'Celadon City ↔ Saffron City'],[8,77,35,'Saffron City ↔ Lavender Town'],
 [9,77,16,'Cerulean City ↔ Rota 10'],[10,89,28,'Rota 9 ↔ Lavender Town, pelo Rock Tunnel'],
 [11,77,55,'Vermilion City ↔ Rota 12'],[12,90,49,'Lavender Town ↔ Rota 13'],
 [13,81,69,'Rota 12 ↔ Rota 14'],[14,72,73,'Rota 13 ↔ Rota 15'],
 [15,62,77,'Rota 14 ↔ Fuchsia City'],[16,38,35,'Celadon City ↔ Rota 17'],
 [17,36,55,'Rota 16 ↔ Rota 18'],[18,40,76,'Rota 17 ↔ Fuchsia City'],
 [19,50,85,'Fuchsia City ↔ Rota 20'],[20,32,93,'Cinnabar Island ↔ Rota 19, pelas Seafoam Islands'],
 [21,23,80,'Pallet Town ↔ Cinnabar Island'],[22,17,46,'Viridian City ↔ acesso à Liga Pokémon'],
 [23,12,24,'Caminho de acesso ao Indigo Plateau'],[24,65,10,'Cerulean City ↔ Rota 25'],
 [25,75,5,'Rota 24 ↔ casa de Bill']
];
const landmarks = [
 ['forest','Viridian Forest',25,34,'Floresta de Viridian','Uma passagem arborizada na ligação entre Viridian e Pewter.','Viridian_Forest'],
 ['moon','Mt. Moon',43,16,'Monte Lua','Caverna entre as rotas 3 e 4, conhecida por seus fósseis.','Mt._Moon'],
 ['rock','Rock Tunnel',87,22,'Túnel de Pedra','Passagem subterrânea da Rota 10.','Rock_Tunnel'],
 ['power','Power Plant',88,43,'Usina de energia','Instalação próxima à Rota 10, associada ao lendário Zapdos.','Power_Plant'],
 ['seafoam','Seafoam Islands',39,94,'Ilhas Espuma do Mar','Cavernas na Rota 20, associadas ao lendário Articuno.','Seafoam_Islands'],
 ['cave','Cerulean Cave',60,14,'Caverna de Cerulean','Caverna próxima a Cerulean, conhecida por abrigar Mewtwo.','Cerulean_Cave'],
 ['victory','Victory Road',12,16,'Estrada da Vitória','O desafio de cavernas no caminho da Liga Pokémon.','Victory_Road_(Kanto)'],
 ['league','Indigo Plateau',12.5,5,'Liga Pokémon','Destino dos treinadores que desafiam a Elite Four e o Campeão.','Indigo_Plateau'],
 ['diglett','Diglett’s Cave',29,40,'Caverna dos Diglett','Atalho subterrâneo entre as rotas 2 e 11.','Diglett%27s_Cave'],
 ['park','GO Park',50,71,'Complexo GO Park','Área de Fuchsia presente em Let’s Go, no lugar da antiga Safari Zone.','GO_Park']
];
export const locations = [
 ...cities.map(([id,name,x,y,description])=>({id,name,x,y,description,category:'city',subtitle:'Cidade de Kanto',source:`https://bulbapedia.bulbagarden.net/wiki/${name.replaceAll(' ','_')}`})),
 ...routes.map(([number,x,y,connection])=>({id:`route-${number}`,name:`Rota ${number}`,number,x,y,category:'route',subtitle:number>=19&&number<=21?'Rota marítima':'Rota terrestre',description:`Ligação: ${connection}.`,source:`https://bulbapedia.bulbagarden.net/wiki/Kanto_Route_${number}`})),
 ...landmarks.map(([id,name,x,y,subtitle,description,page])=>({id,name,x,y,subtitle,description,category:'place',source:`https://bulbapedia.bulbagarden.net/wiki/${page}`}))
];
