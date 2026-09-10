# Solara City Homes

Página estática informativa en español, con Montserrat variable alojada localmente. Sites sirve exclusivamente `dist/`; el brochure y el brief interno no se incluyen en el sitio ni en su repositorio de publicación.

## Edición

- `content/solara.json`: datos comerciales y configuración de publicación. El precio y su fecha proceden del brochure del 1 de septiembre de 2026; no representan una nueva verificación de disponibilidad.
- `src/index.html`: plantilla del contenido. `dist/styles.css` y `dist/site.js`: estilos e interacción de planos. Los enlaces a imágenes funcionan sin JavaScript.
- Ejecutar `node scripts/render.mjs` después de editar los datos o la plantilla. El resultado HTML completo se conserva en `dist/index.html`, junto a robots, sitemap y cabeceras.
- Ejecutar `node scripts/validate.mjs` para validar el contenido, metadatos, recursos y configuración de indexación. No requiere paquetes externos.

## Publicación

La versión inicial tiene `publicLaunch: false`, canonical de la URL privada, `noindex` en HTML y cabeceras, y sitemap vacío. La privacidad efectiva depende de los controles de acceso de Sites; `noindex` no es un control de acceso.

Solo después de autorizar el lanzamiento público:

1. Confirmar precio, fecha comercial, ubicación y URL pública. Actualizar `content/solara.json` con `publicOrigin` y `publicLaunch: true`.
2. Regenerar y validar. El render elimina `noindex`, cambia canonical e identificadores JSON-LD y publica una sola URL en sitemap. Robots permite a todos los rastreadores, incluidos Googlebot, Bingbot, OAI-SearchBot y Claude-SearchBot.
3. Publicar para la audiencia autorizada y comprobar respuesta 200 sin autenticación, bloqueos de CDN ni cabeceras heredadas de noindex. Redirigir otros dominios públicos si existieran.
4. Con acceso a las cuentas del cliente, verificar Google Search Console y Bing Webmaster Tools y enviar sitemap. Revisar indexación y apariciones en búsqueda; no asumir que las herramientas están conectadas.
5. Medir Core Web Vitals con tráfico real: objetivos p75 LCP ≤2.5 s, CLS ≤0.1 e INP ≤200 ms. Las pruebas estáticas no acreditan estas métricas ni garantizan posicionamiento o citas de IA.

## Recursos

Los renders originales y el brochure permanecen intactos en `assets/` (excluidos de Git). `dist/media/` contiene copias WebP optimizadas, los planos y un recorte del mapa suministrado. La fuente proviene de Google Fonts, familia Montserrat variable 100–900, subconjunto latino con español; licencia OFL en `dist/fonts/OFL.txt`.

No se incluyen captación, CRM, analítica, píxeles publicitarios, inventario, llms.txt ni una imagen social generada.
