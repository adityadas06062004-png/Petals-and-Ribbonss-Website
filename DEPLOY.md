# Deploy Instructions — Pearls & Petals

This document explains how to set up a simple VPS for hosting the static site and how to configure GitHub Actions to deploy via SSH+rsync.

1) Prepare the VPS

- Create a non-root user for deployment (e.g., `deploy`) and give it permission to write to the web root or configure `sudo` for limited use.

  ```sh
  # on VPS as root
  adduser deploy
  usermod -aG www-data deploy
  mkdir -p /var/www/pearls-and-petals
  chown -R deploy:www-data /var/www/pearls-and-petals
  ```

- Install Nginx and Certbot (Ubuntu example):

  ```sh
  sudo apt update
  sudo apt install nginx certbot python3-certbot-nginx
  ```

2) Add SSH key for CI

- On your local machine, generate a key for CI (or reuse a deploy key):

  ```sh
  ssh-keygen -t ed25519 -C "github-actions-deploy" -f github_deploy_key
  # copy the public key to the server (authorized_keys for deploy user)
  ssh-copy-id -i github_deploy_key.pub deploy@your-server-ip
  ```

- Add the private key contents to your GitHub repo secrets as `SSH_PRIVATE_KEY`. Add `SSH_USER`, `SSH_HOST`, `SSH_PORT` (usually 22), and `REMOTE_PATH`.

3) Configure GitHub Actions

- The provided workflow `.github/workflows/deploy.yml` will run on push to `main`. It uses the `webfactory/ssh-agent` action and rsync to copy files to the remote path.

4) Nginx config

- Copy `nginx.conf.example` contents to `/etc/nginx/nginx.conf` (or use as a server block under `/etc/nginx/sites-available/example.com`). Update domain and cert paths, then test and reload Nginx:

  ```sh
  sudo nginx -t
  sudo systemctl reload nginx
  ```

5) TLS with Certbot

  ```sh
  sudo certbot --nginx -d example.com -d www.example.com
  sudo certbot renew --dry-run
  ```

6) Final notes

- For production, put a CDN/WAF in front of the site for DDoS protection and caching.
- Monitor logs and set up automatic certificate renewal (certbot usually adds a cron timer).
