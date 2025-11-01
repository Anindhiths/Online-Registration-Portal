<?php
header("Content-Type: text/html; charset=utf-8");

// Helper: Validate input
function isValidEmail($e) { return filter_var($e, FILTER_VALIDATE_EMAIL) !== false; }
function isValidName($n) { return strlen($n) >= 3 && strlen($n) <= 32; }
function isValidPassword($p) { return strlen($p) >= 6; }

$name = isset($_POST['name']) ? htmlspecialchars(trim($_POST['name'])) : '';
$email = isset($_POST['email']) ? htmlspecialchars(trim($_POST['email'])) : '';
$psw = isset($_POST['psw']) ? htmlspecialchars($_POST['psw']) : '';

if (!isValidName($name)) {
  echo "<div class='error'>Server: Invalid name.</div>"; exit();
}
if (!isValidEmail($email)) {
  echo "<div class='error'>Server: Invalid email format.</div>"; exit();
}
if (!isValidPassword($psw)) {
  echo "<div class='error'>Server: Weak password.</div>"; exit();
}

// ===== Upstash (PHP cURL) =====
$redis_url = getenv('UPSTASH_URL');
$redis_token = getenv('UPSTASH_TOKEN');
$timestamp = date('Ymd_His');
$key = 'user:' . strtolower(preg_replace('/[^a-zA-Z0-9]/', '_', $name)) . ":" . $timestamp;
$payload = json_encode([
  "name" => $name,
  "email" => $email,
  "created_at" => date("Y-m-d H:i:s")
]);

if ($redis_url && $redis_token) {
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $redis_url . "/set/" . urlencode($key) . "/" . urlencode($payload));
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer " . $redis_token]);
  curl_exec($ch); // Not checking result for brevity
  curl_close($ch);
}

// Output formatted confirmation with CSS classes
echo "<h2>✅ Registered Successfully!</h2>";
echo "<div><b>Name:</b> <span style='color:#3b3b5b;'>$name</span></div>";
echo "<div><b>Email:</b> <span style='color:#5272f1;'>$email</span></div>";
echo "<div><b>Registered at:</b> " . date("d M Y, H:i") . "</div>";
?>
