<?php
/**
 * Webhook del repositorio de documentos -> recompilación automática del sitio.
 *
 * GitHub llama a esta URL en cada push al repositorio de contenido (configurado en
 * Settings > Webhooks del repositorio de documentos: no requiere ningún archivo en
 * ese repositorio, que queda solo con Markdown). Este script:
 *   1. Verifica la firma HMAC del aviso (X-Hub-Signature-256) con el secreto compartido.
 *   2. Comprueba que sea un push a la rama publicada del repositorio esperado.
 *   3. Pide al repositorio (privado) del sitio que se recompile, con un
 *      repository_dispatch "contenido-actualizado" (ver .github/workflows/publicar.yml).
 *
 * Los secretos NO viven aquí: se leen de un archivo FUERA de public_html, que no se
 * sube con el sitio. Ver docs/publicacion-automatica.md.
 *
 *   /home/<usuario>/ippse-config/webhook.php
 *   <?php return [
 *     'secreto'    => '...',            // el mismo "Secret" cargado en el webhook de GitHub
 *     'token'      => 'github_pat_...', // token fino con permiso "Contents: write" SOLO sobre el repo del sitio
 *     'repo_sitio' => 'usuario/ippse-web',
 *     'repo_docs'  => 'usuario/ippse-documentos',
 *     'rama'       => 'main',
 *   ];
 */

header('Content-Type: text/plain; charset=utf-8');

function responder(int $codigo, string $mensaje): void {
    http_response_code($codigo);
    echo $mensaje . "\n";
    exit;
}

$rutaConfig = dirname(__DIR__) . '/ippse-config/webhook.php';
if (!is_readable($rutaConfig)) responder(500, 'Webhook sin configurar.');
$config = require $rutaConfig;
foreach (['secreto', 'token', 'repo_sitio', 'repo_docs'] as $clave) {
    if (empty($config[$clave])) responder(500, "Falta '$clave' en la configuración.");
}
$rama = $config['rama'] ?? 'main';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') responder(405, 'Solo POST.');

// 1. Firma: sin ella, cualquiera podría disparar compilaciones.
$cuerpo = file_get_contents('php://input') ?: '';
$firma = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
$esperada = 'sha256=' . hash_hmac('sha256', $cuerpo, $config['secreto']);
if (!hash_equals($esperada, $firma)) responder(401, 'Firma inválida.');

// 2. Solo pushes a la rama publicada del repositorio de documentos.
$evento = $_SERVER['HTTP_X_GITHUB_EVENT'] ?? '';
if ($evento === 'ping') responder(200, 'pong');
if ($evento !== 'push') responder(202, "Evento '$evento' ignorado.");

$datos = json_decode($cuerpo, true);
if (($datos['repository']['full_name'] ?? '') !== $config['repo_docs']) responder(202, 'Repositorio ignorado.');
if (($datos['ref'] ?? '') !== "refs/heads/$rama") responder(202, 'Rama ignorada.');

// 3. Pedir la recompilación del sitio.
$ch = curl_init("https://api.github.com/repos/{$config['repo_sitio']}/dispatches");
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_HTTPHEADER => [
        'Accept: application/vnd.github+json',
        'Authorization: Bearer ' . $config['token'],
        'User-Agent: ippse-webhook',
        'X-GitHub-Api-Version: 2022-11-28',
        'Content-Type: application/json',
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'event_type' => 'contenido-actualizado',
        'client_payload' => ['commit' => $datos['after'] ?? null],
    ]),
]);
curl_exec($ch);
$estado = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// GitHub responde 204 cuando acepta el pedido.
if ($estado !== 204) responder(502, "GitHub rechazó el pedido de compilación (HTTP $estado).");
responder(200, 'Compilación solicitada.');
