#!/usr/bin/env python3
from __future__ import annotations

import contextlib
import os
import socket
import subprocess
import sys
import threading
import webbrowser
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path

ROOT = Path(__file__).resolve().parent
HOST = '127.0.0.1'
START_PORT = 8765


def find_port(host: str, start: int) -> int:
    for port in range(start, start + 50):
        with contextlib.closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
            sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                sock.bind((host, port))
            except OSError:
                continue
            return port
    raise RuntimeError('未找到可用端口，请关闭占用端口的程序后重试。')


class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory=None, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt: str, *args):
        print('[HTTP]', fmt % args)


def main() -> None:
    os.chdir(ROOT)
    port = find_port(HOST, START_PORT)
    server = ThreadingHTTPServer((HOST, port), QuietHandler)
    url = f'http://{HOST}:{port}/index.html'
    print('\n好吃家本地服务已启动\n')
    print(f'目录: {ROOT}')
    print(f'地址: {url}')
    print('\n请用浏览器打开上面的地址。按 Ctrl+C 可停止服务。\n')

    def open_browser() -> None:
        try:
            webbrowser.open(url)
        except Exception:
            pass

    threading.Timer(0.8, open_browser).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n服务已停止。')
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
