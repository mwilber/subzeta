<?php

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function send_json(int $statusCode, array $body): void
{
	http_response_code($statusCode);
	echo json_encode($body);
	exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	send_json(405, ['ok' => false, 'error' => 'Method not allowed.']);
}

$rawBody = file_get_contents('php://input');
$body = json_decode($rawBody ?: '{}', true);
if (!is_array($body)) {
	send_json(400, ['ok' => false, 'error' => 'Invalid JSON.']);
}

$text = trim((string)($body['text'] ?? ''));
$selmaBaseUrl = rtrim((string)($body['selmaBaseUrl'] ?? ''), '/');
$selmaApiToken = (string)($body['selmaApiToken'] ?? '');

if ($text === '') {
	send_json(400, ['ok' => false, 'error' => 'Text is required.']);
}

if ($selmaBaseUrl === '' || $selmaApiToken === '') {
	send_json(400, ['ok' => false, 'error' => 'SELMA settings are missing.']);
}

$parts = parse_url($selmaBaseUrl);
if (!is_array($parts) || !in_array($parts['scheme'] ?? '', ['http', 'https'], true) || empty($parts['host'])) {
	send_json(400, ['ok' => false, 'error' => 'SELMA base URL is invalid.']);
}

$payload = json_encode([
	'transcript' => 'Music player request: ' . $text,
	'source' => 'subzeta',
	'metadata' => [
		'submitted_at' => gmdate('c'),
	],
]);

if ($payload === false) {
	send_json(500, ['ok' => false, 'error' => 'Could not encode SELMA request.']);
}

$url = $selmaBaseUrl . '/api/agent-runs';
$headers = [
	'Authorization: Bearer ' . $selmaApiToken,
	'Content-Type: application/json',
];

if (function_exists('curl_init')) {
	$curl = curl_init($url);
	curl_setopt_array($curl, [
		CURLOPT_POST => true,
		CURLOPT_HTTPHEADER => $headers,
		CURLOPT_POSTFIELDS => $payload,
		CURLOPT_RETURNTRANSFER => true,
		CURLOPT_HEADER => false,
		CURLOPT_TIMEOUT => 30,
	]);
	$responseBody = curl_exec($curl);
	$statusCode = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
	$error = curl_error($curl);
	curl_close($curl);
} else {
	$context = stream_context_create([
		'http' => [
			'method' => 'POST',
			'header' => implode("\r\n", $headers),
			'content' => $payload,
			'ignore_errors' => true,
			'timeout' => 30,
		],
	]);
	$responseBody = file_get_contents($url, false, $context);
	$statusCode = 0;
	$error = '';
	if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', $http_response_header[0], $matches)) {
		$statusCode = (int)$matches[1];
	}
}

if ($responseBody === false || $statusCode < 200 || $statusCode >= 300) {
	send_json(502, [
		'ok' => false,
		'error' => $error !== '' ? $error : 'SELMA request failed.',
		'status' => $statusCode,
	]);
}

send_json(200, ['ok' => true]);
