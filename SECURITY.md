# Deployment Security Checklist — Pearls & Petals

This document provides a practical, copy-paste friendly checklist and example configurations for deploying the single-file site securely. It focuses on recommended HTTP headers, an example Nginx server block, TLS (Let's Encrypt), basic firewall rules, and operational guidance. This is a reference: prefer applying CSP and other security headers via your server (Nginx) or CDN rather than the meta tag in `index.html`.

## Quick checklist
- Serve the site over HTTPS only (redirect HTTP → HTTPS).
- Use a trusted certificate (Let’s Encrypt or commercial CA).
- Set a tight Content Security Policy (CSP) via response headers.
- Add security headers: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- Enable rate limiting and basic request size limits on the server or CDN.
- Configure a simple firewall (ufw / cloud provider security groups).
- Use a CDN or WAF (Cloudflare, Fastly, AWS CloudFront) for DDoS protection and TLS termination.
- Use `rel="noopener noreferrer"` and `target="_blank"` for external links (already applied).
- Sanitize and validate all user inputs server-side (note: this site is static/demo; any backend endpoints must validate inputs).
- Monitor logs and rotate backups; use automated deploys and secret management.

---

## Minimal recommended HTTP security headers
Add these as response headers (example below shows how to add them with Nginx). Adjust `'self'` and host names according to your third-party services.

- Strict-Transport-Security: `max-age=31536000; includeSubDomains; preload`
- Content-Security-Policy: choose a policy tuned to your external needs (fonts, images). Example is below.
- X-Frame-Options: `DENY` or `SAMEORIGIN`
- X-Content-Type-Options: `nosniff`
- Referrer-Policy: `strict-origin-when-cross-origin`
- Permissions-Policy: disable features you don't use, e.g. `geolocation=(), microphone=()`

Example CSP (server header form)

Content-Security-Policy: 
```
default-src 'self';
script-src 'self';
style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
font-src https://fonts.gstatic.com data:;
img-src 'self' data: https:;
connect-src 'self' https://wa.me https://api.whatsapp.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self' https://wa.me;
```

Notes:
- Keep `'unsafe-inline'` out where possible (it weakens CSP). If needed for quick demos, keep it but plan to replace inline scripts/styles with external files and use nonces or hashes.
- `frame-ancestors 'none'` helps prevent clickjacking. 

---

## Example Nginx server block (static site)
Replace example domain, cert paths and root with your values. This includes common security headers and redirects HTTP→HTTPS.

```
server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    # TLS certs (Let's Encrypt example)
    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    root /var/www/pearls-and-petals;
    index index.html;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=()" always;

    # CSP header (adjust to needs)
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com data:; img-src 'self' data: https:; connect-src 'self' https://wa.me https://api.whatsapp.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://wa.me;" always;

    # Basic rate limiting (optional, tuning required)
    limit_req zone=one burst=8 nodelay;

    location / {
        try_files $uri $uri/ =404;
    }

    # Optionally serve robots and security files
    location = /robots.txt { try_files $uri /robots.txt =404; }
}

# Note: configure limit_req_zone in http{} block:
# limit_req_zone $binary_remote_addr zone=one:10m rate=1r/s;
```

---

## Let's Encrypt (Certbot) quick commands 
```
# Install certbot and nginx plugin (depends on distro)
# Ubuntu/Debian example:
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain cert and let certbot configure nginx:
sudo certbot --nginx -d example.com -d www.example.com

# Test renewal (dry-run)
sudo certbot renew --dry-run
```

---

## Firewall & basic host hardening
- If using UFW (Ubuntu):
```
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```
- If using cloud provider security groups (AWS/GCP/Azure), allow only necessary ports (80, 443, 22 for management with IP restriction).
- Use fail2ban to reduce brute-force attempts for services that need auth (SSH, admin panels).

---

## CDN / WAF recommendations
- Use Cloudflare (Free/Pro) or a CDN with WAF support to add TLS, DDoS protection, caching, and a Web Application Firewall.
- Configure page rules to enforce HTTPS and caching policies for static assets.

---

## Operational tips
- Do not store API keys or secrets in the repo. Use environment variables or a secrets manager.
- Deploy from CI (GitHub Actions, GitLab CI) and run automated tests and linting before deploy.
- Monitor logs (nginx/access.log, nginx/error.log) and set up alerts for spikes or errors.
- Backup site files and certificates; consider automating snapshots.

---

## What I can provide next
- A hardened example `nginx.conf` tuned to a specific host or provider.
- A simple GitHub Actions workflow to deploy to a VPS or to GitHub Pages with HTTPS via Cloudflare.
- A checklist for integrating a payments provider (Stripe / PayPal) securely.

If you'd like, I can add a `SECURITY.md` into the repo (this file) and a sample `nginx.conf` next — tell me which provider (VPS, DigitalOcean, AWS) you plan to use and I will tailor the config.
