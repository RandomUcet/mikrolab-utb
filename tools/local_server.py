#!/usr/bin/env python3
"""Local static server for the prebuilt MikroLab app (Python stdlib only).

Designed for Mac users whose Homebrew Node installation may be unavailable or broken.
Only binds to loopback; no external access, dependency installation, or telemetry.
"""
from __future__ import print_function

import errno
import functools
import http.server
import os
from pathlib import Path
import sys
import webbrowser

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / 'dist'
PORT = int(os.environ.get('MIKROLAB_PORT', '4173'))
HOST = '127.0.0.1'

class MikroLabHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def guess_type(self, path):
        if path.endswith('.webmanifest'):
            return 'application/manifest+json'
        if path.endswith('.js'):
            return 'text/javascript'
        return super().guess_type(path)

    def log_message(self, fmt, *args):
        # Keep the local terminal readable; still show failed requests.
        if args and isinstance(args[1] if len(args) > 1 else None, str):
            try:
                if int(args[1]) < 400:
                    return
            except (ValueError, TypeError):
                pass
        super().log_message(fmt, *args)


def main():
    if not (DIST / 'index.html').is_file():
        print('CHYBA: chybí předem sestavená aplikace v adresáři dist/.', file=sys.stderr)
        print('Rozbal celý archiv MikroLab a spouštěj soubor z jeho hlavní složky.', file=sys.stderr)
        return 1
    handler = functools.partial(MikroLabHandler, directory=str(DIST))
    try:
        server = http.server.ThreadingHTTPServer((HOST, PORT), handler)
    except OSError as exc:
        if getattr(exc, 'errno', None) == errno.EADDRINUSE:
            print('CHYBA: port {} už využívá jiná aplikace. Zavři její server, nebo spusť s MIKROLAB_PORT=4174.'.format(PORT), file=sys.stderr)
        else:
            print('Nepodařilo se spustit server: {}'.format(exc), file=sys.stderr)
        return 1
    url = 'http://localhost:{}'.format(PORT)
    print('MikroLab běží na {} – Terminal nech otevřený; ukončení Ctrl+C.'.format(url), flush=True)
    if sys.platform == 'darwin' and os.environ.get('MIKROLAB_NO_BROWSER') != '1':
        try:
            webbrowser.open(url)
        except Exception:
            print('Otevři v prohlížeči: {}'.format(url), flush=True)
    try:
        server.serve_forever(poll_interval=0.2)
    except KeyboardInterrupt:
        print('\nMikroLab ukončen.')
    finally:
        server.server_close()
    return 0


if __name__ == '__main__':
    sys.exit(main())
