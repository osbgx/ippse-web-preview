# Pendientes del sitio IPPSE

Lista viva de configuraciones, datos y decisiones que faltan para publicar. Marcar con `[x]` al
completar. Lo técnico ya está hecho en el código: esto es lo que requiere cuentas, accesos,
datos del cliente o una decisión.

## Antes de publicar

### Repositorios y GitHub
- [ ] Subir `contenido-local/` al repositorio de documentos (`ippse-documentos`), incluidas las
      carpetas nuevas: `contenido/prensa/`, `contenido/institucional/`, `contenido/glosario/`,
      `contenido/preguntas-frecuentes/`.
- [ ] Subir los cambios del informe 2/26 (`US\$` y `(\*)`) al repositorio de documentos (van con el punto anterior).
- [ ] Subir el código del sitio y pasar el repositorio a **privado**.
- [ ] Borrar `PUBLIC_DOCS_LOCAL=1` del `.env` local cuando el contenido esté en GitHub.
- [ ] Decidir el dueño definitivo de ambos repositorios (cuenta u organización del IPPSE) y
      actualizar `PUBLIC_DOCS_REPO`.

### Publicación automática — guía: `docs/publicacion-automatica.md`
- [ ] Secretos FTP en el repo del sitio: `FTP_SERVIDOR`, `FTP_USUARIO`, `FTP_CLAVE` (opcional `FTP_DIRECTORIO`).
- [ ] Variables: `PUBLICAR_CPANEL=true`, `URL_SITIO`, `PUBLIC_DOCS_REPO`; `PUBLICAR_PAGES=false` al pasar a privado.
- [ ] Token fino de GitHub (solo repo del sitio, *Contents: write*). Anotar fecha de vencimiento: ____.
- [ ] Crear `/home/<usuario>/ippse-config/webhook.php` en cPanel (fuera de `public_html`, permisos 600).
- [ ] Webhook en el repo de documentos → `https://ippse.org.py/webhook-contenido.php` (solo *push*).
- [ ] Verificar: editar un `.md` y comprobar que la web se actualiza y cambia `/contenido-version.txt`.
- [ ] Confirmar que el hosting admite FTPS (si no, `protocol: ftp` en el workflow).
- [ ] Token fino `DOCS_ISSUES_TOKEN` (solo repo de documentos, *Issues: write*) para el aviso de
      archivos con errores. Anotar fecha de vencimiento: ____.
- [ ] Activar las notificaciones por email de GitHub ("Watching") en el repo de documentos para
      quien cargue el contenido.

### Boletín (Brevo) — guía: `docs/boletin.md`
- [ ] Crear la cuenta de Brevo con el correo institucional.
- [ ] Autenticar el dominio `ippse.org.py` (SPF, DKIM, DMARC en la Zona DNS de cPanel).
- [ ] Crear la lista "Boletín IPPSE" y la plantilla de doble confirmación; anotar sus IDs.
- [ ] Crear `/home/<usuario>/ippse-config/boletin.php` con la API key.
- [ ] Probar una suscripción completa con un correo propio.

### Formulario de contacto
- [ ] Confirmar el buzón que recibe los mensajes y el remitente del dominio (requerido por SPF/DKIM):
      en `/home/<usuario>/ippse-config/contacto.php` (`destino`, `remitente`) o en `public/enviar.php`.
- [ ] (Opcional, si llega spam) Cloudflare Turnstile: variable `PUBLIC_TURNSTILE_SITEKEY` y
      `/home/<usuario>/ippse-config/turnstile.php` con la clave secreta.
- [ ] Verificar en el hosting que PHP pueda crear `/home/<usuario>/ippse-datos/` (contadores del
      límite de envíos); si no, usa la carpeta temporal del sistema.

### Estadísticas (Umami)
- [ ] Elegir Umami Cloud (gratis hasta 100.000 eventos/mes) o una instalación propia.
- [ ] Cargar `PUBLIC_UMAMI_SRC` y `PUBLIC_UMAMI_ID` (Variables del repo): el script, la CSP y la
      política de privacidad se ajustan solos.

### Seguridad
- [ ] Al publicar, revisar la nota en securityheaders.com y que ninguna página quede bloqueada por
      la Content-Security-Policy (consola del navegador).

### Datos del cliente
- [ ] Teléfono real (hoy `+595 21 000 000`, de ejemplo) → `PUBLIC_IPPSE_TELEFONO`.
- [ ] Enlace real del canal de WhatsApp → `PUBLIC_IPPSE_WHATSAPP`.
- [ ] Dirección física → `PUBLIC_IPPSE_DIRECCION`.
- [ ] Redes sociales (Facebook, Instagram, LinkedIn, X, YouTube) → `PUBLIC_IPPSE_*`.
- [ ] Contacto de prensa (si es distinto del general) → `PUBLIC_IPPSE_EMAIL_PRENSA`, `PUBLIC_IPPSE_TELEFONO_PRENSA`.
- [ ] Foto oficial del presidente para el kit de prensa → `fotoPresidente` en `src/data/institucion.ts`.

## Contenido para revisar con el IPPSE
- [ ] Aprobar los textos nuevos redactados para el sitio: políticas (privacidad, accesibilidad,
      términos), definiciones del glosario, respuestas de la FAQ y el boilerplate del kit de prensa.
- [ ] Revisión legal de la política de privacidad y los términos de uso.
- [ ] Confirmar si "MIC insiste en industrializar…" y "Perspectivas divergentes…" (22/10/2026)
      citan el Informe 2/26: si es así, agregarles `informes: ["informe-2-26"]`.
- [ ] Documento de prueba "Documento de referencia: formato Markdown admitido": no publicarlo
      (renombrar con `_` adelante o sacarlo del repositorio de documentos).
- [ ] Fecha del Código de Ética (el original escaneado no la tiene).
- [ ] Auditoría de accesibilidad formal si se quiere declarar conformidad total con WCAG 2.2 AA
      (hoy la declaración dice "parcialmente conforme").

### Socios
- [ ] Cargar el directorio de socios (`contenido/socios/`, ver `_LEEME.md`) solo con quienes
      autoricen por escrito figurar. Mientras esté vacío, `/socios/` muestra requisitos y proceso.
- [ ] Formulario de afiliación en PDF (no existe): si el IPPSE lo tiene, agregarlo como descarga en `/socios/`.

### Datos
- [ ] Datos de demanda 2020-2025 y requerimientos anuales (Informe Parte I): pasar el informe para
      sumar esos gráficos a `/datos/` (`contenido/datos/`).

### Archivo de informes
- [ ] Reunir los informes y artículos anteriores del IPPSE (desde 1993) para cargarlos en
      `contenido/publicaciones/`. El listado ya filtra por categoría y año.

## Mejoras a considerar
- [ ] Versión en inglés (o portugués) de Inicio, Nosotros y los resúmenes de informes
      (decidido: no por ahora).
- [ ] Redirecciones si alguna vez se publicaron las páginas de apariciones en medios
      (`/prensa/<id>/` de notas externas), que ya no se generan.
- [ ] Mover los PDFs institucionales (`public/documentos/`) al repositorio de documentos, para
      que también se actualicen sin tocar el código.
