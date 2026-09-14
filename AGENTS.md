Todo apunta a #README.md, seguir instrucciones de allí.

El archivo /Users/valeriavichy/Documents/Agents/Virtuo/solara-website/assets/Brief Performance Solara — Meta Ads.pdf está excluido del sitio y del repositorio de publicación. El brochure comercial (assets/Solara brochure.pdf) sí se publica: scripts/render.mjs lo copia a dist/media/ para su descarga desde el hero, Viviendas, Amenidades y el footer.

El sitio sigue siendo una página de captación: su objetivo es motivar la descarga del PDF. Desde la v3, y por petición expresa del cliente, sí se publican el número de viviendas (14), el croquis de distribución del conjunto, el mapa de Google Maps y las referencias de puntos cercanos. Siguen fuera del sitio el precio, la superficie de construcción, los planos de la vivienda, la disponibilidad por lote y las preguntas frecuentes: ese detalle vive solo en el brochure y scripts/validate.mjs falla si reaparece.

Cada versión conserva su propio enlace de GitHub Pages: main se publica en la raíz y las ramas version-1, version-2 y version-3 en /v1/, /v2/ y /v3/. Antes de fusionar una versión nueva a main, crear su rama version-N.
