<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

const BOOKING_TO = '';

function fail(int $code, string $reason): void
{
    http_response_code($code);
    echo json_encode(['ok' => false, 'reason' => $reason]);
    exit;
}

if (BOOKING_TO === '' || filter_var(BOOKING_TO, FILTER_VALIDATE_EMAIL) === false) {
    fail(503, 'unconfigured');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail(405, 'method');
}

$company = trim((string) ($_POST['company'] ?? ''));
if ($company !== '') {
    fail(400, 'rejected');
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));
$date = trim((string) ($_POST['date'] ?? ''));
$location = trim((string) ($_POST['location'] ?? ''));
$rawTypes = $_POST['type'] ?? [];
if (!is_array($rawTypes)) {
    $rawTypes = [];
}
$allowed = ['fashion', 'portraits', 'model', 'bridal', 'couples', 'events', 'business', 'other'];
$types = array_values(array_intersect(array_map('strval', $rawTypes), $allowed));

if ($name === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false || $message === '' || $types === []) {
    fail(400, 'invalid');
}

if (preg_match('/[\r\n]/', $name . $email) === 1) {
    fail(400, 'invalid');
}

$ip = (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
$bucket = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'tc-book-' . hash('sha256', $ip);
$now = time();
$hits = [];
if (is_file($bucket)) {
    $decoded = json_decode((string) file_get_contents($bucket), true);
    if (is_array($decoded)) {
        $hits = $decoded;
    }
}
$hits = array_values(array_filter($hits, static function ($stamp) use ($now): bool {
    return is_int($stamp) && $stamp > $now - 3600;
}));
if (count($hits) >= 5) {
    fail(429, 'rate');
}
$hits[] = $now;
file_put_contents($bucket, json_encode($hits), LOCK_EX);

$body = "Name: {$name}\nEmail: {$email}\nTypes: " . implode(', ', $types) . "\nDate: {$date}\nLocation: {$location}\n\n{$message}\n";
$headers = 'Reply-To: ' . $email . "\r\nContent-Type: text/plain; charset=UTF-8";
$sent = mail(BOOKING_TO, 'Shoot enquiry', $body, $headers);
if ($sent !== true) {
    fail(500, 'mail');
}

echo json_encode(['ok' => true]);
