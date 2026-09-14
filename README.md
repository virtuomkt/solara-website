# Solara City Homes Veracruz

Página estática en español, con Montserrat variable alojada localmente. El hosting sirve exclusivamente `dist/`; el brief interno no se incluye en el sitio ni en su repositorio de publicación.

El nombre completo es **Solara City Homes Veracruz** y el comercial, **Solara Veracruz**: `content/solara.json` guarda ambos (`name` y `shortName`) y la plantilla usa el corto en títulos, hero y footer.

## Qué se publica y qué no

El sitio es una página de captación, no un folleto: su función es motivar la descarga del PDF. Desde la v3, a petición del cliente, la página sí muestra el número de viviendas (14), el croquis de distribución del conjunto, el mapa de Google Maps embebido y las referencias de puntos cercanos. Siguen fuera el precio, la superficie de construcción, los planos de la vivienda, la disponibilidad por lote y las preguntas frecuentes: ese detalle vive solo en el brochure descargable.

`scripts/validate.mjs` sostiene esa frontera: falla si reaparecen el precio, la superficie, los planos, la disponibilidad ("vendido") o un acordeón de preguntas; exige la descarga del folleto en el hero, en Viviendas, en Amenidades y en el footer; y comprueba que el croquis numere las 14 viviendas y que el mapa embebido apunte a las coordenadas del proyecto, con título accesible y carga diferida.

La contrapartida es de posicionamiento: una página con poco contenido da poco que indexar. El plan de publicación de abajo asume tráfico orgánico; si el canal real es de anuncios, revisar esa sección antes del lanzamiento.

## Versiones publicadas

GitHub Pages sirve un solo sitio por repositorio, así que cada versión conserva su enlace como subcarpeta y la vigente ocupa la raíz. El workflow `.github/workflows/pages.yml` arma el sitio en cada despliegue: la raíz sale de `dist/` en `main` y cada versión de su rama.

| Versión | Rama | Enlace |
| --- | --- | --- |
| v3 (vigente, también en la raíz) | `version-3` | `/` y `/v3/` |
| v2 | `version-2` | `/v2/` |
| v1 | `version-1` | `/v1/` |

`/version-anterior/` se conserva como redirección a `/v1/` para no romper el enlace que ya se compartió. Para preparar una versión nueva: crear su rama `version-N`, añadirla al bucle del workflow y fusionar a `main`; un push a `main` o a cualquier rama `version-*` vuelve a desplegar el conjunto.

## Edición

- `content/solara.json`: datos comerciales y configuración de publicación. El precio y su fecha proceden del brochure del 1 de septiembre de 2026; no representan una nueva verificación de disponibilidad. Ese precio ya no se muestra en la página, pero sigue siendo el registro de la fuente. `commercialSource` apunta al PDF origen en `assets/`; `brochureFile` es el nombre con el que se publica en `dist/media/`. `latitude` y `longitude` (19.1601438, −96.1167767, resueltas desde el `mapUrl` del cliente) alimentan el mapa embebido y el `geo` de los datos estructurados; `streetAddress`, `neighborhood` y `postalCode` alimentan la ficha de ubicación y el `PostalAddress`.
- `src/index.html`: plantilla del contenido. `dist/styles.css` y `dist/site.js`: estilos y animación de entrada por scroll. La página funciona completa sin JavaScript; el script solo añade movimiento y respeta `prefers-reduced-motion`.
- Ejecutar `node scripts/render.mjs` después de editar los datos o la plantilla. El resultado HTML completo se conserva en `dist/index.html`, junto a robots, sitemap y cabeceras. El script también copia el brochure desde `commercialSource` hacia `dist/media/<brochureFile>` para su descarga pública.
- Ejecutar `node scripts/validate.mjs` para validar el contenido, metadatos, recursos y configuración de indexación. No requiere paquetes externos.

## Publicación

La versión inicial tiene `publicLaunch: false`, canonical de la URL privada, `noindex` en HTML y cabeceras, y sitemap vacío. La privacidad efectiva depende de los controles de acceso de Sites; `noindex` no es un control de acceso.

Solo después de autorizar el lanzamiento público:

1. Confirmar fecha comercial, ubicación y URL pública. Actualizar `content/solara.json` con `publicOrigin` y `publicLaunch: true`. Revisar también el contenido del PDF: al ser lo único que publica precios y superficies, el brochure pasa a ser el documento comercial vigente frente al público.
2. Regenerar y validar. El render elimina `noindex`, cambia canonical e identificadores JSON-LD y publica una sola URL en sitemap. Robots permite a todos los rastreadores, incluidos Googlebot, Bingbot, OAI-SearchBot y Claude-SearchBot.
3. Publicar para la audiencia autorizada y comprobar respuesta 200 sin autenticación, bloqueos de CDN ni cabeceras heredadas de noindex. Redirigir otros dominios públicos si existieran.
4. Con acceso a las cuentas del cliente, verificar Google Search Console y Bing Webmaster Tools y enviar sitemap. Revisar indexación y apariciones en búsqueda; no asumir que las herramientas están conectadas.
5. Medir Core Web Vitals con tráfico real: objetivos p75 LCP ≤2.5 s, CLS ≤0.1 e INP ≤200 ms. Las pruebas estáticas no acreditan estas métricas ni garantizan posicionamiento o citas de IA.

## Recursos

Los renders originales y el master del brochure permanecen intactos en `assets/` (excluido de Git); `node scripts/render.mjs` copia ese PDF a `dist/media/` para su descarga pública, sin comprimir (~8.6 MB; conviene optimizarlo si el peso es un problema). El brief interno de Meta Ads permanece excluido tanto del sitio como del repositorio de publicación. `dist/media/` contiene además las copias WebP optimizadas que la página sigue usando y un recorte del mapa suministrado. La fuente proviene de Google Fonts, familia Montserrat variable 100–900, subconjunto latino con español; licencia OFL en `dist/fonts/OFL.txt`.

Los planos de la vivienda (planta baja, niveles y azotea) siguen fuera de `dist/media/`: publicados quedarían accesibles por URL directa aunque ninguna página los enlazara. Permanecen versionados en el tag `v1.0.0` y en la rama `version-1`, y se recuperan con `git checkout v1.0.0 -- dist/media/<archivo>`.

La v3 añadió cuatro imágenes, generadas con `sharp` desde los originales de `assets/img/` (no hay script versionado: fue un paso puntual): `area-social-*` (hero, render 05), `andador-*` (calle interior, render 02), `acceso-*` (banda de privacidad, render 01, recuperado de la v1) y `comunidad-*`, reexportada recortando la esquina inferior derecha porque la copia anterior mostraba la marca de agua «Activar Windows» del render original. El croquis (`croquis-800/1600.webp`) es la imagen limpia incrustada en la página 11 del brochure —sin los precios ni las marcas de «vendido», que allí son una capa aparte—; la numeración del 1 al 14 se dibuja en HTML sobre la imagen con coordenadas en porcentaje, así que si se reemplaza el croquis hay que recalcularlas.

El botón de descarga aparece en el hero, al pie de la ficha de Viviendas, al cierre de Amenidades y en el footer (el croquis añade un enlace de texto a la disponibilidad); el footer incluye además el teléfono comercial enlazado para llamar. No se incluyen formularios, CRM, analítica, píxeles publicitarios, inventario, llms.txt ni una imagen social generada.
