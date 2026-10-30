# Publicación automática del contenido

El contenido del sitio (informes, prensa, glosario, preguntas frecuentes y documentos
institucionales) vive en el **repositorio de documentos**, que tiene solo Markdown y adjuntos.
El código del sitio vive en este repositorio, que puede ser **privado**.

Cuando alguien sube o edita un `.md` en el repositorio de documentos, la web se actualiza sola
en 2-3 minutos. Nadie tiene que compilar a mano.

```
Repositorio de documentos ──push──▶ Webhook de GitHub (ajuste del repo, no un archivo)
                                         │
                                         ▼
                      https://ippse.org.py/webhook-contenido.php   (cPanel)
                                         │  verifica la firma y pide la recompilación
                                         ▼
                Repositorio del sitio: workflow "Publicar sitio" (GitHub Actions)
                                         │  npm run build (lee el contenido de GitHub)
                                         ▼
                              Sube dist/ a public_html por FTP
```

Como respaldo, el mismo workflow revisa **cada hora** si el último commit de documentos es
distinto del publicado (`/contenido-version.txt`) y, solo en ese caso, recompila. Si un aviso del
webhook se pierde, la web igual se actualiza en menos de una hora.

## Costo

GitHub Actions es gratis en repositorios privados hasta **2.000 minutos por mes** (plan Free).
- Cada publicación: 2-3 minutos.
- Revisión horaria: ~1 minuto por ejecución (GitHub redondea al minuto) → ~720 minutos/mes.

Sobra margen para decenas de publicaciones por mes. Si hiciera falta ahorrar, se puede espaciar
la revisión (`cron` en `.github/workflows/publicar.yml`) a cada 3 o 6 horas: el webhook sigue
siendo inmediato.

---

## Configuración (una sola vez)

### 1. Repositorio del sitio: secretos y variables

En **Settings → Secrets and variables → Actions** del repositorio del sitio:

**Secrets**

| Nombre           | Valor |
|------------------|-------|
| `FTP_SERVIDOR`   | Servidor FTP del cPanel (p. ej. `ftp.ippse.org.py`). |
| `FTP_USUARIO`    | Usuario FTP. Conviene crear uno propio en cPanel limitado a `public_html`. |
| `FTP_CLAVE`      | Contraseña de ese usuario. |
| `FTP_DIRECTORIO` | (Opcional) Carpeta destino. Por defecto `public_html/`. |

**Variables**

| Nombre             | Valor |
|--------------------|-------|
| `PUBLICAR_CPANEL`  | `true` para publicar en cPanel. |
| `PUBLICAR_PAGES`   | `false` para dejar de publicar en GitHub Pages (con el repo privado, Pages pide plan pago). |
| `URL_SITIO`        | `https://ippse.org.py` (la revisión horaria lee `/contenido-version.txt` de ahí). |
| `PUBLIC_DOCS_REPO` | `usuario/ippse-documentos` (repositorio de contenido). |
| `PUBLIC_IPPSE_*`   | Datos de contacto y redes (ver `.env.example`). |

El workflow usa FTPS (FTP cifrado). Si el hosting no lo admite, cambiar `protocol: ftps` por
`protocol: ftp` en `.github/workflows/publicar.yml`.

### 2. Token para que el webhook pueda pedir la compilación

En GitHub: **Settings (de la cuenta) → Developer settings → Personal access tokens →
Fine-grained tokens → Generate new token**.

- **Repository access:** *Only select repositories* → solo el repositorio **del sitio**.
- **Permissions:** *Contents: Read and write* (es el permiso que exige `repository_dispatch`).
- **Expiration:** la máxima que permita la organización; anotar la fecha para renovarlo.

Este token solo sirve para disparar compilaciones del sitio: no da acceso al repositorio de
documentos ni a otros repositorios.

### 3. Configuración del webhook en cPanel (fuera de `public_html`)

Con el Administrador de archivos de cPanel, crear `/home/<usuario>/ippse-config/webhook.php`
(una carpeta **al lado** de `public_html`, no adentro, para que nunca se sirva por la web):

```php
<?php return [
  'secreto'    => 'una-frase-larga-y-aleatoria',   // la misma del paso 4
  'token'      => 'github_pat_...',                // el token del paso 2
  'repo_sitio' => 'usuario/ippse-web',
  'repo_docs'  => 'usuario/ippse-documentos',
  'rama'       => 'main',
];
```

Permisos recomendados del archivo: `600`.

### 4. Webhook en el repositorio de documentos

En el repositorio de documentos: **Settings → Webhooks → Add webhook**.

| Campo            | Valor |
|------------------|-------|
| Payload URL      | `https://ippse.org.py/webhook-contenido.php` |
| Content type     | `application/json` |
| Secret           | la misma frase de `secreto` del paso 3 |
| Events           | *Just the push event* |

Al guardarlo, GitHub envía un `ping`: en **Recent Deliveries** debe verse respuesta `200 pong`.

---

### 5. Aviso de archivos con errores

Si un `.md` tiene la cabecera mal escrita (un campo obligatorio vacío, una fecha con otro formato…),
el build **omite solo ese archivo** y publica todo lo demás. Para que quien lo subió se entere, el
workflow abre un *issue* en el repositorio de documentos con el archivo y qué corregir. GitHub lo
notifica por email; cuando se corrige, el aviso se cierra solo.

Crear un segundo token fino: **Repository access:** solo el repositorio **de documentos**;
**Permissions:** *Issues: Read and write*. Cargarlo como secreto `DOCS_ISSUES_TOKEN` en el
repositorio del sitio. Sin este token, los errores solo se ven en el registro de Actions.

## Verificación

1. Editar cualquier `.md` en el repositorio de documentos y guardar (commit a `main`).
2. En el webhook → **Recent Deliveries**: respuesta `200 Compilación solicitada.`
3. En el repositorio del sitio → **Actions**: aparece "Publicar sitio" disparado por
   `repository_dispatch`.
4. A los 2-3 minutos, el cambio está en la web, y `https://ippse.org.py/contenido-version.txt`
   muestra el commit nuevo.

## Problemas frecuentes

| Respuesta del webhook | Causa |
|---|---|
| `401 Firma inválida.` | El *Secret* del webhook no coincide con `secreto`. |
| `500 Webhook sin configurar.` | No existe `ippse-config/webhook.php` o no está al lado de `public_html`. |
| `502 … (HTTP 401/403/404)` | Token vencido, sin permiso *Contents: write* o `repo_sitio` mal escrito. |
| `202 Rama ignorada.` | El push fue a otra rama: solo publica `main` (o la `rama` configurada). |

Si el webhook falla, la revisión horaria publica igual el cambio. También se puede forzar una
publicación desde **Actions → Publicar sitio → Run workflow**.
