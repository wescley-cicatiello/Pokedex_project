import {existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {neonEnvironment,dockerEnvironmentArguments} from './neon-environment.mjs';
const envFile=process.env.NEON_ENV_FILE || (existsSync('.env')?'.env':'.env.local');
if(!existsSync(envFile))throw Error('Execute neon deploy para obter as variáveis do PostgreSQL.');
const processHandle=spawn('docker',['run','--rm','--name','pokedex-neon',...dockerEnvironmentArguments,'-p','127.0.0.1:8002:10000','pokedex-neon:latest'],{stdio:'inherit',env:neonEnvironment(envFile)});
console.log('Aplicação Neon: http://localhost:8002 (após a importação).');
processHandle.on('exit',code=>process.exit(code||0));
processHandle.on('error',error=>{console.error(error.message);process.exit(1);});
