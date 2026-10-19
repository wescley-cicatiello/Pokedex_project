<?php
declare(strict_types=1);
function mapName(string $name): string {
    $name=str_replace(['Sea Route ', 'Diglett’s', 'Pokémon', 'Pokemon'],['Route ', "Diglett's", 'Pokemon', 'Pokemon'],$name);
    return strtolower(trim($name));
}
function mapLocationId(string $name): string {
    $known=['Pallet Town'=>'pallet','Viridian City'=>'viridian','Pewter City'=>'pewter','Cerulean City'=>'cerulean','Vermilion City'=>'vermilion','Lavender Town'=>'lavender','Celadon City'=>'celadon','Saffron City'=>'saffron','Fuchsia City'=>'fuchsia','Cinnabar Island'=>'cinnabar','New Bark Town'=>'newbark','Cherrygrove City'=>'cherrygrove','Violet City'=>'violet','Azalea Town'=>'azalea','Goldenrod City'=>'goldenrod','Ecruteak City'=>'ecruteak','Olivine City'=>'olivine','Cianwood City'=>'cianwood','Mahogany Town'=>'mahogany','Blackthorn City'=>'blackthorn','Seafoam Islands'=>'seafoam','Indigo Plateau'=>'league'];
    return $known[$name]??trim(preg_replace('/[^a-z0-9]+/','-',mapName($name)),'-');
}
function buildMapWorld(string $version,array $atlas,array $profiles): array {
    $game=games()['versions'][$version];
    $group=$game['group']==='johto'?($game['generation']===2?'gsc':'hgss'):($game['group']==='frlg'?'frlg':$version);
    $layouts=json_decode(file_get_contents(__DIR__.'/../data/map-layouts.json'),true,512,JSON_THROW_ON_ERROR);
    $cityGroups=json_decode(file_get_contents(__DIR__.'/../data/map-cities.json'),true,512,JSON_THROW_ON_ERROR);
    $mapIds=match($group){'gsc'=>['johto-gsc','kanto-gsc'],'hgss'=>['johto-hgss','kanto-hgss'],'frlg'=>['kanto-frlg','sevii-123','sevii-45','sevii-67'],default=>['kanto-classics']};
    $maps=[];$locations=[];$encounters=[];$usedNames=[];
    $areasByName=[];
    foreach($atlas['locations'] as $area)$areasByName[mapName($area['name'])][]=$area;
    $indexed=[];foreach($profiles as $p)$indexed[$p['id']]=$p;
    foreach($mapIds as $mapId){
        $layout=$layouts[$mapId];$points=$layout['locations'];unset($layout['locations']);$maps[]=$layout;
        foreach($points as $point){
            if($point['name']==='Battle Tower'&&$version!=='crystal')continue;
            if(in_array($point['name'],['Route 23'],true)&&$game['group']==='johto')continue;
            $point['id']=mapLocationId($point['name']);$point['mapId']=$mapId;
            $point['subtitle']=$layout['label'].' · '.$game['name'];
            $point['description']=$point['category']==='city'?'Conheça os serviços e pontos de interesse desta cidade.':'Consulte as áreas e os Pokémon registrados neste local para a edição selecionada.';
            if($point['name']==='Bell Tower'&&$group==='gsc')$point['name']='Tin Tower';
            $key=mapName($point['name']==='Tin Tower'?'Bell Tower':$point['name']);
            $usedNames[$key]=true;
            $point['areas']=$areasByName[$key]??[];
            if($point['name']==='Mahogany Town')$point['areas']=array_merge($point['areas'],$areasByName[mapName('Team Rocket HQ')]??[]);
            $locations[]=$point;
        }
    }
    // Special events, roaming encounters and islands absent from the artwork remain accessible without invented coordinates.
    foreach($areasByName as $key=>$areas){
        if(isset($usedNames[$key])||preg_match('/unknown|pokecenter|pokemart/',$key))continue;
        $name=$areas[0]['name'];
        if(preg_match('/(?:monean|liptoo|weepth|dilford|scufib|rixy|viapos) chamber/i',$name)){
            foreach($locations as &$point)if($point['name']==='Tanoby Ruins')$point['areas']=array_merge($point['areas'],$areas);
            unset($point);continue;
        }
        $locations[]=['id'=>mapLocationId($name),'name'=>$name,'category'=>'place','mapId'=>'special','subtitle'=>'Local especial · '.$game['name'],'description'=>'Este registro não possui uma posição própria no mapa regional. A disponibilidade pode depender de eventos ou condições especiais.','areas'=>$areas];
    }
    foreach($locations as &$point){
        $pokemon=[];
        foreach($point['areas'] as &$area){
            foreach($area['pokemon'] as &$entry){
                $p=$indexed[$entry['id']]??null;if(!$p)continue;
                $entry['name']=$p['name'];$entry['image']=$p['image'];$entry['versions']=[$version];
                if(!isset($pokemon[$p['id']]))$pokemon[$p['id']]=$entry;
                else {$pokemon[$p['id']]['methods']=array_values(array_unique(array_merge($pokemon[$p['id']]['methods'],$entry['methods'])));$pokemon[$p['id']]['min_level']=min($pokemon[$p['id']]['min_level'],$entry['min_level']);$pokemon[$p['id']]['max_level']=max($pokemon[$p['id']]['max_level'],$entry['max_level']);}
            }unset($entry);
        }unset($area);
        $encounters[$point['id']]=array_values($pokemon);
    }unset($point);
    $cities=$cityGroups[$group];
    if($group==='frlg'){
        $islandPoints=['One'=>['Pokémon Network Center','Terminal de Celio'],'Two'=>['Centro Pokémon','Mercado ao ar livre','Joyful Game Corner','Move Reminder'],'Three'=>['Centro Pokémon','Poké Mart'],'Four'=>['Centro Pokémon','Poké Mart','Day Care','Casa de Lorelei'],'Five'=>['Centro Pokémon'],'Six'=>['Centro Pokémon','Poké Mart'],'Seven'=>['Centro Pokémon','Poké Mart']];
        foreach($islandPoints as $island=>$points){$id=mapLocationId($island.' Island');$cities[$id]=['points'=>[...$points,'Porto da Seagallop'],'note'=>'As Ilhas Sevii não possuem ginásios da Liga de Kanto.'];}
    }
    foreach($locations as &$point){
        $city=$cities[$point['id']]??null;
        if($city&&isset($city['note']))$point['description']=$city['note'];
        // Do not offer deleted locations from the original games in GSC.
        if($group==='gsc'&&$point['name']==='Kanto Power Plant')$point['description']='Usina em funcionamento. A restauração de energia faz parte da jornada em Kanto.';
    }unset($point);
    $leagues=json_decode(file_get_contents(__DIR__.'/../data/map-leagues.json'),true,512,JSON_THROW_ON_ERROR);
    $portraits=json_decode(file_get_contents(__DIR__.'/../public/assets/trainers/maps/sources.json'),true,512,JSON_THROW_ON_ERROR);
    $league=$leagues[$group];
    foreach($cities as &$city)if(isset($city['gym']['portrait']))$city['gym']['portrait']=$portraits[$city['gym']['portrait']]??null;unset($city);
    foreach($league as &$trainer)if(isset($trainer['portrait']))$trainer['portrait']=$portraits[$trainer['portrait']]??null;unset($trainer);
    return ['version'=>$version,'reference'=>$version,'maps'=>$maps,'locations'=>$locations,'cities'=>$cities,'league'=>$league,'encounters'=>$encounters,'note'=>$atlas['note']];
}
