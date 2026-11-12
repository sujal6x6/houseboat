# Cloudflare production setup

The website is static and deploys from the repository root. The admin API is implemented as Cloudflare Pages Functions under `functions/` and stores records in D1. One Cloudflare configuration step is still required because credentials and database IDs belong to your account.

## 1. Create the database

Install Wrangler, authenticate, then create a D1 database:

```bash
npm install -g wrangler
wrangler login
wrangler d1 create new-peony-houseboats
```

Copy the returned database ID into a Pages D1 binding named **DB**:

Cloudflare dashboard → Workers & Pages → your Pages project → Settings → Functions → D1 database bindings → Production → **DB**.

Run the schema against the remote database:

```bash
wrangler d1 execute new-peony-houseboats --remote --file=schema.sql
```

## 2. Configure admin credentials

Add these Production environment variables in the same Pages project (Settings → Environment variables):

- `ADMIN_USERNAME` — the username you will use at `/admin.html`
- `ADMIN_PASSWORD_SHA256` — SHA-256 hash of the password, not the password itself
- `SESSION_SECRET` — a long random string (at least 32 characters)

Create a password hash locally with:

```bash
printf %s 'choose-a-strong-password' | sha256sum
```

Redeploy after saving the variables. The login form now uses an HttpOnly, signed eight-hour session cookie; no password is stored in the repository.

## 3. Optional gallery uploads

To make the Gallery upload button persist images across devices, create an R2 bucket and bind it as **MEDIA**:

```bash
wrangler r2 bucket create new-peony-gallery
```

Pages project → Settings → Functions → R2 bucket bindings → Production → **MEDIA**.

Without this binding, the rest of the dashboard remains fully usable, but newly selected gallery files are only a local browser preview.

## 4. Verify

After deployment:

1. Open `https://your-domain.example/admin.html`.
2. Sign in with the configured username and password.
3. Change a rate, refresh on another device, and confirm it remains updated.
4. Submit the public booking form and confirm the enquiry appears under **Bookings**.

For an additional perimeter layer, put `/admin.html` behind a Cloudflare Access application and allow only your team.
