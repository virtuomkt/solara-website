import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const read = file => readFile(path.join(dist, file), 'utf8');
const [html,css,robots,sitemap,headers,dataText] = await Promise.all([read('index.html'),read('styles.css'),read('robots.txt'),read('sitemap.xml'),read('_headers'),readFile(path.join(root,'content/solara.json'),'utf8')]);
const data = JSON.parse(dataText);
assert(!/\{\{[A-Z_]+\}\}/.test(html), 'Unresolved content tokens');
assert.match(html, /<html lang="es-MX">/);
assert.equal((html.match(/<h1\b/g)||[]).length,1,'Exactly one H1 required');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length,'Duplicate element IDs');
for (const m of html.matchAll(/\bhref="#([^"]+)"/g)) assert(ids.includes(m[1]),`Missing section ${m[1]}`);
for (const section of ['desarrollo','viviendas','amenidades','ubicacion','distribucion']) assert(ids.includes(section));
const references = new Set([...html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)].map(m=>m[1]));
for (const m of html.matchAll(/srcset="([^"]+)"/g)) for(const source of m[1].split(',')) references.add(source.trim().split(' ')[0]);
for (const m of css.matchAll(/url\(['"]?(\.\/[^)'"\s]+)/g)) references.add(m[1]);
for (const ref of references) {
  const resolved = path.resolve(dist,ref);
  assert(resolved.startsWith(dist+path.sep),'Asset escaped public directory');
  assert((await stat(resolved)).isFile(),`Missing asset ${ref}`);
}
for (const match of html.matchAll(/<img\b[^>]*>/g)) {
  assert.match(match[0],/\balt="[^"]*"/,'All images need alt text');
  assert.match(match[0],/\bwidth="\d+"/,'Reserve image width');
  assert.match(match[0],/\bheight="\d+"/,'Reserve image height');
}
assert.match(html, /fetchpriority="high"/);
assert.equal((css.match(/@font-face/g)||[]).length,1,'Use only Montserrat');
assert.match(css,/font-weight:100 900/);
assert.match(css,/font-display:swap/);
assert.match(css,/@media\(max-width:700px\)/);
assert.match(css,/prefers-reduced-motion/);
const font=await readFile(path.join(dist,'fonts/montserrat-latin-variable.woff2'));
assert.equal(font.subarray(0,4).toString(),'wOF2');
assert((await read('fonts/OFL.txt')).includes('SIL OPEN FONT LICENSE'));
const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.deepEqual(schema['@graph'].map(e=>e['@type']),['WebSite','WebPage','GatedResidenceCommunity']);
assert.equal(schema['@graph'][2].amenityFeature.length,data.amenities.length);
const url = new URL(data.publicLaunch ? data.publicOrigin : data.privateOrigin).origin+'/';
assert(html.includes(`<link rel="canonical" href="${url}">`));
assert(schema['@graph'].every(e=>e['@id'].startsWith(url)));
assert.equal(schema['@graph'][2].hasMap,data.mapUrl);
assert.match(robots,/User-agent: \*\nAllow: \//);
if(data.publicLaunch){
  assert(!/noindex/.test(html+headers));
  assert(sitemap.includes(`<loc>${url}</loc>`));
  assert.equal((sitemap.match(/<url>/g)||[]).length,1);
  assert(robots.includes(`Sitemap: ${url}sitemap.xml`));
}else{
  assert.match(html,/<meta name="robots" content="noindex, nofollow">/);
  assert.match(headers,/X-Robots-Tag: noindex, nofollow/);
  assert(!sitemap.includes('<loc>'),'Private origin must not be submitted in sitemap');
}
// The site is a lead page: price, construction area, floor plans, availability and FAQ live only in the
// downloadable brochure. The home count, site plan (croquis), map and nearby places are shown by client request.
const price='$'+new Intl.NumberFormat('es-MX',{maximumFractionDigits:0}).format(data.startingPrice);
assert(!html.includes(price),'Pricing belongs in the brochure, not on the page');
assert(!html.includes(`${data.constructionAreaM2} m²`),'Construction area belongs in the brochure, not on the page');
assert(!/vendid|planta baja|nivel 0\d|azotea/i.test(html),'Availability and floor plans belong in the brochure, not on the page');
assert(!/<details\b|preguntas frecuentes/i.test(html),'FAQ belongs in the brochure, not on the page');
assert(html.includes(`${data.homes} viviendas`),'The hero states the number of homes');
assert(html.includes(`<time datetime="${data.commercialSourceDate}">`));
const download=/href="\.\/media\/[^"]+\.pdf" download=/;
assert(download.test(html.slice(html.indexOf('class="hero"'),html.indexOf('id="desarrollo"'))),'The brochure download belongs in the hero');
assert(download.test(html.slice(html.indexOf('<footer'))),'The brochure download belongs in the footer');
const iframes=html.match(/<iframe\b[^>]*>/g)||[];
assert.equal(iframes.length,1,'One embedded map');
assert.match(iframes[0],/src="https:\/\/www\.google\.com\/maps\?q=[-\d.]+,[-\d.]+&amp;[^"]*output=embed"/,'Google Maps embed at the project coordinates');
assert.match(iframes[0],/title="[^"]+"/,'The map needs an accessible title');
assert.match(iframes[0],/loading="lazy"/,'The map loads lazily');
assert.equal((html.match(/<ol class="croquis-marks"[^>]*>([\s\S]*?)<\/ol>/)[1].match(/<li\b/g)||[]).length,data.homes,'The croquis numbers every home');
assert.deepEqual([schema['@graph'][2].geo.latitude,schema['@graph'][2].geo.longitude],[data.latitude,data.longitude]);
assert(!/brochure/i.test(html),'Source-document terminology must stay out of visitor-facing content');
assert(html.includes(`href="tel:${data.phoneE164}"`),'Commercial phone must be callable');
assert(html.includes(data.phoneDisplay));
assert.equal(schema['@graph'][2].telephone,data.phoneE164);
assert(!/<form\b|wa\.me|wa\.link|googletagmanager|facebook\.com\/tr|llms\.txt|@virtuomkt/i.test(html));
assert(!references.has('./assets/Brief Performance Solara — Meta Ads.pdf'));
console.log(`PASS: static HTML, ${references.size} local references, headings, brochure download, Montserrat, structured data and ${data.publicLaunch?'public':'private'} indexing settings.`);
