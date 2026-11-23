import {mkdir, rm, cp,writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const root=process.cwd();
await rm(path.join(root,'dist'),{recursive:true,force:true});
await mkdir(path.join(root,'dist'),{recursive:true});
await cp(path.join(root,'public'),path.join(root,'dist'),{recursive:true});
const tsc=path.join(root,'node_modules','.bin','tsc');
try{execFileSync(tsc,['--project','tsconfig.json'],{stdio:'inherit'});}catch(e){
 if(e?.code==='ENOENT'){execFileSync('tsc',['--project','tsconfig.json'],{stdio:'inherit'});}else{throw e;}
}
await writeFile(path.join(root,'dist','.nojekyll'),'');
console.log('MikroLab build complete: dist/');
