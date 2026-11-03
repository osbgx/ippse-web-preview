<?php
/**
 * Procesa el formulario de /contacto/ en cPanel (PHP estándar, sin dependencias).
 * Envía el mensaje por correo y redirige de vuelta con ?enviado=1 o ?error=1.
 */

require __DIR__ . '/proteccion.inc.php';

// Buzón que recibe los mensajes y remitente del propio dominio (requerido por SPF/DKIM).
// Se pueden cambiar sin tocar este archivo en /home/<usuario>/ippse-config/contacto.php:
//   <?php return ['destino' => 'contacto@ippse.org.py', 'remitente' => 'web@ippse.org.py'];
$configContacto = is_readable(dirname(__DIR__) . '/ippse-config/contacto.php')
    ? (require dirname(__DIR__) . '/ippse-config/contacto.php')
    : [];
define('DESTINO', $configContacto['destino'] ?? 'contacto@ippse.org.py');
define('REMITENTE', $configContacto['remitente'] ?? 'web@ippse.org.py');

/** Vuelve a la página de contacto desde la que se envió (es, en o pt) con el resultado. */
function volver(string $estado): void {
    $origen = (string) parse_url($_SERVER['HTTP_REFERER'] ?? '', PHP_URL_PATH);
    $pagina = preg_match('#^(/[a-z0-9-]+)?/(en/|pt/)?contacto/$#', $origen) ? $origen : '/contacto/';
    header("Location: $pagina?$estado=1#formulario", true, 303);
    exit;
}

function limpiar(string $clave, int $max): string {
    $valor = trim((string) ($_POST[$clave] ?? ''));
    // Sin saltos de línea en campos de una línea: evita inyección de cabeceras
    if ($clave !== 'mensaje') $valor = preg_replace('/[\r\n]+/', ' ', $valor);
    return mb_substr($valor, 0, $max);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') volver('error');

// Bots evidentes (trampa o envío instantáneo): se finge éxito y no se envía nada,
// así no aprenden a esquivar la protección.
if (ippse_es_bot()) volver('enviado');
if (!ippse_turnstile_valido()) volver('error');
// Hasta 5 mensajes por hora desde la misma conexión.
if (!ippse_dentro_del_limite('contacto', 5, 3600)) volver('limite');

$nombre = limpiar('nombre', 120);
$email = limpiar('email', 160);
$mensaje = limpiar('mensaje', 5000);

if ($nombre === '' || $mensaje === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) volver('error');
if (ippse_parece_spam($mensaje)) volver('enviado');

$asunto = 'Consulta';
$cuerpo = "Nombre: $nombre\nEmail: $email\n\nMensaje:\n$mensaje\n";

$cabeceras = implode("\r\n", [
    'From: IPPSE Web <' . REMITENTE . '>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
]);

$ok = mail(DESTINO, '=?UTF-8?B?' . base64_encode("[Web IPPSE] $asunto — $nombre") . '?=', $cuerpo, $cabeceras);
volver($ok ? 'enviado' : 'error');
