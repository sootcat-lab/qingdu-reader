#!/usr/bin/env bash
# 打包商店上传用的 zip：Firefox（AMO）用原 manifest；Chrome 包去掉 Firefox 专用字段，避免审核误判
set -euo pipefail
cd "$(dirname "$0")"
version=$(python3 -c 'import json; print(json.load(open("manifest.json"))["version"])')
files=(manifest.json background.js reader.js LICENSE lib icons _locales)
mkdir -p dist
rm -f "dist/qingdu-reader-$version-firefox.zip" "dist/qingdu-reader-$version-chrome.zip"

zip -qr -X -D "dist/qingdu-reader-$version-firefox.zip" "${files[@]}"

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
cp -r "${files[@]}" "$tmp"
python3 - "$tmp/manifest.json" <<'PY'
import json, sys
p = sys.argv[1]
m = json.load(open(p))
del m["background"]["scripts"]
m.pop("browser_specific_settings")
json.dump(m, open(p, "w"), ensure_ascii=False, indent=2)
PY
(cd "$tmp" && zip -qr -X -D - "${files[@]}") > "dist/qingdu-reader-$version-chrome.zip"

ls dist/qingdu-reader-"$version"-*.zip
