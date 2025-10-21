<?php
// Global feature toggles for backend behavior
// Set to true to temporarily bypass 2FA during development/testing.
// IMPORTANT: Do NOT enable in production.
if (!defined('DISABLE_2FA')) {
    define('DISABLE_2FA', false);
}
