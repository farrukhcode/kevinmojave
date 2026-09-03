#!/bin/zsh
# Builds:
#   dist/mojave-medical.html  - artifact fragment (no <html>/<head> wrapper)
#   index.html                - standalone single file, opens straight from disk
#   server/public/            - what the Docker image serves
set -e
cd "$(dirname "$0")"
mkdir -p dist server/public

B64=$(base64 -i assets/dr-ganesh-headshot.jpg | tr -d '\n')
CLINIC64=$(base64 -i assets/clinic-exterior.jpg | tr -d '\n')
EMBLEM64=$(base64 -i brand/mojave-medical-emblem.png | tr -d '\n')
VIRUS64=$(base64 -i brand/mojave-medical-virus-mark.png | tr -d '\n')

emit_body() {
  cat src/part2-skeleton.html
  cat src/part3-content.js
  printf '<script>const HEADSHOT="data:image/jpeg;base64,%s";const CLINIC="data:image/jpeg;base64,%s";const EMBLEM="data:image/png;base64,%s";const VIRUS_MARK="data:image/png;base64,%s";</script>\n' "$B64" "$CLINIC64" "$EMBLEM64" "$VIRUS64"
  cat src/part4-app.js
}

# 1. artifact fragment
{ cat src/part1-head.html; emit_body; } > dist/mojave-medical.html

# 2. standalone + 3. server public copy
{
  printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n<meta name="theme-color" content="#10202F">\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">\n<link rel="icon" type="image/png" sizes="192x192" href="/favicon-192.png">\n<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n<link rel="canonical" href="https://mojavemedical.org/">\n'
  cat src/part1-head.html
  printf '</head>\n<body>\n'
  emit_body
  printf '</body>\n</html>\n'
} > index.html
cp index.html server/public/index.html

# favicons: the real emblem on an ink tile, rendered by headless Chrome
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [ -x "$CHROME" ]; then
  for spec in "32 favicon-32.png" "180 apple-touch-icon.png" "192 favicon-192.png" "512 favicon-512.png"; do
    sz=${spec%% *}; nm=${spec#* }
    pad=$(( sz * 12 / 100 ))
    printf '<body style="margin:0;background:transparent"><div style="width:%spx;height:%spx;border-radius:%spx;background:#10202F;display:flex;align-items:center;justify-content:center"><img src="data:image/png;base64,%s" style="height:%spx;display:block"></div></body>' \
      "$sz" "$sz" "$(( sz * 22 / 100 ))" "$EMBLEM64" "$(( sz - pad * 2 ))" > /tmp/mm-fav.html
    "$CHROME" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --default-background-color=00000000 \
      --window-size=$sz,$sz --screenshot="server/public/$nm" "file:///tmp/mm-fav.html" >/dev/null 2>&1
  done
  cp server/public/favicon-512.png brand/mojave-medical-app-icon.png
fi
rm -f server/public/favicon.svg

mkdir -p server/public/brand
for f in brand/*.png(N); do cp "$f" server/public/brand/; done

cat > server/public/robots.txt <<'TXT'
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Sitemap: https://mojavemedical.org/sitemap.xml
TXT

TODAY=$(date +%Y-%m-%d)
{
  printf '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  for p in "" "about" "services" "patients" "reviews" "contact" "book"; do
    printf '  <url><loc>https://mojavemedical.org/#/%s</loc><lastmod>%s</lastmod></url>\n' "$p" "$TODAY"
  done
  printf '</urlset>\n'
} > server/public/sitemap.xml

echo "built:"
echo "  dist/mojave-medical.html  $(wc -c < dist/mojave-medical.html | tr -d ' ') bytes"
echo "  index.html                $(wc -c < index.html | tr -d ' ') bytes"
echo "  server/public/            $(ls server/public | tr '\n' ' ')"
