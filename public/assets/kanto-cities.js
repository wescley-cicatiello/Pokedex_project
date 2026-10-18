// Gym teams: first battle in Red/Blue. Source: https://www.serebii.net/rb/gyms.shtml
// Points of interest: original Kanto games; names differ in later remakes.
const services = ['Centro Pokémon','Poké Mart'];
export const cityInfo = {
 pallet:{points:['Laboratório do Professor Oak','Casa do protagonista','Casa do rival'],note:'Pallet não possui Centro Pokémon, Poké Mart ou ginásio.'},
 viridian:{points:[...services,'Escola de treinadores','Ginásio de Viridian'],gym:{leader:'Giovanni',type:'Terra',badge:'Earth Badge',team:[[111,'Rhyhorn',45],[51,'Dugtrio',42],[31,'Nidoqueen',44],[34,'Nidoking',45],[112,'Rhydon',50]]}},
 pewter:{points:[...services,'Museu de Ciências','Ginásio de Pewter'],gym:{leader:'Brock',type:'Pedra',badge:'Boulder Badge',team:[[74,'Geodude',12],[95,'Onix',14]]}},
 cerulean:{points:[...services,'Loja de bicicletas','Casa invadida pela Equipe Rocket','Ginásio de Cerulean'],gym:{leader:'Misty',type:'Água',badge:'Cascade Badge',team:[[120,'Staryu',18],[121,'Starmie',21]]}},
 vermilion:{points:[...services,'Fã-clube Pokémon','Casa do pescador','Porto e S.S. Anne','Ginásio de Vermilion'],gym:{leader:'Lt. Surge',type:'Elétrico',badge:'Thunder Badge',team:[[100,'Voltorb',21],[25,'Pikachu',18],[26,'Raichu',24]]}},
 lavender:{points:[...services,'Pokémon Tower','Casa do Sr. Fuji','Avaliador de nomes'],note:'Lavender não possui ginásio.'},
 celadon:{points:['Centro Pokémon','Loja de departamentos','Game Corner','Esconderijo da Equipe Rocket','Mansão de Celadon','Ginásio de Celadon'],gym:{leader:'Erika',type:'Planta',badge:'Rainbow Badge',team:[[71,'Victreebel',29],[114,'Tangela',24],[45,'Vileplume',29]]}},
 saffron:{points:[...services,'Silph Co.','Dojo de lutas','Casa do Mr. Psychic','Ginásio de Saffron'],gym:{leader:'Sabrina',type:'Psíquico',badge:'Marsh Badge',team:[[64,'Kadabra',38],[122,'Mr. Mime',37],[49,'Venomoth',38],[65,'Alakazam',43]]}},
 fuchsia:{points:[...services,'Safari Zone (Red / Blue / Yellow)','Casa do guarda da Safari Zone','Casa do pescador','Ginásio de Fuchsia'],gym:{leader:'Koga',type:'Veneno',badge:'Soul Badge',team:[[109,'Koffing',37],[89,'Muk',39],[109,'Koffing',37],[110,'Weezing',43]]}},
 cinnabar:{points:[...services,'Laboratório de pesquisas','Pokémon Mansion','Ginásio de Cinnabar'],gym:{leader:'Blaine',type:'Fogo',badge:'Volcano Badge',team:[[58,'Growlithe',42],[77,'Ponyta',40],[78,'Rapidash',42],[59,'Arcanine',47]]}}
};
