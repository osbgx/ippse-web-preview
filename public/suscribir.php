<?php
/**
 * Suscripción al boletín del IPPSE ("Recibí los nuevos informes por email").
 *
 * Recibe el formulario del sitio y da de alta el correo en una lista de Brevo con
 * DOBLE CONFIRMACIÓN: Brevo envía un email y la persona queda suscripta recién al
 * hacer clic. Así nadie puede anotar direcciones ajenas, y la lista cumple con las
 * buenas prácticas antispam.
 *
 * La clave de la API NO vive aquí: se lee de un archivo FUERA de public_html.
 *
 *   /home/<usuario>/ippse-config/boletin.php
 *   <?php return [
 *     'api_key'        => 'xkeysib-...',   // Brevo > SMTP & API > API Keys
 *     'lista_id'       => 3,               // Brevo > Contacts > Lists (número de la lista)
 *     'plantilla_doi'  => 5,               // plantilla de confirmación (tipo "Double opt-in")
 *     'url_confirmada' => 'https://ippse.org.py/boletin/confirmado/',
 *   ];
 *
 * Ver docs/boletin.md.
 */

function volver(string $estado): void {
    // Vuelve a la página desde la que se envió el formulario (solo rutas del propio sitio).
    $origen = $_POST['origen'] ?? '/';
    if (!is_string($origen) || !preg_match('#^/[^/\\\\]#', $origen . 'x')) $origen = '/';
    $origen = strtok($origen, '?#');
    header("Location: $origen?boletin=$estado#boletin", true, 303);
    exit;
}

require __DIR__ . '/proteccion.inc.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') volver('error');

// Bots evidentes: se finge éxito y no se hace nada. Hasta 3 suscripciones por hora por conexión.
if (ippse_es_bot()) volver('pendiente');
if (!ippse_dentro_del_limite('boletin', 3, 3600)) volver('limite');

$email = trim((string) ($_POST['email'] ?? ''));
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 160) volver('invalido');

$rutaConfig = dirname(__DIR__) . '/ippse-config/boletin.php';
if (!is_readable($rutaConfig)) volver('error');
$config = require $rutaConfig;

$ch = curl_init('https://api.brevo.com/v3/contacts/doubleOptinConfirmation');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_HTTPHEADER => [
        'accept: application/json',
        'content-type: application/json',
        'api-key: ' . $config['api_key'],
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'email' => $email,
        'includeListIds' => [(int) $config['lista_id']],
        'templateId' => (int) $config['plantilla_doi'],
        'redirectionUrl' => $config['url_confirmada'],
    ]),
]);
curl_exec($ch);
$estado = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// 201: email de confirmación enviado. 204: el contacto ya existía (se actualiza).
volver(in_array($estado, [201, 204], true) ? 'pendiente' : 'error');
