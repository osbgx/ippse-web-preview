<?php
/**
 * Protección anti-abuso compartida por los formularios (enviar.php, suscribir.php).
 * No se sirve por la web: .htaccess bloquea los *.inc.php.
 *
 * Capas, de la más barata a la más fuerte:
 *   1. Trampa (campo oculto "sitio_web"): la completa un bot, nunca una persona.
 *   2. Tiempo mínimo: el formulario guarda cuándo se abrió; un envío en menos de
 *      3 segundos es automático.
 *   3. Límite por IP: N envíos por hora (contador en disco, fuera de public_html).
 *   4. Contenido: demasiados enlaces en el mensaje = spam.
 *   5. Cloudflare Turnstile (opcional): solo si existe ippse-config/turnstile.php.
 */

/** Carpeta privada para contadores (al lado de public_html). */
function ippse_carpeta_datos(): string {
    $dir = dirname(__DIR__) . '/ippse-datos/limites';
    if (!is_dir($dir) && !@mkdir($dir, 0700, true)) $dir = sys_get_temp_dir() . '/ippse-limites';
    if (!is_dir($dir)) @mkdir($dir, 0700, true);
    return $dir;
}

/** IP del visitante (Cloudflare o directa). Solo se guarda su hash. */
function ippse_ip(): string {
    return $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'desconocida';
}

/** true si es un bot evidente (trampa completa o envío demasiado rápido). */
function ippse_es_bot(): bool {
    if (!empty($_POST['sitio_web'])) return true;
    $abierto = (int) ($_POST['abierto'] ?? 0); // milisegundos (lo pone el navegador)
    if ($abierto > 0 && (microtime(true) * 1000 - $abierto) < 3000) return true;
    return false;
}

/**
 * Límite de envíos por IP en una ventana de tiempo. Devuelve false si se superó.
 * Ejemplo: ippse_dentro_del_limite('contacto', 5, 3600) -> 5 envíos por hora.
 */
function ippse_dentro_del_limite(string $accion, int $maximo, int $ventana): bool {
    $archivo = ippse_carpeta_datos() . '/' . $accion . '-' . hash('sha256', ippse_ip() . $accion) . '.json';
    $ahora = time();
    $marcas = [];
    if (is_readable($archivo)) {
        $marcas = json_decode((string) file_get_contents($archivo), true) ?: [];
    }
    $marcas = array_values(array_filter($marcas, fn($t) => $t > $ahora - $ventana));
    if (count($marcas) >= $maximo) return false;
    $marcas[] = $ahora;
    @file_put_contents($archivo, json_encode($marcas), LOCK_EX);
    return true;
}

/** true si el texto parece spam (muchos enlaces). */
function ippse_parece_spam(string $texto): bool {
    return preg_match_all('#https?://|www\.#i', $texto) > 3;
}

/**
 * Cloudflare Turnstile (opcional). Si no está configurado, no bloquea.
 *   /home/<usuario>/ippse-config/turnstile.php -> <?php return ['secreto' => '0x...'];
 */
function ippse_turnstile_valido(): bool {
    $ruta = dirname(__DIR__) . '/ippse-config/turnstile.php';
    if (!is_readable($ruta)) return true;
    $config = require $ruta;
    if (empty($config['secreto'])) return true;
    $token = (string) ($_POST['cf-turnstile-response'] ?? '');
    if ($token === '') return false;
    $ch = curl_init('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_POSTFIELDS => http_build_query([
            'secret' => $config['secreto'],
            'response' => $token,
            'remoteip' => ippse_ip(),
        ]),
    ]);
    $respuesta = json_decode((string) curl_exec($ch), true);
    curl_close($ch);
    return !empty($respuesta['success']);
}
