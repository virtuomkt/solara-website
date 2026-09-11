import { readFile, writeFile, copyFile } from 'node:fs/promises';
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
const description = `${data.name}: fraccionamiento privado en ${data.location}, con jardín privado, estacionamiento techado y amenidades. Descarga el folleto con planos, superficies y precios.`;
const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebSite', '@id': `${url}#website`, url, name: data.name, inLanguage: 'es-MX' },
    { '@type': 'WebPage', '@id': `${url}#webpage`, url, name: title, description, inLanguage: 'es-MX', isPartOf: {'@id': `${url}#website`}, about: {'@id': `${url}#solara`}, mainEntity: {'@id': `${url}#solara`} },
    { '@type': 'GatedResidenceCommunity', '@id': `${url}#solara`, name: data.name, url, telephone: data.phoneE164, description: `Fraccionamiento privado en ${data.location}, con jardín privado, estacionamiento techado y amenidades para la comunidad.`, hasMap: data.mapUrl, image: `${url}media/comunidad-1920.webp`, amenityFeature: data.amenities.map(name => ({'@type':'LocationFeatureSpecification', name, value:true})) }
  ]
};
const values = {
  TITLE: esc(title), DESCRIPTION: esc(description), URL: esc(url),
  ROBOTS: data.publicLaunch ? 'index, follow, max-image-preview:large' : 'noindex, nofollow',
  SCHEMA: JSON.stringify(schema, null, 2).replace(/</g, '\\u003c'),
  PRICE: esc(price), CURRENCY: esc(data.currency), HOMES: esc(data.homes), AREA: esc(data.constructionAreaM2),
  MAP_URL: esc(data.mapUrl), SOURCE_DATE: esc(data.commercialSourceDate), SOURCE_LABEL: esc(`Información comercial al ${formattedSourceDate}`),
  PHONE_DISPLAY: esc(data.phoneDisplay), PHONE_HREF: esc(`tel:${data.phoneE164}`),
  BROCHURE_FILE: esc(data.brochureFile)
};
let html = await readFile(path.join(root, 'src/index.html'), 'utf8');
html = html.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {if (!(key in values)) throw new Error(`Unknown token: ${key}`); return values[key];});
await writeFile(path.join(root, 'dist/index.html'), html);
await writeFile(path.join(root, 'dist/robots.txt'), `# ${data.publicLaunch ? 'Public website' : 'Private review: HTML also sends noindex. Access is controlled by Sites.'}\nUser-agent: *\nAllow: /\n${data.publicLaunch ? `\nSitemap: ${url}sitemap.xml\n` : ''}`);
await writeFile(path.join(root, 'dist/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${data.publicLaunch ? `\n  <url><loc>${esc(url)}</loc></url>\n` : '\n'}</urlset>\n`);
await writeFile(path.join(root, 'dist/_headers'), `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n${data.publicLaunch ? '' : '  X-Robots-Tag: noindex, nofollow\n'}\n/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n\n/media/*\n  Cache-Control: public, max-age=86400\n`);
await copyFile(path.join(root, data.commercialSource), path.join(root, 'dist/media', data.brochureFile));
console.log(`Rendered ${data.name}: ${data.publicLaunch ? 'public, indexable' : 'private, noindex'}; canonical ${url}; brochure copied to dist/media/${data.brochureFile}`);
