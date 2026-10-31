import {test} from 'node:test';
import assert from 'node:assert/strict';
import {checkPublicHtml} from './seo-quality-gate.mjs';
const html='<html><head><title>Service</title><link rel="canonical" href="https://www.digiformation.co.uk/contact"><meta name="robots" content="index,follow"><script type="application/ld+json">{"@type":"WebPage"}</script></head><body><main><h1>Contact</h1><p>'+('Useful service information '.repeat(40))+'</p></main></body></html>';
test('valid full-content fixture passes',()=>assert.deepEqual(checkPublicHtml(html,'/contact'),[]));
for(const [name,mutate,expected] of [
  ['wrong canonical',s=>s.replace('co.uk/contact','co.uk/wrong'),'canonical'],
  ['private directive',s=>s.replace('index,follow','noindex,follow'),'indexability'],
  ['duplicate heading',s=>s.replace('</main>','<h1>Other</h1></main>'),'h1'],
  ['broken schema',s=>s.replace('{"@type":"WebPage"}','{broken}'),'jsonld'],
  ['thin shell',s=>s.replace(/<p>.*<\/p>/,'<p>Short</p>'),'full-content'],
  ['tag before consent',s=>s.replace('</head>','<script src="https://www.googletagmanager.com/gtag/js"></script></head>'),'unconsented-tag'],
])test('rejects deliberately injected '+name,()=>assert.ok(checkPublicHtml(mutate(html),'/contact').includes(expected)));
