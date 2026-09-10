import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await readFile(path.join(root, 'content/solara.json'), 'utf8'));
if (data.publicLaunch && !data.publicOrigin) throw new Error('Public launch requires the confirmed publicOrigin.');
const base = new URL(data.publicLaunch ? data.publicOrigin : data.privateOrigin);
if (base.protocol !== 'https:' || base.pathname !== '/' || base.search || base.hash || base.username || base.password) throw new Error('Origin must be an HTTPS origin without path, query or credentials.');
const url = base.origin + '/';
const price = '$' + new Intl.NumberFormat('es-MX', { maximumFractionDigits: 0 }).format(data.startingPrice);
const sourceDate = new Date(`${data.commercialSourceDate}T12:00:00Z`);
if (!Number.isFinite(sourceDate.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(data.commercialSourceDate)) throw new Error('A valid commercial source date is required.');
const formattedSourceDate = new Intl.DateTimeFormat('es-MX', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(sourceDate);
const esc = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const title = `${data.name} | Casas en fraccionamiento privado en ${data.location}`;
const description = `${data.name}: ${data.homes} viviendas en un fraccionamiento privado en ${data.location}, con ${data.constructionAreaM2} m² de construcción, jardín y amenidades. Desde ${price} ${data.currency}.`;
const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebSite', '@id': `${url}#website`, url, name: data.name, inLanguage: 'es-MX' },
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description, inLanguage: 'es-MX', isPartOf: {'@id': `${url}#website`}, about: {'@id': `${url}#solara`}, mainEntity: {'@id': `${url}#solara`} },
    { '@type': 'GatedResidenceCommunity', '@id': `${url}#solara`, name: data.name, url, description: `Fraccionamiento privado de ${data.homes} viviendas en ${data.location}. Cada vivienda cuenta con ${data.constructionAreaM2} m² de construcción, cocina integral, jardín privado y estacionamiento techado.`, hasMap: data.mapUrl, image: `${url}media/comunidad-1920.webp`, amenityFeature: data.amenities.map(name => ({'@type':'LocationFeatureSpecification', name, value:true})) }
  ]
};
const faqs = [
  ['¿Dónde se encuentra Solara City Homes?', `Solara City Homes es un fraccionamiento privado en ${data.location}. El mapa del desarrollo muestra su ubicación y referencias cercanas como Plaza Mocambo, la Universidad Veracruzana y las playas. Puedes consultar el punto del proyecto en Google Maps.`],
  ['¿Cuántas viviendas tiene el desarrollo?', `El conjunto está integrado por ${data.homes} viviendas. Esta cifra describe el total del desarrollo, no la disponibilidad actual.`],
  ['¿Cuánto mide cada vivienda?', `Cada vivienda cuenta con ${data.constructionAreaM2} m² de construcción, además de los espacios y la distribución que puedes consultar en los planos de esta página.`],
  ['¿Qué amenidades y seguridad ofrece Solara?', `Solara cuenta con alberca, parque, juegos infantiles, asadores y sanitarios exteriores. El desarrollo incluye acceso vehicular con caseta de control y vigilancia 24/7.`],
  ['¿Cuál es el precio de las viviendas?', `El precio publicado es desde ${price} ${data.currency}, según el brochure del ${formattedSourceDate}. Los precios y la disponibilidad están sujetos a cambios sin previo aviso.`]
];
const values = {
  TITLE: esc(title), DESCRIPTION: esc(description), URL: esc(url),
  ROBOTS: data.publicLaunch ? 'index, follow, max-image-preview:large' : 'noindex, nofollow',
  SCHEMA: JSON.stringify(schema, null, 2).replace(/</g, '\\u003c'),
  PRICE: esc(price), CURRENCY: esc(data.currency), HOMES: esc(data.homes), AREA: esc(data.constructionAreaM2),
  MAP_URL: esc(data.mapUrl), SOURCE_DATE: esc(data.commercialSourceDate), SOURCE_LABEL: esc(`Información comercial del brochure: ${formattedSourceDate}`),
  FAQS: faqs.map(([q,a]) => `<article class="faq-item"><h3>${esc(q)}</h3><p>${esc(a)}</p></article>`).join('\n')
};
let html = await readFile(path.join(root, 'src/index.html'), 'utf8');
html = html.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {if (!(key in values)) throw new Error(`Unknown token: ${key}`); return values[key];});
await writeFile(path.join(root, 'dist/index.html'), html);
await writeFile(path.join(root, 'dist/robots.txt'), `# ${data.publicLaunch ? 'Public website' : 'Private review: HTML also sends noindex. Access is controlled by Sites.'}\nUser-agent: *\nAllow: /\n${data.publicLaunch ? `\nSitemap: ${url}sitemap.xml\n` : ''}`);
await writeFile(path.join(root, 'dist/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${data.publicLaunch ? `\n  <url><loc>${esc(url)}</loc></url>\n` : '\n'}</urlset>\n`);
await writeFile(path.join(root, 'dist/_headers'), `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n${data.publicLaunch ? '' : '  X-Robots-Tag: noindex, nofollow\n'}\n/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/media/*\n  Cache-Control: public, max-age=86400\n`);
console.log(`Rendered ${data.name}: ${data.publicLaunch ? 'public, indexable' : 'private, noindex'}; canonical ${url}`);
