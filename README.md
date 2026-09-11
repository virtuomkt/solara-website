# Solara City Homes

Página estática en español, con Montserrat variable alojada localmente. Sites sirve exclusivamente `dist/`; el brief interno no se incluye en el sitio ni en su repositorio de publicación.

## Contenido mínimo por diseño

El sitio es una página de captación, no un folleto: su función es motivar la descarga del PDF. La página conserva lo aspiracional (renders, copy, nombres de amenidades, mapa) y deja fuera todo dato concreto —precio, superficie, número de viviendas, planos de distribución, lista de lugares cercanos y preguntas frecuentes—, que vive únicamente en el brochure descargable. `scripts/validate.mjs` sostiene esa decisión: falla si el precio o la superficie reaparecen en el HTML, y si la descarga no está presente en el hero y en el footer.

La contrapartida es de posicionamiento: una página con poco contenido da poco que indexar. El plan de publicación de abajo asume tráfico orgánico; si el canal real es de anuncios, revisar esa sección antes del lanzamiento.

## Edición

- `content/solara.json`: datos comerciales y configuración de publicación. El precio y su fecha proceden del brochure del 1 de septiembre de 2026; no representan una nueva verificación de disponibilidad. Ese precio ya no se muestra en la página, pero sigue siendo el registro de la fuente. `commercialSource` apunta al PDF origen en `assets/`; `brochureFile` es el nombre con el que se publica en `dist/media/`.
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

Los planos de distribución y el render del acceso se retiraron de `dist/media/` al recortar el contenido: publicados quedaban accesibles por URL directa aunque ninguna página los enlazara. Siguen versionados en el tag `v1.0.0` y se recuperan con `git checkout v1.0.0 -- dist/media/<archivo>`.

El botón de descarga aparece en el hero y en el footer; el footer incluye además el teléfono comercial enlazado para llamar. No se incluyen formularios, CRM, analítica, píxeles publicitarios, inventario, llms.txt ni una imagen social generada.
