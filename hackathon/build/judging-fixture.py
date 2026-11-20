"""Serve either app with isolated data and a synthetic judge for browser checks."""
import importlib.util
from pathlib import Path
import sys
import tempfile
from http.server import ThreadingHTTPServer

spec = importlib.util.spec_from_file_location('fixture', Path(sys.argv[1]).resolve())
app = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app)
app.HOST_PASSWORD = ''
app.KEY = ''
app.judge_with_gemini = lambda state, ideas: [dict(id=i['id'],scores=[9]*len(state['criteria']),strength='Useful.',improve='Pilot it.') for i in ideas]
with tempfile.TemporaryDirectory(prefix='gdg-judging-ui-') as folder:
    app.DB = Path(folder)/'test.sqlite3'
    app.setup()
    server = ThreadingHTTPServer(('127.0.0.1',0),app.Handler)
    app.JOIN_URL = f'http://127.0.0.1:{server.server_port}/join'
    print(app.JOIN_URL.removesuffix('/join'),flush=True)
    server.serve_forever()
