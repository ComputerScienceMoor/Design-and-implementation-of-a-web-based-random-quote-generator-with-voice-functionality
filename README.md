# QuoteGen — XAMPP Setup

This is the QuoteGen final year project with a real PHP + MySQL backend
added for sign up, login, and saving favorite quotes. It was built to run
on a stock XAMPP install.

## 1. Install the project

1. Install [XAMPP](https://www.apachefriends.org/) if you don't have it.
2. Copy the whole `quotegen` folder into your XAMPP `htdocs` directory, e.g.:
   - Windows: `C:\xampp\htdocs\quotegen`
   - macOS: `/Applications/XAMPP/htdocs/quotegen`
   - Linux: `/opt/lampp/htdocs/quotegen`

## 2. Start Apache & MySQL

Open the **XAMPP Control Panel** and click **Start** next to both
**Apache** and **MySQL**.

## 3. Open the site

Visit **http://localhost/quotegen/** in your browser.

That's it — no manual database import is required. The first time any
backend page runs, `backend/config.php` automatically:
- creates the `quotegen_db` database,
- creates the `users`, `favorites`, and `quotes` tables,
- seeds the `quotes` table with ~30 starter quotes (used if the external
  quotes API is unreachable).

If you'd rather set the database up by hand in phpMyAdmin instead, a copy
of the schema is in `backend/database.sql`.

## What the backend does

| File | Purpose |
|---|---|
| `backend/config.php` | DB connection + auto-setup. Edit `$DB_USER` / `$DB_PASS` here if your MySQL root user has a password. |
| `backend/signup.php` | Creates an account (hashed password), logs the user in. |
| `backend/login.php` | Verifies email/password, starts a PHP session. |
| `backend/logout.php` | Destroys the session. |
| `backend/session_check.php` | Used by `homepage.html` to check who's logged in / redirect to login if not. |
| `backend/favorites.php` | GET/POST/DELETE a logged-in user's saved quotes. |
| `backend/get_quote.php` | Fetches a quote from API-Ninjas (key stays server-side) and falls back to the local `quotes` table if that fails. |

## Notes

- Passwords are stored using PHP's `password_hash()` (bcrypt) — never in
  plain text.
- Favorites are now stored per-account in MySQL instead of only living in
  memory, so they survive logout/refresh.
- The API-Ninjas key that used to sit directly in `homepage.js` has been
  moved into `backend/get_quote.php` so it's no longer visible to anyone
  viewing the page source. You can swap in your own key there if you have
  one — the app works fine without it too, using the local quote bank.
- If `http://localhost/quotegen/` shows a database error, it almost
  always means MySQL isn't running yet in the XAMPP Control Panel.
