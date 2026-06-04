# Deploy de Wapsell en la VPS Hetzner

Runbook para correr `wapsell.com` en la VPS compartida que ya tiene Coolify +
pipaas.com + el resto. El sitio queda servido por un container Docker
escuchando en `127.0.0.1:3010`, con el host nginx reverse-proxying la URL
pública.

## Prerrequisitos en la VPS

- Docker + docker compose plugin ya instalados (los tenés por Coolify).
- Host nginx ya corriendo (es el que sirve pipaas.com).
- Certbot ya instalado (lo usaste para pipaas).
- Puerto 3010 libre (no lo usa Coolify, no lo usa pipaas).

## 1. DNS — Namecheap

En el panel de Namecheap → Domain List → **wapsell.com** → Manage → Advanced
DNS:

| Type  | Host | Value              | TTL       |
|-------|------|--------------------|-----------|
| A     | @    | `89.167.96.239`    | Automatic |
| CNAME | www  | `wapsell.com.`     | Automatic |

Borrá cualquier "URL Redirect" o "CNAME @ parkingpage" que Namecheap haya
creado por default.

Verificá la propagación (puede tardar 5 min - 1 h):

```bash
dig +short wapsell.com
# debería devolver 89.167.96.239
```

## 2. Clonar el repo en la VPS

```bash
ssh root@89.167.96.239
cd /opt
git clone https://github.com/fmonfasani/wapsell.git
cd wapsell
```

## 3. Build + up del container

```bash
docker compose up -d --build
docker ps | grep wapsell    # debería aparecer wapsell-app healthy
curl -sS -I http://127.0.0.1:3010/es | head -3  # → HTTP/1.1 200 OK
```

Primera build: ~3 min. Builds posteriores con cache: ~90 seg.

## 4. nginx vhost

```bash
cp /opt/wapsell/infra/nginx/wapsell.com.conf /etc/nginx/sites-available/wapsell.com
ln -s /etc/nginx/sites-available/wapsell.com /etc/nginx/sites-enabled/wapsell.com
nginx -t                # debería decir "syntax is ok" "test is successful"
```

Pero antes de `nginx -s reload`, necesitás el cert (sino el `listen 443 ssl`
falla). Vamos al paso 5.

## 5. Certificado TLS con Certbot

Como nginx todavía no escucha en wapsell.com:443, usamos `--standalone` para
el primer cert (Certbot levanta su propio servidor en :80 brevemente):

```bash
# Primero comentá temporalmente las server blocks de wapsell en el vhost
# o renombralo así nginx no falla:
mv /etc/nginx/sites-enabled/wapsell.com /tmp/wapsell.com.conf.bak
systemctl reload nginx

# Obtener cert (apex + www en el mismo cert).
certbot certonly --webroot \
    -w /var/www/certbot \
    -d wapsell.com -d www.wapsell.com \
    --agree-tos -m hola@wapsell.com --no-eff-email

# Si /var/www/certbot no existe todavía:
mkdir -p /var/www/certbot

# Renovación auto ya está en systemd (certbot.timer); confirmá:
systemctl status certbot.timer
```

Después de tener el cert:

```bash
mv /tmp/wapsell.com.conf.bak /etc/nginx/sites-enabled/wapsell.com
nginx -t
systemctl reload nginx
```

## 6. Smoke test en producción

```bash
# Resolución DNS:
dig +short wapsell.com

# TLS handshake:
curl -sS -I https://wapsell.com/ | head -5

# Locale routing:
curl -sS -I https://wapsell.com/        # 307 -> /es o /en según Accept-Language
curl -sS -I https://wapsell.com/es      # 200
curl -sS -I https://wapsell.com/en      # 200
curl -sS -I https://wapsell.com/es/demo-tour  # 200

# Sitemap accesible:
curl -sS https://wapsell.com/sitemap.xml | head -20
curl -sS https://wapsell.com/robots.txt

# OG image se renderiza:
curl -sS -I https://wapsell.com/es/opengraph-image  # 200 image/png
```

## 7. Update cuando hay nuevo commit

```bash
cd /opt/wapsell
git pull --ff-only
docker compose up -d --build app
# Si hay cambios en next.config / package.json, el rebuild los toma sin más.
curl -sS -I https://wapsell.com/es | head -3
```

## 8. Rollback si la build nueva rompe algo

```bash
cd /opt/wapsell
git log --oneline -5     # encontrar el sha previo bueno
git checkout <sha>
docker compose up -d --build app
```

## Troubleshooting

### El container está running pero la web no carga

```bash
docker logs --tail 50 wapsell-app
# buscá errores de Node / Next al arranque
```

### nginx devuelve 502 Bad Gateway

El container está caído o el puerto cambió:

```bash
docker ps | grep wapsell
ss -tlnp | grep 3010   # debería estar wapsell-app escuchando
```

### `dig wapsell.com` devuelve la IP vieja de Namecheap

DNS todavía propagando. Esperá hasta 1h o probá con `nslookup wapsell.com 1.1.1.1`
para chequear desde Cloudflare directamente.

### Certbot dice "DNS problem: SERVFAIL"

El DNS A record no se propagó todavía. Esperá unos minutos y reintentá:

```bash
certbot renew --force-renewal --webroot -w /var/www/certbot
```

## Cambios al CTA de WhatsApp

El número al que linkea el CTA "Hablá con Wapsell" vive en `lib/constants.ts`
como `WA_NUMBER`. Para cambiarlo:

1. Editás el archivo localmente, commit + push.
2. En la VPS: `git pull && docker compose up -d --build app`.

O en caliente (sin rebuild) editás directo en la VPS, pero el cambio se pierde
en el próximo `git pull` — preferí el flujo git.
