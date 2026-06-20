"""
REELHAUS – lokaler Dev-Server mit HTTP-Range-Support.

Pythons Standard `http.server` beantwortet keine Range-Requests (206),
die iOS Safari zum Abspielen von <video> aber zwingend braucht.
Dieser Server liefert 206 Partial Content + Accept-Ranges aus,
sodass Videos auf iPhone & Android sauber streamen/seeken.

Start:  python serve.py
"""
import http.server
import os
import re
from functools import partial

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class RangeHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # immer frische Dateien während der Entwicklung
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def send_head(self):
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()
        ctype = self.guess_type(path)
        try:
            f = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return None

        fs = os.fstat(f.fileno())
        size = fs.st_size
        rng = self.headers.get("Range")

        if rng:
            m = re.match(r"bytes=(\d*)-(\d*)", rng.strip())
            if m and (m.group(1) or m.group(2)):
                start = int(m.group(1)) if m.group(1) else 0
                end = int(m.group(2)) if m.group(2) else size - 1
                end = min(end, size - 1)
                if start > end or start >= size:
                    self.send_error(416, "Requested Range Not Satisfiable")
                    f.close()
                    return None
                length = end - start + 1
                self.send_response(206)
                self.send_header("Content-Type", ctype)
                self.send_header("Accept-Ranges", "bytes")
                self.send_header("Content-Range", "bytes %d-%d/%d" % (start, end, size))
                self.send_header("Content-Length", str(length))
                self.end_headers()
                self._copy_range(f, self.wfile, length)
                f.close()
                return None

        # kein Range -> ganze Datei
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(size))
        self.end_headers()
        return f

    def _copy_range(self, src, dst, length):
        bufsize = 64 * 1024
        while length > 0:
            chunk = src.read(min(bufsize, length))
            if not chunk:
                break
            try:
                dst.write(chunk)
            except (BrokenPipeError, ConnectionResetError):
                break
            length -= len(chunk)


def main():
    handler = partial(RangeHandler, directory=DIRECTORY)
    with http.server.ThreadingHTTPServer(("0.0.0.0", PORT), handler) as httpd:
        print("REELHAUS dev server (range-enabled)")
        print("Serving %s" % DIRECTORY)
        print("Local:   http://localhost:%d" % PORT)
        print("Network: http://192.168.1.121:%d" % PORT)
        httpd.serve_forever()


if __name__ == "__main__":
    main()
