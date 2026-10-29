"""Local static preview with cache disabled, so overnight edits are actually reloaded."""
from argparse import ArgumentParser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class Preview(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    parser = ArgumentParser()
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    server = ThreadingHTTPServer(("127.0.0.1", args.port), partial(Preview, directory=str(root)))
    print(f"Glasswing preview: http://127.0.0.1:{args.port}", flush=True)
    server.serve_forever()
