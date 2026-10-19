import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
function run(command,args) {
  const result=spawnSync(command,args,{stdio:'inherit'});
  if(result.error) throw result.error;
  if(result.status!==0)process.exit(result.status||1);
}
for(const directory of ['public/assets','scripts'])for(const file of readdirSync(directory)){
  if(/\.(mjs|js)$/.test(file))run(process.execPath,['--check',`${directory}/${file}`]);
}
console.log('JavaScript: sintaxe válida.');
run(process.execPath,['scripts/prepare-letsgo.mjs']);
run('docker',['build','-f','Dockerfile.production','-t','pokedex-neon:latest','.']);
run('docker',['run','--rm','pokedex-neon:latest','sh','-c',"find public src scripts -name '*.php' -print0 | xargs -0 -n1 php -l"]);
console.log('BUILD OK: imagem PHP/Apache e sintaxe PHP/JavaScript validadas.');
