#!/bin/zsh
# MikroLab local launcher for macOS. No npm/node needed for the prebuilt app.
cd "$(dirname "$0")" || exit 1

echo "MikroLab – spouštění lokální aplikace…"
# Prefer Python's built-in HTTP server, avoiding broken Homebrew Node installations.
if command -v python3 >/dev/null 2>&1 && python3 -c 'import http.server' >/dev/null 2>&1; then
  exec python3 tools/local_server.py
fi

# Optional fallback when Python 3 is unavailable but Node.js actually works.
if command -v node >/dev/null 2>&1 && node --version >/dev/null 2>&1; then
  (sleep 1; open 'http://localhost:4173') &
  exec node tools/dev-server.mjs
fi

echo ""
echo "Serverové prostředí není dostupné. Otevřu záložní offline HTML verzi."
if [[ -f "MikroLab_offline.html" ]]; then
  open "MikroLab_offline.html"
  echo "Offline soubor byl otevřen. Pokrok raději pravidelně exportuj do zálohy."
  exit 0
fi
echo "Nepodařilo se najít funkční Python 3 ani Node.js."
echo ""
echo "Na macOS lze použít Python 3 z příkazových nástrojů Apple (Xcode Command Line Tools),"
echo "nebo opravit Homebrew Node instalací: brew reinstall simdjson node"
echo ""
read '?Stiskni Enter pro zavření…'
exit 1
