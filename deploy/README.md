# Deploying MIRA Hub to hub.mira-intelligence.com

The hub is published twice from the same sources:

| Where | Base path / URL | Deployed by |
|---|---|---|
| <https://mira-intelligence.github.io/mira-hub/> | `/mira-hub` | `deploy.yml` jobs `build` + `deploy` (GitHub Pages) |
| <https://hub.mira-intelligence.com/> | `/` | `deploy.yml` job `cloud` (rsync to the CVM) |

Keep GitHub Pages running: released engines up to 0.5.0 fetch the registry
from the github.io URL.

## Server layout (mira-intelligence CVM)

Tencent EdgeOne terminates HTTPS for `*.mira-intelligence.com` and pulls from
the CVM. The existing docs nginx (`/opt/mira-docs`, container `mira-docs`)
owns ports 80/443 and routes by Host, so the hub is just another server block
there:

- Static build: `/opt/mira-hub/site` (owner `ubuntu`), mounted read-only into
  the container as `/usr/share/nginx/hub`
  (`/opt/mira-docs/docker-compose.yml`).
- Server blocks: [`nginx-hub.conf`](nginx-hub.conf), appended to
  `/opt/mira-docs/nginx.conf`. Content updates need no reload.
- TLS: the shared Let's Encrypt certificate `mira-intelligence.com`
  (webroot `/opt/mira-docs/certbot-www`, renewed by
  `/opt/mira-docs/renew-certs.sh` from cron) must list
  `hub.mira-intelligence.com`:

  ```bash
  sudo docker run --rm \
    -v /opt/mira-docs/letsencrypt:/etc/letsencrypt \
    -v /opt/mira-docs/certbot-www:/var/www/certbot \
    certbot/certbot certonly --webroot -w /var/www/certbot \
    --cert-name mira-intelligence.com --expand --non-interactive \
    -d mira-intelligence.com -d community.mira-intelligence.com -d hub.mira-intelligence.com
  docker exec mira-docs nginx -s reload
  ```

## CI deploy key

The `cloud` job runs only when the repo has these settings:

| Kind | Name | Value |
|---|---|---|
| secret | `HUB_DEPLOY_KEY` | private half of a dedicated ed25519 key |
| var | `HUB_DEPLOY_HOST` | `43.133.90.127` |
| var | `HUB_DEPLOY_USER` | `ubuntu` |
| var | `HUB_DEPLOY_KNOWN_HOSTS` | `ssh-keyscan -t ed25519 43.133.90.127` output |

The key's `authorized_keys` line on the server pins it to rsync under
`/opt/mira-hub` and nothing else; CI uploads to `site/` inside it. **The
`command="…rrsync…"` prefix is required.** Without it the key is a full login,
and an rsync with `--delete` to a relative path lands in the home directory.
CI refuses to upload unless `site/index.html` already exists at the
destination, but keep the pin anyway:

```text
command="/usr/bin/rrsync /opt/mira-hub",restrict ssh-ed25519 AAAA… github-actions-deploy@mira-hub
```

Setup, from a machine with SSH access to the CVM:

```bash
ssh-keygen -t ed25519 -N '' -C github-actions-deploy@mira-hub -f ./hub_deploy
ssh mira-cvm "echo 'command=\"/usr/bin/rrsync /opt/mira-hub\",restrict $(cat hub_deploy.pub)' >> ~/.ssh/authorized_keys"
gh secret set HUB_DEPLOY_KEY --repo MIRA-Intelligence/mira-hub < hub_deploy
gh variable set HUB_DEPLOY_HOST --repo MIRA-Intelligence/mira-hub --body 43.133.90.127
gh variable set HUB_DEPLOY_USER --repo MIRA-Intelligence/mira-hub --body ubuntu
gh variable set HUB_DEPLOY_KNOWN_HOSTS --repo MIRA-Intelligence/mira-hub \
  --body "$(ssh-keyscan -t ed25519 43.133.90.127 2>/dev/null)"
rm hub_deploy hub_deploy.pub
```

## Manual deploy

```bash
MIRAHUB_BASE_PATH=/ MIRAHUB_BASE_URL=https://hub.mira-intelligence.com \
  npm run build:registry -- --skills-dir ../mira-skills/skills
MIRAHUB_BASE_PATH=/ MIRAHUB_BASE_URL=https://hub.mira-intelligence.com \
  npm run build:web
rsync -rltz --delete --delay-updates packages/web/out/ mira-cvm:/opt/mira-hub/site/
```

## EdgeOne

`hub.mira-intelligence.com` must reach the origin with its own Host header
(otherwise the docs `default_server` answers), and HTML must not be cached
past what the origin's `Cache-Control` allows. After a first deploy, purge the
cached `/` once (it held the docs page before the hub existed).
