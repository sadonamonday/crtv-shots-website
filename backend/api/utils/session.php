<?php
// Centralized session bootstrap with proper cookie settings for cross-site credentials
// Include this file instead of calling session_start() directly.

// Determine if HTTPS is used
$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443);

// Configure session cookie parameters
// Note: For SameSite=None to work, the cookie must be Secure=true. Browsers will ignore it otherwise.
$cookieParams = [
    'lifetime' => 0,                   // Session cookie
    'path' => '/',
    'domain' => '',                    // Default current host
    'secure' => $https,                // Only send over HTTPS
    'httponly' => true,
    'samesite' => $https ? 'None' : 'Lax', // Cross-site only if HTTPS; fallback to Lax in dev HTTP
];

// If PHP < 7.3, session_set_cookie_params does not accept array. Most modern envs support it;
// additionally, set INI directives for broader compatibility.
@ini_set('session.cookie_httponly', '1');
@ini_set('session.use_strict_mode', '1');
@ini_set('session.use_only_cookies', '1');
@ini_set('session.cookie_samesite', $cookieParams['samesite']);
@ini_set('session.cookie_secure', $cookieParams['secure'] ? '1' : '0');

// Optionally set a stable session name to avoid conflicts with other apps on same domain
if (session_status() === PHP_SESSION_NONE) {
    if (session_name() === "PHPSESSID") {
        session_name('CRTVADMINSESSID');
    }
    // Use array form where available
    if (PHP_VERSION_ID >= 70300) {
        session_set_cookie_params($cookieParams);
    } else {
        session_set_cookie_params(
            $cookieParams['lifetime'],
            $cookieParams['path'],
            $cookieParams['domain'],
            $cookieParams['secure'],
            $cookieParams['httponly']
        );
    }
    session_start();
}
