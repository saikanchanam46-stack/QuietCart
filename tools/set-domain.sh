#!/usr/bin/env bash
# Point the site at a domain. Updates the canonical link, the social preview
# tags, robots.txt and sitemap.xml together, so none of them drift apart.
#
#   ./tools/set-domain.sh quietcart.com
#
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "usage: $0 <domain>   e.g. $0 quietcart.com" >&2
  exit 1
fi

domain="${1#http://}"; domain="${domain#https://}"; domain="${domain%/}"
new="https://${domain}"
cd "$(dirname "$0")/.."

old=$(grep -o 'https://[a-z0-9.-]*' index.html | head -1)
if [ -z "$old" ]; then echo "could not find the current site URL" >&2; exit 1; fi

for f in index.html robots.txt sitemap.xml; do
  sed -i.bak "s|${old}|${new}|g" "$f" && rm -f "$f.bak"
done

echo "site URL: ${old}  ->  ${new}"
grep -rn "${new}" index.html robots.txt sitemap.xml | sed 's/^/  /'
echo
echo "Commit and push, then re-scrape the preview at"
echo "  https://www.linkedin.com/post-inspector/  and  https://developers.facebook.com/tools/debug/"
