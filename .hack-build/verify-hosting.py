"""Exercise the real cloud startup with temporary files, data and credentials."""
import base64
from contextlib import contextmanager
import importlib.util
import io
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import sys
import tempfile
import time
from urllib.error import HTTPError
from urllib.request import Request, urlopen
from unittest.mock import patch

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'gdg hackathon sharing/workshop/server.py'
PASSWORD = 'test-only-presenter-password'
AUTH = 'Basic ' + base64.b64encode(('presenter:' + PASSWORD).encode()).decode()

with tempfile.TemporaryDirectory(prefix='gdg-hosting-') as folder:
    test_root = Path(folder).resolve()
    assert test_root.is_relative_to(Path(tempfile.gettempdir()).resolve())
    env = dict(os.environ, WORKSHOP_DATA_DIR=str(test_root/'data'),
        WORKSHOP_HOST_PASSWORD=PASSWORD, WORKSHOP_REQUIRE_AUTH='1',
        GEMINI_API_KEY='test-only-not-a-real-key', RAILWAY_PUBLIC_DOMAIN='workshop.example.com')
    env.pop('GEMINI_MODEL', None)
    spec = importlib.util.spec_from_file_location('hosting_check', SOURCE)
    app = importlib.util.module_from_spec(spec)
    previous = dict(os.environ)
    try:
        os.environ.update(env)
        spec.loader.exec_module(app)
    finally:
        os.environ.clear()
        os.environ.update(previous)
    assert app.DB.parent == test_root/'data', 'Database must use the configured persistent directory'
    assert app.MODEL == 'gemini-3.5-flash-lite', 'Flash-Lite must be the default judging model'
    criteria = app.initial_state()['criteria']
    assert [c['weight'] for c in criteria] == [25,20,20,15,20]
    assert all(c['guidance'] for c in criteria)
    app.setup()
    legacy = [dict(name='Impact',weight=40),dict(name='Feasibility',weight=30),dict(name='Clarity',weight=30)]
    state = app.initial_state()
    state['criteria'] = legacy
    app.save_state(state)
    app.setup()
    assert app.get_state()['criteria'] == criteria, 'Upgrade the old default before judging'
    state.update(results=[dict(id=1)],phase='ready')
    app.save_state(state)
    app.setup()
    assert app.get_state()['criteria'] == legacy, 'Never change a completed ranking rubric'
    state.update(results=[],phase='collecting',criteria=[dict(name='Custom',weight=100)])
    app.save_state(state)
    app.setup()
    assert app.get_state()['criteria'] == state['criteria'], 'Preserve a presenter custom rubric'
    app.save_state(app.initial_state())
    sample = [dict(id=1,title='Pocket Pantry',idea='Help people use food before it expires.')]
    def gemini_response(req, timeout):
        assert req.full_url.endswith('/gemini-3.5-flash-lite:generateContent')
        payload = json.loads(req.data)
        config = payload['generationConfig']
        assert not {'temperature','topP','topK'} & config.keys(), 'Flash-Lite rejects deprecated sampling controls'
        assert config['responseFormat']['text']['mimeType'] == 'APPLICATION_JSON'
        prompt = payload['contents'][0]['parts'][0]['text']
        assert sample[0]['title'] in prompt and sample[0]['idea'] in prompt
        assert criteria[0]['guidance'] in prompt and 'unsupported' in prompt
        result = json.dumps(dict(ratings=[dict(id=1,scores=[9,8,9,7,6],strength='Useful',improve='Validate')]))
        return io.BytesIO(json.dumps(dict(candidates=[dict(content=dict(parts=[dict(text=result)]))])).encode())
    with patch.object(app,'urlopen',gemini_response):
        ratings = app.judge_with_gemini(app.initial_state(),sample)
    assert ratings[0]['scores'] == [9,8,9,7,6]
    for body, expected in [
        (json.dumps(dict(error=dict(status='INVALID_ARGUMENT',message='Invalid mime_type. Key: '+app.KEY))).encode(),'INVALID_ARGUMENT'),
        (b'<html>Proxy failure</html>','Gemini returned HTTP 400'),
    ]:
        upstream = HTTPError('https://generativelanguage.googleapis.com/',400,'Bad Request',None,io.BytesIO(body))
        with patch.object(app,'urlopen',side_effect=upstream):
            try: app.judge_with_gemini(app.initial_state(),sample)
            except ValueError as error:
                message = str(error)
                assert expected in message
                assert app.KEY not in message and '<html>' not in message
                if expected == 'INVALID_ARGUMENT':
                    assert 'mime_type' in message and '[redacted]' in message
            else: raise AssertionError('Upstream errors must be reported')

    (test_root/'workshop').mkdir()
    (test_root/'output/assets').mkdir(parents=True)
    shutil.copyfile(SOURCE, test_root/'workshop/server.py')
    for name in ['Hackathon-Tips.html','session/host.html','session/board.html','session/join.html']:
        target = test_root/'output'/name
        target.parent.mkdir(exist_ok=True)
        shutil.copyfile(ROOT/'gdg hackathon sharing/output'/name, target)

    def request(base, path, data=None, auth=None, marker=False):
        headers = {'Content-Type':'application/json'}
        if auth: headers['Authorization'] = auth
        if marker: headers['X-Workshop-Host'] = '1'
        req = Request(base+path, data=None if data is None else json.dumps(data).encode(), headers=headers)
        try:
            with urlopen(req, timeout=3) as response:
                return response.status, response.headers, response.read()
        except HTTPError as error:
            return error.code, error.headers, error.read()

    @contextmanager
    def running():
        with socket.socket() as probe:
            probe.bind(('127.0.0.1',0))
            port = probe.getsockname()[1]
        base = f'http://127.0.0.1:{port}'
        process = subprocess.Popen([sys.executable,str(test_root/'workshop/server.py'),'--host','127.0.0.1'],
            env=dict(env,PORT=str(port)), stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        try:
            for _ in range(150):
                if process.poll() is not None:
                    raise AssertionError(process.stderr.read().decode())
                try:
                    if request(base,'/healthz')[0] == 200: break
                except OSError: pass
                time.sleep(.1)
            else: raise AssertionError('Cloud service did not bind PORT or expose /healthz')
            yield base
        finally:
            process.terminate()
            process.wait(timeout=10)
            process.stderr.close()

    with running() as base:
        for path in ['/host','/host/','/session/host.html','/session/../session/host.html','/%73ession/host.html','/api/host']:
            status, headers, _ = request(base,path)
            assert status == 401 and 'Basic' in headers.get('WWW-Authenticate',''), path
        wrong = 'Basic '+base64.b64encode(b'presenter:wrong').decode()
        assert request(base,'/host',auth=wrong)[0] == 401
        assert request(base,'/host',auth='Basic invalid!')[0] == 401
        assert request(base,'/host',auth=AUTH)[0] == 200
        for path in ['/','/join','/board']:
            assert request(base,path)[0] == 200, path
        assert request(base,'/api/collect',{'open':False},marker=True)[0] == 401
        assert request(base,'/api/collect',{'open':False},auth=AUTH)[0] == 403
        assert request(base,'/api/collect',{'open':True},auth=AUTH,marker=True)[0] == 200
        entry = dict(client='hosting_participant_0001',name='Participant',title='Pocket Pantry',idea=' '.join(['everyday']*200))
        assert request(base,'/api/ideas',entry)[0] == 200, '200 words can exceed the former 700-character limit'
        entry['idea'] += ' extra'
        assert request(base,'/api/ideas',entry)[0] == 400, 'Reject 201 words on the server'
        entry['idea'] = 'everyday\n\t'*200
        assert request(base,'/api/ideas',entry)[0] == 200, 'Whitespace does not count as words'
        assert request(base,'/api/ideas',dict(client='hosting_participant_0001',name='Participant',title='Pocket Pantry',idea='Help people use food before it expires.'))[0] == 200
        public = json.loads(request(base,'/api/state')[2])
        assert public['count'] == 1 and public['joinUrl'] == 'https://workshop.example.com/join'
        assert set(public['ideas'][0]) == {'id','title','created'}
        assert 'aiReady' not in public and 'error' not in public
        assert all(set(c) == {'name','weight'} for c in public['criteria']), 'Judging guidance stays private'
        private = json.loads(request(base,'/api/host',auth=AUTH)[2])
        assert all(c['guidance'] for c in private['criteria'])
        assert private['ideas'][0]['idea'].startswith('Help people') and private['aiReady']
        assert env['GEMINI_API_KEY'] not in json.dumps(private)
        state = app.get_state()
        state.update(phase='revealed', results=[dict(**private['ideas'][0], scores=[9,9,9,9,9],
            total=90, strength='Useful test idea.', improve='Validate the main assumption.')])
        app.save_state(state)
        revealed = json.loads(request(base,'/api/state')[2])
        assert 'idea' not in revealed['results'][0], 'The introduction stays private after ranking too'
        import cv2
        qr = cv2.imread(str(test_root/'output/assets/challenge-qr.png'))
        assert cv2.QRCodeDetector().detectAndDecode(qr)[0] == public['joinUrl']

    with running() as base:
        assert json.loads(request(base,'/api/state')[2])['count'] == 1, 'Submissions survive a restart'

    for password in ['', 'short']:
        rejected = subprocess.run([sys.executable,str(test_root/'workshop/server.py')],
            env=dict(env,WORKSHOP_HOST_PASSWORD=password),capture_output=True,timeout=10)
        assert rejected.returncode != 0 and b'WORKSHOP_HOST_PASSWORD' in rejected.stderr

print('Passed: cloud PORT, health check, persistent data after restart, public QR, presenter authentication, CSRF guard, public title privacy and fail-closed configuration.')
