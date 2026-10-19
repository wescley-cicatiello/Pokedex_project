import {spawnSync} from 'node:child_process';
import {neonEnvironment,dockerEnvironmentArguments} from './neon-environment.mjs';
const file=process.argv[2] || '.env.local';
const result=spawnSync('docker',['run','--rm',...dockerEnvironmentArguments,'pokedex-neon:latest','php','scripts/seed.php'],{stdio:'inherit',env:neonEnvironment(file)});
if(result.error)throw result.error;
process.exit(result.status||0);
