# L2 Intratables — sitio web

Sitio estático para GitHub Pages (Lineage II Interlude C6). Incluye el primer álbum público de Multimedia: “Raids Custom Drop (Armas, Accesorios, Joyería)”, con dos capturas.

## Páginas
- `index.html`: portada.
- `information.html`: rates y sistemas del servidor.
- `downloads.html`: cliente y parche.
- `multimedia.html`: galería pública y vista previa local de álbumes.
- `rules.html`: reglas de la comunidad.
- `register.html`: información sobre el registro de cuentas.

## Publicar un álbum en Multimedia
La web estática no puede subir archivos al repositorio por sí sola. Para que un álbum sea público:
1. Creá una carpeta, por ejemplo `assets/albums/asedio-giran-2026/`.
2. Agregá las fotos `.jpg`, `.png` o `.webp` a esa carpeta.
3. Editá `assets/albums/albums.json` y agregá una entrada con rutas relativas. Ejemplo:

```json
{
  "albums": [
    {
      "title": "Asedio de Giran",
      "category": "eventos",
      "date": "2026-10-19",
      "cover": "assets/albums/asedio-giran-2026/cover.jpg",
      "photos": [
        "assets/albums/asedio-giran-2026/cover.jpg",
        "assets/albums/asedio-giran-2026/foto-02.jpg"
      ]
    }
  ]
}
```

Categorías disponibles: `pvp`, `eventos`, `comunidad`. Las rutas deben coincidir exactamente con los nombres de archivo (incluidas mayúsculas/minúsculas).

La herramienta de “Preparar un álbum” de la página Multimedia solo previsualiza las imágenes en tu navegador; no las publica automáticamente. Para subir álbumes desde un panel web real hace falta un backend o una integración segura con GitHub autenticada en el servidor.

## Registro de cuentas
GitHub Pages sirve archivos estáticos y no puede crear cuentas de juego directamente. `register.html` explica esa limitación; para habilitar registros hay que conectar un sistema de cuentas/backend real. No se deben poner credenciales o tokens de GitHub en JavaScript del navegador.
