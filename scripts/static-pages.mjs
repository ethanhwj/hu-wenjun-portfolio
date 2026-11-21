import {mkdir,copyFile} from 'node:fs/promises';
for(const page of ['about','playground','work/cest-la-vie','work/sheld','work/new-choice','work/blinblin','work/iman','work/sogue']){await mkdir(`dist/${page}`,{recursive:true});await copyFile('dist/index.html',`dist/${page}/index.html`)}
