# Boletín por email

El formulario "Recibí los nuevos informes por email" (en el pie de todas las páginas y en
Informes y Publicaciones) da de alta el correo en una lista de **Brevo** (plan gratuito: hasta
300 envíos por día, contactos ilimitados).

```
Formulario del sitio ──▶ /suscribir.php (cPanel) ──▶ API de Brevo
                                                       │ envía el email de confirmación
                                                       ▼
                         la persona confirma ──▶ queda en la lista ──▶ /boletin/confirmado/
```

La suscripción es con **doble confirmación**: nadie queda anotado sin hacer clic en el email que
recibe. Esto evita que se anoten direcciones ajenas y protege la reputación del dominio.

## Configuración (una sola vez)

1. Crear una cuenta en [brevo.com](https://www.brevo.com) con el correo institucional y
   **autenticar el dominio** `ippse.org.py` (Senders, Domains & Dedicated IPs → Domains): Brevo
   indica los registros DNS (SPF, DKIM, DMARC) que se cargan en la Zona DNS del cPanel.
2. **Contacts → Lists → Create a list**: por ejemplo "Boletín IPPSE". Anotar su número (ID).
3. **Campaigns → Templates → New template** de tipo **Double opt-in (DOI)**: el email que pide
   confirmar la suscripción. Anotar su número (ID).
4. **SMTP & API → API Keys → Generate a new API key**.
5. En cPanel, crear `/home/<usuario>/ippse-config/boletin.php` (al lado de `public_html`, no
   adentro), con permisos `600`:

   ```php
   <?php return [
     'api_key'        => 'xkeysib-...',
     'lista_id'       => 3,
     'plantilla_doi'  => 5,
     'url_confirmada' => 'https://ippse.org.py/boletin/confirmado/',
   ];
   ```

6. Probar: suscribirse desde el sitio con un correo propio, confirmar y verificar que aparezca
   en la lista de Brevo.

## Enviar un boletín

Como el IPPSE publica pocas veces al año, lo más simple es un envío manual por informe:
**Campaigns → Create an email campaign**, elegir la lista "Boletín IPPSE", y en el contenido
pegar el título, el extracto y el enlace al informe (la cita sugerida del sitio sirve como
referencia). Brevo agrega solo el enlace de baja que exige la ley.

## Mensajes del formulario

`suscribir.php` vuelve a la página de origen con `?boletin=…`:

| Valor        | Mensaje |
|--------------|---------|
| `pendiente`  | Te enviamos un email: confirmá la suscripción. |
| `invalido`   | El email no es válido. |
| `error`      | No se pudo registrar (falta la configuración o Brevo no respondió). |
