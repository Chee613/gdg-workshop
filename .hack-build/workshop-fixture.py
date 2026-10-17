"""Isolated browser-test fixture. Synthetic judging never touches the live workshop."""
import importlib.util
from pathlib import Path
import tempfile
import time
from http.server import ThreadingHTTPServer

spec=importlib.util.spec_from_file_location('workshop',Path(__file__).resolve().parent.parent/'gdg hackathon sharing/workshop/server.py')
app=importlib.util.module_from_spec(spec)
spec.loader.exec_module(app)

def fixture_judge(state,ideas):
    time.sleep(.2)
    return [dict(id=idea['id'],scores=[9-i,8,9],strength='A clear, useful test idea.',improve='Test the main assumption.') for i,idea in enumerate(ideas)]

with tempfile.TemporaryDirectory() as folder:
    app.DB=Path(folder)/'fixture.sqlite3'
    app.KEY='test-only-not-a-real-key'
    app.judge_with_gemini=fixture_judge
    app.setup()
    sample=[dict(id=1,name='Test',title='Test',idea='A useful test idea',created=0)]
    state=app.get_state()
    assert app.validate_ratings([dict(id=1,scores=[10,8,9],strength='Useful',improve='Test')],state,sample)[0]['total']==91
    for invalid in [[dict(id=999,scores=[10,8,9],strength='x',improve='x')],[],[dict(id=1,scores=[11,8,9],strength='x',improve='x')]]:
        try:app.validate_ratings(invalid,state,sample)
        except ValueError:pass
        else:raise AssertionError('Invalid AI output must be rejected')
    server=ThreadingHTTPServer(('127.0.0.1',0),app.Handler)
    app.JOIN_URL=f'http://127.0.0.1:{server.server_port}/join'
    print(app.JOIN_URL.removesuffix('/join'),flush=True)
    server.serve_forever()
