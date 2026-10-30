# Assets descargados de power-paraguay-link.base44.app

Estas imagenes se descargaron del sitio de referencia para uso en el proyecto IPPSE.

## Imagenes principales (webp optimizado, 1200px max)

| Archivo | Uso sugerido | Alt text | Dimensiones originales |
|---|---|---|---|
| `22a32298a_generated_43a648f3.webp` | Fondo hero / banner principal | Líneas de transmisión | 1536x1024 |
| `390840802_generated_d56ac8c6.webp` | Card de informe / sección técnica | Sala de control eléctrico | 1536x1024 |
| `726c04d4d_generated_f07a7368.webp` | Card de informe / sección energética | Represa de Itaipú al atardecer | 1024x1024 |

## Thumbnails (600x600, webp)

- `*-thumb.webp`: versiones recortadas cuadradas para cards y galerías.

## Logo

- `f7f3071c4_logo.png`: logo oficial del IPPSE (180x180, descargado del sitio de referencia).
- `logo-ippse-64/128/256.png`: versiones recortadas del logo para uso en distintos contextos.
- `12d367_4f26ccd17f8f4e3a8958306ea08c2332.png`: fallback del componente ResponsiveImage del sitio de referencia (1920x1080).

## Uso en Astro

```astro
---
import { Image } from 'astro:assets';
import heroImg from '../assets/power-paraguay/22a32298a_generated_43a648f3.webp';
---
<Image src={heroImg} alt="Líneas de transmisión" width={1200} height={800} />
```

O directamente con img:
```html
<img src="/assets/power-paraguay/22a32298a_generated_43a648f3.webp" alt="Líneas de transmisión" loading="lazy" />
```
