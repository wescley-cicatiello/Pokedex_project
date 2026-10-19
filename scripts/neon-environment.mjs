import {readFileSync} from 'node:fs';
export function neonEnvironment(file) {
  const environment={...process.env};
  for(const line of readFileSync(file,'utf8').split(/\r?\n/)) {
    const match=line.trim().match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if(!match)continue;
    let value=match[2].trim();
    if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'")))value=value.slice(1,-1);
    if(['DATABASE_URL','DATABASE_URL_UNPOOLED','NEON_BRANCH'].includes(match[1]))environment[match[1]]=value;
  }
  if(!environment.DATABASE_URL)throw Error('DATABASE_URL ausente; execute neon deploy.');
  return environment;
}
export const dockerEnvironmentArguments=['-e','DATABASE_URL','-e','DATABASE_URL_UNPOOLED','-e','NEON_BRANCH'];
